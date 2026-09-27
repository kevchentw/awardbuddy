import { CABIN_LABELS } from '../common/constants.js'
import { sleep } from '../common/search.js'

// Starlux Airlines – award availability via COSMILE flights/search API
// Requires login; captures jx-cosmile-token from page XHR/fetch.

const JX_SEARCH_URL = 'https://ecapi.starlux-airlines.com/searchFlight/v2/redemption/flights/search'
const JX_CAL_URL = 'https://ecapi.starlux-airlines.com/searchFlight/v2/redemption/calendars'
const JX_DELAY_MS = 600

const JX_CABIN_TO = { Y: 'eco', N: 'ecoPremium', J: 'business', F: 'first' }
const JX_CABIN_FROM = { eco: 'Y', ecoPremium: 'N', business: 'J', first: 'F' }

const jxCaptured = { token: null }
let jxSessionCallback = null

function jxApplyToken(raw) {
  if (jxCaptured.token) return
  jxCaptured.token = raw.startsWith('Bearer ') ? raw.slice(7) : raw
  if (jxSessionCallback) jxSessionCallback()
}

// Intercept fetch + XHR to grab jx-cosmile-token from the site's own API calls
;(function patchJx() {
  if (location.hostname !== 'www.starlux-airlines.com') return
  const origFetch = window.fetch
  window.fetch = function (input, init) {
    if (!jxCaptured.token && init?.headers) {
      const hdrs = init.headers instanceof Headers ? init.headers : new Headers(init.headers)
      const raw = hdrs.get('jx-cosmile-token')
      if (raw) jxApplyToken(raw)
    }
    return origFetch.call(window, input, init)
  }

  const OrigXHR = window.XMLHttpRequest
  function PatchedXHR() {
    const xhr = new OrigXHR()
    const origSetHeader = xhr.setRequestHeader.bind(xhr)
    xhr.setRequestHeader = function (name, value) {
      if (!jxCaptured.token && name.toLowerCase() === 'jx-cosmile-token') jxApplyToken(value)
      return origSetHeader(name, value)
    }
    return xhr
  }
  PatchedXHR.prototype = OrigXHR.prototype
  window.XMLHttpRequest = PatchedXHR
})()

function jxParseFlights(json, origin, destination, date) {
  if (!json?.success) return []
  const flights = json?.data?.flights
  if (!Array.isArray(flights)) return []

  const results = []
  for (const flight of flights) {
    const segs = []
    for (const seg of flight.flightDetails ?? []) {
      segs.push({
        airline: seg.marketingAirlineCode,
        flight: seg.marketingAirlineCode + seg.marketingFlightNumber,
        origin: seg.departure?.airport,
        destination: seg.arrival?.airport,
        dep: seg.departure?.dateTime,
        arr: seg.arrival?.dateTime,
      })
    }
    if (!segs.length) continue

    const flightDate = (segs[0].dep ?? date).slice(0, 10)

    const firstDep = new Date(segs[0].dep)
    const lastArr = new Date(segs[segs.length - 1].arr)
    const duration = isNaN(firstDep) ? null : Math.round((lastArr - firstDep) / 60000)

    const cabins = { F: null, J: null, N: null, Y: null }
    const miles = {}
    for (const offer of flight.airOffers ?? []) {
      if (offer.isSoldOut) continue
      const c = JX_CABIN_FROM[offer.cabin]
      if (!c) continue
      cabins[c] = -1  // available, seat count not exposed by API
      const m = offer.milesConversion?.convertedMiles
      if (typeof m === 'number' && (!miles[c] || m < miles[c])) miles[c] = m
    }

    if (!Object.values(cabins).some(v => v !== null)) continue

    results.push({
      date: flightDate,
      origin: segs[0].origin,
      destination: segs[segs.length - 1].destination,
      segs,
      cabins,
      miles,
      duration,
      bookUrl: 'https://www.starlux-airlines.com/en-US/redeem-award-ticket/index',
    })
  }
  return results
}

