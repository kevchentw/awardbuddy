// Run: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getDates, addDays, parseNumberList, combos } from '../src/common/search.js'

test('getDates spans month end and US DST change without gaps or repeats', () => {
  assert.deepEqual(getDates('2027-03-12', '2027-03-16'), ['2027-03-12', '2027-03-13', '2027-03-14', '2027-03-15', '2027-03-16'])
  assert.deepEqual(getDates('2026-12-31', '2027-01-01'), ['2026-12-31', '2027-01-01'])
  assert.deepEqual(getDates('2026-10-02', '2026-10-01'), [])
})

test('addDays goes both ways across months', () => {
  assert.equal(addDays('2026-03-01', -1), '2026-02-28')
  assert.equal(addDays('2026-10-25', 14), '2026-11-08')
})

test('parseNumberList expands ranges and rejects junk', () => {
  assert.deepEqual(parseNumberList('3-5, 7'), [3, 4, 5, 7])
  assert.deepEqual(parseNumberList('5'), [5])
  assert.deepEqual(parseNumberList(' 2,2 '), [2])
  assert.deepEqual(parseNumberList('5-3'), [])
  assert.deepEqual(parseNumberList('x'), [])
  assert.deepEqual(parseNumberList(''), [])
})

test('combos is the cartesian product of option lists', () => {
  assert.deepEqual(combos({}), [{}])
  assert.deepEqual(combos({ city: ['MUC', 'FRA'], days: [3, 5] }),
    [{ city: 'MUC', days: 3 }, { city: 'MUC', days: 5 }, { city: 'FRA', days: 3 }, { city: 'FRA', days: 5 }])
  assert.deepEqual(combos({ city: [], days: [3] }), [])
})

test('EVA award chart prices by origin/destination zone', async () => {
  const { brAwardMiles } = await import('../src/programs/br.js')
  assert.equal(brAwardMiles('TPE', 'HKG', 'Y'), 10000)
  assert.equal(brAwardMiles('MFM', 'KHH', 'J'), 25000)
  assert.equal(brAwardMiles('TPE', 'HKG', 'N'), 0)
  assert.equal(brAwardMiles('NRT', 'BKK', 'Y'), 17500)
  assert.equal(brAwardMiles('HKG', 'NRT', 'N'), 20000)
  assert.equal(brAwardMiles('LAX', 'TPE', 'J'), 75000)
  assert.equal(brAwardMiles('BKK', 'JFK', 'Y'), 55000)
  assert.equal(brAwardMiles('YYZ', 'TPE', 'N'), 60000)
  assert.equal(brAwardMiles('TPE', 'CDG', 'N'), 55000)
  assert.equal(brAwardMiles('BNE', 'TPE', 'J'), 75000)
  assert.equal(brAwardMiles('LAX', 'LHR', 'J'), 0)
})

test('JAL partner availability: cabin needs every segment, seats = tightest segment', async () => {
  const { jalParsePartnerAvailability } = await import('../src/programs/jal.js')
  const seg = (fl, o, d, dep, cabins) => ({
    originLocation: `T1_${o}`, destinationLocation: `T1_${d}`, destinationDate: dep + 7200000,
    flightIdentifier: { marketingAirline: 'CX', flightNumber: fl, originDate: dep },
    cabins: Object.fromEntries(Object.entries(cabins).map(([k, status]) => [k, { code: k, status }])),
  })
  const data = { PAGE: { DATA: {
    context: { flow: { mode: 'REDEMPTION', partnerCode: 'CX' } },
    jlScheduleDrivenAvailability: { upsell: { bounds: [{ flights: [
      { id: 0, bookable: true, duration: 8100000, segments: [seg('451', 'TPE', 'HKG', 1794739500000, { B: '3', E: '9' })] },
      { id: 1, bookable: true, duration: 30000000, segments: [
        seg('451', 'TPE', 'HKG', 1794739500000, { B: '3', E: '9' }),
        seg('255', 'HKG', 'LHR', 1794760000000, { F: '1', B: '2', E: '0' }),
      ] },
      { id: 2, bookable: true, duration: 8100000, segments: [seg('489', 'TPE', 'HKG', 1794739500000, { E: '0' })] },
    ] }] } },
  } } }
  const html = `<script id="clientSideData" type="application/json">${JSON.stringify(data)}</script>`
  const rows = jalParsePartnerAvailability(html, '2026-11-15')
  assert.equal(rows.length, 2)
  assert.deepEqual(rows[0].cabins, { F: null, J: 3, N: null, Y: 9 })
  assert.deepEqual(rows[1].cabins, { F: null, J: 2, N: null, Y: null })
  assert.equal(rows[1].destination, 'LHR')
  assert.equal(rows[1].segs.map(s => s.flight).join('+'), 'CX451+CX255')
  const revenue = html.replace('REDEMPTION', 'REVENUE')
  assert.equal(jalParsePartnerAvailability(revenue, '2026-11-15'), 'SESSION_EXPIRED')
})

