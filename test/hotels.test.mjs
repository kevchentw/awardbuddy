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

test('Marriott: redemption calendar request for one hotel, parsed to one row per date', async () => {
  const { marriottBuildRequest, marriottParseCalendar } = await import('../src/programs/marriott.js')
  const body = marriottBuildRequest({ hotel: 'TPEDM', start: '2026-10-01', end: '2026-10-31' })
  assert.deepEqual(body.variables.id, ['TPEDM'])
  assert.equal(body.variables.search.propertyId, 'TPEDM')
  assert.deepEqual(body.variables.search.options.rateRequestTypes, [{ type: 'REDEMPTION' }])
  assert.equal(body.variables.search.options.startDate, '2026-10-01')
  assert.equal(body.variables.search.options.endDate, '2026-10-31')
  assert.match(body.query, /^query phoenixShopADFSearchProductsByProperty\(/)
  const node = (date, points) => ({ node: { startDate: date, endDate: date, rateModes: { pointsPerQuantity: points == null ? null : { points }, sourceOfRate: 'DSP' } } })
  const data = { data: { search: { calendarSearchByProperty: { edges: [node('2026-10-01', 134000), node('2026-10-02', null), node('2026-10-03', 118000)] } } } }
  const rows = marriottParseCalendar(data, 'TPEDM')
  assert.deepEqual(rows.map(r => [r.date, r.hotel, r.points, r.room]), [['2026-10-01', 'TPEDM', 134000, undefined], ['2026-10-03', 'TPEDM', 118000, undefined]])
  assert.match(rows[0].bookUrl, /availabilityCalendar\.mi\?propertyCode=TPEDM/)
  assert.deepEqual(marriottParseCalendar(null, 'TPEDM'), [])
})

test('Marriott: hotel code from hotel, rate list and rate calendar URLs', async () => {
  const { marriottHotelFromUrl } = await import('../src/programs/marriott.js')
  assert.equal(marriottHotelFromUrl('https://www.marriott.com/en-us/hotels/tpedm-le-meridien-taipei/overview/'), 'TPEDM')
  assert.equal(marriottHotelFromUrl('https://www.marriott.com/hotels/travel/tyomy-sheraton-miyako-hotel-tokyo/'), 'TYOMY')
  assert.equal(marriottHotelFromUrl('https://www.marriott.com/search/availabilityCalendar.mi?isRateCalendar=true&propertyCode=ukyrz&isSearch=true'), 'UKYRZ')
  assert.equal(marriottHotelFromUrl('https://www.marriott.com/reservation/rateListMenu.mi?marshaCode=TPEDM'), 'TPEDM')
  assert.equal(marriottHotelFromUrl('https://www.marriott.com/search/findHotels.mi?destinationAddress.city=Tokyo'), null)
  assert.equal(marriottHotelFromUrl('https://www.marriott.com/default.mi'), null)
})

test('Marriott: hotels on a search results page, plus the hotel page the user is on', async () => {
  const { marriottPageHotels } = await import('../src/programs/marriott.js')
  // Just enough of the DOM API for the selectors used
  const el = (attrs, children = {}) => ({
    getAttribute: k => attrs[k] ?? null,
    querySelector: sel => children[sel] ?? null,
    textContent: attrs.text,
  })
  const listCard = el({ 'data-marsha': 'TYOAK', 'data-property': JSON.stringify({ marshacode: 'TYOAK', hotelName: 'The Prince Sakura Tower Tokyo, Autograph Collection' }) })
  const mapCard = el({}, {
    'a[href*="propertyCode="]': el({ href: '/search/availabilityCalendar.mi?propertyCode=TYOMY&isSearch=true' }),
    '.HotelCard__top-section_title': el({ text: '  Sheraton Miyako\n Hotel Tokyo ' }),
  })
  const doc = {
    querySelectorAll: sel => sel.startsWith('.property-card') ? [listCard, listCard] : sel === '.HotelCardContainer' ? [mapCard] : [],
    querySelector: sel => sel === '.hotel-name' ? el({ text: 'Le Méridien Taipei' }) : null,
  }
  assert.deepEqual(marriottPageHotels(doc, 'https://www.marriott.com/search/findHotels.mi'), [
    { code: 'TYOAK', name: 'The Prince Sakura Tower Tokyo, Autograph Collection' },
    { code: 'TYOMY', name: 'Sheraton Miyako Hotel Tokyo' },
  ])
  assert.deepEqual(marriottPageHotels({ querySelectorAll: () => [], querySelector: doc.querySelector }, 'https://www.marriott.com/reservation/rateListMenu.mi?marshaCode=TPEDM'),
    [{ code: 'TPEDM', name: 'Le Méridien Taipei' }])
})
