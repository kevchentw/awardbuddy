import { sleep } from '../common/search.js'

// I Prefer (Preferred Hotels & Resorts), booked with I Prefer points – no login required. One of the two
// search modes of the I Prefer program (preferred.js), next to Choice points.
// The site's data comes from ptgapis.com, which answers any origin (CORS *):
//   /rate-calendar/v2?propertyCode=…&rateCode=IPPOINTS   reward calendar: points per night for one hotel,
//                                        every date it has (about 18 months) in one response; nights without
//                                        reward rooms are left out, and a hotel without any comes back as []
//   /property-search/v1?site=IPrefer     every I Prefer hotel (~700); the POST body picks the fields, so ours
//                                        (code, name, city, country, coordinates, page path, points flag,
//                                        Choice points value) is ~300 KB.
//                                        Fetched once and kept for names, text search and the hotels around
//                                        a city (the site's own place search is Google Maps in the page)
// The directory, text search and calendar cache are shared with the Choice points mode (preferred-choice.js).
// Hotel pages (/hotels/<country>/<slug>) and search result cards don't carry the code in a URL or
// attribute: on iprefer.com a hotel page's server-rendered data names it (for preselecting it); cards and
// pages are also matched through the directory (preferred.js).

export const PTG_API = 'https://ptgapis.com'
const IPREFER_DELAY_MS = 600
const CALENDAR_TTL_MS = 30 * 60 * 1000
const NEARBY_RADIUS_KM = 80  // about 50 miles
const NEARBY_MAX = 30
const REGION_MAX = 100
const SUGGEST_MAX = 8
const REWARD_RATE_CODE = 'IPPOINTS'
const DIRECTORY_FIELDS = {
  field_item_code: {},
  field_display_title: {},
  field_address: { type: 'address', fields: { locality: {} } },
  field_geolocation: { type: 'geolocation', fields: { lat: {}, lng: {} } },
  field_state_name: {},
  field_country_name: {},
  field_i_prefer_book_with_points: {},
  entity_url: {},
  field_synxis_id: {},
  participates_in_choice_points: {},
  choice_points_value: {},
}

// Property codes are 5 letters or digits, e.g. PARHD, TYOSE
export const CODE_RE = /^[A-Z0-9]{5}$/

export const ipreferCalendarUrl = hotel =>
  `${PTG_API}/rate-calendar/v2?propertyCode=${hotel}&adults=1&children=0&rateCode=${REWARD_RATE_CODE}`

// Opens the hotel page for that night with points pricing picked (rateType RN = IPPOINTS on the site)
export const ipreferBookUrl = (path, date, nextDate) =>
  `https://iprefer.com${path}?arrivalDate=${date}&departureDate=${nextDate}&rateType=RN`

