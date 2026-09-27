// Air Canada – Aeroplan award availability
// Auth: intercepted from page's own API calls (Akamai blocks direct calls)
// Strategy: patch fetch at document-start (before Akamai wraps it) to capture
// all dbaas.aircanada.com responses. Trigger new searches via history.pushState.
// Stopover mode: same page with tripType=M & locationCodes0/stayDuration0; results come back as one
// bound whose longest connection is the stopover, so duration/arrival can't be derived from it.

// ── Install interceptor immediately (before Akamai's p.js patches window.fetch) ──
;(function acInstallInterceptor() {
  const _orig = window.fetch
  window.fetch = async function(...args) {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url
    const res = await _orig.apply(this, args)
    if (url?.includes('dbaas.aircanada.com')) {
      res.clone().json().then(json => {
        if (json?.data?.sessionToken) {
          acOnSessionData(json)
        } else if (json?.data?.airBoundGroups) {
          acOnSearchResult({ ...json.data, dictionaries: json.dictionaries })
        } else if (json?.errors?.some(e => e.code === AC_NO_FLIGHTS)) {
          acOnSearchResult({ airBoundGroups: [] })  // common with stopovers; don't wait out the timeout
        }
      }).catch(() => {})
    }
    return res
  }
})()

const AC_NO_FLIGHTS = '7959'  // polldapi error "NO FLIGHTS FOUND"
const AC_BOOK_URL = 'https://www.aircanada.com/aeroplan/redeem/availability/outbound'

// Session state – filled once page makes its first market-token → polldapi cycle
const acSession = { marketCode: null, userId: null, ready: false }
let acSessionCallback = null

// The one in-flight search: { search, resolve } – search is the query string that was pushed
let acPending = null

function acOnSessionData(json) {
  if (acSession.ready) return
  acSession.marketCode = json.data.marketCode || 'NBM'
  acSession.userId = json.userId || null
  acSession.ready = true
  if (acSessionCallback) acSessionCallback()
}

// Only accept a result while the page still shows the URL we pushed, so a late response to an
// earlier (timed-out) search can't land on the next one
function acOnSearchResult(data) {
  if (acPending && location.search === acPending.search) acPending.resolve(data)
}

const AC_ONE_WAY = 'O'
const AC_STOPOVER = 'SO'
const AC_SEARCH_MODES = [
  { code: AC_ONE_WAY, name: 'One-way' },
  { code: AC_STOPOVER, name: 'One-way with stopover' },
]

// stopover = { city, days } or null
function acSearchUrl(origin, dest, date, stopover) {
  const route = stopover
    ? `tripType=M&marketCode=INT&org0=${origin}&dest0=${dest}&locationCodes0=${stopover.city}&stayDuration0=${stopover.days}`
    : `tripType=O&org0=${origin}&dest0=${dest}`
  return `${AC_BOOK_URL}?${route}&departureDate0=${date}&ADT=1&YTH=0&CHD=0&INF=0&INS=0`
}

// Trigger page's own search by pushing a new URL (React Router picks up popstate)
function acNavigateSearch(origin, dest, date, stopover) {
  history.pushState({}, '', acSearchUrl(origin, dest, date, stopover))
  window.dispatchEvent(new PopStateEvent('popstate', { state: history.state }))
}

// The page runs one search at a time (a new URL cancels the previous one), so searches from the
// UI's worker pool are queued
let acQueue = Promise.resolve()
function acTriggerSearch(origin, dest, date, stopover, timeoutMs = 25000) {
  const run = acQueue.then(() => new Promise(resolve => {
    const done = data => { clearTimeout(timer); acPending = null; resolve(data) }
    const timer = setTimeout(() => done(null), timeoutMs)
    acNavigateSearch(origin, dest, date, stopover)
    acPending = { search: location.search, resolve: done }
  }))
  acQueue = run
  return run
}

// Parse "SEG-AC3-YVRNRT-2026-10-19-1235" → { airline, flight, origin, dest, dep, arr }
// Local times come from the flight dictionary; without it arr is estimated from the bound duration
function acParseFlightId(flightId, totalDurSec, segCount, dict) {
  const m = flightId.match(/^SEG-([A-Z]{2})(\d+[A-Z]?)-([A-Z]{3})([A-Z]{3})-(\d{4}-\d{2}-\d{2})-(\d{4})$/)
  if (!m) return null
  const [, airline, num, org, dst, date, t] = m
  const info = dict?.[flightId]
  const dep = info?.departure?.dateTime?.slice(0, 19) ?? `${date}T${t.slice(0, 2)}:${t.slice(2)}:00`
  const arr = info?.arrival?.dateTime?.slice(0, 19)
    ?? new Date(new Date(dep).getTime() + (totalDurSec / segCount) * 1000).toISOString().slice(0, 19)
  return { airline, flight: airline + num, origin: org, destination: dst, dep, arr }
}

