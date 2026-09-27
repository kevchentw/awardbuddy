import { sleep } from '../common/search.js'

// Marriott Bonvoy – no login required.
// Everything goes through the site's GraphQL gateway (www.marriott.com/mi/query/<operation>). It only runs
// safelisted operations: each request names one and sends its signature, and the gateway runs its own
// registered query for that signature — the query text sent along is ignored, so ours only lists the
// fields read here (the response has everything the registered query asks for).
//   phoenixShopADFSearchProductsByProperty    reward calendar: lowest points per check-in date for one
//                                             hotel over a date range; dates without availability left out
//   phoenixShopSuggestedPlacesQuery           autocomplete (Google places: hotels, cities, airports, …)
//   phoenixShopSuggestedPlacesDetailsQuery    a suggestion's coordinates and type
//   phoenixShopSearchPropertiesByGeoLocation  hotels around a point with code, name and distance (metres)
//   phoenixShopPropertyInfoCall               one hotel's profile, for its name
// Signatures come from the site's _app bundle. Akamai guards www.marriott.com (403 / 429 challenge), so
// requests go out from the page with its cookies.

const MARRIOTT_SIGNATURES = {
  phoenixShopADFSearchProductsByProperty: '887375892e1ad2a43f46a9c95c55ea47cf6eca3af03331c2134f1b440cff3f9f',
  phoenixShopSuggestedPlacesQuery: '70b3555c91797ca8945e4f4b1bdda42c3e37fa1f08fa99feafb73195702c1d34',
  phoenixShopSuggestedPlacesDetailsQuery: '0b89c8ea7a6a6408eaee651983d6c7ee168670b727cc5beea980b2d2edfdbe2b',
  phoenixShopSearchPropertiesByGeoLocation: 'bea225a1df0a1546d3f0a18ac19b5f5cfe1b94fbead7cf0624e5d5dcef28419f',
  phoenixShopPropertyInfoCall: '00f8d18ee03321350caae9366a33f51b190bc80e760eb3d586260f31b902e843',
}
const MARRIOTT_QUERIES = {
  phoenixShopADFSearchProductsByProperty: `query phoenixShopADFSearchProductsByProperty($search: CalendarSearchByPropertyInput!, $id: [ID!]!) {
  search { calendarSearchByProperty(search: $search) { edges { node { startDate rateModes { pointsPerQuantity { points } } } } } }
}`,
  phoenixShopSuggestedPlacesQuery: `query phoenixShopSuggestedPlacesQuery($query: String!) {
  suggestedPlaces(query: $query) { edges { node { placeId primaryDescription secondaryDescription } } }
}`,
  phoenixShopSuggestedPlacesDetailsQuery: `query phoenixShopSuggestedPlacesDetailsQuery($placeId: ID!) {
  suggestedPlaceDetails(placeId: $placeId) { placeId destinationType location { latitude longitude } }
}`,
  phoenixShopSearchPropertiesByGeoLocation: `query phoenixShopSearchPropertiesByGeoLocation($search: SearchPropertiesByGeolocationInput!, $sort: SearchPropertiesSort, $limit: Int, $offset: Int, $filter: [PropertyDescriptionType]) {
  search { properties { searchByGeolocation(search: $search, sort: $sort, limit: $limit, offset: $offset) { edges { distance node { id basicInformation { name } } } } } }
}`,
  phoenixShopPropertyInfoCall: `query phoenixShopPropertyInfoCall($propertyId: ID!) {
  property(id: $propertyId) { id basicInformation { name } }
}`,
}
const MARRIOTT_DELAY_MS = 600
const NEARBY_RADIUS_M = 80467  // 50 miles, as the site's own search
const NEARBY_MAX = 30
const SAME_PLACE_M = 150  // a hotel suggestion this close to a hotel is that hotel

const CODE_RE = /^[A-Z0-9]{5}$/

