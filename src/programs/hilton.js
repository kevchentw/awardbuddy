import { sleep } from '../common/search.js'

// Hilton Honors – no login required.
// Everything goes through the site's GraphQL endpoint (www.hilton.com/graphql/customer), which takes the
// query text as sent, so ours only list the fields read here:
//   hotel_shopAvailOptions_shopCalendarPropAvail  reward calendar: the lowest points rate per check-in date
//                                                 for the whole month holding arrivalDate, with its rate
//                                                 plan (Standard / Premium Room Reward) and rooms left
//   geocode_hotelSummaryOptions                   a place (city, airport, landmark or hotel) and the hotels
//                                                 around it, nearest first, with distance in km
//   hotel                                         one hotel's name
// Autocomplete is a plain GET on /dx-customer/autocomplete; hotels come back with their code in the
// place id (dx-hotel::tyocici). Akamai guards www.hilton.com (429 / 403), so requests go out from the page.

const HILTON_GRAPHQL = '/graphql/customer'
const HILTON_QUERIES = {
  hotel_shopAvailOptions_shopCalendarPropAvail: `query hotel_shopAvailOptions_shopCalendarPropAvail($arrivalDate: String!, $ctyhocn: String!, $language: String!, $guestLocationCountry: String, $numAdults: Int!, $numChildren: Int!, $numRooms: Int!, $displayCurrency: String, $lengthOfStay: Int!, $specialRates: ShopSpecialRateInput) {
  hotel(ctyhocn: $ctyhocn, language: $language) {
    ctyhocn
    shopCalendarAvail(input: {guestLocationCountry: $guestLocationCountry, arrivalDate: $arrivalDate, displayCurrency: $displayCurrency, numAdults: $numAdults, numChildren: $numChildren, numRooms: $numRooms, lengthOfStay: $lengthOfStay, displayRateType: average, specialRates: $specialRates}) {
      calendars { arrivalDate roomRate { dailyRmPointsRate numRoomsAvail ratePlan { ratePlanName } } }
    }
  }
}`,
  geocode_hotelSummaryOptions: `query geocode_hotelSummaryOptions($address: String, $distanceUnit: HotelDistanceUnit, $language: String!, $placeId: String, $queryLimit: Int!, $sessionToken: String) {
  geocode(language: $language, address: $address, placeId: $placeId, sessionToken: $sessionToken) {
    match { id type }
    hotelSummaryOptions(distanceUnit: $distanceUnit, sortBy: distance) { hotels(first: $queryLimit) { ctyhocn name distance } }
  }
}`,
  hotel: `query hotel($ctyhocn: String!, $language: String!) {
  hotel(ctyhocn: $ctyhocn, language: $language) { ctyhocn name }
}`,
}
const HILTON_DELAY_MS = 600
const NEARBY_MAX = 30

// Codes (ctyhocn) are 7 letters: city, hotel and brand, e.g. TYOCICI
const CODE_RE = /^[A-Z]{7}$/

// Returns the response JSON, or 'SESSION_EXPIRED' for Akamai's bot check (429 / 403; a page refresh
// usually clears it); throws on other failures
async function hiltonQuery(operationName, variables) {
  const res = await fetch(`${HILTON_GRAPHQL}?appName=dx-res-ui&operationName=${operationName}&bl=en`, {
    method: 'POST',
    headers: { accept: '*/*', 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ operationName, variables, query: HILTON_QUERIES[operationName] }),
  })
  if (res.status === 403 || res.status === 429) return 'SESSION_EXPIRED'
  if (!res.ok) throw new Error(`Hilton ${res.status}`)
  const data = await res.json()
  if (data?.errors?.length && !data.data) throw new Error(`Hilton: ${data.errors[0].message}`)
  return data
}

// The calendar always covers the whole month holding arrivalDate
export function hiltonCalendarVariables({ hotel, start }) {
  return {
    arrivalDate: start,
    ctyhocn: hotel,
    language: 'en',
    guestLocationCountry: 'US',
    lengthOfStay: 1,
    numAdults: 1,
    numChildren: 0,
    numRooms: 1,
    displayCurrency: null,
    specialRates: { hhonors: true },
  }
}

export const hiltonBookUrl = (hotel, date, nextDate) =>
  `https://www.hilton.com/en/book/reservation/rooms/?ctyhocn=${hotel}&arrivalDate=${date}&departureDate=${nextDate}&room1NumAdults=1&redeemPts=true`

