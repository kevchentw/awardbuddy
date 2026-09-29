// Run: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { asFareCabin, asParseResponse } from '../src/programs/as.js'

const seg = (flightNumber, dep, arr) => ({
  publishingCarrier: { carrierCode: 'AA', flightNumber }, departureStation: dep, arrivalStation: arr,
  departureTime: '2026-12-09T06:00:00', arrivalTime: '2026-12-10T14:35:00',
})

test('asFareCabin reads the cabin from the solution key, not the first segment', () => {
  assert.equal(asFareCabin('REFUNDABLE_BUSINESS', { cabins: ['FIRST', 'BUSINESS'] }), 'J')
  assert.equal(asFareCabin('REFUNDABLE_MAIN', { cabins: ['COACH'] }), 'Y')
  assert.equal(asFareCabin('SAVER_FIRST', { cabins: ['FIRST'] }), 'F')
  assert.equal(asFareCabin('PREMIUM', { cabins: ['PREMIUM-COACH'] }), 'N')
  assert.equal(asFareCabin('UNKNOWN', { cabins: ['BUSINESS'] }), 'J')
})

test('asParseResponse keeps per-segment cabins for a mixed-cabin fare', () => {
  // BOS-JFK-HND: 75k business prices as AA domestic first + AA 167 business
  const data = { rows: [{
    duration: 1115, segments: [seg(4639, 'BOS', 'JFK'), seg(167, 'JFK', 'HND')],
    solutions: {
      REFUNDABLE_BUSINESS: { cabins: ['FIRST', 'BUSINESS'], atmosPoints: 75000, seatsRemaining: 1, mixedCabin: true },
      REFUNDABLE_MAIN: { cabins: ['COACH', 'COACH'], atmosPoints: 37500, seatsRemaining: 9, mixedCabin: false },
    },
  }] }
  const [r] = asParseResponse(data, 'BOS', 'HND', '2026-12-09')
  assert.deepEqual(r.cabins, { F: null, J: 1, N: null, Y: 9 })
  assert.deepEqual(r.miles, { J: 75000, Y: 37500 })
  assert.deepEqual(r.segCabins, { J: ['F', 'J'] })
})
