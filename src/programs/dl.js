import { COMMON_AIRPORTS } from '../common/constants.js'
import { sleep, addDays, monthSpans } from '../common/search.js'

// Delta SkyMiles – no login required
// The award search is the site's own GraphQL POST to offer-api-prd.delta.com. Logged out, the page
// sends Authorization: GUEST and no cookies are needed. About 7 back-to-back searches get a 429, and
// about 9 calendar requests a few seconds apart get a 444, so requests are serialized with a gap and
// a 429 / 444 gets one retry after a pause.
// Each offer set's offers[] lines up with offerDataList.retailItemDefinitionList: column i is a Delta
// fare column (Basic, Main, Comfort, First, Premium Select, Delta One) and partner fares (AFST, CVSUP,
// CEC…) sit in the column of their cabin, so the cabin comes from the column, not the fare's own brand.
// Calendar: the flexible-calendar page's request (calendarSearch) returns the lowest fare per day for
// 5 weeks, starting the Sunday of the week before the date sent. sortByBrandId picks the page's
// "best fares for" column, a floor rather than a cabin: DPPS is "Premium Select / First" (domestic
// First where there's no Premium Select; FIRST alone fails on domestic routes), and D1 can return
// Delta One with a domestic First connection. So each day is filed under the cabin it actually flies.

const DL_OFFERS_URL = 'https://offer-api-prd.delta.com/prd/rm-offer-gql'
const DL_GAP_MS = 1500
const DL_CAL_GAP_MS = 5000
const DL_BACKOFF_MS = 30000
const DL_PAGE_SIZE = 50
const DL_MAX_PAGES = 3
const DL_CAL_MAX_REQUESTS = 20  // per cabin and route, in case a window stops moving forward
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

const DL_CAL_QUERY = `query ($offerSearchCriteria: OfferSearchCriteriaInput!) {
  gqlSearchOffers(offerSearchCriteria: $offerSearchCriteria) {
    gqlOffersSets {
      offers {
        soldOut
        additionalOfferProperties { offered }
        offerItems { retailItems { retailItemMetaData { fareInformation {
          brandByFlightLegs { brandId }
          priceCalendar { priceCalendarDate }
        } } } }
        offerPricing { totalAmt { milesEquivalentPrice { mileCnt } } }
      }
    }
  }
}`

// Fare columns by priority: 1 Basic, 2 Main, 5 Comfort, 8 First, 11 Premium Select, 14 Delta One
const DL_PRIORITY_CABIN = { 1: 'Y', 2: 'Y', 5: 'Y', 8: 'F', 11: 'N', 14: 'J' }
const DL_BRAND_CABIN = { BMAIN: 'Y', CMAIN: 'Y', CDCP: 'Y', CDPS: 'N', CFIRST: 'F', CD1: 'J' }
// Calendar "best fares for" brand per cabin (BE includes Basic, like the Economy column)
const DL_CAL_BRAND = { Y: 'BE', N: 'DPPS', F: 'DPPS', J: 'D1' }
// Which leg names a calendar day's cabin: domestic First is the short-haul product, so a fare with a
// First connection plus a Premium Select or Delta One flight is a Premium Select / Delta One fare
const DL_CABIN_RANK = { Y: 0, F: 1, N: 2, J: 3 }

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

// Calendar response → { days: [{ date, cabin, miles }], last: the window's last date or null }.
// Dates can come back unpadded ("2027-1-02"); days without a fare (past, sold out) are skipped.
export function dlParseCalendar(data, fallbackCabin) {
  const days = []
  let last = null
  for (const offer of (data?.data?.gqlSearchOffers?.gqlOffersSets ?? []).flatMap(s => s.offers ?? [])) {
    const fare = offer.offerItems?.[0]?.retailItems?.[0]?.retailItemMetaData?.fareInformation?.[0]
    const raw = fare?.priceCalendar?.priceCalendarDate?.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
    if (!raw) continue
    const date = `${raw[1]}-${raw[2].padStart(2, '0')}-${raw[3].padStart(2, '0')}`
    if (!last || date > last) last = date
    const miles = offer.offerPricing?.[0]?.totalAmt?.milesEquivalentPrice?.mileCnt
    if (offer.soldOut || !offer.additionalOfferProperties?.offered || !(miles > 0)) continue
    const legCabins = (fare.brandByFlightLegs ?? []).map(b => dlBrandCabin(b.brandId))
    const cabin = legCabins.length
      ? legCabins.reduce((a, b) => DL_CABIN_RANK[b] > DL_CABIN_RANK[a] ? b : a)
      : fallbackCabin
    days.push({ date, cabin, miles })
  }
  return { days, last }
}

// Brands to ask for, in cabin order (one DPPS request covers Prem Eco and First)
function dlCalBrands(cabinFilter) {
  const cabins = cabinFilter?.length ? cabinFilter.filter(c => c in DL_CAL_BRAND) : ['F', 'J', 'N', 'Y']
  return [...new Set(cabins.map(c => DL_CAL_BRAND[c]))]
}