// Returns the response JSON, or 'SESSION_EXPIRED' for Akamai's bot check (403 / 429; a page refresh
// usually clears it); throws on other failures
async function marriottQuery(operationName, variables) {
  const res = await fetch(`/mi/query/${operationName}`, {
    method: 'POST',
    headers: {
      accept: '*/*',
      'content-type': 'application/json',
      'apollographql-client-name': 'phoenix_shop',
      'apollographql-client-version': 'v1',
      'application-name': 'shop',
      'graphql-operation-name': operationName,
      'graphql-operation-signature': MARRIOTT_SIGNATURES[operationName],
      'graphql-require-safelisting': 'true',
    },
    credentials: 'include',
    body: JSON.stringify({ operationName, variables, query: MARRIOTT_QUERIES[operationName] }),
  })
  if (res.status === 403 || res.status === 429) return 'SESSION_EXPIRED'
  if (!res.ok) throw new Error(`Marriott ${res.status}`)
  const data = await res.json()
  if (data?.errors?.length && !data.data) throw new Error(`Marriott: ${data.errors[0].message}`)
  return data
}

export function marriottCalendarVariables({ hotel, start, end }) {
  return {
    id: [hotel],
    search: {
      propertyId: hotel,
      options: {
        startDate: start,
        endDate: end,
        numberOfRooms: 1,
        numberOfDays: 1,
        numberInParty: 1,
        rateRequestTypes: [{ type: 'REDEMPTION' }],
      },
    },
  }
}

// The rate calendar for a hotel; it can't open on a given date
export const marriottBookUrl = hotel =>
  `https://www.marriott.com/search/availabilityCalendar.mi?propertyCode=${hotel}&isRateCalendar=true&isSearch=true`

// One result per date: the calendar only has the lowest standard reward rate, no room types
export function marriottParseCalendar(data, hotel) {
  const results = []
  for (const edge of data?.data?.search?.calendarSearchByProperty?.edges ?? []) {
    const node = edge?.node
    const points = node?.rateModes?.pointsPerQuantity?.points
    if (!node?.startDate || !(points > 0)) continue
    results.push({ date: node.startDate, hotel, points, bookUrl: marriottBookUrl(hotel) })
  }
  return results
}

// Hotel code from a Marriott URL: /hotels/travel/tpedm-le-meridien-taipei/, /en-US/hotels/tyomy-…/reviews/,
// or ?propertyCode=TPEDM / ?marshaCode=TPEDM (rate calendar, rate list)
export function marriottHotelFromUrl(url) {
  const u = new URL(url)
  const code = u.searchParams.get('propertyCode') ?? u.searchParams.get('marshaCode')
    ?? u.pathname.match(/\/hotels\/(?:travel\/)?([a-z0-9]{5})(?:-|\/|$)/i)?.[1]
  return code && CODE_RE.test(code.toUpperCase()) ? code.toUpperCase() : null
}

// Search result cards: list view has data-marsha plus a data-property JSON with the name;
// the map card links to the rate calendar with ?propertyCode=
export function marriottPageHotels(doc, url) {
  const hotels = []
  const push = (code, name) => {
    code = code?.toUpperCase()
    if (code && CODE_RE.test(code) && !hotels.some(h => h.code === code)) hotels.push({ code, name: name?.replace(/\s+/g, ' ').trim() || undefined })
  }
  for (const card of doc.querySelectorAll('.property-card[data-marsha]')) {
    let name
    try { name = JSON.parse(card.getAttribute('data-property') ?? '{}').hotelName } catch {}
    push(card.getAttribute('data-marsha'), name ?? card.querySelector('.property-card-title, h2, h3')?.textContent)
  }
  for (const card of doc.querySelectorAll('.HotelCardContainer')) {
    const href = card.querySelector('a[href*="propertyCode="]')?.getAttribute('href')
    const code = href && new URL(href, 'https://www.marriott.com').searchParams.get('propertyCode')
    push(code, card.querySelector('.HotelCard__top-section_title')?.textContent)
  }
  const current = marriottHotelFromUrl(url)
  // A hotel page (rate list, rate calendar) shows its name in the header
  if (current && !hotels.some(h => h.code === current)) hotels.unshift({ code: current, name: doc.querySelector('.hotel-name')?.textContent.replace(/\s+/g, ' ').trim() || undefined })
  return hotels
}


