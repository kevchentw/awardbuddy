import { COMMON_AIRPORTS } from '../common/constants.js'

// ANA (All Nippon Airways) – award availability via session-based ANA booking engine
// Session: browser cookies on aswbe-i.ana.co.jp; aswcid captured from URL
// Per-day search only; parses addRecommendation() and obList data from result HTML

const ANA_HOST = 'aswbe-i.ana.co.jp'
const ANA_INPUT_PATH = '/international_asw/pages/award/search/roundtrip/award_search_roundtrip_input.xhtml'

// Our cabin → ANA CFF code
const ANA_CFF = { F: 'CFF3', J: 'CFF2', N: 'CFF4', Y: 'CFF1' }
// ANA serviceLevel → our cabin
const ANA_SERVICE_LEVEL_CABIN = { 200: 'F', 400: 'F', 600: 'J', 800: 'J', 950: 'N', 1000: 'N', 1200: 'Y', 1400: 'Y' }

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
  // Trip-type tab state is server-side; the one-way tab is a JSF command link (id needed to switch)
  const oneWay = html.match(/name="hiddenSearchMode"[^>]*value="([^"]*)"/)?.[1] === 'ONE_WAY'
  const oneWayLink = html.match(/id="onewayButton"[\s\S]{0,400}?(j_idt\d+)/)?.[1] ?? null
  return { action, viewState, searchBtn: btnM[1], oneWay, oneWayLink }
}

// obList airport names are JS string literals; the Japanese site writes them as \uXXXX escapes
// and without the "(SEA)" suffix the English site has
const anaUnescape = s => s.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))

function anaAirport(name) {
  const text = anaUnescape(name)
  return text.match(/\(([A-Z]{3})\)/)?.[1] ?? text
}

const anaIsCode = s => /^[A-Z]{3}$/.test(s)

// Arrival times carry a day marker after the clock time: "19:00<span>+1day</span>" (English),
// "19:00翌日" / "翌々日" (Japanese, \uXXXX-escaped)
function anaDayOffset(suffix) {
  const text = anaUnescape(suffix).replace(/<[^>]+>/g, '').trim()
  if (!text) return 0
  if (text.includes('翌々')) return 2
  return +(text.match(/\d/)?.[0] ?? 1)
}

