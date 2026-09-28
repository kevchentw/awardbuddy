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

  // Build flightId -> cabins map from associations (lsa = lowest seats available)
  const flightCabins = {}
  for (const assoc of Object.values(upsell.associations ?? {})) {
    const { flightId, fareFamily, lsa } = assoc.boundAssociations[0]
    if (!lsa) continue
    const cabin = CX_FAMILY_CABIN[fareFamily] ?? (fareFamily.includes('FIR') ? 'F' : null)
    if (!cabin) continue
    if (!flightCabins[flightId]) flightCabins[flightId] = { F: null, J: null, N: null, Y: null }
    flightCabins[flightId][cabin] = lsa
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
    results.push({ date, origin, destination, segs, cabins, miles: {}, duration: Math.round(flight.duration / 60000), bookUrl: CX_AWARD_PAGE })
  }
  return results
}

// Miles depend on the actual itinerary (route, carriers, cabin), so they come from the
// same milesInfo API the CX results page uses. data.requestParams MILES_* only echo the
// route the session was opened with and must not be used.
const CX_MILES_INFO_URL = 'https://api.cathaypacific.com/redibe/milesInfo/v2.0'
const CX_MILES_CABIN = { F: 'FIR', J: 'BUS', N: 'PEY', Y: 'ECO' }
const cxMilesCache = {}

// e.g. "NRT:HKG:BOS_CX:CX_STD_ECO:ECO"
export function cxMilesKey(segs, cabin) {
  const airports = [segs[0].origin, ...segs.map(s => s.destination)].join(':')
  const airlines = segs.map(s => s.airline).join(':')
  const cabins = segs.map(() => CX_MILES_CABIN[cabin]).join(':')
  return `${airports}_${airlines}_STD_${cabins}`
}

async function cxFillMiles(results) {
  const keyed = results.flatMap(r => Object.entries(r.cabins)
    .filter(([, lsa]) => lsa !== null)
    .map(([cabin]) => ({ r, cabin, key: cxMilesKey(r.segs, cabin) })))
  const missing = [...new Set(keyed.map(k => k.key).filter(k => !(k in cxMilesCache)))]
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
  for (const { r, cabin, key } of keyed) if (cxMilesCache[key]) r.miles[cabin] = cxMilesCache[key]
  return results
}

async function cxDoSearch(origin, destination, date) {
  await sleep(CX_DELAY_MS)
  const res = await fetch(cxCaptured.formSubmitUrl, {
    method: 'POST', credentials: 'include',
    headers: { 'content-type': 'application/x-www-form-urlencoded', 'accept': 'application/json, text/plain, */*' },
    body: cxBuildParams(origin, destination, date),
  })
  // TAB_ID expired — refresh and retry once
  if (res.status === 404 || res.status >= 300) {
    const ok = await cxRefreshTabId()
    if (!ok) return []
    const res2 = await fetch(cxCaptured.formSubmitUrl, {
      method: 'POST', credentials: 'include',
      headers: { 'content-type': 'application/x-www-form-urlencoded', 'accept': 'application/json, text/plain, */*' },
      body: cxBuildParams(origin, destination, date),
    })
    if (!res2.ok) return []
    const data2 = await res2.json()
    return cxFillMiles(cxParseResponse(data2, origin, destination, date))
  }
  if (!res.ok) return []
  const data = await res.json()
  return cxFillMiles(cxParseResponse(data, origin, destination, date))
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
