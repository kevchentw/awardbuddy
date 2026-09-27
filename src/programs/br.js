import { sleep } from '../common/search.js'

// EVA Air – award availability via ASP.NET WebForms page
// Requires login; captures __ZIPSTATE from page DOM or fetches fresh.
// Akamai Bot Manager guards the search POST: when it objects it answers 200 with a "Challenge
// Validation" (sec_chlge_form) or "Access Denied" page instead of results. That must surface as
// SESSION_EXPIRED – parsing it as an empty table made every search look like "no seats".

const BR_SEARCH_URL = 'https://booking.evaair.com/flyeva/EVA/B2C/plan-your-journey/award-upgrade-availability/award-upgrade-availability.aspx'
// Minimum gap between POSTs, counted from the last one – including the user's own search that
// loaded this page. Shorter gaps (700 ms, 3 s) got challenged within a few requests.
const BR_DELAY_MS = 15000
// EY=Economy(Y), PE=PremiumEconomy(N), SD=Business/RoyalLaurel(J)
const BR_CABIN_PARAM = { Y: 'EY', N: 'PE', J: 'SD' }
const BR_MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Fixed one-way award chart for EVA/UNI-operated flights (evaair.com, Sep 2026).
// Priced by origin/destination zone; connections via TPE don't change the zone.
const BR_ZONE_OF = {
  TPE: 'TW', TSA: 'TW', KHH: 'TW',
  HKG: 'HK', MFM: 'HK',
  BNE: 'OC',
  LAX: 'AM', SFO: 'AM', SEA: 'AM', YVR: 'AM',
  ORD: 'AM+', JFK: 'AM+', IAH: 'AM+', DFW: 'AM+', IAD: 'AM+', YYZ: 'AM+',
  AMS: 'EU', LHR: 'EU', MXP: 'EU', MUC: 'EU', CDG: 'EU', VIE: 'EU',
}
const BR_CHART = {
  TWHK: { Y: 10000, J: 25000 },
  ASIA: { Y: 17500, N: 20000, J: 25000 },
  OC: { Y: 50000, J: 75000 },
  AM: { Y: 50000, N: 55000, J: 75000 },
  'AM+': { Y: 55000, N: 60000, J: 80000 },
  EU: { Y: 50000, N: 55000, J: 75000 },
}

// Returns miles, or 0 when the route isn't on the chart (e.g. long-haul ↔ long-haul)
export function brAwardMiles(origin, destination, cabin) {
  const zo = BR_ZONE_OF[origin] || 'ASIA', zd = BR_ZONE_OF[destination] || 'ASIA'
  const isAsia = z => z === 'TW' || z === 'HK' || z === 'ASIA'
  let zone
  if (isAsia(zo) && isAsia(zd)) zone = [zo, zd].sort().join('') === 'HKTW' ? 'TWHK' : 'ASIA'
  else if (isAsia(zo) !== isAsia(zd)) zone = isAsia(zo) ? zd : zo
  return BR_CHART[zone]?.[cabin] ?? 0
}

const brCaptured = { zipState: null }
let brSessionCallback = null
let brChallenged = false
let brLastPostAt = Date.now()  // this page is itself the result of a POST when the user searched by hand

// Akamai trusts scripted POSTs far more once the user has run a real search in this tab, so we
// only start once the page shows a results week (i.e. it was loaded by the form's own POST).
const brHasManualSearch = () => !!document.querySelector('[aria-label][id*="_td_Day_"]')

export const BR_CHALLENGE_MESSAGE = '⚠ EVA bot check — run one search on the EVA page by hand, then search again'

export const brIsBlockedPage = html =>
  html.includes('sec_chlge_form') || /<title>\s*(Challenge Validation|Access Denied)\s*<\/title>/i.test(html)

function brExtractZipState(html) {
  const m = html.match(/id="__ZIPSTATE"[^>]*value="([^"]+)"/)
  return m ? m[1] : null
}

function brTryCapture() {
  const el = document.getElementById('__ZIPSTATE')
  if (!el?.value) return false
  brCaptured.zipState = el.value
  if (brSessionCallback) brSessionCallback()
  return true
}

