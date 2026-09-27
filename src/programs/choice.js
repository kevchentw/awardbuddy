import { sleep } from '../common/search.js'
import { preferredChoiceProgram, PARTNER_PAGE_URL } from './preferred-choice.js'

// Choice Privileges – no login required.
// Everything goes through the site's GraphQL endpoint (www.choicehotels.com/dxapi/graphql), which takes
// the query text as sent, so ours only list the fields read here:
//   getHotelAvailabilityCalendarRates  reward calendar: points per check-in date for one hotel (the SRD
//                                      reward rate plan), up to 31 days per request; nights without
//                                      reward rooms come back with availableForSale false
//   searchPoisByTerm                   autocomplete: Google places (cities, airports, hotels, …); hotels
//                                      come without their code
//   searchPoisByPlaceId                a place's coordinates and type
//   searchHotelsByGeoLocation          hotels within a radius (miles) of a point, unsorted, with their
//                                      coordinates (its distanceFromOrigin isn't from that point)
//   fetchHotelSummary                  hotel names by code
// Kasada and Akamai guard www.choicehotels.com, so requests go out from the page with its cookies.
// A second search mode covers Preferred Hotels & Resorts, bookable with Choice points (preferred-choice.js).

const CHOICE_GRAPHQL = '/dxapi/graphql'
const CHOICE_QUERIES = {
  GetHotelCalendarRates: `query GetHotelCalendarRates($hotelCode: String!, $startDate: String!, $endDate: String!, $adults: Int!, $minors: Int!, $ratePlanCodes: [String!], $currencyCode: String!) {
  getHotelAvailabilityCalendarRates(hotelCode: $hotelCode, startDate: $startDate, endDate: $endDate, adults: $adults, minors: $minors, ratePlanCodes: $ratePlanCodes, currencyCode: $currencyCode) {
    calendarRates { startDate points availableForSale }
  }
}`,
  SearchAutoSuggestions: `query SearchAutoSuggestions($searchTerm: String!, $limit: Int) {
  searchPoisByTerm(searchTerm: $searchTerm, limit: $limit) { placeId placeType displayName }
}`,
  SearchPoisByPlaceId: `query SearchPoisByPlaceId($placeId: String!) {
  searchPoisByPlaceId(placeId: $placeId) { placeType latitude longitude }
}`,
  SearchHotelsByGeoLocation: `query SearchHotelsByGeoLocation($latitude: Float!, $longitude: Float!, $radius: Int) {
  searchHotelsByGeoLocation(latitude: $latitude, longitude: $longitude, radius: $radius) {
    code details { name status geoLocation { latitude longitude } }
  }
}`,
  FetchHotelSummary: `query FetchHotelSummary($hotelIds: [String!]!) {
  fetchHotelSummary(hotelIds: $hotelIds) { code name }
}`,
}
const CHOICE_DELAY_MS = 600
const NEARBY_RADIUS_MI = 30
const NEARBY_MAX = 30
const SAME_PLACE_KM = 0.15  // a suggestion this close to a hotel is that hotel
const REWARD_RATE_PLAN = 'SRD'

// Codes are 2 letters and 3 letters or digits, e.g. JP056, NY836, CAH59
const CODE_RE = /^[A-Z]{2}[A-Z0-9]{3}$/

// Returns the response JSON, or 'SESSION_EXPIRED' when the bot check turns the request away (403 / 429;
// a page refresh usually clears it); throws on other failures. An unknown hotel code comes back as a
// 400 with NONEXISTENT_HOTEL_INFO, which is returned like any answer.
async function choiceQuery(operationName, variables) {
  const res = await fetch(`${CHOICE_GRAPHQL}?q=${operationName}`, {
    method: 'POST',
    headers: { accept: '*/*', 'content-type': 'application/json', 'dxapi-context': 'locale:en-us,platform:desktop,sitename:us' },
    credentials: 'include',
    body: JSON.stringify({ operationName, variables, query: CHOICE_QUERIES[operationName] }),
  })
  if (res.status === 403 || res.status === 429) return 'SESSION_EXPIRED'
  const data = await res.json().catch(() => null)
  if (choiceUnknownHotel(data)) return data
  if (!res.ok) throw new Error(`Choice ${res.status}`)
  if (data?.errors?.length && !data.data) throw new Error(`Choice: ${data.errors[0].message}`)
  return data
}

const choiceUnknownHotel = data => !!data?.errors?.some(e => /NONEXISTENT_HOTEL/.test(e?.message))

export function choiceCalendarVariables({ hotel, start, end }) {
  return {
    hotelCode: hotel,
    startDate: start,
    endDate: end,
    adults: 1,
    minors: 0,
    ratePlanCodes: [REWARD_RATE_PLAN],
    currencyCode: 'HOTEL_DEFAULT_CURRENCY',
  }
}

// Opens the hotel page for that night with the reward rate picked
export const choiceBookUrl = (hotel, date, nextDate) =>
  `https://www.choicehotels.com/hotel/${hotel.toLowerCase()}?checkInDate=${date}&checkOutDate=${nextDate}&ratePlanCode=${REWARD_RATE_PLAN}`

