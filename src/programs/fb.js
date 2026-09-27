import { COMMON_AIRPORTS } from '../common/constants.js'
import { sleep, addDays, todayISO } from '../common/search.js'

// Flying Blue (Air France / KLM) – award search via the site's own GraphQL endpoint.
// Hashcash (reverse-engineered from the site's worker):
//   challenge = JSON.stringify({...deepSortByKey(variables), timestamp})
//   hash      = SHA256(challenge)                    ← hex string
//   find nonce N: SHA256(hash + "-" + N) starts with "000"
//   sent as:  {version:2, timestamp, hash: hash+"-"+N}
// Akamai guards /gql/v1:
//   - requests need the page's own headers (AFKL-*, x-client-revision…) → captured from the page's fetches
//   - searchStateUuid must be the page's (sessionStorage), a random one → DataSourceError
//   - ~5-7 AvailableOffers calls in a short window → 503, keep going → 403 Access Denied.
//     So: one request per date (withUpsellCabins returns Y/N/J together), strictly serial, spaced out.

const FB_GQL_PATH = '/gql/v1'
const FB_OP = 'SearchResultAvailableOffersQuery'
const FB_PERSISTED_HASH = '2fefa196c99a8c9847e453d4611888d114e5e7780bfc3f7670d47c598d935795'
const FB_CAL_OP = 'SharedSearchLowestFareOffersForSearchQuery'
const FB_CAL_HASH = 'da21c63708940f578da4e9fb30c1fdf41ae6e7bf4fe8851257c351d66b5dff80'
const FB_GAP_MS = 4000      // ponytail: tuned by hand against Akamai; raise if 503s show up
const FB_BACKOFF_MS = 30000 // one retry after a 503
const FB_CABIN_KEY = { ECONOMY: 'Y', PREMIUM: 'N', BUSINESS: 'J' }
const FB_CABIN_GQL = { Y: 'ECONOMY', N: 'PREMIUM', J: 'BUSINESS' }

let fbHeaders = null
let fbSessionCallback = null
let fbSessionValid = false  // true only after a successful (non-DataSourceError) search

// Capture headers from the page's own GQL POSTs. Wraps whatever fetch the page ends up with,
// and our requests go through window.fetch too (the page's Jscrambler/Akamai wrappers included).
;(function fbPatchFetch() {
  if (location.hostname !== 'wwws.airfrance.us' && location.hostname !== 'www.klm.com') return
  const orig = window.fetch
  window.fetch = function(input, init) {
    try {
      const url = typeof input === 'string' ? input : input?.url
      if (url?.includes(FB_GQL_PATH) && init?.body && init.headers) {
        fbHeaders = init.headers instanceof Headers ? Object.fromEntries(init.headers) : { ...init.headers }
        // Sniff the page's own search responses to detect a valid session
        // Only REWARD searches count: a cash (LEISURE) search's uuid doesn't validate award queries
        const isSearch = url.includes(FB_OP) || url.includes(FB_CAL_OP)
        let isReward = false
        try { isReward = JSON.parse(init.body)?.variables?.bookingFlow === 'REWARD' } catch {}
        if (isSearch && isReward) {
          const promise = orig.apply(this, arguments)
          promise.then(r => r.clone().json()).then(data => {
            const ao = data?.data?.availableOffers
            const lo = data?.data?.lowestFareOffers
            const valid = (ao && ao.__typename !== 'DataSourceError') ||
                          (lo && lo.__typename !== 'DataSourceError')
            if (valid) { fbSessionValid = true; fbSessionCallback?.() }
          }).catch(() => {})
          return promise
        }
        if (fbUuid()) fbSessionCallback?.()
      }
    } catch {}
    return orig.apply(this, arguments)
  }
})()

function fbUuid() {
  try { return JSON.parse(sessionStorage.getItem('bwsfe-state-searchStateUuid')) || null } catch { return null }
}

async function fbSha256Hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}

function fbSortVars(t) {
  if (Array.isArray(t)) return t.map(fbSortVars)
  if (t !== null && typeof t === 'object') {
    const out = {}
    for (const k of Object.keys(t).sort((a, b) => a.localeCompare(b))) out[k] = fbSortVars(t[k])
    return out
  }
  return t
}

async function fbHashcash(variables, timestamp) {
  const challengeHash = await fbSha256Hex(JSON.stringify(Object.assign({}, fbSortVars(variables), { timestamp })))
  for (let nonce = 0; ; nonce++) {
    const candidate = challengeHash + '-' + nonce
    if ((await fbSha256Hex(candidate)).startsWith('000')) return { version: 2, timestamp, hash: candidate }
  }
}