async function brFetchSession() {
  try {
    const res = await fetch(BR_SEARCH_URL, { credentials: 'include' })
    if (!res.ok) return false
    const html = await res.text()
    const zs = brExtractZipState(html)
    if (!zs) return false
    brCaptured.zipState = zs
    if (brSessionCallback) brSessionCallback()
    return true
  } catch { return false }
}

// Day header aria-label → "YYYY-MM-DD". Seen as "May 16, 2027Sunday"; older pages had "Jul. 8, 2026…"
export function brParseAriaDate(label) {
  const dm = label.match(/^([A-Za-z]{3})[a-z]*\.?\s+(\d+),\s+(\d{4})/)
  const mon = dm ? BR_MONTH_ABBR.indexOf(dm[1]) : -1
  if (mon === -1) return null
  return `${dm[3]}-${String(mon + 1).padStart(2, '0')}-${String(+dm[2]).padStart(2, '0')}`
}

function brBuildBody(origin, destination, date, cabinParam, zipState) {
  // The form's own date inputs hold YYYY-MM-DD
  const fmtDate = date
  return new URLSearchParams({
    __EVENTTARGET: '',
    __EVENTARGUMENT: '',
    __ZIPSTATE: zipState,
    __VIEWSTATE: '',
    __VIEWSTATEENCRYPTED: '',
    'ctl00$__MasterEVENTTARGET': 'ctl00$content$btn_ok',
    'ctl00$__MasterEVENTARGUMENT': '',
    languageLocation: 'North America',
    languageSelector: '4',
    'ctl00$content$hid_Dep': origin,
    'ctl00$content$hid_Arr': destination,
    'ctl00$content$hid_From': '',
    'ctl00$content$hid_To': '',
    'ctl00$content$hid_Segment': '',
    'ctl00$content$hid_SearchType': '',
    'ctl00$content$hid_InitGoDate': '',
    'ctl00$content$hid_InitBackDate': '',
    'ctl00$content$rbn_SearchType': 'award',
    'ctl00$content$rbn_Segment': 'ONE_WAY',
    'ctl00$content$txt_formcity': origin,
    'ctl00$content$txt_tocity': destination,
    'ctl00$content$txt_tbGoYYYYMM': fmtDate,
    'ctl00$content$txt_tbBackYYYYMM': fmtDate,
    'ctl00$content$txt_tbGo2YYYYMM': fmtDate,
    'ctl00$content$ddl_Award_Cabin': cabinParam,
    'ctl00$content$ddl_Upgrade_Cabin': 'PE',
    'ctl00$content$ddl_PassengerCount': '1',
  }).toString()
}

// Returns { "YYYY-MM-DD": colIdx } for all 7 day headers visible in the response
function brParseWeekDates(doc) {
  const map = {}
  for (const el of doc.querySelectorAll('[aria-label][id*="_td_Day_"]')) {
    const m = el.id.match(/_td_Day_(\d+)$/)
    if (!m) continue
    const date = brParseAriaDate(el.getAttribute('aria-label') || '')
    if (date) map[date] = +m[1]
  }
  return map
}

function brParseResponse(html, origin, destination, date, cabin) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const dayIdx = brParseWeekDates(doc)[date]
  if (dayIdx == null) return []

  // Each flight row: th with flight info, tds for each day
  const rows = doc.querySelectorAll('#content_control_Award_AvailabilityGO_div_Result tr.table-dataRow')
  const results = []
  for (const row of rows) {
    const td = row.querySelector(`[id$="_td_Day_${dayIdx}"]`)
    if (!td) continue
    const img = td.querySelector('img')
    if (!img || img.alt.trim() !== 'Available') continue

    // Parse flight info from th
    const th = row.querySelector('th')
    if (!th) continue
    const flightNums = [...th.querySelectorAll('.table-flightNumber')].map(el => el.textContent.trim())
    // Each li: "BR184  TPE  07:55  NRT  12:25"
    const lis = [...th.querySelectorAll('li')]

    const segs = []
    for (let i = 0; i < lis.length; i++) {
      const text = lis[i].textContent.replace(/\s+/g, ' ').trim()
      // Match: "BR184 TPE 07:55 NRT 12:25"
      const m = text.match(/^((?:BR|[A-Z]{2})\d+)\s+([A-Z]{3})\s+(\d{2}:\d{2})\s+([A-Z]{3})\s+(\d{2}:\d{2})/)
      if (!m) continue
      const [, flight, org, dep, dst, arr] = m
      segs.push({
        airline: flight.slice(0, 2),
        flight,
        origin: org,
        destination: dst,
        dep: `${date}T${dep}:00`,
        arr: `${date}T${arr}:00`,
      })
    }
    if (!segs.length) {
      // fallback: use origin/destination from search params
      segs.push({ airline: 'BR', flight: flightNums[0] || 'BR???', origin, destination, dep: `${date}T00:00:00`, arr: `${date}T00:00:00` })
    }

    const cabins = { F: null, J: null, N: null, Y: null }
    cabins[cabin] = 1  // ponytail: EVA only returns available/not, no seat count
    const miles = { [cabin]: brAwardMiles(origin, destination, cabin) }
    results.push({ date, origin, destination, segs, cabins, miles, duration: null, bookUrl: BR_SEARCH_URL })
  }
  return results
}

