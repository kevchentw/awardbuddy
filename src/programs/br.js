import { sleep } from '../common/search.js'

// EVA Air – award availability via ASP.NET WebForms page
// Requires login; captures __ZIPSTATE from page DOM or fetches fresh.

const BR_SEARCH_URL = 'https://booking.evaair.com/flyeva/EVA/B2C/plan-your-journey/award-upgrade-availability/award-upgrade-availability.aspx'
const BR_DELAY_MS = 700
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

// Format date for aria-label matching: "2026-07-08" → "Jul. 8, 2026"
function brFormatAriaDate(date) {
  const [y, m, d] = date.split('-')
  return `${BR_MONTH_ABBR[+m - 1]}. ${+d}, ${y}`
}

function brBuildBody(origin, destination, date, cabinParam, zipState) {
  // date: YYYY-MM-DD → YYYY/MM/DD
  const fmtDate = date.replace(/-/g, '/')
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
    const label = el.getAttribute('aria-label') || ''
    // label: "Jul. 8, 2026Wednesday" → parse month abbr, day, year
    const dm = label.match(/^([A-Za-z]+)\.\s+(\d+),\s+(\d{4})/)
    if (!dm) continue
    const mon = BR_MONTH_ABBR.indexOf(dm[1])
    if (mon === -1) continue
    const date = `${dm[3]}-${String(mon + 1).padStart(2, '0')}-${String(+dm[2]).padStart(2, '0')}`
    map[date] = +m[1]
  }
  return map
}

function brParseResponse(html, origin, destination, date, cabin) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const ariaTarget = brFormatAriaDate(date)

  // Find which day column index matches our target date
  // aria-label like "Jul. 8, 2026Wednesday"
  const headerRow = doc.querySelectorAll('[aria-label]')
  let dayIdx = -1
  for (const el of headerRow) {
    const label = el.getAttribute('aria-label') || ''
    if (label.startsWith(ariaTarget)) {
      // Extract column index from element id: _td_Day_N
      const m = el.id.match(/_td_Day_(\d+)$/)
      if (m) { dayIdx = +m[1]; break }
    }
  }
  if (dayIdx === -1) return []

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

async function brSearchCabin(origin, destination, date, cabin) {
  await sleep(BR_DELAY_MS)
  const body = brBuildBody(origin, destination, date, BR_CABIN_PARAM[cabin], brCaptured.zipState)
  let res = await fetch(BR_SEARCH_URL, {
    method: 'POST', credentials: 'include',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  })
  // Session may have expired – refresh once
  if (!res.ok || res.url.includes('login')) {
    const ok = await brFetchSession()
    if (!ok) return []
    res = await fetch(BR_SEARCH_URL, {
      method: 'POST', credentials: 'include',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: brBuildBody(origin, destination, date, BR_CABIN_PARAM[cabin], brCaptured.zipState),
    })
    if (!res.ok) return []
  }
  const html = await res.text()
  // Update ZIPSTATE for next request
  const newZs = brExtractZipState(html)
  if (newZs) brCaptured.zipState = newZs
  return brParseResponse(html, origin, destination, date, cabin)
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

  isSessionReady() { return !!brCaptured.zipState && location.hostname === 'booking.evaair.com' },

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
        await sleep(BR_DELAY_MS)
        try {
          const body = brBuildBody(origin, destination, weekStart, BR_CABIN_PARAM[cabin], brCaptured.zipState)
          let res = await fetch(BR_SEARCH_URL, {
            method: 'POST', credentials: 'include',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body,
          })
          if (!res.ok || res.url.includes('login')) {
            const ok = await brFetchSession()
            if (!ok) return 'SESSION_EXPIRED'
            res = await fetch(BR_SEARCH_URL, {
              method: 'POST', credentials: 'include',
              headers: { 'content-type': 'application/x-www-form-urlencoded' },
              body: brBuildBody(origin, destination, weekStart, BR_CABIN_PARAM[cabin], brCaptured.zipState),
            })
            if (!res.ok) { done++; continue }
          }
          const html = await res.text()
          const newZs = brExtractZipState(html)
          if (newZs) brCaptured.zipState = newZs

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
        const rows = await brSearchCabin(origin, destination, date, cabin)
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
