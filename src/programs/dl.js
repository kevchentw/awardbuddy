import { COMMON_AIRPORTS } from '../common/constants.js'
import { sleep } from '../common/search.js'

// Delta SkyMiles – no login required
// The award search is the site's own GraphQL POST to offer-api-prd.delta.com. Logged out, the page
// sends Authorization: GUEST and no cookies are needed. About 7 back-to-back requests get a 429, so
// requests are serialized with a gap, and a 429 gets one retry after a pause.
// Each offer set's offers[] lines up with offerDataList.retailItemDefinitionList: column i is a Delta
// fare column (Basic, Main, Comfort, First, Premium Select, Delta One) and partner fares (AFST, CVSUP,
// CEC…) sit in the column of their cabin, so the cabin comes from the column, not the fare's own brand.
// There's no one-way award calendar: the price calendar needs a trip length (round trip) and the
// flexible-dates grid only spans ±3 days.

const DL_OFFERS_URL = 'https://offer-api-prd.delta.com/prd/rm-offer-gql'
const DL_GAP_MS = 1500
const DL_BACKOFF_MS = 20000
const DL_PAGE_SIZE = 50
const DL_MAX_PAGES = 3
const DL_RATE_LIMIT_MESSAGE = '⚠ Delta is limiting searches — wait a minute, then search again'

const DL_QUERY = `query ($offerSearchCriteria: OfferSearchCriteriaInput!) {
  gqlSearchOffers(offerSearchCriteria: $offerSearchCriteria) {
    gqlOffersSets {
      trips {
        totalTripTime { hourCnt minuteCnt }
        flightSegment {
          flightSegmentNum originAirportCode destinationAirportCode scheduledDepartureLocalTs scheduledArrivalLocalTs
          marketingCarrier { carrierCode carrierNum }
        }
      }
      offers {
        soldOut
        additionalOfferProperties { unavailableForSale dominantSegmentBrandId }
        offerItems { retailItems { retailItemMetaData { fareInformation {
          brandByFlightLegs { brandId flightSegmentNum }
          availableSeatCnt
          farePrice { totalFarePrice { milesEquivalentPrice { mileCnt } } }
        } } } }
      }
    }
    offerDataList {
      retailItemDefinitionList { retailItemBrandId retailItemPriorityText }
      responseProperties { pageResultCnt }
    }
  }
}`

// Fare columns by priority: 1 Basic, 2 Main, 5 Comfort, 8 First, 11 Premium Select, 14 Delta One
const DL_PRIORITY_CABIN = { 1: 'Y', 2: 'Y', 5: 'Y', 8: 'F', 11: 'N', 14: 'J' }
const DL_BRAND_CABIN = { BMAIN: 'Y', CMAIN: 'Y', CDCP: 'Y', CDPS: 'N', CFIRST: 'F', CD1: 'J' }

// Best guess from a brand id alone, for a flight whose brand differs from its fare's column
// (partner brands end in their cabin: CEC / KEEC economy, AFPE premium, CBU / CVSUP business)
export function dlBrandCabin(brandId) {
  const b = String(brandId ?? '').toUpperCase()
  if (DL_BRAND_CABIN[b]) return DL_BRAND_CABIN[b]
  if (/(D1|BU|UP)$/.test(b)) return 'J'
  if (/(PE|PS)$/.test(b)) return 'N'
  if (/(FIRST|FI|FR)$/.test(b)) return 'F'
  return 'Y'
}

function dlColumnCabin(def) {
  return DL_PRIORITY_CABIN[def?.retailItemPriorityText] ?? dlBrandCabin(def?.retailItemBrandId)
}

function dlBookUrl(origin, destination, date) {
  const [y, m, d] = date.split('-')
  const params = new URLSearchParams({
    action: 'findFlights', tripType: 'ONE_WAY', priceSchedule: 'price',
    originCity: origin, destinationCity: destination, departureDate: `${m}/${d}/${y}`,
    departureTime: 'AT', returnDate: '', returnTime: 'AT', paxCount: '1', searchByCabin: 'true',
    cabinFareClass: 'BE', deltaOnlySearch: 'false', deltaOnly: 'off', Go: 'Find Flights',
    meetingEventCode: '', refundableFlightsOnly: 'false', compareAirport: 'false',
    awardTravel: 'true', shopWithMiles: 'on',
  })
  return `https://www.delta.com/flight-search/search?${params}`
}

