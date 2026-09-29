import { COMMON_AIRPORTS } from '../common/constants.js'

// ANA (All Nippon Airways) – award availability via session-based ANA booking engine
// Session: browser cookies on aswbe-i.ana.co.jp; aswcid captured from URL
// Per-day search only; parses addRecommendation() and obList data from result HTML

const ANA_HOST = 'aswbe-i.ana.co.jp'
const ANA_INPUT_PATH = '/international_asw/pages/award/search/roundtrip/award_search_roundtrip_input.xhtml'

// Our cabin → ANA CFF code
const ANA_CFF = { F: 'CFF3', J: 'CFF2', N: 'CFF4', Y: 'CFF1' }
// ANA serviceLevel → our cabin
const ANA_SERVICE_LEVEL_CABIN = { 200: 'F', 400: 'F', 600: 'J', 800: 'J', 1000: 'N', 1200: 'Y', 1400: 'Y' }

const anaCaptured = { aswcid: null, basePath: null }
let anaSessionCallback = null

function anaTryCapture() {
  if (location.hostname !== ANA_HOST) return false
  const m = location.pathname.match(/^\/(rei[^/]+)\//)
  const q = new URLSearchParams(location.search)
  const aswcid = q.get('aswcid')
  if (!aswcid) return false
  const changed = anaCaptured.aswcid !== aswcid || anaCaptured.basePath !== (m?.[1] ?? null)
  anaCaptured.aswcid = aswcid
  anaCaptured.basePath = m?.[1] ?? null
  if (changed && anaSessionCallback) anaSessionCallback()
  return true
}

function anaInputUrl() {
  const base = anaCaptured.basePath
    ? `https://${ANA_HOST}/${anaCaptured.basePath}`
    : `https://${ANA_HOST}`
  return `${base}${ANA_INPUT_PATH}?aswcid=${anaCaptured.aswcid}`
}

function anaParseInputPage(html) {
  // Extract form action URL, ViewState, search button name
  const actionM = html.match(/id="conditionInput"[^>]*action="([^"]+)"/)
  if (!actionM) return null
  const action = actionM[1].replace(/&amp;/g, '&')
  const vsM = html.match(/name="javax\.faces\.ViewState"[^>]*value="([^"]+)"/)
  if (!vsM) return null
  const viewState = vsM[1]
  // Find the main search submit button (not modal buttons)
  const btnM = html.match(/name="(j_idt\d+)" value="Search"/)
    ?? html.match(/name="(j_idt\d+)" value="検索する"/)
  if (!btnM) return null
  return { action, viewState, searchBtn: btnM[1] }
}