function fbParseResponse(data, origin, destination, date) {
  const results = []
  for (const itin of data?.data?.availableOffers?.offerItineraries || []) {
    const conn = itin.activeConnection
    if (!conn) continue
    const segs = conn.segments.map(seg => {
      const mf = seg.marketingFlight
      return {
        airline: mf?.carrier?.code || '',
        flight: (mf?.carrier?.code || '') + (mf?.number || '').replace(/^0+/, ''),
        origin: seg.origin?.code || '',
        destination: seg.destination?.code || '',
        dep: seg.departureDateTime,
        arr: seg.arrivalDateTime,
      }
    })

    const cabins = { F: null, J: null, N: null, Y: null }
    const miles = {}
    for (const up of itin.upsellCabinProducts || []) {
      for (const c of up.connections || []) {
        const key = FB_CABIN_KEY[c.cabinClass]
        if (!key || !(c.numberOfSeatsAvailable > 0)) continue
        cabins[key] = c.numberOfSeatsAvailable
        if (c.price?.amount) miles[key] = c.price.amount
      }
    }
    if (!Object.values(cabins).some(v => v !== null)) continue

    results.push({
      date,
      origin: segs[0]?.origin || origin,
      destination: segs.at(-1)?.destination || destination,
      segs,
      cabins,
      miles,
      duration: conn.duration ?? null,
      bookUrl: `https://${location.hostname}/search/flights/0`,
    })
  }
  return results
}

const FB_CUSTOMER = { selectedTravelCompanions: [{ passengerId: 1, travelerKey: 0, travelerSource: 'PROFILE' }] }

async function fbFetchOnce(op, hash, variables) {
  const hashcash = await fbHashcash(variables, new Date().toISOString())
  return window.fetch(`${FB_GQL_PATH}?bookingFlow=REWARD&operationName=${op}`, {
    method: 'POST',
    credentials: 'include',
    headers: fbHeaders,
    body: JSON.stringify({
      operationName: op,
      variables,
      extensions: { hashcash, persistedQuery: { version: 1, sha256Hash: hash } },
    }),
  }).catch(() => ({ status: 503 })) // Akamai 503s surface as "Failed to fetch"
}

// Serialize every request across the UI's worker pool
let fbQueue = Promise.resolve()
let fbLastAt = 0
function fbEnqueue(fn) {
  const run = fbQueue.then(async () => {
    await sleep(Math.max(0, fbLastAt + FB_GAP_MS - Date.now()))
    try { return await fn() } finally { fbLastAt = Date.now() }
  })
  fbQueue = run.catch(() => {})
  return run
}

// Returns parsed JSON, or 'SESSION_EXPIRED' when Akamai blocks us or UUID is stale
async function fbGql(op, hash, buildVariables) {
  if (!fbHeaders || !fbUuid()) return 'SESSION_EXPIRED'
  const send = () => fbEnqueue(() => fbFetchOnce(op, hash, buildVariables()))
  let res = await send()
  if (res.status === 503) { await sleep(FB_BACKOFF_MS); res = await send() }
  if (res.status === 403 || res.status === 503) return 'SESSION_EXPIRED'
  if (!res.ok) return null
  const data = await res.json().catch(() => null)
  // DataSourceError means the searchStateUuid is stale — need a fresh page search
  if (data?.data?.availableOffers?.__typename === 'DataSourceError' ||
      data?.data?.lowestFareOffers?.__typename === 'DataSourceError') {
    fbSessionValid = false
    fbSessionCallback?.()
    return 'SESSION_EXPIRED'
  }
  fbSessionValid = true
  return data
}

async function fbSearchDate(origin, destination, date) {
  const data = await fbGql(FB_OP, FB_PERSISTED_HASH, () => ({
    activeConnectionIndex: 0,
    bookingFlow: 'REWARD',
    availableOfferRequestBody: {
      commercialCabins: ['ECONOMY'],
      passengers: [{ id: 1, type: 'ADT' }],
      requestedConnections: [{
        origin: { code: origin, type: 'AIRPORT' },
        destination: { code: destination, type: 'AIRPORT' },
        departureDate: date,
      }],
      bookingFlow: 'REWARD',
      customer: FB_CUSTOMER,
      withUpsellCabins: true,
    },
    searchStateUuid: fbUuid(),
  }))
  if (data === 'SESSION_EXPIRED') return data
  return fbParseResponse(data, origin, destination, date)
}

// Calendar: one request per cabin × month, returns lowest miles per day
function fbMonths(fromMonth, toMonth) {
  const months = []
  for (let m = fromMonth; m <= toMonth; m = addDays(m + '-28', 7).slice(0, 7)) months.push(m)
  return months
}

function fbCalCabins(cabinFilter) {
  return cabinFilter.length ? cabinFilter.filter(c => c in FB_CABIN_GQL) : ['J', 'N', 'Y']
}