const AC_CABIN_MAP = { eco: 'Y', premium: 'N', business: 'J', first: 'F' }

export function acParseData(data, origin, destination, date, stopover = null) {
  const byKey = {}
  const dict = data.dictionaries?.flight
  for (const group of data.airBoundGroups || []) {
    const { boundDetails, airBounds } = group
    const segDefs = boundDetails?.segments || []
    // Stopover bounds: the stay is the longest connection – leave it out of the travel time
    const stayIdx = stopover && segDefs.length > 1
      ? segDefs.reduce((best, s, i) => (s.connectionTime || 0) > (segDefs[best].connectionTime || 0) ? i : best, 0)
      : -1
    const dur = (boundDetails?.duration || 0) - (segDefs[stayIdx]?.connectionTime || 0)
    const segs = segDefs.map(s => acParseFlightId(s.flightId, dur, segDefs.length, dict)).filter(Boolean)
    if (!segs.length) continue
    const stopoverInfo = stayIdx >= 0 && segs.length === segDefs.length ? {
      at: segs[stayIdx].destination,
      days: Math.round((Date.parse(segs[stayIdx + 1].dep.slice(0, 10)) - Date.parse(segs[stayIdx].arr.slice(0, 10))) / 86400000),
    } : undefined

    const key = segDefs.map(s => s.flightId).join('+')
    if (!byKey[key]) {
      byKey[key] = {
        date, origin, destination, segs,
        cabins: { F: null, J: null, N: null, Y: null },
        miles: {},
        duration: Math.round(dur / 60),
        bookUrl: acSearchUrl(origin, destination, date, stopover),
        stopover: stopoverInfo,
      }
    }
    const entry = byKey[key]
    for (const bound of airBounds || []) {
      const avail = bound.availabilityDetails?.[0]
      const cabin = AC_CABIN_MAP[avail?.cabin] || 'Y'
      const seats = avail?.quota ?? 1
      // Try direct path first (confirmed from AC Angular bundle), fallback to unitPrices path
      const miles = bound.prices?.convertedMiles?.base
        ?? bound.prices?.unitPrices?.[0]?.milesConversion?.convertedMiles?.base
      // Keep best (lowest miles) option per cabin
      if (entry.cabins[cabin] == null || (miles && miles < (entry.miles[cabin] || Infinity))) {
        entry.cabins[cabin] = seats
        if (miles) entry.miles[cabin] = miles
      } else if (entry.cabins[cabin] != null && !miles) {
        entry.cabins[cabin] = seats
      }

      // Detect mix-cabin: availabilityDetails has one entry per segment
      const details = bound.availabilityDetails || []
      if (details.length > 1 && details.length === segDefs.length) {
        const cabinsPerSeg = details.map(d => AC_CABIN_MAP[d?.cabin] || 'Y')
        const unique = new Set(cabinsPerSeg)
        if (unique.size > 1) {
          // Use per-segment duration if available, else equal weight
          const segDurs = segDefs.map(s => s.duration || (dur / segDefs.length))
          const totalDur = segDurs.reduce((a, b) => a + b, 0) || 1
          const cabinDur = segDurs.reduce((sum, d, i) => cabinsPerSeg[i] === cabin ? sum + d : sum, 0)
          const pct = Math.round(cabinDur / totalDur * 100)
          if (!entry.mixPct) entry.mixPct = {}
          if (!entry.mixPct[cabin] || pct > entry.mixPct[cabin]) entry.mixPct[cabin] = pct
        }
      }
    }
  }
  return Object.values(byKey)
}