function anaParseResults(html, date) {
  try {
    // Extract obList (flight info): new f('index','','date_html','orig','dest','dep','arr','flight',isAna,'')
    const obListM = html.match(/var obList = new Array\(\);([\s\S]*?)var ibList/)
    if (!obListM) return []
    const flightMap = {}  // index → { segs: [...] }
    const flightRe = /new f\('(\d+)'[^,]*,[^,]*,'[^']*','([^']+)','([^']+)','(\d{2}:\d{2})','(\d{2}:\d{2})','([A-Z]{2}\d+)'[^)]*\)/g
    let m
    while ((m = flightRe.exec(obListM[1])) !== null) {
      const [, idx, orig, dest, dep, arr, flight] = m
      if (!flightMap[idx]) flightMap[idx] = { segs: [] }
      // Avoid duplicate segments (each flight appears twice in obList for outbound/inbound pairs)
      const seg = { flight, origin: orig.match(/\(([A-Z]{3})\)/)?.[1] ?? orig, destination: dest.match(/\(([A-Z]{3})\)/)?.[1] ?? dest, dep, arr }
      if (!flightMap[idx].segs.some(s => s.flight === seg.flight)) {
        flightMap[idx].segs.push(seg)
      }
    }

    // Extract segment airport codes from outboundSegmentInfoMap (more reliable than display names)
    const segMapRe = /addOutboundSegmentInfoMap\('(\d+)_(\d+)',\s*'[A-Z]{2}',\s*'(\d+)',\s*'([A-Z]{3})',\s*'([A-Z]{3})'/g
    while ((m = segMapRe.exec(html)) !== null) {
      const [, flightIdx, segIdx, flightNum, orig, dest] = m
      if (flightMap[flightIdx]?.segs[+segIdx]) {
        flightMap[flightIdx].segs[+segIdx].origin = orig
        flightMap[flightIdx].segs[+segIdx].destination = dest
      }
    }

    // Extract recommendations: addRecommendation(obIdx, listIdx, null, 'fareCode', null, tax, null, tax, ..., miles, ...)
    const recRe = /addRecommendation\((\d+),\s*\d+,\s*null,\s*'(\d+)',\s*null,\s*[\d.]+,\s*null,\s*[\d.]+,\s*\w+,\s*\d+,\s*null,\s*(\d+)/g
    // Per flight index: track cabin → min miles
    const results = {}
    while ((m = recRe.exec(html)) !== null) {
      const [, obIdx, fareCode, miles] = m
      const cabin = ANA_SERVICE_LEVEL_CABIN[+fareCode]
      if (!cabin || !flightMap[obIdx]) continue
      if (!results[obIdx]) {
        const info = flightMap[obIdx]
        const segs = info.segs
        results[obIdx] = {
          date,
          origin: segs[0].origin,
          destination: segs[segs.length - 1].destination,
          segs: segs.map(s => ({
            airline: s.flight.slice(0, 2),
            flight: s.flight,
            origin: s.origin,
            destination: s.destination,
            dep: `${date}T${s.dep}:00`,
            arr: `${date}T${s.arr}:00`,
          })),
          cabins: { F: null, J: null, N: null, Y: null },
          miles: {},
          bookUrl: 'https://aswbe-i.ana.co.jp/international_asw/pages/award/search/roundtrip/award_search_roundtrip_input.xhtml',
        }
      }
      const r = results[obIdx]
      const mi = +miles
      if (r.cabins[cabin] === null) {
        r.cabins[cabin] = 1
        r.miles[cabin] = mi
      } else if (mi < (r.miles[cabin] ?? Infinity)) {
        r.miles[cabin] = mi
      }
    }
    return Object.values(results)
  } catch { return [] }
}

// The input page's ViewState and the search POST run one flow on the aswcid session; two dates in
// flight at once can overwrite each other, so one search at a time across the worker pool
let anaQueue = Promise.resolve()
function anaEnqueue(fn) {
  const run = anaQueue.then(fn)
  anaQueue = run.catch(() => {})
  return run
}

// → results HTML, or null on an error
async function anaFetchResults(origin, destination, date, cabinFilter) {
  const cabins = cabinFilter.length ? cabinFilter : ['F', 'J', 'N', 'Y']

  // Fetch input page once per search (one search covers all cabins via result parsing)
  const inputRes = await fetch(anaInputUrl(), { credentials: 'include' })
  if (!inputRes.ok) return null
  const inputHtml = await inputRes.text()
  const parsed = anaParseInputPage(inputHtml)
  if (!parsed) return null

  // Use first cabin for the search request (result page shows all cabins for ANA flights)
  // ponytail: ANA result page always shows all available cabins regardless of CFF; cabin filter applied post-parse
  const cff = ANA_CFF[cabins[0]] ?? 'CFF1'
  const body = new URLSearchParams({
    'conditionInput': 'conditionInput',
    'conditionInput_operationTicket': '',
    'conditionInput_cmnPageTicket': '0',
    'hiddenSearchMode': 'ONE_WAY',
    'itineraryButtonCheck': 'oneWay',
    'hiddenAction': 'AwardRoundTripSearchInputAction',
    'hiddenRoundtripOpenJawSelected': '0',
    'departureAirportCode:field': origin,
    'departureAirportCode:field_pctext': origin,
    'arrivalAirportCode:field': destination,
    'arrivalAirportCode:field_pctext': destination,
    'awardDepartureDate:field': date.replace(/-/g, ''),
    'hiddenBoardingClassType': '0',
    'boardingClass': cff,
    'adult:count': '1',
    'youngAdult:count': '0',
    'child:count': '0',
    'hiddenDomesticChildAge': 'false',
    'infant:count': '0',
    [parsed.searchBtn]: 'Search',
    'javax.faces.ViewState': parsed.viewState,
  })

  const res = await fetch(parsed.action, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  return res.ok ? res.text() : null
}

export const anaProgram = {
  id: 'ana',
  name: 'ANA',
  color: '#003087',
  cabins: ['F', 'J', 'N', 'Y'],
  airports: COMMON_AIRPORTS,
  requiresSession: true,
  loginUrl: `https://${ANA_HOST}${ANA_INPUT_PATH}?aswcid=1`,
  matches: [],
  matchHost: h => h.endsWith('.ana.co.jp'),

  onSessionReady(cb) {
    anaSessionCallback = cb
    if (anaTryCapture()) return
    const poll = setInterval(() => { if (anaTryCapture()) clearInterval(poll) }, 500)
  },

  isSessionReady() { return !!anaCaptured.aswcid },

  async onSearch({ origin, destination, date, cabinFilter }) {
    if (!anaCaptured.aswcid) return []
    const html = await anaEnqueue(() => anaFetchResults(origin, destination, date, cabinFilter))
    return html ? anaParseResults(html, date) : []
  },
}