async function fbSearchMonth(origin, destination, cabin, month) {
  const today = todayISO()
  const first = month + '-01' < today ? today : month + '-01'
  const last = addDays(addDays(month + '-28', 7).slice(0, 7) + '-01', -1)
  if (first > last) return {}
  const data = await fbGql(FB_CAL_OP, FB_CAL_HASH, () => ({
    lowestFareOffersRequest: {
      bookingFlow: 'REWARD',
      withUpsellCabins: true,
      passengers: [{ id: 1, type: 'ADT' }],
      commercialCabins: [FB_CABIN_GQL[cabin]],
      customer: FB_CUSTOMER,
      type: 'DAY',
      requestedConnections: [{
        departureDate: first,
        dateInterval: `${first}/${last}`,
        origin: { type: 'AIRPORT', code: origin },
        destination: { type: 'AIRPORT', code: destination },
      }],
    },
    activeConnection: 0,
    searchStateUuid: fbUuid(),
    bookingFlow: 'REWARD',
  }))
  if (data === 'SESSION_EXPIRED') return data
  const out = {}
  for (const o of data?.data?.lowestFareOffers?.lowestOffers || []) {
    if (o.noFlight || !o.displayPrice || o.currency !== 'MILES') continue
    out[o.flightDate] = o.displayPrice
  }
  return out
}

const FB_SEARCH_PATH = '/search/advanced'
const FB_GET_SESSION_KEY = 'ab-fb-get-session'

// Clicks before Angular hydrates the widget are silently dropped, so keep retrying until we leave the page
async function fbSubmitRewardSearch() {
  for (let i = 0; i < 30 && location.pathname === FB_SEARCH_PATH; i++) {
    const toggle = document.querySelector('.bw-search-widget__reward-toggle button[role=switch]')
    const submit = document.querySelector('.bw-search-widget__search-button')
    if (toggle?.getAttribute('aria-checked') !== 'true') toggle?.click()
    else submit?.click()
    await sleep(1000)
  }
}

// Resume a Get session started on another page
if ((location.hostname === 'wwws.airfrance.us' || location.hostname === 'www.klm.com') &&
    location.pathname === FB_SEARCH_PATH && sessionStorage.getItem(FB_GET_SESSION_KEY)) {
  sessionStorage.removeItem(FB_GET_SESSION_KEY)
  fbSubmitRewardSearch()
}

export const fbProgram = {
  id: 'fb',
  name: 'Flying Blue',
  color: '#002157',
  cabins: ['J', 'N', 'Y'],
  airports: COMMON_AIRPORTS,
  requiresSession: true,
  loginUrl: 'https://wwws.airfrance.us/search/flights/0',

  matchHost: h => h === 'wwws.airfrance.us' || h === 'www.klm.com',

  onSessionReady(cb) {
    fbSessionCallback = cb
    if (fbHeaders && fbUuid()) cb()
  },

  isSessionReady() { return !!(fbHeaders && fbUuid() && fbSessionValid) },

  getSessionUrl() { return `https://${location.hostname}/search/flights/0` },

  // Deep links to /search/flights/0 redirect to /search/advanced and run a cash search, so instead
  // flip the page's "Book with my Miles" toggle and submit the widget (logged-in only).
  // fbPatchFetch sniffs the resulting REWARD response and sets fbSessionValid.
  triggerSession() {
    if (location.pathname !== FB_SEARCH_PATH) {
      sessionStorage.setItem(FB_GET_SESSION_KEY, '1')
      location.href = FB_SEARCH_PATH
      return
    }
    fbSubmitRewardSearch()
  },

  onSearch({ origin, destination, date }) {
    return fbSearchDate(origin, destination, date)
  },

  calendarRequestsPerRoute(fromMonth, toMonth, cabinFilter) {
    return fbCalCabins(cabinFilter).length * fbMonths(fromMonth, toMonth).length
  },

  async onCalendarSearch(origin, destination, cabinFilter, fromMonth, toMonth, onProgress) {
    const cabins = fbCalCabins(cabinFilter)
    const months = fbMonths(fromMonth, toMonth)
    const total = cabins.length * months.length
    let done = 0
    const byDate = {}
    for (const cabin of cabins) {
      for (const month of months) {
        onProgress?.(null, { done, total, label: `Searching ${cabin} – ${month}` })
        const days = await fbSearchMonth(origin, destination, cabin, month)
        if (days === 'SESSION_EXPIRED') return days
        const partial = {}
        for (const [date, miles] of Object.entries(days)) {
          byDate[date] = { ...byDate[date], [cabin]: miles }
          partial[date] = { [cabin]: miles }
        }
        onProgress?.(Object.keys(partial).length ? partial : null, { done: ++done, total })
      }
    }
    return byDate
  },
}
