import { CABIN_LABELS, COMMON_AIRPORTS } from '../common/constants.js'
import { sleep } from '../common/search.js'

// Japan Airlines – award availability via session-based JAL booking engine
// Two search modes: per-day (availability) and calendar (histogramInformation)
// Session: JAL_SESSION_ID captured from URL pathname on book-i.jal.co.jp
// Partner awards (www.jal.co.jp/…/award/partner/) use the same /availability endpoint, but each
// session is locked to one PARTNER_CODE, so we open one session per partner (see jalPartnerSession).

const JAL_HOST = 'book-i.jal.co.jp'
const JAL_BASE = 'https://book-i.jal.co.jp/JLInt/dyn/air/booking'
// JMB international award search form (frmInter); logged-out visitors are sent through JMB login first
const JAL_AWARD_URL = 'https://www.jal.co.jp/jp/en/jmb/award-inter/booking/'

// Our cabin → JAL CABIN_CODE for histogram API
const JAL_CABIN_HIST = { F: 'F', J: 'B', N: 'N', Y: 'E' }
// Our cabin → JAL CFF_OUTBOUND for availability API
const JAL_CFF = { F: '9FE', J: '9JE', N: '9NE', Y: '9YE' }
// JAL fare family code → our cabin
const JAL_FF_CABIN = { '9Z0Z0YPZ': 'Y', '9Z0Z0WPZ': 'N', '9Z0Z0JPZ': 'J', '9Z0Z0FPZ': 'F' }
// JAL segment cabin code → our cabin
const JAL_BOOKING_CABIN = { F: 'F', C: 'J', W: 'N', M: 'Y', Y: 'Y' }

// Partner award search: dropdown value → PARTNER_CODE (list from the JMB partner award page, Sep 2026)
const JAL_OWN = 'JL'
const JAL_SEARCH_MODES = [
  { code: JAL_OWN, name: 'JAL (own flights)' },
  { code: 'AS', name: 'Partner: Alaska / Hawaiian' },
  { code: 'AA', name: 'Partner: American Airlines' },
  { code: 'BA', name: 'Partner: British Airways' },
  { code: 'CX', name: 'Partner: Cathay Pacific' },
  { code: 'FJ', name: 'Partner: Fiji Airways' },
  { code: 'AY', name: 'Partner: Finnair' },
  { code: 'IB', name: 'Partner: Iberia' },
  { code: 'MH', name: 'Partner: Malaysia Airlines' },
  { code: 'WY', name: 'Partner: Oman Air' },
  { code: 'QF', name: 'Partner: Qantas' },
  { code: 'QR', name: 'Partner: Qatar Airways' },
  { code: 'AT', name: 'Partner: Royal Air Maroc' },
  { code: 'RJ', name: 'Partner: Royal Jordanian' },
  { code: 'UL', name: 'Partner: SriLankan Airlines' },
  { code: 'AF', name: 'Partner: Air France' },
  { code: 'PG', name: 'Partner: Bangkok Airways' },
  { code: 'EK', name: 'Partner: Emirates' },
  { code: 'GA', name: 'Partner: Garuda Indonesia' },
  { code: 'KE', name: 'Partner: Korean Air' },
  { code: 'LA', name: 'Partner: LATAM Airlines' },
]
// Partner segment cabin code → our cabin
const JAL_PARTNER_CABIN = { F: 'F', B: 'J', N: 'N', E: 'Y' }
const JAL_PARTNER_GAP_MS = 3000  // ponytail: a quick burst of ~15 partner requests got a 403 Access Denied from Akamai
const JAL_OWN_GAP_MS = 500

const jalCaptured = { sessionId: null }
let jalSessionCallback = null

function jalTryCapture() {
  const m = location.pathname.match(/;JAL_SESSION_ID=([^/?;&]+)/)
  if (!m) return false
  if (jalCaptured.sessionId === m[1]) return true
  jalCaptured.sessionId = m[1]
  if (jalSessionCallback) jalSessionCallback()
  return true
}