const nextDay = date => {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

// One result per bookable night (Choice prices a single reward rate per night); an unknown hotel has none
export function choiceParseCalendar(data, { hotel, start, end }) {
  const results = []
  for (const rate of data?.data?.getHotelAvailabilityCalendarRates?.calendarRates ?? []) {
    const date = rate?.startDate
    if (!date || date < start || date > end || !rate.availableForSale || !(rate.points > 0)) continue
    results.push({ date, hotel, points: rate.points, bookUrl: choiceBookUrl(hotel, date, nextDay(date)) })
  }
  return results.sort((a, b) => a.date.localeCompare(b.date))
}

// Hotel code from a hotel page URL: /japan/tokyo/comfort-inn-hotels/jp056 or /hotel/jp056
export function choiceHotelFromUrl(url) {
  const u = new URL(url)
  const code = u.pathname.match(/\/(?:hotel|[a-z0-9-]+-hotels)\/([a-z0-9]{5})\/?$/i)?.[1]?.toUpperCase()
  return code && CODE_RE.test(code) ? code : null
}

// Search result cards (list and map) title each hotel <h2 id="search-page-list-card-property-name_JP056">
export function choicePageHotels(doc, url) {
  const hotels = []
  for (const el of doc.querySelectorAll('[id^="search-page-list-card-property-name_"]')) {
    const code = el.id.split('_').pop().toUpperCase()
    if (!CODE_RE.test(code) || hotels.some(h => h.code === code)) continue
    hotels.push({ code, name: el.textContent.replace(/\s+/g, ' ').trim() || undefined })
  }
  const current = choiceHotelFromUrl(url)
  if (current && !hotels.some(h => h.code === current)) hotels.unshift({ code: current })
  return hotels
}

// Autocomplete → suggestions; each is a Google place, looked up by its id when picked
export function choiceParseSuggestions(data) {
  return (data?.data?.searchPoisByTerm ?? []).filter(p => p?.placeId && p.displayName).map(p => {
    const [label, ...rest] = p.displayName.split(', ')
    return {
      label, sub: [p.placeType === 'Airport' && 'Airport', rest.join(', ')].filter(Boolean).join(' · ') || undefined,
      ref: { placeId: p.placeId, label: p.displayName },
    }
  })
}

// Hotels around a place, nearest first; exact when the place sits on a hotel (not for an airport)
export function choiceNearby(hotels, place) {
  const { latitude: lat, longitude: lon } = place
  const rad = Math.PI / 180
  const km = (lat2, lon2) => {
    const x = Math.sin((lat2 - lat) * rad / 2) ** 2 + Math.cos(lat * rad) * Math.cos(lat2 * rad) * Math.sin((lon2 - lon) * rad / 2) ** 2
    return 12742 * Math.asin(Math.sqrt(x))
  }
  const list = []
  for (const h of hotels ?? []) {
    const code = h?.code?.toUpperCase()
    const g = h?.details?.geoLocation
    if (!code || !CODE_RE.test(code) || g?.latitude == null || g?.longitude == null) continue
    if (h.details.status && h.details.status !== 'ACTIVE') continue
    list.push({ code, name: h.details.name || undefined, d: km(g.latitude, g.longitude) })
  }
  list.sort((a, b) => a.d - b.d)
  const first = list[0]
  if (first && place.placeType !== 'Airport' && first.d < SAME_PLACE_KM) return { exact: { code: first.code, name: first.name }, nearby: [] }
  return { nearby: list.slice(0, NEARBY_MAX).map(h => ({ code: h.code, name: h.name, sub: `${h.d.toFixed(1)} km` })) }
}

const choiceHotelsProgram = {
  id: 'choice',
  kind: 'hotel',
  name: 'Choice',
  color: '#0070BA',
  matches: ['www.choicehotels.com'],
  requiresSession: false,
  hotelPlaceholder: 'Hotel name, city, airport or code',
  expiredMessage: '⚠ Choice blocked the request — refresh the page and try again',

  currentHotel: () => choiceHotelFromUrl(location.href),
  isHotelCode: text => CODE_RE.test(text),
  pageHotels: () => choicePageHotels(document, location.href),

  async suggestHotels(text) {
    const data = await choiceQuery('SearchAutoSuggestions', { searchTerm: text, limit: 8 })
    return data === 'SESSION_EXPIRED' ? [] : choiceParseSuggestions(data)
  },

  async hotelsAt(ref) {
    const poi = await choiceQuery('SearchPoisByPlaceId', { placeId: ref.placeId })
    if (poi === 'SESSION_EXPIRED') throw new Error('Choice blocked the request')
    const place = poi?.data?.searchPoisByPlaceId?.[0]
    if (place?.latitude == null || place?.longitude == null) return { nearby: [] }
    const data = await choiceQuery('SearchHotelsByGeoLocation', { latitude: place.latitude, longitude: place.longitude, radius: NEARBY_RADIUS_MI })
    if (data === 'SESSION_EXPIRED') throw new Error('Choice blocked the request')
    return choiceNearby(data?.data?.searchHotelsByGeoLocation, place)
  },

  async hotelName(code) {
    const data = await choiceQuery('FetchHotelSummary', { hotelIds: [code] })
    return data === 'SESSION_EXPIRED' ? null : data?.data?.fetchHotelSummary?.find(h => h?.code?.toUpperCase() === code)?.name ?? null
  },

  async onHotelSearch(params) {
    await sleep(CHOICE_DELAY_MS)
    const data = await choiceQuery('GetHotelCalendarRates', choiceCalendarVariables(params))
    return data === 'SESSION_EXPIRED' ? data : choiceParseCalendar(data, params)
  },
}

export const choiceProgram = {
  ...choiceHotelsProgram,
  modes: [
    { code: 'choice', name: 'Choice hotels', program: choiceHotelsProgram },
    {
      code: 'preferred', name: 'Preferred Hotels & Resorts', program: preferredChoiceProgram,
      tip: 'Booking needs your Choice Privileges login: click Start booking on the partner page first, then the Book links open the hotel on preferredhotels.com (pick the dates there).',
      tipLink: { url: PARTNER_PAGE_URL, text: 'Partner page ↗' },
    },
  ],
}