export const jxProgram = {
  id: 'jx',
  name: 'Starlux Airlines',
  color: '#1B3D6F',
  cabins: ['F', 'J', 'N', 'Y'],
  requiresSession: true,
  // ponytail: point at redeem page so clicking "Get session" triggers the token-bearing API calls
  loginUrl: 'https://www.starlux-airlines.com/en-US/redeem-award-ticket/index',
  matches: [],
  matchHost: h => h === 'www.starlux-airlines.com',

  onSessionReady(cb) {
    jxSessionCallback = cb
    if (jxCaptured.token) cb()
  },

  isSessionReady() { return !!jxCaptured.token },

  async onSearch({ origin, destination, date, cabinFilter }) {
    // Search each cabin separately (API is per-cabin)
    const cabinsToSearch = cabinFilter.length ? cabinFilter : ['F', 'J', 'N', 'Y']
    const byFlight = {}

    for (const cabin of cabinsToSearch) {
      await sleep(JX_DELAY_MS)
      try {
        const res = await fetch(JX_SEARCH_URL, {
          method: 'POST',
          credentials: 'omit',
          headers: {
            'accept': 'application/json, text/plain, */*',
            'content-type': 'application/json',
            'jx-cosmile-token': `Bearer ${jxCaptured.token}`,
            'jx-lang': 'en-Global',
          },
          body: JSON.stringify({
            cabin: JX_CABIN_TO[cabin],
            companyCode: 'JX',
            itineraries: [{ departure: origin, arrival: destination, departureDate: date }],
            travelers: { adt: 1, chd: 0, inf: 0 },
          }),
        })
        if (res.status === 401 || res.status === 403) {
          jxCaptured.token = null
          return 'SESSION_EXPIRED'
        }
        if (!res.ok) continue
        const json = await res.json()
        const rows = jxParseFlights(json, origin, destination, date)
        for (const row of rows) {
          const key = row.segs.map(s => s.flight).join('+')
          if (!byFlight[key]) byFlight[key] = row
          else {
            // Merge cabins/miles from this cabin's search into existing entry
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

  // Calendar mode: use /redemption/calendars API — one call per cabin per 14-day anchor
  // Returns availability only (no miles); much faster than per-date search
  async onCalendarSearch(origin, destination, cabins, fromMonth, toMonth, onProgress) {
    const cabinsToSearch = cabins.length ? cabins : ['F', 'J', 'N', 'Y']
    const [fy, fm] = fromMonth.split('-').map(Number)
    const [ty, tm] = toMonth.split('-').map(Number)
    const endDate = new Date(ty, tm, 0)
    // Anchor dates every 14 days to cover the full range (API returns ~±7 days window)
    const anchors = []
    for (let d = new Date(fy, fm - 1, 1); d <= endDate; d.setDate(d.getDate() + 14))
      anchors.push(d.toISOString().slice(0, 10))
    const total = cabinsToSearch.length * anchors.length
    let done = 0
    const byDate = {}
    for (const cabin of cabinsToSearch) {
      for (const anchor of anchors) {
        onProgress?.(null, { done, total, label: `Searching ${CABIN_LABELS[cabin]} class` })
        await sleep(JX_DELAY_MS)
        try {
          const res = await fetch(JX_CAL_URL, {
            method: 'POST', credentials: 'omit',
            headers: {
              'accept': 'application/json, text/plain, */*',
              'content-type': 'application/json',
              'jx-cosmile-token': `Bearer ${jxCaptured.token}`,
              'jx-lang': 'en-Global',
            },
            body: JSON.stringify({
              cabin: JX_CABIN_TO[cabin], companyCode: 'JX',
              itineraries: [{ departure: origin, arrival: destination, departureDate: anchor }],
              travelers: { adt: 1, chd: 0, inf: 0 },
            }),
          })
          if (res.status === 401 || res.status === 403) { jxCaptured.token = null; return 'SESSION_EXPIRED' }
          if (!res.ok) { done++; continue }
          const json = await res.json()
          const partial = {}
          for (const cal of json?.data?.calendars ?? []) {
            if (cal.status !== 'available') continue
            const date = cal.departureDate
            if (date < fromMonth || date > toMonth + '-31') continue
            if (!byDate[date]) byDate[date] = {}
            byDate[date][cabin] = 0  // available, no miles from this API
            if (!partial[date]) partial[date] = {}
            partial[date][cabin] = 0
          }
          done++
          onProgress?.(Object.keys(partial).length ? partial : null, { done, total, label: `${CABIN_LABELS[cabin]} class` })
        } catch { done++ }
      }
    }
    return byDate
  },
}