// One POST at a time: the UI's worker pool would otherwise fire several at once and trip Akamai.
// → results HTML, null (network/HTTP error) or 'SESSION_EXPIRED' (login lost or bot check)
let brQueue = Promise.resolve()
function brPost(origin, destination, date, cabin) {
  const run = brQueue.then(() => brPostNow(origin, destination, date, cabin))
  brQueue = run.catch(() => {})
  return run
}

// A results page covers the whole Sun–Sat week around the requested date, so a date-range search
// needs one POST per cabin per week, not per day. Akamai starts challenging after a couple of
// scripted POSTs, so every request saved counts. Failures aren't cached. The calendar fills the
// same cache, so searching a day it already covered costs nothing – hence a TTL longer than a
// multi-month calendar run at BR_DELAY_MS.
const BR_WEEK_TTL_MS = 30 * 60 * 1000
const brWeekCache = new Map()

export function brWeekKey(origin, destination, date, cabin) {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - d.getUTCDay())
  return `${origin}|${destination}|${cabin}|${d.toISOString().slice(0, 10)}`
}

function brPostWeek(origin, destination, date, cabin) {
  const key = brWeekKey(origin, destination, date, cabin)
  const hit = brWeekCache.get(key)
  if (hit && Date.now() - hit.at < BR_WEEK_TTL_MS) return hit.html
  const html = brPost(origin, destination, date, cabin)
  brWeekCache.set(key, { at: Date.now(), html })
  html.then(h => { if (typeof h !== 'string' || h === 'SESSION_EXPIRED') brWeekCache.delete(key) },
    () => brWeekCache.delete(key))
  return html
}

async function brPostNow(origin, destination, date, cabin) {
  if (brChallenged) return 'SESSION_EXPIRED'
  await sleep(brLastPostAt + BR_DELAY_MS - Date.now())
  brLastPostAt = Date.now()
  const post = () => fetch(BR_SEARCH_URL, {
    method: 'POST', credentials: 'include',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: brBuildBody(origin, destination, date, BR_CABIN_PARAM[cabin], brCaptured.zipState),
  })
  const blocked = () => {
    brChallenged = true
    brSessionCallback?.()
    return 'SESSION_EXPIRED'
  }
  let res = await post()
  if (res.status === 403) return blocked()
  // Session may have expired – refresh once
  if (!res.ok || res.url.includes('login')) {
    if (!await brFetchSession()) return 'SESSION_EXPIRED'
    await sleep(BR_DELAY_MS)
    brLastPostAt = Date.now()
    res = await post()
    if (!res.ok) return null
  }
  const html = await res.text()
  if (brIsBlockedPage(html)) return blocked()
  // Update ZIPSTATE for next request
  const newZs = brExtractZipState(html)
  if (newZs) brCaptured.zipState = newZs
  return html
}

