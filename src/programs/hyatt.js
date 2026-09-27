import { sleep } from '../common/search.js'

// World of Hyatt – no login required.
//   /explore-hotels/service/avail/days   reward calendar: points per night by room type (Standard Room,
//                                        Club, Standard / Premium Suite) with the night's peak level, for
//                                        any date range; nights without award rooms come back empty
//   /explore-hotels/service/hotels       every Hyatt hotel (code → name, coordinates, …; ~7 MB), fetched
//                                        once and kept for names and for the hotels around a place
//   /quickbook/autocomplete              hotels (with code), cities and Google places (airports, …)
//   /search/hotels/en-US/<place>         the site's search page; its server-rendered data holds the
//                                        place's coordinates (centerPoint), which autocomplete leaves out
// Requests go out from the page with its cookies, as the site's own do.

const HYATT_DELAY_MS = 600
const NEARBY_RADIUS_KM = 80  // about 50 miles
const NEARBY_MAX = 30

// Spirit codes are 5 letters or digits, e.g. TYOPH (Mr & Mrs Smith hotels: M0296)
const CODE_RE = /^[A-Z0-9]{5}$/

const ROOM_TYPES = {
  STANDARD_ROOM: 'Standard Room',
  CLUB: 'Club Access',
  STANDARD_SUITE: 'Standard Suite',
  PREMIUM_SUITE: 'Premium Suite',
}
const PEAK_LEVELS = {
  SUPER_OFF_PEAK: 'Super off-peak',
  OFF_PEAK: 'Off-peak',
  STANDARD: 'Standard',
  PEAK: 'Peak',
  SUPER_PEAK: 'Super peak',
}

// Returns the response JSON, or 'SESSION_EXPIRED' when the site turns the request away (403 / 429 bot
// check, or a redirect; a page refresh usually clears it); throws on other failures
async function hyattGet(path) {
  const res = await fetch(path, { headers: { accept: 'application/json' }, credentials: 'include', redirect: 'manual' })
  if (res.type === 'opaqueredirect' || res.status === 403 || res.status === 429) return 'SESSION_EXPIRED'
  if (!res.ok) throw new Error(`Hyatt ${res.status}`)
  return res.json()
}

export const hyattCalendarUrl = ({ hotel, start, end }) =>
  `/explore-hotels/service/avail/days?spiritCode=${hotel.toLowerCase()}&startDate=${start}&endDate=${end}&numAdults=1&numChildren=0&roomQuantity=1&los=1&isMock=false`

export const hyattBookUrl = (hotel, date, nextDate) =>
  `https://www.hyatt.com/shop/rooms/${hotel}?checkinDate=${date}&checkoutDate=${nextDate}&rooms=1&adults=1&kids=0&rateFilter=woh`

