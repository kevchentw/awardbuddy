// Run: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { monthSpans } from '../src/common/search.js'
import { lowestByDate, cheapestOnly, parseHotelCodes } from '../src/common/hotels.js'

test('monthSpans gives one span per month, clipped to minDate', () => {
  assert.deepEqual(monthSpans('2026-09', '2026-11', '2026-09-27'), [
    { start: '2026-09-27', end: '2026-09-30' },
    { start: '2026-10-01', end: '2026-10-31' },
    { start: '2026-11-01', end: '2026-11-30' },
  ])
  assert.deepEqual(monthSpans('2027-12', '2028-02', '2026-01-01').map(s => s.end), ['2027-12-31', '2028-01-31', '2028-02-29'])
  assert.deepEqual(monthSpans('2026-08', '2026-08', '2026-09-01'), [])
})

test('parseHotelCodes uppercases, splits on commas/spaces and dedupes', () => {
  assert.deepEqual(parseHotelCodes('tpekm, TYOIC tpekm,,'), ['TPEKM', 'TYOIC'])
  assert.deepEqual(parseHotelCodes(''), [])
})

test('lowestByDate and cheapestOnly keep the lowest rate per hotel and date', () => {
  const r = (hotel, date, points, room) => ({ hotel, date, points, room })
  const results = [r('A', '2026-10-01', 40000, 'King'), r('A', '2026-10-01', 30000, 'Twin'), r('B', '2026-10-01', 50000), r('A', '2026-10-02', 45000)]
  assert.deepEqual(lowestByDate(results), { '2026-10-01': { A: 30000, B: 50000 }, '2026-10-02': { A: 45000 } })
  assert.deepEqual(cheapestOnly(results).map(x => `${x.hotel} ${x.date} ${x.points}`),
    ['A 2026-10-01 30000', 'B 2026-10-01 50000', 'A 2026-10-02 45000'])
})

test('IHG: parses reward offers only, one row per room type', async () => {
  const { ihgParseCalendar, ihgBuildRequest } = await import('../src/programs/ihg.js')
  const body = ihgBuildRequest({ hotel: 'TPEKM', start: '2026-10-01', end: '2026-10-31' })
  assert.deepEqual(body.hotelMnemonics, ['TPEKM'])
  assert.equal(body.lengthOfStay, 1)
  const data = { data: { hotels: [{ hotel: { hotelMnemonic: 'TPEKM' }, calendar: [{ start: '2026-10-01', offers: [
    { ratePlanCode: 'IVANI', inventoryTypesAvailable: [{ inventoryTypeCode: 'CSPG', numberOfAvailableProducts: 9 }], checkInPoints: 61000, totalPoints: 61000 },
    { ratePlanCode: 'IVANI', inventoryTypesAvailable: [{ inventoryTypeCode: 'KDXN', numberOfAvailableProducts: 2 }], checkInPoints: 74000, totalPoints: 74000 },
    { ratePlanCode: 'IGCOR', inventoryTypesAvailable: [{ inventoryTypeCode: 'CSPG', numberOfAvailableProducts: 9 }], totalAmount: '10125' },
  ] }] }] } }
  const rows = ihgParseCalendar(data)
  assert.deepEqual(rows.map(r => [r.date, r.hotel, r.points, r.room, r.roomsLeft]), [
    ['2026-10-01', 'TPEKM', 61000, 'Double Superior', 9],
    ['2026-10-01', 'TPEKM', 74000, 'King Deluxe', 2],
  ])
  assert.equal(rows[0].bookUrl, undefined)  // IHG's room page can't be deep-linked
})

test('IHG: hotel code from hotel page URLs', async () => {
  const { ihgHotelFromUrl } = await import('../src/programs/ihg.js')
  assert.equal(ihgHotelFromUrl('https://www.ihg.com/holidayinnexpress/hotels/us/en/taipei/tpekm/hoteldetail'), 'TPEKM')
  assert.equal(ihgHotelFromUrl('https://www.ihg.com/intercontinental/hotels/us/en/tokyo/tyoic/hoteldetail/rooms'), 'TYOIC')
  assert.equal(ihgHotelFromUrl('https://www.ihg.com/hotels/us/en/find-hotels/hotel/rooms?qDest=TPEKM&qCiD=2026-10-01'), 'TPEKM')
  assert.equal(ihgHotelFromUrl('https://www.ihg.com/hotels/us/en/find-hotels/hotel-search?qDest=Taipei'), null)
  assert.equal(ihgHotelFromUrl('https://www.ihg.com/hotels/us/en/reservation'), null)
})

test('IHG: autocomplete keeps entries with coordinates and marks airports', async () => {
  const { ihgParseDestinations } = await import('../src/programs/ihg.js')
  const s = ihgParseDestinations([
    { clarifiedLocation: 'Taipei, Taiwan', type: 'B', latitude: 25.05, longitude: 121.53 },
    { clarifiedLocation: 'TPE - Taipei Shek Airport, Taiwan', type: 'A', latitude: 25.08, longitude: 121.23 },
    { clarifiedLocation: 'No coordinates', type: 'B' },
  ])
  assert.deepEqual(s.map(x => [x.label, x.sub, x.ref.airport]), [['Taipei, Taiwan', undefined, false], ['TPE - Taipei Shek Airport, Taiwan', 'Airport', true]])
  assert.deepEqual(ihgParseDestinations(null), [])
})

test('IHG: nearby hotels sorted by distance; a suggestion on top of a hotel is that hotel', async () => {
  const { ihgParseNearby } = await import('../src/programs/ihg.js')
  const data = { hotels: [
    { hotelMnemonic: 'TPETT', distanceKm: 2.04, availabilityStatus: 'OPEN' },
    { hotelMnemonic: 'TPERG', distanceKm: 1.54, availabilityStatus: 'OPEN' },
    { hotelMnemonic: 'TPETC', distanceKm: 4.28, availabilityStatus: 'CLOSED' },
  ] }
  assert.deepEqual(ihgParseNearby(data, { label: 'Taipei, Taiwan' }).nearby,
    [{ code: 'TPERG', sub: '1.5 km' }, { code: 'TPETT', sub: '2.0 km' }, { code: 'TPETC', sub: '4.3 km · closed' }])
  const onHotel = { hotels: [{ hotelMnemonic: 'TPEKM', distanceKm: 0 }, ...data.hotels] }
  assert.deepEqual(ihgParseNearby(onHotel, { label: 'Kimpton Da An Hotel' }).exact, { code: 'TPEKM' })
  assert.equal(ihgParseNearby(onHotel, { label: 'TPE airport', airport: true }).exact, undefined)
})
