import { sleep } from '../common/search.js'

// Marriott Bonvoy – no login required.
// The site's availability calendar (www.marriott.com/mi/query/phoenixShopADFSearchProductsByProperty)
// is a GraphQL query that returns the lowest reward-night points per check-in date for one hotel over
// a date range; dates without availability are left out. The gateway only runs safelisted queries: the
// query text must match the operation signature byte for byte, so it can't be trimmed or extended.
// Akamai guards www.marriott.com (403 / 429 challenge), so requests go out from the page with its cookies.
// Hotels are found from the page (search result cards carry the code and name) or by typing a code;
// there's no name search yet.

const MARRIOTT_OP = 'phoenixShopADFSearchProductsByProperty'
const MARRIOTT_SIGNATURE = '887375892e1ad2a43f46a9c95c55ea47cf6eca3af03331c2134f1b440cff3f9f'
const MARRIOTT_HEADERS = {
  accept: '*/*',
  'content-type': 'application/json',
  'apollographql-client-name': 'phoenix_shop',
  'apollographql-client-version': 'v1',
  'application-name': 'shop',
  'graphql-operation-name': MARRIOTT_OP,
  'graphql-operation-signature': MARRIOTT_SIGNATURE,
  'graphql-require-safelisting': 'true',
}
const MARRIOTT_DELAY_MS = 600
const MARRIOTT_QUERY = `query phoenixShopADFSearchProductsByProperty($search: CalendarSearchByPropertyInput!, $id: [ID!]!) {
  search {
    calendarSearchByProperty(search: $search) {
      total
      edges {
        node {
          endDate
          startDate
          rateModes {
            lowestAverageRate {
              amount {
                currency
                amount
                decimalPoint
                __typename
              }
              __typename
            }
            pointsPerQuantity {
              points
              __typename
            }
            totalRate {
              amount {
                amount
                currency
                decimalPoint
                __typename
              }
              __typename
            }
            sourceOfRate
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
  propertiesByIds(ids: $id) {
    basicInformation {
      isAdultsOnly
      descriptions(
        filter: [RESORT_FEE_DESCRIPTION, DESTINATION_FEE_DESCRIPTION, SURCHARGE_ORDINANCE_COST_DESCRIPTION]
      ) {
        type {
          enumCode
          __typename
        }
        __typename
      }
      resort
      __typename
    }
    __typename
  }
}
`

const CODE_RE = /^[A-Z0-9]{5}$/

export function marriottBuildRequest({ hotel, start, end }) {
  return {
    operationName: MARRIOTT_OP,
    variables: {
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
    },
    query: MARRIOTT_QUERY,
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

export const marriottProgram = {
  id: 'marriott',
  kind: 'hotel',
  name: 'Marriott',
  color: '#1C1C1C',
  matches: ['www.marriott.com'],
  requiresSession: false,
  hotelPlaceholder: 'Hotel code (e.g. TPEDM) — or pick from this page',
  expiredMessage: '⚠ Marriott blocked the request — refresh the page and try again',

  currentHotel: () => marriottHotelFromUrl(location.href),
  isHotelCode: text => CODE_RE.test(text),
  pageHotels: () => marriottPageHotels(document, location.href),

  async onHotelSearch({ hotel, start, end }) {
    await sleep(MARRIOTT_DELAY_MS)
    const res = await fetch(`/mi/query/${MARRIOTT_OP}`, {
      method: 'POST',
      headers: MARRIOTT_HEADERS,
      credentials: 'include',
      body: JSON.stringify(marriottBuildRequest({ hotel, start, end })),
    })
    // 403 / 429 is Akamai's bot check; a page refresh usually clears it
    if (res.status === 403 || res.status === 429) return 'SESSION_EXPIRED'
    if (!res.ok) throw new Error(`Marriott ${res.status}`)
    const data = await res.json()
    if (data?.errors?.length && !data.data?.search) throw new Error(`Marriott: ${data.errors[0].message}`)
    return marriottParseCalendar(data, hotel)
  },
}