const nextDay = date => {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

// One result per date and room type: { days: { date: { STANDARD_ROOM: { pointsValue: [45000], pointsLevel: 'OFF_PEAK' } } } }
export function hyattParseCalendar(data, { hotel, start, end }) {
  const results = []
  for (const [date, rooms] of Object.entries(data?.days ?? {})) {
    if (date < start || date > end) continue
    for (const [type, rate] of Object.entries(rooms ?? {})) {
      const points = rate?.pointsValue?.[0]
      if (!(points > 0)) continue
      const level = PEAK_LEVELS[rate.pointsLevel]
      const room = ROOM_TYPES[type] ?? type
      results.push({ date, hotel, points, room: level ? `${room} · ${level}` : room, bookUrl: hyattBookUrl(hotel, date, nextDay(date)) })
    }
  }
  return results.sort((a, b) => a.date.localeCompare(b.date) || a.points - b.points)
}

// Hotel code from a Hyatt URL: /park-hyatt/en-US/tyoph-park-hyatt-tokyo, /mr-and-mrs-smith/m0296-zaborin,
// /shop/rooms/tyoph (booking) or ?spiritCode=tyoph (explore pages)
export function hyattHotelFromUrl(url) {
  const u = new URL(url)
  const code = u.searchParams.get('spiritCode')
    ?? u.pathname.match(/^\/shop\/(?:rooms\/)?([a-z0-9]{5})(?:\/|$)/i)?.[1]
    ?? u.pathname.match(/^\/[a-z-]+\/(?:[a-z]{2}-[A-Z]{2}\/)?([a-z0-9]{5})-[a-z0-9-]+\/?/i)?.[1]
  return code && CODE_RE.test(code.toUpperCase()) ? code.toUpperCase() : null
}

// Search result cards are <div data-js="hotel-card" data-spirit-code="tyoph"> with the name in
// #map-result-card-title-tyoph. A hotel page has no clean name on it, so the picker looks that one up.
export function hyattPageHotels(doc, url) {
  const hotels = []
  for (const card of doc.querySelectorAll('div[data-js="hotel-card"][data-spirit-code]')) {
    const raw = card.getAttribute('data-spirit-code')
    const code = raw.toUpperCase()
    if (!CODE_RE.test(code) || hotels.some(h => h.code === code)) continue
    const name = card.querySelector(`[id="map-result-card-title-${raw}"]`)?.textContent.replace(/\s+/g, ' ').trim()
    hotels.push({ code, name: name || undefined })
  }
  const current = hyattHotelFromUrl(url)
  if (current && !hotels.some(h => h.code === current)) hotels.unshift({ code: current })
  return hotels
}

// Autocomplete → suggestions. Hotels carry their code; cities and Google places (airports, landmarks)
// are found by their label, which the search page geocodes
export function hyattParseSuggestions(data) {
  const hotels = (data?.properties ?? []).filter(p => p?.spiritCode && CODE_RE.test(p.spiritCode.toUpperCase())).map(p => {
    const code = p.spiritCode.toUpperCase()
    return { label: p.label, sub: code, ref: { code, label: p.label } }
  })
  const cities = (data?.cities ?? []).filter(c => c?.label).map(c => ({
    label: c.city || c.label, sub: [c.province, c.country].filter(Boolean).join(', ') || undefined, ref: { place: c.label, label: c.label },
  }))
  const places = (data?.suggestions ?? []).filter(s => s?.label).map(s => ({
    label: s.label, sub: s.types?.includes('airport') ? 'Airport' : undefined, ref: { place: s.label, label: s.label },
  }))
  return [...cities, ...places, ...hotels]
}

// The search page's server-rendered data, with its quotes escaped: …\"centerPoint\":{\"id\":…,\"latitude\":35.77,\"longitude\":140.39,…
export function hyattParseCenter(html) {
  const cp = String(html ?? '').replace(/\\"/g, '"').match(/"centerPoint":\{[^}]*\}/)?.[0]
  const lat = +cp?.match(/"latitude":(-?[\d.]+)/)?.[1]
  const lon = +cp?.match(/"longitude":(-?[\d.]+)/)?.[1]
  return Number.isFinite(lat) && Number.isFinite(lon) && cp ? { lat, lon } : null
}

// Directory (code → hotel) → the bookable hotels within reach of a point, nearest first
export function hyattNearby(directory, { lat, lon }) {
  const rad = Math.PI / 180
  const km = (lat2, lon2) => {
    const x = Math.sin((lat2 - lat) * rad / 2) ** 2 + Math.cos(lat * rad) * Math.cos(lat2 * rad) * Math.sin((lon2 - lon) * rad / 2) ** 2
    return 12742 * Math.asin(Math.sqrt(x))
  }
  const hotels = []
  for (const h of Object.values(directory ?? {})) {
    const g = h?.location?.geolocation
    const code = h?.spiritCode?.toUpperCase()
    if (!code || !CODE_RE.test(code) || g?.latitude == null || g?.longitude == null) continue
    if (h.booking?.isExternal || h.openStatus?.key === 'NOT_BOOKABLE' || h.openStatus === 'NOT_BOOKABLE') continue
    const d = km(g.latitude, g.longitude)
    if (d <= NEARBY_RADIUS_KM) hotels.push({ code, name: h.name || undefined, d, category: h.awardCategory?.label })
  }
  hotels.sort((a, b) => a.d - b.d)
  return hotels.slice(0, NEARBY_MAX).map(h => ({
    code: h.code, name: h.name,
    sub: [`${h.d.toFixed(1)} km`, h.category && `Category ${h.category}`].filter(Boolean).join(' · '),
  }))
}

// Every Hyatt hotel, fetched once per page (a failed fetch is retried next time)
let directory
function hyattDirectory() {
  directory ??= hyattGet('/explore-hotels/service/hotels').then(d => {
    if (d === 'SESSION_EXPIRED' || !d || typeof d !== 'object') throw new Error('Hyatt blocked the request')
    return d
  })
  return directory.catch(err => { directory = undefined; throw err })
}

export const hyattProgram = {
  id: 'hyatt',
  kind: 'hotel',
  name: 'Hyatt',
  color: '#0D2D52',
  matches: ['www.hyatt.com'],
  requiresSession: false,
  hotelPlaceholder: 'Hotel name, city, airport or code',
  expiredMessage: '⚠ Hyatt blocked the request — refresh the page and try again',

  currentHotel: () => hyattHotelFromUrl(location.href),
  isHotelCode: text => CODE_RE.test(text),
  pageHotels: () => hyattPageHotels(document, location.href),

  async suggestHotels(text) {
    const res = await fetch(`/quickbook/autocomplete?query=${encodeURIComponent(text)}&locale=en-US&includeGoogleSuggestions=true`, { credentials: 'include' })
    return res.ok ? hyattParseSuggestions(await res.json()) : []
  },

  // A hotel suggestion already has its code; any other place lists the hotels around it
  async hotelsAt(ref) {
    if (ref.code) return { exact: { code: ref.code, name: ref.label }, nearby: [] }
    const [res, dir] = await Promise.all([
      fetch(`/search/hotels/en-US/${encodeURIComponent(ref.place)}`, { credentials: 'include' }),
      hyattDirectory(),
    ])
    if (!res.ok) throw new Error(`Hyatt ${res.status}`)
    const center = hyattParseCenter(await res.text())
    return { nearby: center ? hyattNearby(dir, center) : [] }
  },

  async hotelName(code) {
    return (await hyattDirectory())[code.toLowerCase()]?.name ?? null
  },

  async onHotelSearch(params) {
    await sleep(HYATT_DELAY_MS)
    const data = await hyattGet(hyattCalendarUrl(params))
    return data === 'SESSION_EXPIRED' ? data : hyattParseCalendar(data, params)
  },
}