// Autocomplete entries → suggestions; coordinates come from a details call once one is picked
export function marriottParseSuggestions(data) {
  return (data?.data?.suggestedPlaces?.edges ?? []).map(e => e?.node)
    .filter(n => n?.placeId && n.primaryDescription)
    .map(n => ({
      label: n.primaryDescription,
      sub: n.secondaryDescription || undefined,
      ref: { placeId: n.placeId, label: n.primaryDescription },
    }))
}

// Hotels around a place, nearest first; exact when the place is a hotel and one sits right on it
// (distance is in metres). An airport or city never counts as a hotel.
export function marriottParseNearby(data, place) {
  const hotels = (data?.data?.search?.properties?.searchByGeolocation?.edges ?? [])
    .filter(e => e?.node?.id && CODE_RE.test(e.node.id.toUpperCase()))
    .map(e => ({ code: e.node.id.toUpperCase(), name: e.node.basicInformation?.name || undefined, distance: e.distance }))
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
  const first = hotels[0]
  if (first && place?.destinationType === 'Hotel Name' && first.distance < SAME_PLACE_M) {
    return { exact: { code: first.code, name: first.name }, nearby: [] }
  }
  return {
    nearby: hotels.slice(0, NEARBY_MAX).map(h => ({
      code: h.code, name: h.name,
      sub: h.distance != null ? `${(h.distance / 1000).toFixed(1)} km` : undefined,
    })),
  }
}

export const marriottProgram = {
  id: 'marriott',
  kind: 'hotel',
  name: 'Marriott',
  color: '#1C1C1C',
  matches: ['www.marriott.com'],
  requiresSession: false,
  hotelPlaceholder: 'Hotel name, city, airport or code',
  expiredMessage: '⚠ Marriott blocked the request — refresh the page and try again',

  currentHotel: () => marriottHotelFromUrl(location.href),
  isHotelCode: text => CODE_RE.test(text),
  pageHotels: () => marriottPageHotels(document, location.href),

  async suggestHotels(text) {
    const data = await marriottQuery('phoenixShopSuggestedPlacesQuery', { query: text })
    return data === 'SESSION_EXPIRED' ? [] : marriottParseSuggestions(data)
  },

  async hotelsAt(ref) {
    const details = await marriottQuery('phoenixShopSuggestedPlacesDetailsQuery', { placeId: ref.placeId })
    if (details === 'SESSION_EXPIRED') throw new Error('Marriott blocked the request')
    const place = details?.data?.suggestedPlaceDetails
    const { latitude, longitude } = place?.location ?? {}
    if (latitude == null || longitude == null) return { nearby: [] }
    const data = await marriottQuery('phoenixShopSearchPropertiesByGeoLocation', {
      search: { latitude, longitude, distance: NEARBY_RADIUS_M }, limit: NEARBY_MAX * 2, offset: 0,
    })
    if (data === 'SESSION_EXPIRED') throw new Error('Marriott blocked the request')
    return marriottParseNearby(data, place)
  },

  async hotelName(code) {
    const data = await marriottQuery('phoenixShopPropertyInfoCall', { propertyId: code })
    return data === 'SESSION_EXPIRED' ? null : data?.data?.property?.basicInformation?.name ?? null
  },

  async onHotelSearch(params) {
    await sleep(MARRIOTT_DELAY_MS)
    const data = await marriottQuery('phoenixShopADFSearchProductsByProperty', marriottCalendarVariables(params))
    return data === 'SESSION_EXPIRED' ? data : marriottParseCalendar(data, params.hotel)
  },
}
