// Run: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { dlBrandCabin, dlParseResponse } from '../src/programs/dl.js'

const seg = (num, carrier, flight, from, to) => ({
  flightSegmentNum: String(num), originAirportCode: from, destinationAirportCode: to,
  scheduledDepartureLocalTs: '2026-11-12T08:05', scheduledArrivalLocalTs: '2026-11-13T16:20',
  marketingCarrier: { carrierCode: carrier, carrierNum: flight },
})
const offer = (dominant, mileCnt, seats, legBrands) => ({
  soldOut: false,
  additionalOfferProperties: { unavailableForSale: false, dominantSegmentBrandId: dominant },
  offerItems: [{ retailItems: [{ retailItemMetaData: { fareInformation: [{
    brandByFlightLegs: legBrands.map((brandId, i) => ({ brandId, flightSegmentNum: String(i + 1) })),
    availableSeatCnt: seats,
    farePrice: [{ totalFarePrice: { milesEquivalentPrice: { mileCnt } } }],
  }] } }] }],
})
const soldOut = { soldOut: true, additionalOfferProperties: {}, offerItems: null }
const columns = [['BMAIN', '1'], ['CMAIN', '2'], ['CDCP', '5'], ['CDPS', '11'], ['CD1', '14']]
const response = (sets, pageResultCnt = 1) => ({ data: { gqlSearchOffers: {
  gqlOffersSets: sets,
  offerDataList: {
    retailItemDefinitionList: columns.map(([retailItemBrandId, retailItemPriorityText]) => ({ retailItemBrandId, retailItemPriorityText })),
    responseProperties: { pageResultCnt },
  },
} } })

test('dlBrandCabin maps Delta and partner brand ids', () => {
  assert.equal(dlBrandCabin('CD1'), 'J')
  assert.equal(dlBrandCabin('CFIRST'), 'F')
  assert.equal(dlBrandCabin('CDPS'), 'N')
  assert.equal(dlBrandCabin('CDCP'), 'Y')
  assert.equal(dlBrandCabin('CVSUP'), 'J')
  assert.equal(dlBrandCabin('AFPE'), 'N')
  assert.equal(dlBrandCabin('KEEC'), 'Y')
})

test('dlParseResponse takes the cabin from the fare column and keeps the cheapest per cabin', () => {
  // ATL-DTW-ICN: Delta One prices as domestic First + DL 159 Delta One; Comfort in Main's cabin is dearer
  const data = response([{
    trips: [{ totalTripTime: { hourCnt: 27, minuteCnt: 51 }, flightSegment: [seg(1, 'DL', '830', 'ATL', 'DTW'), seg(2, 'DL', '159', 'DTW', 'ICN')] }],
    offers: [
      soldOut,
      offer('CMAIN', 81300, 9, ['CMAIN', 'CMAIN']),
      offer('CDCP', 88300, 5, ['CDCP', 'CDCP']),
      offer('CDPS', 115700, 5, ['CDCP', 'CDPS']),
      offer('CD1', 499900, 7, ['CFIRST', 'CD1']),
    ],
  }])
  const [r] = dlParseResponse(data, 'ATL', 'ICN', '2026-11-12')
  assert.deepEqual(r.cabins, { F: null, J: 7, N: 5, Y: 9 })
  assert.deepEqual(r.miles, { Y: 81300, N: 115700, J: 499900 })
  assert.deepEqual(r.segCabins, { N: ['Y', 'N'], J: ['F', 'J'] })
  assert.equal(r.duration, 27 * 60 + 51)
  assert.deepEqual(r.segs.map(s => s.flight), ['DL830', 'DL159'])
  assert.match(r.bookUrl, /departureDate=11%2F12%2F2026/)
})

test('dlParseResponse files partner fares under their column and skips unpriced ones', () => {
  // AF 8 CDG-JFK: AF economy in the Main column, AF premium in Premium Select, Comfort unpriced
  const unpriced = { soldOut: false, additionalOfferProperties: { dominantSegmentBrandId: 'CDCP' }, offerItems: null }
  const data = response([
    { trips: [{ totalTripTime: { hourCnt: 8, minuteCnt: 30 }, flightSegment: [seg(1, 'AF', '8', 'CDG', 'JFK')] }],
      offers: [soldOut, offer('AFST', 43000, 9, ['AFST']), unpriced, offer('AFPE', 94000, 2, ['AFPE']), soldOut] },
    { trips: [{ totalTripTime: { hourCnt: 8, minuteCnt: 0 }, flightSegment: [seg(1, 'AF', '2', 'CDG', 'JFK')] }],
      offers: [soldOut, soldOut, unpriced, soldOut, soldOut] },
  ])
  const results = dlParseResponse(data, 'CDG', 'JFK', '2026-12-08')
  assert.equal(results.length, 1)
  assert.deepEqual(results[0].cabins, { F: null, J: null, N: 2, Y: 9 })
  assert.equal(results[0].segCabins, undefined)
})

test('dlParseResponse returns nothing for a GraphQL error', () => {
  assert.deepEqual(dlParseResponse({ errors: [{ message: 'RetailOfferError' }] }, 'ATL', 'SEA', '2026-12-12'), [])
})