const BR_AIRPORTS = [
  { code: 'TPE', name: 'Taipei (Taoyuan)' },
  { code: 'KHH', name: 'Kaohsiung' },
  { code: 'TSA', name: 'Taipei (Songshan)' },
  { code: 'HKG', name: 'Hong Kong' },
  { code: 'MFM', name: 'Macau' },
  { code: 'PEK', name: 'Beijing' },
  { code: 'CTU', name: 'Chengdu' },
  { code: 'CAN', name: 'Guangzhou' },
  { code: 'HGH', name: 'Hangzhou' },
  { code: 'SHA', name: 'Shanghai (Hongqiao)' },
  { code: 'PVG', name: 'Shanghai (Pudong)' },
  { code: 'SZX', name: 'Shenzhen' },
  { code: 'XMN', name: 'Xiamen' },
  { code: 'AOJ', name: 'Aomori' },
  { code: 'AKJ', name: 'Asahikawa' },
  { code: 'PUS', name: 'Busan' },
  { code: 'FUK', name: 'Fukuoka' },
  { code: 'KMQ', name: 'Komatsu' },
  { code: 'MYJ', name: 'Matsuyama' },
  { code: 'OKA', name: 'Okinawa' },
  { code: 'KIX', name: 'Osaka (Kansai)' },
  { code: 'UKB', name: 'Osaka (Kobe)' },
  { code: 'CTS', name: 'Sapporo' },
  { code: 'SDJ', name: 'Sendai' },
  { code: 'GMP', name: 'Seoul (Gimpo)' },
  { code: 'ICN', name: 'Seoul (Incheon)' },
  { code: 'HND', name: 'Tokyo (Haneda)' },
  { code: 'NRT', name: 'Tokyo (Narita)' },
  { code: 'HKD', name: 'Hakodate' },
  { code: 'CRK', name: 'Angeles (Clark)' },
  { code: 'BKK', name: 'Bangkok' },
  { code: 'CEB', name: 'Cebu' },
  { code: 'CNX', name: 'Chiang Mai' },
  { code: 'DAD', name: 'Da Nang' },
  { code: 'DPS', name: 'Denpasar Bali' },
  { code: 'HAN', name: 'Hanoi' },
  { code: 'SGN', name: 'Ho Chi Minh City' },
  { code: 'CGK', name: 'Jakarta' },
  { code: 'KUL', name: 'Kuala Lumpur' },
  { code: 'MNL', name: 'Manila' },
  { code: 'KTI', name: 'Phnom Penh' },
  { code: 'SIN', name: 'Singapore' },
  { code: 'DEL', name: 'Delhi' },
  { code: 'ORD', name: "Chicago (O'Hare)" },
  { code: 'DFW', name: 'Dallas' },
  { code: 'IAH', name: 'Houston' },
  { code: 'LAX', name: 'Los Angeles' },
  { code: 'JFK', name: 'New York (JFK)' },
  { code: 'SFO', name: 'San Francisco' },
  { code: 'SEA', name: 'Seattle' },
  { code: 'YYZ', name: 'Toronto' },
  { code: 'YVR', name: 'Vancouver' },
  { code: 'IAD', name: 'Washington D.C.' },
  { code: 'AMS', name: 'Amsterdam' },
  { code: 'LHR', name: 'London (Heathrow)' },
  { code: 'MXP', name: 'Milan (Malpensa)' },
  { code: 'MUC', name: 'Munich' },
  { code: 'CDG', name: 'Paris (CDG)' },
  { code: 'VIE', name: 'Vienna' },
  { code: 'BNE', name: 'Brisbane' },
]

