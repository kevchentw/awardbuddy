import { COMMON_AIRPORTS } from '../common/constants.js'
import { addDays, sleep, todayISO } from '../common/search.js'

// American Airlines (AAdvantage) – no login required, but needs a "session": a real search run on the
// page (Get session), so Akamai's bot check is met – and passed by the user – on a visible page
// The JSON API (/booking/api/search/itinerary) answers direct calls with a bare "309" error, so we do
// what the site's own search form does: POST the search as form data to the choose-flights page and
// read the results out of the server-rendered Angular transfer state (<script id="ng-state">).
// Calendar mode instead uses the JSON API behind the results page's Calendar popup
// (/booking/api/search/calendar): one request per cabin per month.
// Bursts of these POSTs make Akamai answer with a "Challenge Validation" page (an "I'm not a robot"
// check) instead; that has to be passed by the user, so the session drops and Get session reappears.

const AA_RESULTS_URL = 'https://www.aa.com/booking/choose-flights/1'
// Randomised pacing: a fixed interval is an easy bot signal for Akamai, so each request waits a
// jittered delay, and every AA_BURST_MIN…MAX requests take a longer break. After a challenge the
// delays are stretched (AA_BACKOFF_STEP per challenge, up to AA_BACKOFF_MAX) and relax again slowly
// as requests succeed
const AA_DELAY_MS = [2500, 6000]
const AA_BURST = [8, 15]
const AA_BREAK_MS = [15000, 30000]
const AA_BACKOFF_STEP = 1.5
const AA_BACKOFF_MAX = 4

const AA_PRODUCT_MAP = { FIRST: 'F', BUSINESS: 'J', PREMIUM_ECONOMY: 'N', COACH: 'Y' }
// Leg cabinType rank, to tell whether a leg is flown in (at least) the cabin the product is sold as
const AA_CABIN_RANK = { COACH: 0, PREMIUM_ECONOMY: 1, BUSINESS: 2, FIRST: 3 }

function aaSearchRequest(origin, destination, date, cabin = '') {
  return {
    loyaltyInfo: null,
    metadata: { errorCode: null, selectedProducts: [], tripType: 'OneWay' },
    passengers: [{ type: 'adult', count: 1 }],
    queryParams: { sessionId: '', sliceIndex: 0, solutionId: '', solutionSet: '' },
    slices: [{
      allCarriers: true, cabin, departureDate: date,
      origin, originNearbyAirports: false, destination, destinationNearbyAirports: false,
    }],
    tripOptions: {
      corporateBooking: false, fareType: 'Lowest', locale: 'en_US', pointOfSale: null,
      searchType: 'Award', travelType: null, enableBenefits: true,
    },
    requestHeader: { clientId: 'AAcom' },
    version: 'cfr',
  }
}

export const AA_CHALLENGE_MESSAGE = '⚠ AA bot check — click Get session, tick "I\'m not a robot" on aa.com if asked, then search again'

// Session = this page is a real search result (challenge passed), or a background search has since
// succeeded; a challenge response drops it until the next real search
let aaSessionCallback = null
let aaChallenged = false
let aaFetchOk = false
const aaOnResultsPage = () => location.pathname.startsWith('/booking/choose-flights') &&
  document.readyState !== 'loading' && document.title !== 'Challenge Validation'

// Real search for the last route searched in the panel (else a placeholder), a month out
function aaSessionUrl() {
  let saved = {}
  try { saved = JSON.parse(localStorage.getItem('award-buddy:aa')) || {} } catch {}
  const first = v => Array.isArray(v) ? v[0] : undefined
  return aaBookUrl(first(saved.origins) ?? 'DFW', first(saved.dests) ?? 'LHR', addDays(todayISO(), 30))
}

const aaRand = ([lo, hi]) => lo + Math.random() * (hi - lo)
// Kept in sessionStorage: Get session reloads the page, and a challenge should still slow the next run
const AA_BACKOFF_KEY = 'award-buddy:aa-backoff'
let aaBackoff = 1
try { aaBackoff = Number(sessionStorage.getItem(AA_BACKOFF_KEY)) || 1 } catch {}
function aaSetBackoff(v) {
  aaBackoff = v
  try { sessionStorage.setItem(AA_BACKOFF_KEY, String(v)) } catch {}
}
let aaUntilBreak = Math.round(aaRand(AA_BURST))
function aaNextDelay() {
  if (--aaUntilBreak <= 0) {
    aaUntilBreak = Math.round(aaRand(AA_BURST))
    return aaRand(AA_BREAK_MS) * aaBackoff
  }
  return aaRand(AA_DELAY_MS) * aaBackoff
}

// One request at a time: the UI's worker pool would otherwise double the rate and trip Akamai sooner
let aaQueue = Promise.resolve()
function aaFetch(origin, destination, date, cabin) {
  const run = aaQueue.then(() => aaFetchNow(origin, destination, date, cabin))
  aaQueue = run
  return run
}