const nextDay = date => {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

// One result per date (the lowest reward rate that night), kept to start..end since the reply is a whole month
export function hiltonParseCalendar(data, { hotel, start, end }) {
  const results = []
  for (const day of data?.data?.hotel?.shopCalendarAvail?.calendars ?? []) {
    const date = day?.arrivalDate
    const rate = day?.roomRate
    const points = rate?.dailyRmPointsRate
    if (!date || date < start || date > end || !(points > 0)) continue
    results.push({
      date, hotel, points,
      room: rate.ratePlan?.ratePlanName || undefined,
      roomsLeft: rate.numRoomsAvail ?? undefined,
      bookUrl: hiltonBookUrl(hotel, date, nextDay(date)),
    })
  }
  return results
}

// Hotel code from a Hilton URL: /en/hotels/tyocici-conrad-tokyo/… or ?ctyhocn=TYOCICI (booking pages)
export function hiltonHotelFromUrl(url) {
  const u = new URL(url)
  const code = u.searchParams.get('ctyhocn') ?? u.pathname.match(/\/hotels\/([a-z]{7})(?:-|\/|$)/i)?.[1]
  return code && CODE_RE.test(code.toUpperCase()) ? code.toUpperCase() : null
}

// Search result cards are <li data-testid="hotel-card-TYOCICI"> with the name in an h3.
// A hotel page has no clean name on it, so the picker looks that one up.
export function hiltonPageHotels(doc, url) {
  const hotels = []
  for (const card of doc.querySelectorAll('li[data-testid^="hotel-card-"]')) {
    const code = card.getAttribute('data-testid').slice('hotel-card-'.length).toUpperCase()
    if (!CODE_RE.test(code) || hotels.some(h => h.code === code)) continue
    hotels.push({ code, name: card.querySelector('h3')?.textContent.replace(/\s+/g, ' ').trim() || undefined })
  }
  const current = hiltonHotelFromUrl(url)
  if (current && !hotels.some(h => h.code === current)) hotels.unshift({ code: current })
  return hotels
}

// Autocomplete entries → suggestions. A hotel's place id carries its code; other places (cities have
// no place id) are looked up by id and text
export function hiltonParseSuggestions(data) {
  return (data?.predictions ?? [])
    .filter(p => p?.structured_formatting?.main_text)
    .map(p => {
      const label = p.structured_formatting.main_text
      const code = p.place_id?.match(/^dx-hotel::([a-z]{7})$/i)?.[1]?.toUpperCase()
      return {
        label,
        sub: p.type === 'airport' ? ['Airport', p.structured_formatting.secondary_text].filter(Boolean).join(' · ')
          : p.structured_formatting.secondary_text || undefined,
        ref: code ? { code, label } : { placeId: p.place_id ?? null, address: p.description ?? label, label },
      }
    })
}

// Hotels around a place, nearest first (distance in km)
export function hiltonParseNearby(data) {
  const hotels = (data?.data?.geocode?.hotelSummaryOptions?.hotels ?? [])
    .filter(h => h?.ctyhocn && CODE_RE.test(h.ctyhocn.toUpperCase()))
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
  return {
    nearby: hotels.slice(0, NEARBY_MAX).map(h => ({
      code: h.ctyhocn.toUpperCase(), name: h.name || undefined,
      sub: h.distance != null ? `${h.distance.toFixed(1)} km` : undefined,
    })),
  }
}

export const hiltonProgram = {
  id: 'hilton',
  kind: 'hotel',
  name: 'Hilton',
  color: '#104C97',
  matches: ['www.hilton.com'],
  requiresSession: false,
  hotelPlaceholder: 'Hotel name, city, airport or code',
  expiredMessage: '⚠ Hilton blocked the request — refresh the page and try again',

  currentHotel: () => hiltonHotelFromUrl(location.href),
  isHotelCode: text => CODE_RE.test(text),
  pageHotels: () => hiltonPageHotels(document, location.href),

  async suggestHotels(text) {
    const res = await fetch(`/dx-customer/autocomplete?input=${encodeURIComponent(text)}&language=en`, {
      headers: { 'dx-map-session-token': crypto.randomUUID() },
      credentials: 'include',
    })
    return res.ok ? hiltonParseSuggestions(await res.json()) : []
  },

  // A hotel suggestion already has its code; any other place lists what's around it
  async hotelsAt(ref) {
    if (ref.code) return { exact: { code: ref.code, name: ref.label }, nearby: [] }
    const data = await hiltonQuery('geocode_hotelSummaryOptions', {
      address: ref.address, placeId: ref.placeId, language: 'en', distanceUnit: 'km', queryLimit: NEARBY_MAX,
    })
    if (data === 'SESSION_EXPIRED') throw new Error('Hilton blocked the request')
    return hiltonParseNearby(data)
  },

  async hotelName(code) {
    const data = await hiltonQuery('hotel', { ctyhocn: code, language: 'en' })
    return data === 'SESSION_EXPIRED' ? null : data?.data?.hotel?.name ?? null
  },

  async onHotelSearch(params) {
    await sleep(HILTON_DELAY_MS)
    const data = await hiltonQuery('hotel_shopAvailOptions_shopCalendarPropAvail', hiltonCalendarVariables(params))
    return data === 'SESSION_EXPIRED' ? data : hiltonParseCalendar(data, params)
  },
}