test('Aeroplan stopover: real times from flight dictionary, stay excluded from duration', async () => {
  globalThis.window ??= { fetch: async () => {} }
  const { acParseData } = await import('../src/programs/ac.js')
  const ids = ['SEG-LH425-BOSMUC-2027-07-21-2005', 'SEG-LH97-MUCFRA-2027-07-27-1000', 'SEG-NH204-FRAHND-2027-07-27-1210']
  const data = {
    airBoundGroups: [{
      boundDetails: { duration: 515100, segments: [
        { flightId: ids[0], connectionTime: 434100 }, { flightId: ids[1], connectionTime: 4200 }, { flightId: ids[2] }] },
      airBounds: [{
        availabilityDetails: ids.map(flightId => ({ flightId, cabin: 'business', quota: 2 })),
        prices: { unitPrices: [{ milesConversion: { convertedMiles: { base: 120000 } } }] },
      }],
    }],
    dictionaries: { flight: {
      [ids[0]]: { departure: { dateTime: '2027-07-21T20:05:00.000-04:00' }, arrival: { dateTime: '2027-07-22T10:10:00.000+02:00' } },
      [ids[1]]: { departure: { dateTime: '2027-07-27T10:00:00.000+02:00' }, arrival: { dateTime: '2027-07-27T11:00:00.000+02:00' } },
      [ids[2]]: { departure: { dateTime: '2027-07-27T12:10:00.000+02:00' }, arrival: { dateTime: '2027-07-28T07:40:00.000+09:00' } },
    } },
  }
  const [r] = acParseData(data, 'BOS', 'TYO', '2027-07-21', { city: 'MUC', days: 5 })
  assert.equal(r.duration, Math.round((515100 - 434100) / 60))
  assert.equal(r.segs[0].arr, '2027-07-22T10:10:00')
  assert.equal(r.segs[2].arr, '2027-07-28T07:40:00')
  assert.deepEqual([r.cabins.J, r.miles.J], [2, 120000])
  assert.deepEqual(r.stopover, { at: 'MUC', days: 5 })
  assert.match(r.bookUrl, /tripType=M&.*locationCodes0=MUC&stayDuration0=5/)
})

test('AA parser keeps available products and flags downgraded legs as mixed cabin', async () => {
  const { aaParseResults } = await import('../src/programs/aa.js')
  const leg = (mins, cabinTypes) => ({ durationInMinutes: mins, productDetails: Object.entries(cabinTypes).map(([productType, cabinType]) => ({ productType, cabinType })) })
  const seg = (flightNumber, o, d, dep, arr, legs) => ({
    flight: { carrierCode: 'AA', flightNumber }, origin: { code: o }, destination: { code: d },
    departureDateTime: dep, arrivalDateTime: arr, legs,
  })
  const [r] = aaParseResults({ slices: [{
    durationInMinutes: 1099,
    segments: [
      seg('317', 'DFW', 'CLT', '2026-11-15T07:01:00.000-06:00', '2026-11-15T10:30:00.000-05:00', [leg(149, { COACH: 'COACH', BUSINESS: 'FIRST', FIRST: 'FIRST' })]),
      seg('730', 'CLT', 'LHR', '2026-11-15T19:00:00.000-05:00', '2026-11-16T07:20:00.000+00:00', [leg(500, { COACH: 'COACH', BUSINESS: 'BUSINESS', FIRST: 'BUSINESS' })]),
    ],
    pricingDetail: [
      { productType: 'COACH', productAvailable: true, perPassengerAwardPoints: 30000, seatsRemaining: 0 },
      { productType: 'PREMIUM_ECONOMY', productAvailable: false, perPassengerAwardPoints: 0, seatsRemaining: 0 },
      { productType: 'BUSINESS', productAvailable: true, perPassengerAwardPoints: 57500, seatsRemaining: 2 },
      { productType: 'FIRST', productAvailable: true, perPassengerAwardPoints: 267500, seatsRemaining: 0 },
    ],
  }] }, 'DFW', 'LHR', '2026-11-15')
  assert.deepEqual(r.segs.map(s => s.flight), ['AA317', 'AA730'])
  assert.equal(r.segs[1].arr, '2026-11-16T07:20:00')
  assert.deepEqual(r.cabins, { F: true, J: 2, N: null, Y: true })
  assert.deepEqual(r.miles, { F: 267500, J: 57500, Y: 30000 })
  assert.deepEqual(r.mixPct, { F: 23 })
})

test('AA calendar parser keeps valid days with an award price', async () => {
  const { aaParseCalendar } = await import('../src/programs/aa.js')
  const day = (date, pts, validDay = true) => ({ date, validDay, solution: pts == null ? null : { perPassengerAwardPoints: pts } })
  const out = aaParseCalendar({ calendarMonths: [{ month: '12', weeks: [
    { days: [day(null, null, false), day('2026-12-01', 138000), day('2026-12-02', null)] },
    { days: [day('2026-12-06', 57500)] },
  ] }] })
  assert.deepEqual(out, { '2026-12-01': 138000, '2026-12-06': 57500 })
})