// → { itineraryResult, … }, null (no flights / error page) or 'SESSION_EXPIRED' (challenge)
async function aaFetchNow(origin, destination, date, cabin) {
  await sleep(aaNextDelay())
  try {
    const res = await fetch(AA_RESULTS_URL, {
      method: 'POST',
      credentials: 'include',
      body: new URLSearchParams({
        searchRequest: JSON.stringify(aaSearchRequest(origin, destination, date, cabin)),
        requestType: 'itinerary',
      }),
    })
    if (!res.ok) return null
    const html = await res.text()
    if (html.includes('<title>Challenge Validation</title>')) {
      aaChallenged = true
      aaSetBackoff(Math.min(aaBackoff * AA_BACKOFF_STEP, AA_BACKOFF_MAX))
      aaSessionCallback?.()
      return 'SESSION_EXPIRED'
    }
    const m = html.match(/<script id="ng-state" type="application\/json">([\s\S]*?)<\/script>/)
    const data = m && JSON.parse(m[1]).SearchData
    if (data) {
      aaFetchOk = true
      aaSetBackoff(Math.max(1, aaBackoff * 0.95))
    }
    return data?.itineraryResult ? data : null
  } catch { return null }
}

function aaBookUrl(origin, destination, date) {
  const slices = JSON.stringify([{ orig: origin, origNearby: false, dest: destination, destNearby: false, date }])
  return `https://www.aa.com/booking/search?locale=en_US&pax=1&adult=1&type=OneWay&searchType=Award&cabin=&carriers=ALL&slices=${encodeURIComponent(slices)}`
}

// Share of flying time spent in at least the product's cabin (100 = no downgrade on any leg)
function aaCabinPct(legs, productType) {
  const want = AA_CABIN_RANK[productType]
  let total = 0, inCabin = 0
  for (const leg of legs) {
    const mins = leg.durationInMinutes || 0
    const cabinType = leg.productDetails?.find(p => p.productType === productType)?.cabinType
    total += mins
    if ((AA_CABIN_RANK[cabinType] ?? -1) >= want) inCabin += mins
  }
  return total ? Math.round(inCabin / total * 100) : 100
}

export function aaParseResults(itineraryResult, origin, destination, date) {
  const results = []
  for (const slice of itineraryResult?.slices ?? []) {
    const segs = (slice.segments ?? []).map(seg => ({
      airline: seg.flight.carrierCode,
      flight: seg.flight.carrierCode + seg.flight.flightNumber,
      origin: seg.origin.code, destination: seg.destination.code,
      dep: seg.departureDateTime.slice(0, 19), arr: seg.arrivalDateTime.slice(0, 19),
    }))
    if (!segs.length) continue
    const legs = slice.segments.flatMap(seg => seg.legs ?? [])
    const cabins = { F: null, J: null, N: null, Y: null }, miles = {}, mixPct = {}
    for (const p of slice.pricingDetail ?? []) {
      const c = AA_PRODUCT_MAP[p.productType]
      if (!c || !p.productAvailable || !(p.perPassengerAwardPoints > 0)) continue
      cabins[c] = p.seatsRemaining > 0 ? p.seatsRemaining : true
      miles[c] = p.perPassengerAwardPoints
      const pct = aaCabinPct(legs, p.productType)
      if (pct < 100) mixPct[c] = pct
    }
    if (!Object.values(cabins).some(v => v !== null)) continue
    results.push({
      date, origin, destination, segs, cabins, miles,
      ...(Object.keys(mixPct).length ? { mixPct } : {}),
      duration: slice.durationInMinutes,
      bookUrl: aaBookUrl(origin, destination, date),
    })
  }
  return results
}

// Months (YYYY-MM) from fromMonth … toMonth, skipping any already past
function aaCalendarMonths(fromMonth, toMonth) {
  const months = []
  const thisMonth = todayISO().slice(0, 7)
  for (let [y, m] = fromMonth.split('-').map(Number); ; m === 12 ? (y++, m = 1) : m++) {
    const ym = `${y}-${String(m).padStart(2, '0')}`
    if (ym > toMonth) break
    if (ym >= thisMonth) months.push(ym)
  }
  return months
}