// Auto-extend session when JAL timeout modal appears (deferred — body not available at document-start)
// ponytail: skip affinity — it's the entry point; JAL manages its own session flow there
function jalWatchTimeout() {
  if (location.hostname !== JAL_HOST) return
  if (location.pathname.includes('/affinity')) return
  new MutationObserver(() => {
    const dialog = document.querySelector('jal-tmos-popin-mobile')
    if (!dialog) return
    const title = dialog.querySelector('.popin-title')
    if (!title?.textContent?.includes('Time out')) return
    const sid = jalCaptured.sessionId
    if (!sid) return
    fetch(`${JAL_BASE}/timeoutSession;JAL_SESSION_ID=${sid}`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'SITE=J019J019&COUNTRY_SITE=JAL_JR_JP&LANGUAGE=GB',
      credentials: 'include',
    }).then(() => {
      document.querySelectorAll('.cdk-overlay-backdrop, .cdk-global-overlay-wrapper').forEach(el => el.remove())
      document.body.classList.remove('cdk-global-scrollblock')
    }).catch(() => {})
  }).observe(document.body, { childList: true, subtree: true })
}

function jalParseAvailability(html, date) {
  try {
    const m = html.match(/<script[^>]*id="clientSideData"[^>]*>([\s\S]*?)<\/script>/)
    if (!m) return []
    const json = JSON.parse(m[1])
    const pageData = json?.PAGE?.DATA
    if (pageData?.context?.flow?.mode === 'REVENUE') return 'SESSION_EXPIRED'
    const upsell = pageData?.jlowdFlexpricerAvailability?.upsell
    const flights = upsell?.bounds?.[0]?.flights
    if (!flights?.length) return []
    const fareFamily = upsell?.bounds?.[0]?.fareFamilies?.[0] ?? ''
    const associations = upsell?.associations ?? {}
    const recommendations = upsell?.recommendations ?? {}
    const results = []
    for (let fi = 0; fi < flights.length; fi++) {
      const flight = flights[fi]
      const rawSegs = flight.segments
      if (!rawSegs?.length) continue
      const segs = rawSegs.map(seg => ({
        airline: seg.flightIdentifier.marketingAirline,
        flight: seg.flightIdentifier.marketingAirline + seg.flightIdentifier.flightNumber,
        origin: seg.originLocation.slice(-3),
        destination: seg.destinationLocation.slice(-3),
        dep: new Date(seg.flightIdentifier.originDate).toISOString(),
        arr: new Date(seg.destinationDate).toISOString(),
      }))
      const flightId = flight.id
      const assocKey = fareFamily
        ? `${fareFamily}_${flightId ?? fi}`
        : Object.keys(associations).find(k => k.endsWith(`_${flightId ?? fi}`))
      const assoc = assocKey ? associations[assocKey] : undefined
      if (!assoc) continue
      const boundAssoc = assoc.boundAssociations?.[0]
      const lsa = boundAssoc?.lsa
      const bookingClass = boundAssoc?.bookingClass ?? ''
      const lsaCabin = (fareFamily ? JAL_FF_CABIN[fareFamily] : undefined) ?? JAL_BOOKING_CABIN[bookingClass]
      const cabins = { F: null, J: null, N: null, Y: null }
      if (lsaCabin && lsa != null && lsa > 0) cabins[lsaCabin] = lsa
      if (!Object.values(cabins).some(v => v !== null)) continue
      const recoId = assoc.recoId
      const reco = recoId != null ? recommendations[String(recoId)] : undefined
      const miles = reco?.recommendationPrice?.price?.totalPrice?.milesAmount?.amount
      const milesKey = assocKey ? (JAL_FF_CABIN[assocKey.slice(0, assocKey.lastIndexOf('_'))] ?? 'Y') : 'Y'
      results.push({
        date,
        origin: segs[0].origin,
        destination: segs[segs.length - 1].destination,
        segs,
        cabins,
        miles: miles ? { [milesKey]: miles } : {},
        duration: Math.floor(flight.duration / 60000),
        bookUrl: 'https://www.jal.co.jp/jp/en/inter/award/',
      })
    }
    return results
  } catch { return [] }
}

