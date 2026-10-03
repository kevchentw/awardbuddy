import { COMMON_AIRPORTS } from '../common/constants.js'
import { todayISO } from '../common/search.js'

// ANA (All Nippon Airways) – award availability via session-based ANA booking engine
// Session: browser cookies on aswbe-i.ana.co.jp; aswcid captured from URL
// Search: one day per request; parses addRecommendation() and obList data from result HTML

const ANA_HOST = 'aswbe-i.ana.co.jp'
const ANA_INPUT_PATH = '/international_asw/pages/award/search/roundtrip/award_search_roundtrip_input.xhtml'

// Our cabin → ANA CFF code
const ANA_CFF = { F: 'CFF3', J: 'CFF2', N: 'CFF4', Y: 'CFF1' }
// ANA serviceLevel → our cabin
const ANA_SERVICE_LEVEL_CABIN = { 200: 'F', 400: 'F', 600: 'J', 800: 'J', 950: 'N', 1000: 'N', 1200: 'Y', 1400: 'Y' }

const anaCaptured = { aswcid: null, basePath: null }
let anaSessionCallback = null

// Only award pages count: the login and session-error pages also carry an aswcid (aswcid=1)
function anaTryCapture() {
  if (location.hostname !== ANA_HOST || !location.pathname.includes('/pages/award/')) return false
  const m = location.pathname.match(/^\/(rei[^/]+)\//)
  const q = new URLSearchParams(location.search)
  const aswcid = q.get('aswcid')
  if (!aswcid) return false
  const changed = anaCaptured.aswcid !== aswcid || anaCaptured.basePath !== (m?.[1] ?? null)
  anaCaptured.aswcid = aswcid
  anaCaptured.basePath = m?.[1] ?? null
  if (changed) anaInput = null
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
        r.cabins[cabin] = true  // the page gives no seat count
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
  // A dead session or a rejected flow redirects to session_error / browser_back_error (HTTP 200)
  if (!res.ok || /error/.test(new URL(res.url).pathname)) return null
  return res.text()
}

// → the parsed input page on the one-way tab, or null when the session is unusable
async function anaOneWayInput() {
  const inputRes = await fetch(anaInputUrl(), { credentials: 'include' })
  if (!inputRes.ok) return null
  const parsed = anaParseInputPage(await inputRes.text())
  // A one-way search posted while the session sits on the round-trip tab (the default) lands on
  // browser_back_error; submit the one-way tab link first, it answers with a fresh input page
  if (!parsed || parsed.oneWay || !parsed.oneWayLink) return parsed
  const switched = await anaPost(parsed.action, {
    ...ANA_ONE_WAY_FIELDS,
    [parsed.oneWayLink]: parsed.oneWayLink,
    'javax.faces.ViewState': parsed.viewState,
  })
  return switched ? anaParseInputPage(switched) : null
}

// The input page's ViewState keeps working for later searches (other cabins and dates), so it is
// fetched once and reused until a search is rejected
let anaInput = null

// → results HTML for one cabin (the result page only lists the requested class), or null when the
// session is unusable
async function anaFetchResults(origin, destination, date, cabin) {
  const search = input => anaPost(input.action, {
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
    [input.searchBtn]: 'Search',
    'javax.faces.ViewState': input.viewState,
  })

  const reused = !!anaInput
  anaInput ??= await anaOneWayInput()
  let html = anaInput && await search(anaInput)
  if (!html && reused) {
    anaInput = await anaOneWayInput()
    html = anaInput && await search(anaInput)
  }
  if (!html) anaInput = null
  return html
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

// Calendar: the public award calendar (cam.ana.co.jp/psz/tokutencal) reads one static JSONP file per
// class and zone, CAL_<class>_<zone>_<status>.js, no session needed:
//   cal([["Departure","Arrival","2026/10/3",…], ["NRT","LAX",1,1,2,…], ["LAX","NRT",…], …])
// Rows come in pairs, from and to Japan, for each nonstop ANA route of the zone, with a state per day
// for about 6 months: 3 wide open, 2 open, 1 tight / waitlisted, 0 unavailable. No mileage. The
// status is the member's tier: elite tiers are shown more seats, which only that tier can book (the
// files themselves are public). The files send no CORS header, so they load as a script with the
// fixed callback cal(). The page leaves out the classes a zone doesn't offer: their files are a 404
// or left over from years ago. (Its campaign-period overlay, data_sale_info.js, only lists 2019.)
const ANA_CAL_URL = 'https://cam.ana.co.jp/amctop/'
const ANA_CAL_CLASS = { Y: 'X', N: 'R', J: 'I', F: 'O' }
const ANA_CAL_STATUSES = [
  { value: 'N', label: 'General member' },
  { value: 'B', label: 'Bronze' },
  { value: 'P', label: 'Platinum' },
  { value: 'D', label: 'Diamond' },
  { value: 'S', label: 'Super Flyers (SFC)' },
]
const ANA_CAL_ZONES = [
  { value: 'Z2', label: 'Zone 2 South Korea · Russia 1' },
  { value: 'Z3', label: 'Zone 3 Asia 1' },
  { value: 'Z4', label: 'Zone 4 Asia 2' },
  { value: 'Z5', label: 'Zone 5 Hawaii' },
  { value: 'Z6', label: 'Zone 6 North America' },
  { value: 'Z7', label: 'Zone 7 Europe · Russia 2' },
  { value: 'ZA', label: 'Zone 10 Oceania · Micronesia' },
]
const ANA_CAL_NO_CABIN = { N: ['Z2', 'Z3'], F: ['Z2', 'Z3', 'Z4', 'ZA'] }

// Required mileage, one way between Japan and the zone, [low, regular, high] season, from ANA's chart
// for awards issued on/after 2025-06-24 (ANA_CHART_URL; round trip is twice)
export const ANA_CHART_URL = 'https://www.ana.co.jp/en/jp/guide/amc/award/international/terms/'
const ANA_ONE_WAY_MILES = {
  Z2: { Y: [6000, 7500, 12000], J: [18000, 20500, 25000] },
  Z3: { Y: [8500, 10000, 15000], N: [15000, 16500, 23500], J: [24000, 26500, 32500] },
  Z4: { Y: [15000, 17500, 25000], N: [23000, 25500, 35500], J: [40000, 42500, 47500], F: [57500, 60000, 85500] },
  Z5: { Y: [17500, 20000, 32500], N: [26500, 29000, 44000], J: [40000, 42500, 67500], F: [60000, 70000, 120000] },
  Z6: { Y: [20000, 25000, 36000], N: [31000, 36000, 50500], J: [50000, 52500, 82500], F: [75000, 85000, 150000] },
  Z7: { Y: [22500, 27500, 39000], N: [33500, 38500, 53500], J: [55000, 57500, 90000], F: [82500, 95000, 165000] },
  ZA: { Y: [18500, 22500, 32500], N: [27000, 31000, 44000], J: [40000, 45000, 67500] },
}
// Seasonality charts by zone group, [first day "MM-DD", last day] per season, by year of the flight date
// (only the high and low periods; every other day is regular). The season of a one-way award is the
// season of its departure date.
const ANA_SEASON_GROUP = { Z2: 'asia', Z3: 'asia', Z4: 'asia', Z6: 'longhaul', Z7: 'longhaul', Z5: 'resort', ZA: 'resort' }
const ANA_SEASONS = {
  asia: {
    2026: { L: [['01-05', '02-13'], ['04-01', '04-28'], ['05-11', '06-30']],
      H: [['01-01', '01-04'], ['04-29', '05-10'], ['07-18', '08-23'], ['12-21', '12-31']] },
    2027: { L: [['01-05', '02-03'], ['04-12', '04-28'], ['05-10', '06-30'], ['12-01', '12-19']],
      H: [['01-01', '01-04'], ['02-04', '02-06'], ['04-29', '05-09'], ['07-16', '08-23'], ['10-01', '10-07'], ['12-20', '12-31']] },
    2028: { L: [['01-05', '01-24']], H: [['01-01', '01-04'], ['01-25', '01-31']], until: '03-31' },
  },
  longhaul: {
    2026: { L: [['01-06', '02-28'], ['04-01', '04-28']],
      H: [['01-01', '01-03'], ['04-29', '05-09'], ['07-16', '08-23'], ['12-19', '12-31']] },
    2027: { L: [['01-06', '02-28']],
      H: [['01-01', '01-03'], ['04-29', '05-09'], ['07-16', '08-22'], ['12-20', '12-31']] },
    2028: { L: [['01-06', '02-29']], H: [['01-01', '01-03']], until: '03-31' },
  },
  resort: {
    2026: { L: [['01-07', '02-28'], ['04-01', '04-27'], ['05-10', '05-31'], ['07-01', '07-15']],
      H: [['01-01', '01-03'], ['04-28', '05-09'], ['07-16', '08-23'], ['12-19', '12-31']] },
    2027: { L: [['01-06', '02-28'], ['04-01', '04-28'], ['05-10', '05-31']],
      H: [['01-01', '01-03'], ['04-29', '05-09'], ['07-16', '08-22'], ['12-20', '12-31']] },
    2028: { L: [['01-06', '02-29']], H: [['01-01', '01-03']], until: '03-31' },
  },
}
const ANA_SEASON_INDEX = { L: 0, R: 1, H: 2 }

// 'L' / 'R' / 'H' for a flight date between Japan and the zone, null past the published charts
export function anaSeason(zone, date) {
  const year = ANA_SEASONS[ANA_SEASON_GROUP[zone]]?.[date.slice(0, 4)]
  const md = date.slice(5)
  if (!year || (year.until && md > year.until)) return null
  for (const s of ['L', 'H']) if (year[s].some(([a, b]) => md >= a && md <= b)) return s
  return 'R'
}

// One-way miles for a cabin on a date, null when the chart or the season isn't known
export function anaMiles(zone, cabin, date) {
  const season = anaSeason(zone, date)
  return season ? ANA_ONE_WAY_MILES[zone]?.[cabin]?.[ANA_SEASON_INDEX[season]] ?? null : null
}
const ANA_CAL_TTL_MS = 10 * 60 * 1000
const ANA_CAL_TIMEOUT_MS = 10000

// File rows → { dates, routes: [{ from, to, out, back }] }: from is the Japanese airport, out / back the
// day states from / to Japan, days before today left out (all of them in a stale file); null if the
// file didn't load
export function anaParseZoneCalendar(rows, today) {
  if (!Array.isArray(rows) || !Array.isArray(rows[0])) return null
  const cols = []
  rows[0].forEach((v, i) => {
    const m = i >= 2 && String(v).match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/)
    const date = m && `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
    if (date && date >= today) cols.push({ i, date })
  })
  const routes = []
  for (let i = 1; i + 1 < rows.length; i += 2) {
    const out = rows[i], back = rows[i + 1]
    if (out[0] !== back[1] || out[1] !== back[0]) continue
    routes.push({ from: out[0], to: out[1], out: cols.map(c => +out[c.i] || 0), back: cols.map(c => +back[c.i] || 0) })
  }
  return { dates: cols.map(c => c.date), routes }
}

// One script at a time: every file calls the same global cal()
let anaCalQueue = Promise.resolve()
function anaCalLoad(file) {
  const run = anaCalQueue.then(() => new Promise(resolve => {
    const prev = window.cal
    const script = document.createElement('script')
    let rows = null
    const done = () => {
      clearTimeout(timer)
      script.remove()
      window.cal = prev
      resolve(rows)
    }
    const timer = setTimeout(done, ANA_CAL_TIMEOUT_MS)
    window.cal = data => { rows = data }
    script.onload = script.onerror = done
    script.src = `${ANA_CAL_URL}${file}?_=${Date.now()}`
    document.head.appendChild(script)
  }))
  anaCalQueue = run
  return run
}

const anaCalFiles = new Map()  // "X_Z6_N" → { at, rows: Promise }
function anaCalRows(cls, zone, status) {
  const key = `${cls}_${zone}_${status}`
  const hit = anaCalFiles.get(key)
  if (hit && Date.now() - hit.at < ANA_CAL_TTL_MS) return hit.rows
  const rows = anaCalLoad(`CAL_${key}.js`).then(data => {
    if (!Array.isArray(data)) anaCalFiles.delete(key)  // try again next time
    return data
  })
  anaCalFiles.set(key, { at: Date.now(), rows })
  return rows
}

export const anaProgram = {
  id: 'ana',
  name: 'ANA',
  color: '#003087',
  cabins: ['F', 'J', 'N', 'Y'],
  airports: COMMON_AIRPORTS,
  requiresSession: true,
  // The entry ANA's own award calendar links to: the member login, then the award search page
  // (opening the input page with ?aswcid=1 lands on the session error page)
  loginUrl: `https://${ANA_HOST}${ANA_INPUT_PATH}?CONNECTION_KIND=JPN&LANG=en`,
  matches: [],
  matchHost: h => h.endsWith('.ana.co.jp'),

  onSessionReady(cb) {
    anaSessionCallback = cb
    if (anaTryCapture()) return
    const poll = setInterval(() => { if (anaTryCapture()) clearInterval(poll) }, 500)
  },

  isSessionReady() { return !!anaCaptured.aswcid },
  expiredMessage: '⚠ ANA session expired — reload the award search page and try again',

  async onSearch({ origin, destination, date, cabinFilter }) {
    if (!anaCaptured.aswcid) return []
    const cabins = cabinFilter.length ? cabinFilter : ['F', 'J', 'N', 'Y']
    const lists = []
    for (const cabin of cabins) {
      const html = await anaEnqueue(() => anaFetchResults(origin, destination, date, cabin))
      if (!html) return 'SESSION_EXPIRED'
      lists.push(anaParseResults(html, date, origin, destination))
    }
    return anaMergeResults(lists)
  },

  // Calendar mode shows ANA's award calendar as the site does: every route of a zone, one class
  zoneCalendar: {
    zones: ANA_CAL_ZONES,
    cabins: ['Y', 'N', 'J', 'F'],
    cabinsFor: zone => ['Y', 'N', 'J', 'F'].filter(c => !ANA_CAL_NO_CABIN[c]?.includes(zone)),
    statuses: ANA_CAL_STATUSES,
    statusHint: 'Elite tiers see more seats, but only members with that status can book them',
    note: 'ANA\'s award calendar: nonstop ANA flights to/from Japan, about 6 months ahead. Miles are one way from ANA\'s chart, by the season of the day.',
    // Required-miles chart for the zone: one row per cabin, [low, regular, high]
    chart: zone => ANA_ONE_WAY_MILES[zone] ?? null,
    chartUrl: ANA_CHART_URL,
    miles: anaMiles,
    async load(zone, cabin, status) {
      const cls = ANA_CAL_CLASS[cabin]
      const tier = ANA_CAL_STATUSES.some(s => s.value === status) ? status : 'N'
      return cls ? anaParseZoneCalendar(await anaCalRows(cls, zone, tier), todayISO()) : null
    },
  },
}