export function dlParseResponse(data, origin, destination, date) {
  const g = data?.data?.gqlSearchOffers
  if (!g?.gqlOffersSets) return []
  const columns = (g.offerDataList?.retailItemDefinitionList ?? []).map(dlColumnCabin)
  const bookUrl = dlBookUrl(origin, destination, date)
  const results = []
  for (const set of g.gqlOffersSets) {
    const trip = set.trips?.[0]
    if (!trip?.flightSegment?.length) continue
    const cabins = { F: null, J: null, N: null, Y: null }, miles = {}
    let segCabins
    set.offers?.forEach((offer, i) => {
      const c = columns[i]
      const fare = offer.offerItems?.[0]?.retailItems?.[0]?.retailItemMetaData?.fareInformation?.[0]
      const mileCnt = fare?.farePrice?.[0]?.totalFarePrice?.milesEquivalentPrice?.mileCnt
      if (!c || offer.soldOut || offer.additionalOfferProperties?.unavailableForSale || !(mileCnt > 0)) return
      if (miles[c] && miles[c] <= mileCnt) return
      miles[c] = mileCnt
      cabins[c] = fare.availableSeatCnt ?? true
      const dominant = offer.additionalOfferProperties?.dominantSegmentBrandId
      const perSeg = trip.flightSegment.map(seg => {
        const brand = fare.brandByFlightLegs?.find(b => b.flightSegmentNum === seg.flightSegmentNum)?.brandId
        return !brand || brand === dominant ? c : dlBrandCabin(brand)
      })
      if (perSeg.some(sc => sc !== c)) (segCabins ??= {})[c] = perSeg
      else if (segCabins) delete segCabins[c]
    })
    if (!Object.values(cabins).some(v => v !== null)) continue
    const segs = trip.flightSegment.map(seg => ({
      airline: seg.marketingCarrier?.carrierCode,
      flight: `${seg.marketingCarrier?.carrierCode}${seg.marketingCarrier?.carrierNum}`,
      origin: seg.originAirportCode, destination: seg.destinationAirportCode,
      dep: seg.scheduledDepartureLocalTs, arr: seg.scheduledArrivalLocalTs,
    }))
    // hourCnt runs past 24 on its own (dayCnt, left out of the query, is the arrival's day change)
    const t = trip.totalTripTime
    const duration = t ? (t.hourCnt ?? 0) * 60 + (t.minuteCnt ?? 0) : null
    results.push({
      date, origin: segs[0].origin, destination: segs.at(-1).destination, segs, cabins, miles, duration, bookUrl,
      ...(segCabins && Object.keys(segCabins).length ? { segCabins } : {}),
    })
  }
  return results
}

function dlVariables(origin, destination, date, page) {
  return {
    offerSearchCriteria: {
      productGroups: [{ productCategoryCode: 'FLIGHTS' }],
      offersCriteria: {
        resultsPageNum: page,
        resultsPerRequestNum: DL_PAGE_SIZE,
        preferences: { refundableOnly: false, showGlobalRegionalUpgradeCertificate: true, nonStopOnly: false, excludeBrandTypes: [] },
        pricingCriteria: { priceableIn: ['MILES'] },
        flightRequestCriteria: {
          currentTripIndexId: '0', sortableOptionId: null, selectedOfferId: '',
          searchOriginDestination: [{
            departureLocalTs: `${date}T00:00:00`,
            origins: [{ airportCode: origin }],
            destinations: [{ airportCode: destination }],
          }],
          sortByBrandId: 'MAIN',
          additionalCriteriaMap: { rollOutTag: 'GBB' },
        },
      },
      customers: [{ passengerTypeCode: 'ADT', passengerId: '1' }],
    },
  }
}

function dlFetchOnce(origin, destination, date, page) {
  return fetch(DL_OFFERS_URL, {
    method: 'POST',
    headers: {
      Authorization: 'GUEST',
      'Content-Type': 'application/json',
      TransactionId: `${crypto.randomUUID()}_${Date.now()}`,
      applicationId: 'DC', channelId: 'DCOM', Airline: 'DL',
      'x-app-type': 'dcom-shop', 'x-app-route': 'search',
    },
    body: JSON.stringify({ variables: dlVariables(origin, destination, date, page), query: DL_QUERY }),
  }).catch(() => null)
}

// Serialize every request across the UI's worker pool
let dlQueue = Promise.resolve()
let dlLastAt = 0
function dlEnqueue(fn) {
  const run = dlQueue.then(async () => {
    await sleep(Math.max(0, dlLastAt + DL_GAP_MS - Date.now()))
    try { return await fn() } finally { dlLastAt = Date.now() }
  })
  dlQueue = run.catch(() => {})
  return run
}

// Parsed JSON, null on other failures (GraphQL errors such as "no flights" come back as 200), or
// 'SESSION_EXPIRED' when still rate limited after the retry
async function dlFetch(origin, destination, date, page) {
  const send = () => dlEnqueue(() => dlFetchOnce(origin, destination, date, page))
  let res = await send()
  if (res?.status === 429) { await sleep(DL_BACKOFF_MS); res = await send() }
  if (res?.status === 429) return 'SESSION_EXPIRED'
  if (!res?.ok) return null
  return res.json().catch(() => null)
}

export const dlProgram = {
  id: 'dl',
  name: 'Delta SkyMiles',
  color: '#003366',
  cabins: ['F', 'J', 'N', 'Y'],
  airports: COMMON_AIRPORTS,
  requiresSession: false,
  matches: ['www.delta.com'],
  expiredMessage: DL_RATE_LIMIT_MESSAGE,

  async onSearch({ origin, destination, date }) {
    const results = []
    for (let page = 1; page <= DL_MAX_PAGES; page++) {
      const data = await dlFetch(origin, destination, date, page)
      if (data === 'SESSION_EXPIRED') return results.length ? results : data
      results.push(...dlParseResponse(data, origin, destination, date))
      if (!(data?.data?.gqlSearchOffers?.offerDataList?.responseProperties?.pageResultCnt > page)) break
    }
    return results
  },
}