// The choose-flights "Calendar" popup's API: one request returns the lowest award price for every day
// of the month containing departureDate, for one cabin. Being a JSON API it needs the XSRF-TOKEN
// cookie echoed back as a header (the page's own HttpClient does this)
function aaCalendarRequest(origin, destination, date, cabin) {
  return {
    metadata: { selectedProducts: [], tripType: 'OneWay', udo: {} },
    passengers: [{ type: 'adult', count: 1 }],
    requestHeader: { clientId: 'AAcom' },
    slices: [{
      allCarriers: true, cabin, departureDate: date, destination, destinationNearbyAirports: false,
      maxStops: null, origin, originNearbyAirports: false,
    }],
    tripOptions: {
      corporateBooking: false, fareType: 'Lowest', locale: 'en_US', pointOfSale: null,
      searchType: 'Award', enableBenefits: true,
    },
    loyaltyInfo: null,
    version: '',
    queryParams: { sliceIndex: 0, sessionId: '', solutionSet: '', solutionId: '' },
  }
}

// → { 'YYYY-MM-DD': miles }
export function aaParseCalendar(json) {
  const out = {}
  for (const month of json?.calendarMonths ?? [])
    for (const week of month.weeks ?? [])
      for (const day of week.days ?? []) {
        const pts = day.solution?.perPassengerAwardPoints
        if (day.validDay && day.date && pts > 0) out[day.date] = pts
      }
  return out
}

function aaCalendarFetch(origin, destination, date, cabin) {
  const run = aaQueue.then(() => aaCalendarFetchNow(origin, destination, date, cabin))
  aaQueue = run
  return run
}

async function aaCalendarFetchNow(origin, destination, date, cabin) {
  await sleep(aaNextDelay())
  const xsrf = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/)?.[1]
  try {
    const res = await fetch('/booking/api/search/calendar', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
        ...(xsrf ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrf) } : {}),
        'X-CID': crypto.randomUUID(),
      },
      body: JSON.stringify(aaCalendarRequest(origin, destination, date, cabin)),
    })
    const text = await res.text()
    let json = null
    try { json = JSON.parse(text) } catch {}
    // Akamai answers a blocked request with its HTML challenge page (or a 403/428) instead of JSON
    if (!json && (text.includes('Challenge Validation') || [403, 428, 429].includes(res.status))) {
      aaChallenged = true
      aaSetBackoff(Math.min(aaBackoff * AA_BACKOFF_STEP, AA_BACKOFF_MAX))
      aaSessionCallback?.()
      return 'SESSION_EXPIRED'
    }
    if (!res.ok || !json) return null
    aaFetchOk = true
    aaSetBackoff(Math.max(1, aaBackoff * 0.95))
    return aaParseCalendar(json)
  } catch { return null }
}

// Calendar API cabin values (it rejects PREMIUM_ECONOMY)
const AA_CAL_CABIN = { F: 'FIRST', J: 'BUSINESS', N: 'PREMIUM_COACH', Y: 'COACH' }

const aaCalCabins = cabinFilter => cabinFilter.length ? cabinFilter : ['F', 'J', 'N', 'Y']

export const aaProgram = {
  id: 'aa',
  name: 'American Airlines',
  color: '#0078d2',
  cabins: ['F', 'J', 'N', 'Y'],
  airports: COMMON_AIRPORTS,
  requiresSession: true,
  matches: ['www.aa.com'],
  expiredMessage: AA_CHALLENGE_MESSAGE,

  onSessionReady(cb) { aaSessionCallback = cb },
  isSessionReady() { return !aaChallenged && (aaFetchOk || aaOnResultsPage()) },
  getSessionUrl() { return aaSessionUrl() },
  triggerSession() { location.href = aaSessionUrl() },

  async onSearch({ origin, destination, date }) {
    const data = await aaFetch(origin, destination, date, '')
    if (data === 'SESSION_EXPIRED') return data
    return data ? aaParseResults(data.itineraryResult, origin, destination, date) : []
  },

  calendarRequestsPerRoute(fromMonth, toMonth, cabinFilter) {
    return aaCalCabins(cabinFilter).length * aaCalendarMonths(fromMonth, toMonth).length
  },

  async onCalendarSearch(origin, destination, cabinFilter, fromMonth, toMonth, onProgress) {
    const cabins = aaCalCabins(cabinFilter)
    const months = aaCalendarMonths(fromMonth, toMonth)
    const today = todayISO()
    const total = cabins.length * months.length
    let done = 0
    const byDate = {}
    for (const cabin of cabins) {
      for (const month of months) {
        onProgress?.(null, { done, total, label: `Searching ${cabin} – ${month}` })
        // departureDate only picks the month; use a date that isn't in the past
        const date = [`${month}-01`, today].sort()[1]
        const days = await aaCalendarFetch(origin, destination, date, AA_CAL_CABIN[cabin])
        if (days === 'SESSION_EXPIRED') return days
        const partial = {}
        for (const [d, pts] of Object.entries(days ?? {})) {
          if (d < today) continue
          byDate[d] = { ...byDate[d], [cabin]: pts }
          partial[d] = { [cabin]: pts }
        }
        onProgress?.(Object.keys(partial).length ? partial : null, { done: ++done, total })
      }
    }
    return byDate
  },
}
