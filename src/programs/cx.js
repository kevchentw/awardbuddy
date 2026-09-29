import { COMMON_AIRPORTS } from '../common/constants.js'
import { sleep } from '../common/search.js'

// Cathay Pacific
// Session is captured from window.requestParams on book.cathaypacific.com.
// The new CX booking flow (api.cathaypacific.com/redibe/IBEFacade?ACTION=RED_AWARD_SEARCH)
// redirects to book.cathaypacific.com/CathayPacificAwardV3/ where requestParams is set.
// All availability fetches must be same-origin on book.cathaypacific.com (no CORS headers).

const CX_DELAY_MS = 500
const CX_AVAILABILITY_BASE = 'https://book.cathaypacific.com/CathayPacificAwardV3/dyn/air/booking/availability'
const CX_AWARD_PAGE = 'https://www.cathaypacific.com/cx/en_HK/book-a-trip/redeem-flights/redeem-flight-awards.html'
const CX_REDIBE_BASE = 'https://api.cathaypacific.com/redibe/IBEFacade'

const cxCaptured = { requestParams: null, tabId: null, formSubmitUrl: null }
let cxSessionCallback = null

function cxApply(parsed) {
  if (!parsed?.TAB_ID) return false
  cxCaptured.requestParams = parsed
  cxCaptured.tabId = parsed.TAB_ID
  cxCaptured.formSubmitUrl = CX_AVAILABILITY_BASE + '?TAB_ID=' + parsed.TAB_ID
  if (cxSessionCallback) cxSessionCallback()
  return true
}

function cxExtractFromHtml(html) {
  const m = html.match(/requestParams = JSON\.parse\(JSON\.stringify\('([^']+)/)
  if (!m) return null
  try { return JSON.parse(m[1]) } catch { return null }
}

function cxTryCapture() {
  // Try window global (set by book.cathaypacific.com pages)
  const rp = window.requestParams
  if (rp) {
    const parsed = typeof rp === 'string' ? JSON.parse(rp) : rp
    if (cxApply(parsed)) return true
  }
  // Scan inline <script> tags
  for (const script of document.scripts) {
    const text = script.textContent
    if (!text.includes('requestParams')) continue
    const m = text.match(/requestParams = JSON\.parse\(JSON\.stringify\('([^']+)/)
    if (!m) continue
    try { if (cxApply(JSON.parse(m[1]))) return true } catch {}
  }
  // Form-based TAB_ID (book.cathaypacific.com with active session, JS-populated)
  const tabInput = document.querySelector('input[name="TAB_ID"]')
  if (tabInput && tabInput.value) {
    const form = tabInput.closest('form')
    const params = { TAB_ID: tabInput.value }
    if (form) {
      for (const el of form.elements) { if (el.name && el.value) params[el.name] = el.value }
    }
    if (cxApply(params)) return true
  }
  return false
}

// Build the URL that navigates the browser to book.cathaypacific.com with a valid session.
// api.cathaypacific.com/redibe/IBEFacade?ACTION=RED_AWARD_SEARCH → redirects to
// book.cathaypacific.com/CathayPacificAwardV3/dyn/air/booking/availability (has window.requestParams).
function cxSessionUrl(origin, dest, date) {
  const d = new Date(); d.setMonth(d.getMonth() + 1)
  const today = d.toISOString().slice(0, 10).replace(/-/g, '')
  const p = new URLSearchParams({
    ACTION: 'RED_AWARD_SEARCH',
    ENTRYPOINT: CX_AWARD_PAGE,
    ENTRYLANGUAGE: 'en',
    ENTRYCOUNTRY: 'HK',
    RETURNURL: CX_AWARD_PAGE,
    ERRORURL: 'https://www.cathaypacific.com/cx/en_HK/book-a-trip/redeem-flights/redeem-flight-awards.handler.html',
    LOGINURL: 'https://www.cathaypacific.com/cx/en_HK/sign-in.html',
    CABINCLASS: 'Y',
    ADULT: '1',
    CHILD: '0',
    DISCOUNTCODE: '',
    FLEXIBLEDATE: 'true',
    BRAND: 'CX',
    'ORIGIN[1]': origin || 'HKG',
    'DESTINATION[1]': dest || 'NRT',
    'DEPARTUREDATE[1]': date || today,
  })
  return `${CX_REDIBE_BASE}?${p}`
}