export const brProgram = {
  id: 'br',
  name: 'EVA Air',
  color: '#006537',
  cabins: ['J', 'N', 'Y'],
  requiresSession: true,
  loginUrl: 'https://booking.evaair.com/flyeva/eva/b2c/plan-your-journey/award-upgrade-availability/login.aspx?lang=en-us',
  airports: BR_AIRPORTS,
  matches: [],
  matchHost: h => h === 'evaair.com' || h.endsWith('.evaair.com'),
  expiredMessage: BR_CHALLENGE_MESSAGE,
  sessionHint: 'Search one route on this EVA page by hand first',
  searchTip: 'EVA blocks requests quickly: use Calendar first to find days with seats, then search those days',

  onSessionReady(cb) {
    brSessionCallback = cb
    if (brTryCapture()) return
    let attempts = 0
    let fetchPending = false
    const poll = setInterval(async () => {
      if (brTryCapture()) { clearInterval(poll); return }
      if (++attempts % 6 === 0 && !fetchPending) {
        fetchPending = true
        await brFetchSession()
        fetchPending = false
        if (brCaptured.zipState) { clearInterval(poll); return }
      }
      if (attempts > 120) clearInterval(poll)
    }, 500)
  },

  // A bot check sticks until the page is reloaded (which re-runs Akamai's sensor)
  isSessionReady() {
    return !brChallenged && !!brCaptured.zipState && location.hostname === 'booking.evaair.com' && brHasManualSearch()
  },

  calendarRequestsPerRoute(fromMonth, toMonth, cabinFilter) {
    const cabins = (cabinFilter.length ? cabinFilter : ['J', 'N', 'Y']).filter(c => c !== 'F')
    const start = new Date(`${fromMonth}-01`)
    const end = new Date(`${toMonth}-28`); end.setMonth(end.getMonth() + 1)
    let weeks = 0
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) weeks++
    return cabins.length * weeks
  },

  async onCalendarSearch(origin, destination, cabins, fromMonth, toMonth, onProgress) {
    const cabinsToSearch = (cabins.length ? cabins : ['J', 'N', 'Y']).filter(c => c !== 'F')
    // Step through weeks (7 days) from start of fromMonth to end of toMonth
    const startDate = new Date(`${fromMonth}-01`)
    const endDate = new Date(`${toMonth}-28`) // safe last-week anchor; we filter by month range below
    // Extend to cover the full toMonth
    endDate.setMonth(endDate.getMonth() + 1)

    const weekStarts = []
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 7))
      weekStarts.push(d.toISOString().slice(0, 10))

    const total = cabinsToSearch.length * weekStarts.length
    let done = 0
    const byDate = {}

    for (const cabin of cabinsToSearch) {
      for (const weekStart of weekStarts) {
        if (weekStart < fromMonth || weekStart > toMonth + '-38') { done++; continue }
        onProgress?.(null, { done, total, label: `${cabin} – week of ${weekStart}` })
        try {
          const html = await brPostWeek(origin, destination, weekStart, cabin)
          if (html === 'SESSION_EXPIRED') return html
          if (!html) { done++; continue }

          const doc = new DOMParser().parseFromString(html, 'text/html')
          const weekDates = brParseWeekDates(doc)
          const rows = doc.querySelectorAll('#content_control_Award_AvailabilityGO_div_Result tr.table-dataRow')
          const partial = {}
          const miles = brAwardMiles(origin, destination, cabin)
          for (const [date, colIdx] of Object.entries(weekDates)) {
            if (date < fromMonth || date > toMonth + '-31') continue
            for (const row of rows) {
              const td = row.querySelector(`[id$="_td_Day_${colIdx}"]`)
              if (!td) continue
              const img = td.querySelector('img')
              if (!img || img.alt.trim() !== 'Available') continue
              if (!byDate[date]) byDate[date] = {}
              byDate[date][cabin] = miles
              if (!partial[date]) partial[date] = {}
              partial[date][cabin] = miles
              break // any available flight on this day counts
            }
          }
          done++
          onProgress?.(Object.keys(partial).length ? partial : null, { done, total })
        } catch { done++ }
      }
    }
    return byDate
  },

  async onSearch({ origin, destination, date, cabinFilter }) {
    const cabins = cabinFilter.length ? cabinFilter.filter(c => c !== 'F') : ['J', 'N', 'Y']
    // Search each cabin separately; merge results by flight
    const byFlight = {}
    for (const cabin of cabins) {
      try {
        const html = await brPostWeek(origin, destination, date, cabin)
        if (html === 'SESSION_EXPIRED') return html
        if (!html) continue
        const rows = brParseResponse(html, origin, destination, date, cabin)
        for (const row of rows) {
          const key = row.segs.map(s => s.flight).join('+')
          if (!byFlight[key]) byFlight[key] = row
          else { byFlight[key].cabins[cabin] = 1; byFlight[key].miles[cabin] = row.miles[cabin] }
        }
      } catch {}
    }
    return Object.values(byFlight)
  },
}