function anaAddDays(date, days) {
  if (!days) return date
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function anaParseResults(html, date, origin, destination) {
  try {
    // Extract obList (flight info): new f('index','','date_html','orig','dest','dep','arr','flight',isAna,'')
    const obListM = html.match(/var obList = new Array\(\);([\s\S]*?)var ibList/)
    if (!obListM) return []
    const flightMap = {}  // index → { segs: [...] }
    const flightRe = /new f\('(\d+)'[^,]*,[^,]*,'[^']*','([^']+)','([^']+)','(\d{2}:\d{2})[^']*','(\d{2}:\d{2})([^']*)','([A-Z0-9]{2}\d+)'[^)]*\)/g
    let m
    while ((m = flightRe.exec(obListM[1])) !== null) {
      const [, idx, orig, dest, dep, arr, arrDay, flight] = m
      if (!flightMap[idx]) flightMap[idx] = { segs: [] }
      // Avoid duplicate segments (each flight appears twice in obList for outbound/inbound pairs)
      const seg = { flight, origin: anaAirport(orig), destination: anaAirport(dest), dep, arr, arrDays: anaDayOffset(arrDay), date: null }
      if (!flightMap[idx].segs.some(s => s.flight === seg.flight)) {
        flightMap[idx].segs.push(seg)
      }
    }

    // Extract segment airport codes and departure date from outboundSegmentInfoMap (more reliable than display names;
    // ANA-operated segments only, partner segments have no entry):
    // addOutboundSegmentInfoMap('0_1', 'NH', '241', 'HND', 'FUK', 'X', '20261018')
    const segMapRe = /addOutboundSegmentInfoMap\('(\d+)_(\d+)',\s*'[A-Z0-9]{2}',\s*'(\d+)',\s*'([A-Z]{3})',\s*'([A-Z]{3})'(?:,\s*'[^']*',\s*'(\d{4})(\d{2})(\d{2})')?/g
    while ((m = segMapRe.exec(html)) !== null) {
      const [, flightIdx, segIdx, flightNum, orig, dest, y, mo, d] = m
      const seg = flightMap[flightIdx]?.segs[+segIdx]
      if (seg) {
        seg.origin = orig
        seg.destination = dest
        if (y) seg.date = `${y}-${mo}-${d}`
      }
    }

    // Partner segments: take a missing code from the neighbouring segment (or the searched airports at
    // the ends) and the date from the previous arrival
    for (const { segs } of Object.values(flightMap)) {
      segs.forEach((seg, i) => {
        const prev = segs[i - 1], next = segs[i + 1]
        if (!anaIsCode(seg.origin)) {
          if (!prev && origin) seg.origin = origin
          else if (prev && anaIsCode(prev.destination)) seg.origin = prev.destination
        }
        if (!anaIsCode(seg.destination)) {
          if (!next && destination) seg.destination = destination
          else if (next && anaIsCode(next.origin)) seg.destination = next.origin
        }
        if (!seg.date) {
          const prevArr = prev && anaAddDays(prev.date, prev.arrDays)
          seg.date = !prev ? date : seg.dep < prev.arr ? anaAddDays(prevArr, 1) : prevArr
        }
      })
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
            dep: `${s.date}T${s.dep}:00`,
            arr: `${anaAddDays(s.date, s.arrDays)}T${s.arr}:00`,
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

const ANA_ONE_WAY_FIELDS = {
  'conditionInput': 'conditionInput',
  'conditionInput_operationTicket': '',
  'conditionInput_cmnPageTicket': '0',
  'hiddenSearchMode': 'ONE_WAY',
  'itineraryButtonCheck': 'oneWay',
  'hiddenAction': 'AwardRoundTripSearchInputAction',
  'hiddenRoundtripOpenJawSelected': '0',
}

async function anaPost(action, fields) {
  const res = await fetch(action, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields).toString(),
  })
  return res.ok ? res.text() : null
}

// → results HTML for one cabin (the result page only lists the requested class), or null on an error
async function anaFetchResults(origin, destination, date, cabin) {
  const inputRes = await fetch(anaInputUrl(), { credentials: 'include' })
  if (!inputRes.ok) return null
  let parsed = anaParseInputPage(await inputRes.text())
  if (!parsed) return null

  // A one-way search posted while the session sits on the round-trip tab (the default) lands on
  // browser_back_error; submit the one-way tab link first, it answers with a fresh input page
  if (!parsed.oneWay && parsed.oneWayLink) {
    const switched = await anaPost(parsed.action, {
      ...ANA_ONE_WAY_FIELDS,
      [parsed.oneWayLink]: parsed.oneWayLink,
      'javax.faces.ViewState': parsed.viewState,
    })
    parsed = switched && anaParseInputPage(switched)
    if (!parsed) return null
  }

  return anaPost(parsed.action, {
    ...ANA_ONE_WAY_FIELDS,
    'departureAirportCode:field': origin,
    'departureAirportCode:field_pctext': origin,
    'arrivalAirportCode:field': destination,
    'arrivalAirportCode:field_pctext': destination,
    'awardDepartureDate:field': date.replace(/-/g, ''),
    'hiddenBoardingClassType': '0',
    'boardingClass': ANA_CFF[cabin] ?? 'CFF1',
    'adult:count': '1',
    'youngAdult:count': '0',
    'child:count': '0',
    'hiddenDomesticChildAge': 'false',
    'infant:count': '0',
    [parsed.searchBtn]: 'Search',
    'javax.faces.ViewState': parsed.viewState,
  })
}

// Per-cabin result lists → one row per itinerary
export function anaMergeResults(lists) {
  const byFlights = new Map()
  for (const r of lists.flat()) {
    const key = r.segs.map(s => s.flight).join('-')
    const prev = byFlights.get(key)
    if (!prev) { byFlights.set(key, r); continue }
    for (const c of Object.keys(r.miles)) {
      if (prev.cabins[c] === null || r.miles[c] < prev.miles[c]) {
        prev.cabins[c] = r.cabins[c]
        prev.miles[c] = r.miles[c]
      }
    }
  }
  return [...byFlights.values()]
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
    const cabins = cabinFilter.length ? cabinFilter : ['F', 'J', 'N', 'Y']
    const lists = []
    for (const cabin of cabins) {
      const html = await anaEnqueue(() => anaFetchResults(origin, destination, date, cabin))
      if (html) lists.push(anaParseResults(html, date, origin, destination))
    }
    return anaMergeResults(lists)
  },
}