// Refresh expired TAB_ID using ENC (mirrors newTabID)
async function cxRefreshTabId() {
  const enc = cxCaptured.requestParams?.ENC
  if (!enc) return false
  try {
    const body = new URLSearchParams({
      SERVICE_ID: '1', LANGUAGE: 'TW',
      EMBEDDED_TRANSACTION: 'AirAvailabilityServlet',
      SITE: 'CXAWCXAW', ENC: enc, ENCT: '2',
      ENTRYCOUNTRY: '', ENTRYLANGUAGE: '',
    })
    const res = await fetch(CX_AVAILABILITY_BASE, {
      method: 'POST', credentials: 'include',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
    const html = await res.text()
    return cxApply(cxExtractFromHtml(html))
  } catch { return false }
}

function cxBuildParams(origin, destination, date) {
  const p = { ...cxCaptured.requestParams }
  p.B_LOCATION_1 = origin
  p.E_LOCATION_1 = destination
  p.B_DATE_1 = date.replace(/-/g, '') + '0000'
  p.ADULT = '1'
  p.CHILD = '0'
  delete p.ENCT; delete p.SERVICE_ID; delete p.DIRECT_LOGIN; delete p.ENC
  return new URLSearchParams(p).toString()
}

// New API uses fareFamily codes in upsell.associations instead of per-segment cabin status
const CX_FAMILY_CABIN = { ECOSTD: 'Y', PEYSTD: 'N', BUSSTD: 'J', FSTSTD: 'F', FIRFAM: 'F', FIRFST: 'F' }

function cxParseResponse(data, origin, destination, date) {
  let bom = data
  if (data.pageBom) try { bom = JSON.parse(data.pageBom) } catch { return [] }
  const av = bom?.modelObject?.availabilities
  const upsell = av?.upsell
  const flights = upsell?.bounds?.[0]?.flights
  if (!flights?.length) return []

  const recoRbds = {}
  for (const reco of Object.values(upsell.recommendations ?? {})) {
    recoRbds[reco.id] = Object.values(reco.rbdsPerBound?.[0]?.segmentRBDs ?? {}).map(r => r.code)
  }

  // Build flightId -> cabins map from associations (lsa = lowest seats available),
  // plus each segment's booking class, which tells the cabin of mixed-cabin itineraries
  const flightCabins = {}
  const flightRbds = {}
  for (const assoc of Object.values(upsell.associations ?? {})) {
    const { flightId, fareFamily, lsa } = assoc.boundAssociations[0]
    if (!lsa) continue
    const cabin = CX_FAMILY_CABIN[fareFamily] ?? (fareFamily.includes('FIR') ? 'F' : null)
    if (!cabin) continue
    if (!flightCabins[flightId]) flightCabins[flightId] = { F: null, J: null, N: null, Y: null }
    flightCabins[flightId][cabin] = lsa
    ;(flightRbds[flightId] ??= {})[cabin] = recoRbds[assoc.recoId] ?? []
  }

  const results = []
  for (const flight of flights) {
    const cabins = flightCabins[flight.id]
    if (!cabins || !Object.values(cabins).some(v => v !== null)) continue
    const segs = flight.segments.map(seg => ({
      airline: seg.flightIdentifier.marketingAirline,
      flight: seg.flightIdentifier.marketingAirline + seg.flightIdentifier.flightNumber,
      origin: seg.originLocation.replace(/^[^_]*_/, ''),
      destination: seg.destinationLocation.replace(/^[^_]*_/, ''),
      dep: new Date(seg.flightIdentifier.originDate).toISOString(),
      arr: new Date(seg.destinationDate).toISOString(),
    }))
    results.push({ date, origin, destination, segs, cabins, miles: {}, rbds: flightRbds[flight.id], duration: Math.round(flight.duration / 60000), bookUrl: CX_AWARD_PAGE })
  }
  return results
}

// Miles depend on the actual itinerary (route, carriers, cabin per segment), so they come
// from the same milesInfo API the CX results page uses. data.requestParams MILES_* only
// echo the route the session was opened with and must not be used.
const CX_MILES_INFO_URL = 'https://api.cathaypacific.com/redibe/milesInfo/v2.0'
const CX_MILES_CABIN = { F: 'FIR', J: 'BUS', N: 'PEY', Y: 'ECO' }
const CX_CABIN_ORDER = ['F', 'J', 'N', 'Y']
const cxMilesCache = {}

// Award booking class -> cabin per marketing carrier, from CX_GLOBAL_CONFIG
// "ONEWORLD.RBD.PARTNER.<carrier>" on book.cathaypacific.com
const CX_RBD_CABIN = Object.fromEntries(Object.entries({
  CX: 'F:Z,J:U,N:T,Y:X', '4C': 'J:U,N:R,Y:T', '4M': 'J:U,N:R,Y:T', '9W': 'F:R,J:D,Y:X',
  AA: 'F:Z,J:U,N:X,Y:T', AB: 'J:U,Y:X', AE: 'F:Z,J:U,N:X,Y:T', AS: 'F:AE,N:Z,Y:WT',
  AT: 'J:U,Y:X', AX: 'F:Z,J:U,N:X,Y:T', AY: 'J:U,Y:X', BA: 'F:Z,J:U,N:P,Y:X', BI: 'J:I,Y:P',
  CA: 'F:O,J:I,Y:X', EI: 'J:U,Y:T', FJ: 'J:U,Y:X', GF: 'J:P,Y:T', HG: 'J:U,Y:X', IB: 'J:U,Y:X',
  IT: 'J:U,Y:X', JC: 'F:Z,J:U,Y:S', JJ: 'J:U,N:R,Y:T', JL: 'F:ZA,J:U,Y:ST', JO: 'F:Z,J:U,Y:S',
  KA: 'F:Z,J:U,Y:X', LA: 'J:U,N:R,Y:T', LP: 'J:U,N:R,Y:T', LU: 'J:U,N:R,Y:T', MA: 'J:R,Y:X',
  MH: 'J:U,Y:X', MU: 'F:A,J:D,Y:I', MX: 'J:U,Y:X', NU: 'F:Z,J:U,Y:ST', QF: 'F:P,J:U,N:Z,Y:X',
  QR: 'F:Z,J:U,Y:X', RJ: 'J:U,Y:X', S7: 'J:U,Y:E', UL: 'J:U,Y:X', WY: 'F:A,J:U,Y:X',
  XL: 'J:U,N:R,Y:T', XM: 'F:Z,J:U,Y:S', ZH: 'F:O,J:I,Y:X',
}).map(([airline, spec]) => [airline, Object.fromEntries(spec.split(',').flatMap(part => {
  const [cabin, codes] = part.split(':')
  return [...codes].map(code => [code, cabin])
}))]))

// e.g. "NRT:HKG:BOS_CX:CX_STD_ECO:ECO"; segCabins is one cabin per segment
export function cxMilesKey(segs, segCabins) {
  const airports = [segs[0].origin, ...segs.map(s => s.destination)].join(':')
  const airlines = segs.map(s => s.airline).join(':')
  const cabins = segCabins.map(c => CX_MILES_CABIN[c]).join(':')
  return `${airports}_${airlines}_STD_${cabins}`
}

const CX_CABIN_FROM_MILES = Object.fromEntries(Object.entries(CX_MILES_CABIN).map(([c, m]) => [m, c]))
export const cxSegCabinsFromKey = key => key.split('_STD_')[1].split(':').map(m => CX_CABIN_FROM_MILES[m])

// Keys to try in order for a fare in `cabin`. A segment whose booking class isn't in the
// table (e.g. JL "Y") may sit in a lower cabin, so try the fare cabin first, then lower ones.
export function cxMilesCandidates(segs, cabin, rbds = []) {
  const lower = CX_CABIN_ORDER.slice(CX_CABIN_ORDER.indexOf(cabin))
  let combos = [[]]
  segs.forEach((seg, i) => {
    const known = CX_RBD_CABIN[seg.airline]?.[rbds[i]]
    const options = known ? [known] : lower
    combos = combos.flatMap(c => options.map(o => [...c, o]))
  })
  return combos.map(c => cxMilesKey(segs, c))
}

async function cxFillMiles(results) {
  const keyed = results.flatMap(r => Object.entries(r.cabins)
    .filter(([, lsa]) => lsa !== null)
    .map(([cabin]) => ({ r, cabin, keys: cxMilesCandidates(r.segs, cabin, r.rbds?.[cabin]) })))
  const missing = [...new Set(keyed.flatMap(k => k.keys).filter(k => !(k in cxMilesCache)))]
  if (missing.length) {
    try {
      const res = await fetch(CX_MILES_INFO_URL, {
        method: 'POST', credentials: 'include',
        headers: { 'content-type': 'application/json', 'accept': 'application/json, text/plain, */*' },
        body: JSON.stringify({ milesInfoList: missing }),
      })
      if (res.ok) Object.assign(cxMilesCache, (await res.json()).milesInfo)
    } catch {}
  }
  // milesInfo returns -1 for a cabin combination that doesn't exist. The key that prices
  // gives each segment's cabin; keep it when the fare mixes cabins.
  for (const { r, cabin, keys } of keyed) {
    const key = keys.find(k => cxMilesCache[k] > 0)
    if (!key) continue
    r.miles[cabin] = cxMilesCache[key]
    const segCabins = cxSegCabinsFromKey(key)
    if (segCabins.some(c => c !== cabin)) (r.segCabins ??= {})[cabin] = segCabins
  }
  for (const r of results) delete r.rbds
  return results
}

// The availability POST drives a stateful flow on the TAB_ID, so two in flight at once overwrite
// each other's date and only one date's flights come back. Serialize them across the worker pool.
let cxQueue = Promise.resolve()
function cxEnqueue(fn) {
  const run = cxQueue.then(fn)
  cxQueue = run.catch(() => {})
  return run
}

const cxPostAvailability = (origin, destination, date) => fetch(cxCaptured.formSubmitUrl, {
  method: 'POST', credentials: 'include',
  headers: { 'content-type': 'application/x-www-form-urlencoded', 'accept': 'application/json, text/plain, */*' },
  body: cxBuildParams(origin, destination, date),
})

async function cxFetchAvailability(origin, destination, date) {
  await sleep(CX_DELAY_MS)
  let res = await cxPostAvailability(origin, destination, date)
  // TAB_ID expired — refresh and retry once
  if (res.status === 404 || res.status >= 300) {
    if (!await cxRefreshTabId()) return null
    res = await cxPostAvailability(origin, destination, date)
  }
  return res.ok ? res.json() : null
}

async function cxDoSearch(origin, destination, date) {
  const data = await cxEnqueue(() => cxFetchAvailability(origin, destination, date))
  return data ? cxFillMiles(cxParseResponse(data, origin, destination, date)) : []
}

export const cxProgram = {
  id: 'cx',
  name: 'Cathay Pacific',
  color: '#006564',
  cabins: ['F', 'J', 'N', 'Y'],
  airports: COMMON_AIRPORTS,
  requiresSession: true,
  matches: ['www.cathaypacific.com', 'book.cathaypacific.com'],

  // Returns a URL the user can navigate to in order to establish a session on book.cathaypacific.com
  getSessionUrl() { return cxSessionUrl() },

  onSessionReady(cb) {
    cxSessionCallback = cb
    if (cxTryCapture()) return
    // Poll every 500ms — catches pages where requestParams is set after DOMContentLoaded
    let attempts = 0
    const poll = setInterval(() => {
      if (cxTryCapture()) { clearInterval(poll); return }
      // ponytail: give up after ~30s, user can click "Get session" link instead
      if (++attempts > 60) clearInterval(poll)
    }, 500)
  },

  isSessionReady() { return !!(cxCaptured.requestParams && cxCaptured.tabId) },

  async onSearch({ origin, destination, date }) {
    try { return await cxDoSearch(origin, destination, date) }
    catch { return [] }
  },
}