function dlCalRange(fromMonth, toMonth) {
  const spans = monthSpans(fromMonth, toMonth)
  return spans.length ? { start: spans[0].start, end: spans.at(-1).end } : null
}

function dlCalVariables(origin, destination, date, brand) {
  return {
    offerSearchCriteria: {
      productGroups: [{ productCategoryCode: 'FLIGHTS' }],
      customers: [{ passengerTypeCode: 'ADT', passengerId: '1' }],
      offersCriteria: {
        pricingCriteria: { priceableIn: ['MILES'] },
        preferences: { nonStopOnly: false, refundableOnly: false, excludeBrandTypes: [] },
        flightRequestCriteria: {
          sortByBrandId: brand,
          calendarSearch: true,
          searchOriginDestination: [{
            departureLocalTs: `${date}T00:00:00`,
            origins: [{ airportCode: origin }],
            destinations: [{ airportCode: destination }],
          }],
        },
      },
    },
  }
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

function dlFetchOnce(variables, query) {
  return fetch(DL_OFFERS_URL, {
    method: 'POST',
    headers: {
      Authorization: 'GUEST',
      'Content-Type': 'application/json',
      TransactionId: `${crypto.randomUUID()}_${Date.now()}`,
      applicationId: 'DC', channelId: 'DCOM', Airline: 'DL',
      'x-app-type': 'dcom-shop', 'x-app-route': 'search',
    },
    body: JSON.stringify({ variables, query }),
  }).catch(() => null)
}

// Serialize every request across the UI's worker pool; gapMs is the pause after the previous one
let dlQueue = Promise.resolve()
let dlLastAt = 0
function dlEnqueue(fn, gapMs) {
  const run = dlQueue.then(async () => {
    await sleep(Math.max(0, dlLastAt + gapMs - Date.now()))
    try { return await fn() } finally { dlLastAt = Date.now() }
  })
  dlQueue = run.catch(() => {})
  return run
}

const dlLimited = res => res?.status === 429 || res?.status === 444

// Parsed JSON, null on other failures (GraphQL errors such as "no flights" come back as 200), or
// 'SESSION_EXPIRED' when still rate limited after the retry
async function dlFetch(variables, query, gapMs) {
  const send = () => dlEnqueue(() => dlFetchOnce(variables, query), gapMs)
  let res = await send()
  if (dlLimited(res)) { await sleep(DL_BACKOFF_MS); res = await send() }
  if (dlLimited(res)) return 'SESSION_EXPIRED'
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
      const data = await dlFetch(dlVariables(origin, destination, date, page), DL_QUERY, DL_GAP_MS)
      if (data === 'SESSION_EXPIRED') return results.length ? results : data
      results.push(...dlParseResponse(data, origin, destination, date))
      if (!(data?.data?.gqlSearchOffers?.offerDataList?.responseProperties?.pageResultCnt > page)) break
    }
    return results
  },

  // A 5-week window moves the cursor forward 29-35 days
  calendarRequestsPerRoute(fromMonth, toMonth, cabinFilter) {
    const range = dlCalRange(fromMonth, toMonth)
    if (!range) return 0
    const days = (Date.parse(range.end) - Date.parse(range.start)) / 86400000 + 1
    return dlCalBrands(cabinFilter).length * Math.ceil(days / 32)
  },

  async onCalendarSearch(origin, destination, cabinFilter, fromMonth, toMonth, onProgress) {
    const range = dlCalRange(fromMonth, toMonth)
    if (!range) return {}
    const brands = dlCalBrands(cabinFilter)
    let total = this.calendarRequestsPerRoute(fromMonth, toMonth, cabinFilter), done = 0
    const byDate = {}
    for (const brand of brands) {
      const brandCabins = Object.keys(DL_CAL_BRAND).filter(c => DL_CAL_BRAND[c] === brand)
      let cursor = range.start
      for (let n = 0; cursor <= range.end && n < DL_CAL_MAX_REQUESTS; n++) {
        total = Math.max(total, done + 1)
        onProgress?.(null, { done, total, label: `Searching ${brandCabins.join('/')} – ${cursor.slice(0, 7)}` })
        // The window starts the Sunday of the week before the date sent, so this one covers the cursor
        const data = await dlFetch(dlCalVariables(origin, destination, addDays(cursor, 7), brand), DL_CAL_QUERY, DL_CAL_GAP_MS)
        if (data === 'SESSION_EXPIRED') return data
        const { days, last } = dlParseCalendar(data, brandCabins[0])
        const partial = {}
        for (const { date, cabin: c, miles } of days) {
          if (date < range.start || date > range.end) continue
          if (byDate[date]?.[c] <= miles) continue
          byDate[date] = { ...byDate[date], [c]: miles }
          partial[date] = { ...partial[date], [c]: miles }
        }
        onProgress?.(Object.keys(partial).length ? partial : null, { done: ++done, total })
        // No window back (no flights, or an error): skip the 5 weeks it would have covered
        cursor = last && last >= cursor ? addDays(last, 1) : addDays(cursor, 35)
      }
    }
    return byDate
  },
}