const AC_AIRPORTS = [
  { code: 'YVR', name: 'Vancouver' },
  { code: 'YYZ', name: 'Toronto' },
  { code: 'YUL', name: 'Montréal' },
  { code: 'YYC', name: 'Calgary' },
  { code: 'YEG', name: 'Edmonton' },
  { code: 'YOW', name: 'Ottawa' },
  { code: 'YHZ', name: 'Halifax' },
  { code: 'YWG', name: 'Winnipeg' },
  { code: 'NRT', name: 'Tokyo (Narita)' },
  { code: 'HND', name: 'Tokyo (Haneda)' },
  { code: 'KIX', name: 'Osaka (Kansai)' },
  { code: 'FUK', name: 'Fukuoka' },
  { code: 'CTS', name: 'Sapporo' },
  { code: 'OKA', name: 'Okinawa' },
  { code: 'ICN', name: 'Seoul (Incheon)' },
  { code: 'GMP', name: 'Seoul (Gimpo)' },
  { code: 'HKG', name: 'Hong Kong' },
  { code: 'TPE', name: 'Taipei (Taoyuan)' },
  { code: 'PEK', name: 'Beijing' },
  { code: 'PVG', name: 'Shanghai (Pudong)' },
  { code: 'CAN', name: 'Guangzhou' },
  { code: 'SIN', name: 'Singapore' },
  { code: 'BKK', name: 'Bangkok' },
  { code: 'KUL', name: 'Kuala Lumpur' },
  { code: 'CGK', name: 'Jakarta' },
  { code: 'MNL', name: 'Manila' },
  { code: 'HAN', name: 'Hanoi' },
  { code: 'SGN', name: 'Ho Chi Minh City' },
  { code: 'DEL', name: 'Delhi' },
  { code: 'BOM', name: 'Mumbai' },
  { code: 'DXB', name: 'Dubai' },
  { code: 'DOH', name: 'Doha' },
  { code: 'TLV', name: 'Tel Aviv' },
  { code: 'LHR', name: 'London (Heathrow)' },
  { code: 'CDG', name: 'Paris (CDG)' },
  { code: 'FRA', name: 'Frankfurt' },
  { code: 'AMS', name: 'Amsterdam' },
  { code: 'ZRH', name: 'Zurich' },
  { code: 'MXP', name: 'Milan (Malpensa)' },
  { code: 'FCO', name: 'Rome' },
  { code: 'BCN', name: 'Barcelona' },
  { code: 'MAD', name: 'Madrid' },
  { code: 'VIE', name: 'Vienna' },
  { code: 'MUC', name: 'Munich' },
  { code: 'DUB', name: 'Dublin' },
  { code: 'LIS', name: 'Lisbon' },
  { code: 'JFK', name: 'New York (JFK)' },
  { code: 'EWR', name: 'New York (Newark)' },
  { code: 'LAX', name: 'Los Angeles' },
  { code: 'ORD', name: "Chicago (O'Hare)" },
  { code: 'SFO', name: 'San Francisco' },
  { code: 'MIA', name: 'Miami' },
  { code: 'BOS', name: 'Boston' },
  { code: 'SEA', name: 'Seattle' },
  { code: 'DFW', name: 'Dallas' },
  { code: 'IAH', name: 'Houston' },
  { code: 'IAD', name: 'Washington D.C.' },
  { code: 'ATL', name: 'Atlanta' },
  { code: 'DEN', name: 'Denver' },
  { code: 'GRU', name: 'São Paulo' },
  { code: 'EZE', name: 'Buenos Aires' },
  { code: 'MEX', name: 'Mexico City' },
  { code: 'SYD', name: 'Sydney' },
  { code: 'MEL', name: 'Melbourne' },
  { code: 'AKL', name: 'Auckland' },
]

export const acProgram = {
  id: 'ac',
  name: 'Air Canada (Aeroplan)',
  color: '#d2001f',
  cabins: ['J', 'N', 'Y'],
  requiresSession: true,
  loginUrl: AC_BOOK_URL,
  airports: AC_AIRPORTS,
  carriers: AC_SEARCH_MODES,
  carrierLabel: 'Search mode',
  optionsFor: carrier => carrier === AC_STOPOVER ? [
    { key: 'stopoverCity', label: 'Stopover cities', type: 'airports' },
    { key: 'stayDays', label: 'Stay (days)', type: 'numbers', placeholder: 'e.g. 3-5, 7', default: '5' },
  ] : [],
  matches: [],
  matchHost: h => h === 'aircanada.com' || h.endsWith('.aircanada.com'),

  onSessionReady(cb) {
    acSessionCallback = cb
    // Session will be marked ready once page's first market-token polldapi is intercepted
    if (acSession.ready) cb()
  },

  isSessionReady() {
    return acSession.ready && location.hostname.endsWith('aircanada.com')
  },

  getSessionUrl() {
    return AC_BOOK_URL + '?tripType=O&org0=YVR&dest0=NRT&departureDate0=2027-03-01&ADT=1&YTH=0&CHD=0&INF=0&INS=0'
  },

  async onSearch({ origin, destination, date, carrier, options }) {
    const stopover = carrier === AC_STOPOVER ? { city: options.stopoverCity.toUpperCase(), days: Number(options.stayDays) } : null
    const data = await acTriggerSearch(origin, destination, date, stopover)
    if (!data) return []
    return acParseData(data, origin, destination, date, stopover)
  },

}