// ponytail: Akamai blocks fetch() on /availability (Sec-Fetch-Mode: cors → 403).
// Use hidden iframe + form submit so browser sends Sec-Fetch-Mode: navigate.
// Resolves { html, url } of the first page that loads (url carries the JAL_SESSION_ID)
function jalSubmit(sid, params, { scripts = false } = {}) {
  return new Promise(resolve => {
    const frameName = `_jal_av_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const iframe = Object.assign(document.createElement('iframe'), { name: frameName })
    iframe.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none'
    // ponytail: sandbox blocks JAL Angular from escaping to parent via window.top.location
    iframe.sandbox = scripts ? 'allow-same-origin allow-forms allow-scripts' : 'allow-same-origin allow-forms'
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = `${JAL_BASE}/availability${sid ? `;JAL_SESSION_ID=${sid}` : ''}`
    form.target = frameName
    for (const [k, v] of Object.entries(params)) {
      const inp = document.createElement('input')
      inp.type = 'hidden'; inp.name = k; inp.value = v
      form.appendChild(inp)
    }
    document.body.appendChild(iframe)
    document.body.appendChild(form)
    const cleanup = () => { iframe.remove(); form.remove() }
    iframe.onload = () => {
      try { resolve({ html: iframe.contentDocument?.documentElement?.outerHTML ?? null, url: iframe.contentWindow.location.href }) }
      catch { resolve({ html: null, url: null }) }
      finally { cleanup() }
    }
    iframe.onerror = () => { resolve({ html: null, url: null }); cleanup() }
    form.submit()
  })
}

const jalIsBlocked = html => /<title>\s*Access Denied/i.test(html ?? '')

// Schedule-driven partner availability: every segment lists seats per cabin, so one request covers all cabins.
// A cabin counts for a connection only when every segment has it; seats = the tightest segment.
export function jalParsePartnerAvailability(html, date) {
  try {
    const m = html.match(/<script[^>]*id="clientSideData"[^>]*>([\s\S]*?)<\/script>/)
    if (!m) return 'SESSION_EXPIRED'
    const pageData = JSON.parse(m[1])?.PAGE?.DATA
    if (pageData?.context?.flow?.mode !== 'REDEMPTION') return 'SESSION_EXPIRED'
    const flights = pageData?.jlScheduleDrivenAvailability?.upsell?.bounds?.[0]?.flights
    if (!flights?.length) return []
    const results = []
    for (const flight of flights) {
      if (!flight.bookable || !flight.segments?.length) continue
      const cabins = { F: null, J: null, N: null, Y: null }
      for (const [code, cabin] of Object.entries(JAL_PARTNER_CABIN)) {
        const seats = flight.segments.map(s => Number(s.cabins?.[code]?.status) || 0)
        const min = Math.min(...seats)
        if (min > 0) cabins[cabin] = min
      }
      if (!Object.values(cabins).some(v => v !== null)) continue
      const segs = flight.segments.map(seg => ({
        airline: seg.flightIdentifier.marketingAirline,
        flight: seg.flightIdentifier.marketingAirline + seg.flightIdentifier.flightNumber,
        origin: seg.originLocation.slice(-3),
        destination: seg.destinationLocation.slice(-3),
        dep: new Date(seg.flightIdentifier.originDate).toISOString(),
        arr: new Date(seg.destinationDate).toISOString(),
      }))
      results.push({
        date,
        origin: segs[0].origin,
        destination: segs[segs.length - 1].destination,
        segs,
        cabins,
        miles: {},  // partner awards are priced off JAL's distance chart, not returned here
        duration: Math.floor(flight.duration / 60000),
        bookUrl: 'https://www.jal.co.jp/jp/en/jmb/award/partner/',
      })
    }
    return results
  } catch { return [] }
}

// Every availability submit goes through one queue: a JAL_SESSION_ID holds a single booking flow, so
// two dates in flight at once overwrite each other, and partner requests are spaced out for Akamai
let jalQueue = Promise.resolve()
let jalLastAt = 0
function jalEnqueue(fn, gapMs) {
  const run = jalQueue.then(async () => {
    await sleep(Math.max(0, jalLastAt + gapMs - Date.now()))
    try { return await fn() } finally { jalLastAt = Date.now() }
  })
  jalQueue = run.catch(() => {})
  return run
}
const jalPartnerEnqueue = fn => jalEnqueue(fn, JAL_PARTNER_GAP_MS)

// DDS request ids chain from one submit to the next across searches; the iframes never change our
// own URL, so it only seeds the first one
let jalDdsId = null
function jalNextDdsIds() {
  jalDdsId ??= Number(new URL(location.href).searchParams.get('DDS_PREVIOUS_REQUEST_ID') || 0)
  return { prevId: jalDdsId, currId: ++jalDdsId }
}

const JAL_PARTNER_BASE = {
  SITE: 'J019J019', LANGUAGE: 'GB', COUNTRY_SITE: 'JAL_AR_US',
  FLOW_MODE: 'REDEMPTION', PATTERN: '1B', DEVICE_TYPE: 'DESKTOP', STREAM: 'booking',
  NB_ADT: '1', NB_YADT: '', NB_CHD: '0', NB_INF: '0',
  IS_FLEXIBLE: 'FALSE', WDS_USER_TRAVELLING: 'TRUE', SEARCH_CASSETTE_ID: '',
}
const jalPartnerParams = (partner, origin, destination, date) => ({
  ...JAL_PARTNER_BASE, PARTNER_CODE: partner, CABIN: 'E',
  DEPARTURE_LOCATION_1: origin, ARRIVAL_LOCATION_1: destination,
  DEPARTURE_DATE_1: `${date.replace(/-/g, '')}0000`,
})

// PARTNER_CODE → JAL_SESSION_ID. A session opened for one partner ignores any other PARTNER_CODE,
// so each partner gets its own, opened the way the www.jal.co.jp partner form does: a sessionless
// POST carrying ENC = the enc1A JMB login cookie. That first page needs its scripts to run.
const jalPartnerSessions = {}
async function jalPartnerSession(partner, origin, destination, date) {
  if (jalPartnerSessions[partner]) return jalPartnerSessions[partner]
  const enc = document.cookie.match(/(?:^|; )enc1A=([^;]*)/)?.[1]
  if (!enc) return null
  const { html, url } = await jalPartnerEnqueue(() => jalSubmit(null, {
    ...jalPartnerParams(partner, origin, destination, date), ENC: decodeURIComponent(enc), ENCT: '2',
  }, { scripts: true }))
  if (jalIsBlocked(html)) return 'BLOCKED'
  const sid = url?.match(/;JAL_SESSION_ID=([^/?;&]+)/)?.[1]
  if (sid) jalPartnerSessions[partner] = sid
  return sid ?? null
}

async function jalPartnerSearch(partner, origin, destination, date) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const sid = await jalPartnerSession(partner, origin, destination, date)
    if (!sid || sid === 'BLOCKED') return 'SESSION_EXPIRED'
    const { html } = await jalPartnerEnqueue(() => jalSubmit(sid, { ...jalPartnerParams(partner, origin, destination, date), TRIP_TYPE: 'M' }))
    if (jalIsBlocked(html)) return 'SESSION_EXPIRED'
    const rows = html ? jalParsePartnerAvailability(html, date) : 'SESSION_EXPIRED'
    if (rows !== 'SESSION_EXPIRED') return rows
    delete jalPartnerSessions[partner]  // stale partner session → reopen once
  }
  return 'SESSION_EXPIRED'
}

function jalParseHistogram(raw) {
  // Returns { isoDate: miles } for the cabin in this response
  try {
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw
    const pageData = data?.mapDataUI?.PAGE?.DATA ?? data?.DATA
    // Check session expired
    if (pageData?.context?.flow?.mode === 'REVENUE') return null
    const recommendations = pageData?.outputs?.affinity?.recommendations
    if (!recommendations) return {}
    const result = {}
    for (const entry of Object.values(recommendations)) {
      const { departureDate, price } = entry
      if (!departureDate) continue
      const miles = price?.totalPrice?.milesAmount?.amount
      if (!miles || miles <= 0) continue
      const isoDate = new Date(departureDate).toISOString().slice(0, 10)
      if (!result[isoDate] || miles < result[isoDate]) result[isoDate] = miles
    }
    return result
  } catch { return {} }
}

// JAL city codes sourced directly from JAL affinity search dropdown
const JAL_AIRPORTS = [
  // Japan
  { code: 'AXT', name: 'Akita' },
  { code: 'ASJ', name: 'Amamioshima' },
  { code: 'AOJ', name: 'Aomori' },
  { code: 'AKJ', name: 'Asahikawa' },
  { code: 'FUK', name: 'Fukuoka' },
  { code: 'HKD', name: 'Hakodate' },
  { code: 'HNA', name: 'Hanamaki' },
  { code: 'HIJ', name: 'Hiroshima' },
  { code: 'ISG', name: 'Ishigaki' },
  { code: 'IZO', name: 'Izumo' },
  { code: 'KOJ', name: 'Kagoshima' },
  { code: 'KKJ', name: 'Kitakyushu' },
  { code: 'KCZ', name: 'Kochi' },
  { code: 'KMQ', name: 'Komatsu' },
  { code: 'KMJ', name: 'Kumamoto' },
  { code: 'UEO', name: 'Kumejima' },
  { code: 'KUH', name: 'Kushiro' },
  { code: 'MMJ', name: 'Matsumoto' },
  { code: 'MYJ', name: 'Matsuyama' },
  { code: 'MMB', name: 'Memanbetsu' },
  { code: 'MSJ', name: 'Misawa' },
  { code: 'MMY', name: 'Miyako' },
  { code: 'KMI', name: 'Miyazaki' },
  { code: 'NGS', name: 'Nagasaki' },
  { code: 'NGO', name: 'Nagoya' },
  { code: 'KIJ', name: 'Niigata' },
  { code: 'OBO', name: 'Obihiro' },
  { code: 'OIT', name: 'Oita' },
  { code: 'OKJ', name: 'Okayama' },
  { code: 'OKA', name: 'Okinawa' },
  { code: 'OSA', name: 'Osaka' },
  { code: 'SPK', name: 'Sapporo' },
  { code: 'SDJ', name: 'Sendai' },
  { code: 'SHM', name: 'Shirahama' },
  { code: 'TJH', name: 'Tajima' },
  { code: 'TAK', name: 'Takamatsu' },
  { code: 'TKS', name: 'Tokushima' },
  { code: 'TYO', name: 'Tokyo' },
  { code: 'KUM', name: 'Yakushima' },
  { code: 'GAJ', name: 'Yamagata' },
  { code: 'UBJ', name: 'Yamaguchi Ube' },
  // East Asia
  { code: 'BJS', name: 'Beijing' },
  { code: 'PUS', name: 'Busan' },
  { code: 'DLC', name: 'Dalian' },
  { code: 'CAN', name: 'Guangzhou' },
  { code: 'HKG', name: 'Hong Kong' },
  { code: 'KHH', name: 'Kaohsiung' },
  { code: 'SEL', name: 'Seoul' },
  { code: 'SHA', name: 'Shanghai' },
  { code: 'TPE', name: 'Taipei' },
  { code: 'TSN', name: 'Tianjin' },
  // Guam
  { code: 'GUM', name: 'Guam' },
  // South-East Asia / South Asia
  { code: 'BKK', name: 'Bangkok' },
  { code: 'BLR', name: 'Bengaluru' },
  { code: 'DEL', name: 'Delhi' },
  { code: 'HAN', name: 'Hanoi' },
  { code: 'SGN', name: 'Ho Chi Minh City' },
  { code: 'JKT', name: 'Jakarta' },
  { code: 'KUL', name: 'Kuala Lumpur' },
  { code: 'MNL', name: 'Manila' },
  { code: 'SIN', name: 'Singapore' },
  // Oceania
  { code: 'MEL', name: 'Melbourne' },
  { code: 'SYD', name: 'Sydney' },
  // Europe / Russia
  { code: 'FRA', name: 'Frankfurt' },
  { code: 'HEL', name: 'Helsinki' },
  { code: 'LON', name: 'London' },
  { code: 'MOW', name: 'Moscow' },
  { code: 'PAR', name: 'Paris' },
  { code: 'VVO', name: 'Vladivostok' },
  // Middle East
  { code: 'DOH', name: 'Doha' },
  // Hawaii
  { code: 'HNL', name: 'Honolulu' },
  { code: 'KOA', name: 'Kona' },
  // North America
  { code: 'BOS', name: 'Boston' },
  { code: 'CHI', name: 'Chicago' },
  { code: 'DFW', name: 'Dallas Fort Worth' },
  { code: 'LAX', name: 'Los Angeles' },
  { code: 'NYC', name: 'New York' },
  { code: 'SAN', name: 'San Diego' },
  { code: 'SFO', name: 'San Francisco' },
  { code: 'SEA', name: 'Seattle' },
  { code: 'YVR', name: 'Vancouver' },
]

// Partner routes reach far beyond JAL's network; keep JAL's metro codes (LON, NYC, TYO…) on top
const JAL_PARTNER_AIRPORTS = [...JAL_AIRPORTS, ...COMMON_AIRPORTS.filter(a => !JAL_AIRPORTS.some(j => j.code === a.code))]

export const jalProgram = {
  id: 'jal',
  name: 'Japan Airlines',
  color: '#C00000',
  cabins: ['F', 'J', 'N', 'Y'],
  requiresSession: true,
  loginUrl: JAL_AWARD_URL,
  airports: JAL_AIRPORTS,
  // Search mode dropdown: JAL's own award search, or one partner airline's
  carriers: JAL_SEARCH_MODES,
  carrierLabel: 'Search mode',
  airportsFor: carrier => carrier === JAL_OWN ? JAL_AIRPORTS : JAL_PARTNER_AIRPORTS,
  calendarFor: carrier => carrier === JAL_OWN,  // histogram API only covers JAL flights
  matches: [],
  matchHost: h => h === JAL_HOST || h.endsWith('.jal.co.jp'),

  onSessionReady(cb) {
    jalSessionCallback = cb
    jalWatchTimeout()
    if (jalTryCapture()) return
    const poll = setInterval(() => { if (jalTryCapture()) clearInterval(poll) }, 500)
  },

  isSessionReady() { return !!jalCaptured.sessionId },

  // Submit the award search form ourselves (same POST as frmInter on JAL_AWARD_URL); the page lands on
  // book-i with ;JAL_SESSION_ID= in its path, which jalTryCapture picks up. Needs the enc1A JMB login cookie.
  triggerSession() {
    const enc = document.cookie.match(/(?:^|; )enc1A=([^;]*)/)?.[1]
    if (!enc) { location.href = JAL_AWARD_URL; return }
    const d = new Date(); d.setMonth(d.getMonth() + 1)
    const form = Object.assign(document.createElement('form'), { method: 'POST', action: `${JAL_BASE}/availability` })
    const params = {
      SITE: 'J019J019', LANGUAGE: 'GB', COUNTRY_SITE: 'JAL_JR_JP', DEVICE_TYPE: 'DESKTOP',
      ENC: decodeURIComponent(enc), ENCT: '2', FLOW_MODE: 'REDEMPTION', PATTERN: '1B',
      DEPARTURE_LOCATION_1: 'TYO', ARRIVAL_LOCATION_1: 'LAX',
      DEPARTURE_DATE_1: `${d.toISOString().slice(0, 10).replace(/-/g, '')}0000`,
      CFF_OUTBOUND: JAL_CFF.Y, NB_ADT: '1', NB_YADT: '0', NB_CHD: '0', NB_INF: '0',
      SEARCH_CASSETTE_ID: '', IS_FLEXIBLE: 'FALSE', WDS_USER_TRAVELLING: 'TRUE',
    }
    for (const [name, value] of Object.entries(params)) form.appendChild(Object.assign(document.createElement('input'), { type: 'hidden', name, value }))
    document.body.appendChild(form)
    form.submit()
  },

  async onSearch({ origin, destination, date, cabinFilter, carrier }) {
    if (carrier && carrier !== JAL_OWN) return jalPartnerSearch(carrier, origin, destination, date)
    const sid = jalCaptured.sessionId
    if (!sid) return []
    const cabins = cabinFilter.length ? cabinFilter : ['F', 'J', 'N', 'Y']
    const byFlight = {}
    for (const cabin of cabins) {
      try {
        const { html } = await jalEnqueue(() => {
          const { prevId, currId } = jalNextDdsIds()
          return jalSubmit(sid, {
            COUNTRY_SITE: 'JAL_JR_JP', LANGUAGE: 'GB', SITE: 'J019J019',
            LOCATION: origin, DESTINATION: destination,
            DEPARTURE_LOCATION_1: origin,
            ARRIVAL_LOCATION_1: destination,
            DEPARTURE_DATE_1: `${date.replace(/-/g, '')}0000`,
            CABIN_CODE: 'ALL',
            CFF_OUTBOUND: JAL_CFF[cabin] ?? '9YE',
            FLOW_MODE: 'REDEMPTION', TRIP_TYPE: 'O',
            NB_ADT: '1', NB_CHD: '0', NB_INF: '0',
            IS_FLEXIBLE: 'false', PATTERN: '1B',
            DEVICE_TYPE: 'mobile', STREAM: 'booking',
            DDS_CURRENT_REQUEST_ID: currId, DDS_PREVIOUS_REQUEST_ID: prevId,
            DDS_FROM_PAGE: 'AFFH', PAGE_TICKET: '1',
          })
        }, JAL_OWN_GAP_MS)
        if (!html) continue
        const rows = jalParseAvailability(html, date)
        if (rows === 'SESSION_EXPIRED') return 'SESSION_EXPIRED'
        for (const row of rows) {
          const key = row.segs.map(s => s.flight).join('+')
          if (!byFlight[key]) byFlight[key] = row
          else {
            for (const c of Object.keys(row.cabins)) {
              if (row.cabins[c] !== null) {
                byFlight[key].cabins[c] = row.cabins[c]
                if (row.miles[c]) byFlight[key].miles[c] = row.miles[c]
              }
            }
          }
        }
      } catch {}
    }
    return Object.values(byFlight)
  },

  // Calendar mode: one histogram request per cabin → { isoDate: { cabin: miles } }
  async onCalendarSearch(origin, destination, cabins, _fromMonth, _toMonth, onProgress) {
    const sid = jalCaptured.sessionId
    if (!sid) return 'SESSION_EXPIRED'
    const cabinsToSearch = cabins.length ? cabins : ['F', 'J', 'N', 'Y']
    const total = cabinsToSearch.length
    const byDate = {}
    for (let i = 0; i < total; i++) {
      const cabin = cabinsToSearch[i]
      onProgress?.(null, { done: i, total, label: `Searching ${CABIN_LABELS[cabin]} class` })
      await sleep(300)
      try {
        const res = await fetch(`${JAL_BASE}/histogramInformation;JAL_SESSION_ID=${sid}`, {
          method: 'POST', credentials: 'include',
          headers: { 'content-type': 'application/x-www-form-urlencoded', 'accept': 'application/json' },
          body: `SITE=J019J019&COUNTRY_SITE=JAL_JR_JP&LANGUAGE=GB&LOCATION=${origin}&TRIP_TYPE=O&DESTINATION=${destination}&CABIN_CODE=${JAL_CABIN_HIST[cabin] ?? 'E'}`,
        })
        if (!res.ok) continue
        const dateMap = jalParseHistogram(await res.text())
        if (dateMap === null) return 'SESSION_EXPIRED'
        const partial = {}
        for (const [date, miles] of Object.entries(dateMap)) {
          if (!byDate[date]) byDate[date] = {}
          byDate[date][cabin] = miles
          if (!partial[date]) partial[date] = {}
          partial[date][cabin] = miles
        }
        onProgress?.(partial, { done: i + 1, total, label: `${CABIN_LABELS[cabin]} class done` })
      } catch {}
    }
    return byDate
  },
}