const nextDay = date => {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

// One result per bookable night within the span (I Prefer prices a single reward rate per night).
// { results: { date: { is_available, has_inventory, allows_check_in, points } } }, or results: [] when none
export function ipreferParseCalendar(data, { hotel, start, end }, path) {
  const results = []
  const days = data?.results
  if (!days || typeof days !== 'object' || Array.isArray(days)) return results
  for (const [date, night] of Object.entries(days)) {
    if (date < start || date > end || !night?.is_available || !night.has_inventory || !night.allows_check_in) continue
    const points = Number(night.points)
    if (!(points > 0)) continue
    results.push({ date, hotel, points, bookUrl: path ? ipreferBookUrl(path, date, nextDay(date)) : undefined })
  }
  return results.sort((a, b) => a.date.localeCompare(b.date))
}

// property-search answer → [{ code, name, city, state, country, lat, lng, path, points, synxisId, choicePoints }]
// points: bookable with I Prefer points; choicePoints: the flat Choice Privileges points per night, when the
// hotel takes them
export function ipreferParseDirectory(data) {
  const hotels = []
  for (const p of Object.values(data?.properties ?? {})) {
    const code = p?.field_item_code?.toUpperCase()
    if (!code || !CODE_RE.test(code)) continue
    const lat = parseFloat(p.field_geolocation?.lat), lng = parseFloat(p.field_geolocation?.lng)
    hotels.push({
      code,
      name: p.field_display_title || undefined,
      city: p.field_address?.locality || undefined,
      state: p.field_state_name || undefined,
      country: p.field_country_name || undefined,
      lat: Number.isFinite(lat) ? lat : undefined,
      lng: Number.isFinite(lng) ? lng : undefined,
      path: p.entity_url?.startsWith('/') ? p.entity_url : undefined,
      points: p.field_i_prefer_book_with_points === '1',
      synxisId: p.field_synxis_id || undefined,
      choicePoints: p.participates_in_choice_points === '1' && Number(p.choice_points_value) > 0 ? Number(p.choice_points_value) : undefined,
    })
  }
  return hotels
}

// "L’Hôtel du Collectionneur" → "l hotel du collectionneur", for matching typed text and card titles
const norm = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
// Matches at the start of a word: "tok" finds "Tokyo" but "kyo" doesn't
const wordMatch = (text, q) => ` ${norm(text)}`.includes(` ${q}`)

const place = h => [h.city, h.state, h.country].filter(Boolean).join(', ')

// I Prefer points; the Choice mode passes its own test
export const bookableWithPoints = h => h.points

// Text search over the directory's bookable hotels: cities, then states / countries, then hotels
// (by name or code)
export function ipreferSuggest(directory, text, bookableIf = bookableWithPoints) {
  const q = norm(text)
  if (!q) return []
  const bookable = (directory ?? []).filter(bookableIf)
  const cities = new Map(), regions = new Map(), hotels = []
  for (const h of bookable) {
    if (h.city && wordMatch(h.city, q)) {
      const key = `${h.city}|${h.country ?? ''}`
      if (!cities.has(key)) cities.set(key, { label: h.city, sub: [h.state, h.country].filter(Boolean).join(', ') || undefined, ref: { city: h.city, country: h.country, label: h.city } })
    }
    for (const [field, other] of [['state', 'country'], ['country', null]]) {
      if (!h[field] || !wordMatch(h[field], q)) continue
      const key = `${field}|${h[field]}`
      if (!regions.has(key)) regions.set(key, { label: h[field], sub: (other && h[other]) || undefined, ref: { [field]: h[field], label: h[field] } })
    }
    if (h.code === text.trim().toUpperCase() || wordMatch(h.name, q)) hotels.push({ label: h.name ?? h.code, sub: place(h) || h.code, ref: { code: h.code, label: h.name } })
  }
  return [...cities.values(), ...regions.values(), ...hotels].slice(0, SUGGEST_MAX)
}

// The hotels for a picked suggestion: a hotel is that hotel; a city lists the hotels around it (from the
// middle of that city's hotels), nearest first; a state or country lists its hotels by name
export function ipreferHotelsAt(directory, ref, bookableIf = bookableWithPoints) {
  if (ref.code) return { exact: { code: ref.code, name: ref.label }, nearby: [] }
  const bookable = (directory ?? []).filter(bookableIf)
  if (ref.state || ref.country && !ref.city) {
    const inRegion = bookable.filter(h => ref.state ? h.state === ref.state : h.country === ref.country)
      .sort((a, b) => (a.name ?? a.code).localeCompare(b.name ?? b.code))
    return { nearby: inRegion.slice(0, REGION_MAX).map(h => ({ code: h.code, name: h.name, sub: [h.city, h.state].filter(Boolean).join(', ') || undefined })) }
  }
  const inCity = bookable.filter(h => h.city === ref.city && h.country === ref.country && h.lat != null)
  if (!inCity.length) return { nearby: [] }
  const lat = inCity.reduce((s, h) => s + h.lat, 0) / inCity.length
  const lng = inCity.reduce((s, h) => s + h.lng, 0) / inCity.length
  const rad = Math.PI / 180
  const km = h => {
    const x = Math.sin((h.lat - lat) * rad / 2) ** 2 + Math.cos(lat * rad) * Math.cos(h.lat * rad) * Math.sin((h.lng - lng) * rad / 2) ** 2
    return 12742 * Math.asin(Math.sqrt(x))
  }
  const near = bookable.filter(h => h.lat != null && h.lng != null).map(h => ({ h, d: km(h) }))
    .filter(({ h, d }) => d <= NEARBY_RADIUS_KM || inCity.includes(h))
    .sort((a, b) => a.d - b.d)
  return { nearby: near.slice(0, NEARBY_MAX).map(({ h, d }) => ({ code: h.code, name: h.name, sub: [h.city, `${d.toFixed(1)} km`].filter(Boolean).join(' · ') })) }
}

// A hotel page's server-rendered data, with its quotes escaped:
//   …\"title\":\"PARHD - L’Hotel du Collectionneur Paris\",\"entityUrl\":{\"path\":\"/hotels/france/lhotel-du-collectionneur-paris\"…
// Tied to the page's path, so data for other hotels (similar hotels, …) isn't taken for this one
export function ipreferHotelFromPage(html, url) {
  const path = new URL(url).pathname.replace(/\/$/, '')
  if (!/^\/hotels\/[^/]+\/[^/]+$/.test(path)) return null
  const text = String(html ?? '').replace(/\\"/g, '"')
  const esc = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const code = text.match(new RegExp(`"title":"([A-Za-z0-9]{5}) - [^"]*","entityUrl":\\{"path":"${esc}"`))?.[1]?.toUpperCase()
  return code && CODE_RE.test(code) ? code : null
}

// Search result cards (list: .property-card__title, map popup: .marker-popup__header) show only the name,
// which the directory turns into a code
export function ipreferPageHotels(doc, directory, current) {
  const byName = new Map((directory ?? []).map(h => [norm(h.name), h]))
  const hotels = []
  for (const el of doc.querySelectorAll('.property-card__title, .marker-popup__header')) {
    const h = byName.get(norm(el.textContent))
    if (h && !hotels.some(x => x.code === h.code)) hotels.push({ code: h.code, name: h.name })
  }
  if (current && !hotels.some(h => h.code === current)) hotels.unshift({ code: current })
  return hotels
}

// Every I Prefer hotel, fetched once per page (a failed fetch is retried next time)
let directory
export function ipreferDirectory() {
  directory ??= fetch(`${PTG_API}/property-search/v1?site=IPrefer`, {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify(DIRECTORY_FIELDS),
  }).then(async res => {
    if (!res.ok) throw new Error(`I Prefer ${res.status}`)
    const hotels = ipreferParseDirectory(await res.json())
    if (!hotels.length) throw new Error('I Prefer: no hotels')
    return hotels
  })
  return directory.catch(err => { directory = undefined; throw err })
}

// One calendar request covers every month a search asks for, so it's kept (per URL, for a while) and
// shared by the month-by-month searches. Failures aren't kept.
const calendarCache = new Map()
export function ptgCalendar(url) {
  const hit = calendarCache.get(url)
  if (hit && Date.now() - hit.at < CALENDAR_TTL_MS) return hit.data
  const data = sleep(IPREFER_DELAY_MS).then(() => fetch(url, { headers: { accept: 'application/json' } })).then(res => {
    // Not seen, but treated like the other chains' bot checks
    if (res.status === 403 || res.status === 429) return 'SESSION_EXPIRED'
    if (!res.ok) throw new Error(`I Prefer ${res.status}`)
    return res.json()
  })
  calendarCache.set(url, { at: Date.now(), data })
  data.then(d => { if (d === 'SESSION_EXPIRED') calendarCache.delete(url) }, () => calendarCache.delete(url))
  return data
}

const currentHotel = () => ipreferHotelFromPage(document.documentElement.innerHTML, location.href)

export const ipreferPointsProgram = {
  id: 'iprefer',
  kind: 'hotel',
  name: 'I Prefer points',
  requiresSession: false,
  hotelPlaceholder: 'Hotel name, city, country or code',
  expiredMessage: '⚠ I Prefer rejected the request — refresh the page and try again',

  currentHotel,
  isHotelCode: text => CODE_RE.test(text),

  async suggestHotels(text) {
    return ipreferSuggest(await ipreferDirectory(), text)
  },

  async hotelsAt(ref) {
    return ipreferHotelsAt(ref.code ? null : await ipreferDirectory(), ref)
  },

  async hotelName(code) {
    return (await ipreferDirectory()).find(h => h.code === code)?.name ?? null
  },

  async onHotelSearch(params) {
    // The booking link needs the hotel page's path; without the directory the rows just have no link
    const [data, dir] = await Promise.all([ptgCalendar(ipreferCalendarUrl(params.hotel)), ipreferDirectory().catch(() => [])])
    return data === 'SESSION_EXPIRED' ? data : ipreferParseCalendar(data, params, dir.find(h => h.code === params.hotel)?.path)
  },
}
