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
  const { marriottCalendarVariables, marriottParseCalendar } = await import('../src/programs/marriott.js')
  const vars = marriottCalendarVariables({ hotel: 'TPEDM', start: '2026-10-01', end: '2026-10-31' })
  assert.deepEqual(vars.id, ['TPEDM'])
  assert.equal(vars.search.propertyId, 'TPEDM')
  assert.deepEqual(vars.search.options.rateRequestTypes, [{ type: 'REDEMPTION' }])
  assert.equal(vars.search.options.startDate, '2026-10-01')
  assert.equal(vars.search.options.endDate, '2026-10-31')
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

test('Marriott: autocomplete suggestions carry the place id for the details lookup', async () => {
  const { marriottParseSuggestions } = await import('../src/programs/marriott.js')
  const node = (placeId, primaryDescription, secondaryDescription) => ({ node: { placeId, primaryDescription, secondaryDescription, description: `${primaryDescription}, ${secondaryDescription}` } })
  const data = { data: { suggestedPlaces: { edges: [
    node('ChIJO4Ou6haLGGARdRY9-ojhl74', 'The Westin Tokyo', '1 Chome-4-1 Mita, Meguro City, Tokyo, Japan'),
    node('ChIJ8cM8zdaoAWARPR27azYdlsA', 'Kyoto', 'Japan'),
    node(null, 'No place id', ''),
  ] } } }
  assert.deepEqual(marriottParseSuggestions(data), [
    { label: 'The Westin Tokyo', sub: '1 Chome-4-1 Mita, Meguro City, Tokyo, Japan', ref: { placeId: 'ChIJO4Ou6haLGGARdRY9-ojhl74', label: 'The Westin Tokyo' } },
    { label: 'Kyoto', sub: 'Japan', ref: { placeId: 'ChIJ8cM8zdaoAWARPR27azYdlsA', label: 'Kyoto' } },
  ])
  assert.deepEqual(marriottParseSuggestions(null), [])
})

test('Marriott: nearby hotels sorted by distance; a hotel suggestion on top of a hotel is that hotel', async () => {
  const { marriottParseNearby } = await import('../src/programs/marriott.js')
  const edge = (id, name, distance) => ({ distance, node: { id, basicInformation: { name } } })
  const data = { data: { search: { properties: { searchByGeolocation: { edges: [
    edge('TYOJW', 'JW Marriott Hotel Tokyo', 973.2531),
    edge('TYOMY', 'Sheraton Miyako Hotel Tokyo', 15.375167),
    edge('TYOWI', 'The Westin Tokyo', 1373.614),
  ] } } } } }
  assert.deepEqual(marriottParseNearby(data, { destinationType: 'Hotel Name' }).exact, { code: 'TYOMY', name: 'Sheraton Miyako Hotel Tokyo' })
  assert.deepEqual(marriottParseNearby(data, { destinationType: 'City' }).nearby, [
    { code: 'TYOMY', name: 'Sheraton Miyako Hotel Tokyo', sub: '0.0 km' },
    { code: 'TYOJW', name: 'JW Marriott Hotel Tokyo', sub: '1.0 km' },
    { code: 'TYOWI', name: 'The Westin Tokyo', sub: '1.4 km' },
  ])
  // An airport (or a hotel suggestion with no hotel right there) lists what's around it
  assert.equal(marriottParseNearby(data, { destinationType: 'Airport' }).exact, undefined)
  const far = { data: { search: { properties: { searchByGeolocation: { edges: [edge('TYOJW', 'JW Marriott Hotel Tokyo', 973.2531)] } } } } }
  assert.equal(marriottParseNearby(far, { destinationType: 'Hotel Name' }).exact, undefined)
  assert.deepEqual(marriottParseNearby(null, {}), { nearby: [] })
})

test('Hilton: calendar request for one hotel, parsed to one row per date within the span', async () => {
  const { hiltonCalendarVariables, hiltonParseCalendar } = await import('../src/programs/hilton.js')
  const vars = hiltonCalendarVariables({ hotel: 'TYOCICI', start: '2026-11-02', end: '2026-11-30' })
  assert.equal(vars.ctyhocn, 'TYOCICI')
  assert.equal(vars.arrivalDate, '2026-11-02')
  assert.equal(vars.lengthOfStay, 1)
  assert.deepEqual(vars.specialRates, { hhonors: true })
  const day = (date, points, name, left) => ({ arrivalDate: date, roomRate: { dailyRmPointsRate: points, numRoomsAvail: left, ratePlan: { ratePlanName: name } } })
  // The reply covers the whole month; dates before the span start are dropped
  const data = { data: { hotel: { ctyhocn: 'TYOCICI', shopCalendarAvail: { calendars: [
    day('2026-11-01', 576000, 'Premium Room Rewards', 22),
    day('2026-11-02', 130000, 'Standard Room Reward', 22),
    day('2026-11-03', null, null, 0),
    { arrivalDate: '2026-11-04', roomRate: null },
    day('2026-11-30', 543000, 'Premium Room Rewards', 18),
  ] } } } }
  const rows = hiltonParseCalendar(data, { hotel: 'TYOCICI', start: '2026-11-02', end: '2026-11-30' })
  assert.deepEqual(rows.map(r => [r.date, r.hotel, r.points, r.room, r.roomsLeft, r.rateType]), [
    ['2026-11-02', 'TYOCICI', 130000, 'Standard Room Reward', 22, 'Standard'],
    ['2026-11-30', 'TYOCICI', 543000, 'Premium Room Rewards', 18, 'Premium'],
  ])
  assert.equal(rows[1].bookUrl, 'https://www.hilton.com/en/book/reservation/rooms/?ctyhocn=TYOCICI&arrivalDate=2026-11-30&departureDate=2026-12-01&room1NumAdults=1&redeemPts=true')
  assert.deepEqual(hiltonParseCalendar(null, { hotel: 'TYOCICI', start: '2026-11-01', end: '2026-11-30' }), [])
})

test('Hilton: hotel code from hotel and booking URLs', async () => {
  const { hiltonHotelFromUrl } = await import('../src/programs/hilton.js')
  assert.equal(hiltonHotelFromUrl('https://www.hilton.com/en/hotels/tyocici-conrad-tokyo/'), 'TYOCICI')
  assert.equal(hiltonHotelFromUrl('https://www.hilton.com/en/hotels/tyocici-conrad-tokyo/rooms/'), 'TYOCICI')
  assert.equal(hiltonHotelFromUrl('https://www.hilton.com/en/book/reservation/rooms/?ctyhocn=TYOCICI&arrivalDate=2026-11-02'), 'TYOCICI')
  assert.equal(hiltonHotelFromUrl('https://www.hilton.com/en/locations/japan/tokyo/'), null)
  assert.equal(hiltonHotelFromUrl('https://www.hilton.com/en/'), null)
})

test('Hilton: hotels on a search results page, plus the hotel page the user is on', async () => {
  const { hiltonPageHotels } = await import('../src/programs/hilton.js')
  const card = (testid, name) => ({ getAttribute: k => k === 'data-testid' ? testid : null, querySelector: sel => sel === 'h3' ? { textContent: name } : null })
  const doc = { querySelectorAll: () => [card('hotel-card-TYOHITW', ' Hilton\n Tokyo '), card('hotel-card-TYOCICI', 'Conrad Tokyo'), card('hotel-card-TYOCICI', 'Conrad Tokyo')] }
  assert.deepEqual(hiltonPageHotels(doc, 'https://www.hilton.com/en/locations/japan/tokyo/'), [
    { code: 'TYOHITW', name: 'Hilton Tokyo' },
    { code: 'TYOCICI', name: 'Conrad Tokyo' },
  ])
  assert.deepEqual(hiltonPageHotels({ querySelectorAll: () => [] }, 'https://www.hilton.com/en/hotels/tyotohi-hilton-tokyo-odaiba/'), [{ code: 'TYOTOHI' }])
})

test('Hilton: autocomplete hotels carry their code; other places are looked up by id and text', async () => {
  const { hiltonParseSuggestions } = await import('../src/programs/hilton.js')
  const p = (place_id, type, main_text, secondary_text, description) => ({ place_id, type, description, structured_formatting: { main_text, secondary_text } })
  const data = { status: 'OK', predictions: [
    p('dx-hotel::tyocici', 'property', 'Conrad Tokyo', 'Tokyo, Japan', 'Conrad Tokyo, Tokyo, Japan'),
    p(null, 'geocode', 'Tokyo', 'Japan', 'Tokyo, Japan'),
    p('dx-airport::5627', 'airport', 'Haneda Airport', 'Tokyo, Japan', 'Haneda Airport, Tokyo, Japan'),
    p('dx-poi::x', 'pointOfInterest', '', '', ''),
  ] }
  assert.deepEqual(hiltonParseSuggestions(data), [
    { label: 'Conrad Tokyo', sub: 'Tokyo, Japan', ref: { code: 'TYOCICI', label: 'Conrad Tokyo' } },
    { label: 'Tokyo', sub: 'Japan', ref: { placeId: null, address: 'Tokyo, Japan', label: 'Tokyo' } },
    { label: 'Haneda Airport', sub: 'Airport · Tokyo, Japan', ref: { placeId: 'dx-airport::5627', address: 'Haneda Airport, Tokyo, Japan', label: 'Haneda Airport' } },
  ])
  assert.deepEqual(hiltonParseSuggestions(null), [])
})

test('Hilton: a hotel suggestion is that hotel; other places list nearby hotels by distance', async () => {
  const { hiltonProgram, hiltonParseNearby } = await import('../src/programs/hilton.js')
  assert.deepEqual(await hiltonProgram.hotelsAt({ code: 'TYOCICI', label: 'Conrad Tokyo' }), { exact: { code: 'TYOCICI', name: 'Conrad Tokyo' }, nearby: [] })
  const h = (ctyhocn, name, distance) => ({ ctyhocn, name, distance })
  const data = { data: { geocode: { match: { id: 'dx-airport::5627', type: 'airport' }, hotelSummaryOptions: { hotels: [
    h('TYOARDI', 'DoubleTree by Hilton Tokyo Ariake', 9.441334),
    h('TYOTOHI', 'Hilton Tokyo Odaiba', 8.630218),
    h(null, 'No code', 1),
  ] } } } }
  assert.deepEqual(hiltonParseNearby(data), { nearby: [
    { code: 'TYOTOHI', name: 'Hilton Tokyo Odaiba', sub: '8.6 km' },
    { code: 'TYOARDI', name: 'DoubleTree by Hilton Tokyo Ariake', sub: '9.4 km' },
  ] })
  assert.deepEqual(hiltonParseNearby(null), { nearby: [] })
})

test('Hyatt: calendar URL and one row per date and room type, within the span', async () => {
  const { hyattCalendarUrl, hyattParseCalendar } = await import('../src/programs/hyatt.js')
  assert.equal(hyattCalendarUrl({ hotel: 'TYOPH', start: '2026-11-02', end: '2026-11-30' }),
    '/explore-hotels/service/avail/days?spiritCode=tyoph&startDate=2026-11-02&endDate=2026-11-30&numAdults=1&numChildren=0&roomQuantity=1&los=1&isMock=false')
  const data = { days: {
    '2026-11-03': { STANDARD_ROOM: { pointsValue: [55000], pointsLevel: 'STANDARD', rate: null }, PREMIUM_SUITE: { pointsValue: [110000], pointsLevel: 'STANDARD' } },
    '2026-11-02': { STANDARD_ROOM: { pointsValue: [45000], pointsLevel: 'OFF_PEAK', rate: null } },
    '2026-11-04': {},
    '2026-11-05': null,
    '2026-11-06': { CLUB: { pointsValue: [], pointsLevel: 'PEAK' }, NEW_TYPE: { pointsValue: [70000] } },
    '2026-12-01': { STANDARD_ROOM: { pointsValue: [45000], pointsLevel: 'OFF_PEAK' } },
  } }
  const rows = hyattParseCalendar(data, { hotel: 'TYOPH', start: '2026-11-02', end: '2026-11-30' })
  assert.deepEqual(rows.map(r => [r.date, r.hotel, r.points, r.room]), [
    ['2026-11-02', 'TYOPH', 45000, 'Standard Room · Off-peak'],
    ['2026-11-03', 'TYOPH', 55000, 'Standard Room · Standard'],
    ['2026-11-03', 'TYOPH', 110000, 'Premium Suite · Standard'],
    ['2026-11-06', 'TYOPH', 70000, 'NEW_TYPE'],
  ])
  assert.equal(rows[0].bookUrl, 'https://www.hyatt.com/shop/rooms/TYOPH?checkinDate=2026-11-02&checkoutDate=2026-11-03&rooms=1&adults=1&kids=0&rateFilter=woh')
  assert.deepEqual(hyattParseCalendar({ days: {}, responseInfo: {} }, { hotel: 'ZZZZZ', start: '2026-11-01', end: '2026-11-30' }), [])
  assert.deepEqual(hyattParseCalendar(null, { hotel: 'TYOPH', start: '2026-11-01', end: '2026-11-30' }), [])
})

test('Hyatt: hotel code from hotel, booking and explore URLs', async () => {
  const { hyattHotelFromUrl } = await import('../src/programs/hyatt.js')
  assert.equal(hyattHotelFromUrl('https://www.hyatt.com/park-hyatt/en-US/tyoph-park-hyatt-tokyo'), 'TYOPH')
  assert.equal(hyattHotelFromUrl('https://www.hyatt.com/park-hyatt/en-US/tyoph-park-hyatt-tokyo/rooms'), 'TYOPH')
  assert.equal(hyattHotelFromUrl('https://www.hyatt.com/mr-and-mrs-smith/m0296-zaborin'), 'M0296')
  assert.equal(hyattHotelFromUrl('https://www.hyatt.com/shop/rooms/tyoph?checkinDate=2026-11-02'), 'TYOPH')
  assert.equal(hyattHotelFromUrl('https://www.hyatt.com/explore-hotels/rate-calendar?spiritCode=tyoph'), 'TYOPH')
  assert.equal(hyattHotelFromUrl('https://www.hyatt.com/search/hotels/en-US/Tokyo%2C%20Japan'), null)
  assert.equal(hyattHotelFromUrl('https://www.hyatt.com/loyalty/en-US'), null)
})

test('Hyatt: hotels on a search results page, plus the hotel page the user is on', async () => {
  const { hyattPageHotels } = await import('../src/programs/hyatt.js')
  const card = (code, name) => ({ getAttribute: k => k === 'data-spirit-code' ? code : null,
    querySelector: sel => sel === `[id="map-result-card-title-${code}"]` ? { textContent: name } : null })
  const doc = { querySelectorAll: () => [card('tyoph', ' Park Hyatt\n Tokyo '), card('tyogh', 'Grand Hyatt Tokyo'), card('tyogh', 'Grand Hyatt Tokyo')] }
  assert.deepEqual(hyattPageHotels(doc, 'https://www.hyatt.com/search/hotels/en-US/Tokyo%2C%20Japan'), [
    { code: 'TYOPH', name: 'Park Hyatt Tokyo' },
    { code: 'TYOGH', name: 'Grand Hyatt Tokyo' },
  ])
  assert.deepEqual(hyattPageHotels({ querySelectorAll: () => [] }, 'https://www.hyatt.com/andaz/en-US/tyoaz-andaz-tokyo-toranomon-hills'), [{ code: 'TYOAZ' }])
})

test('Hyatt: autocomplete hotels carry their code; cities and places are found by label', async () => {
  const { hyattParseSuggestions } = await import('../src/programs/hyatt.js')
  const data = {
    properties: [{ label: 'Park Hyatt Tokyo', spiritCode: 'tyoph', location: { lat: 35.68, lon: 139.69 } }, { label: 'No code' }],
    cities: [{ label: 'Tokyo, Japan', city: 'Tokyo', province: null, country: 'Japan' }],
    provinces: [], countries: [],
    suggestions: [{ label: 'Narita International Airport', types: ['airport'] }, { label: 'Tokyo Tower', types: ['point_of_interest'] }],
  }
  assert.deepEqual(hyattParseSuggestions(data), [
    { label: 'Tokyo', sub: 'Japan', ref: { place: 'Tokyo, Japan', label: 'Tokyo, Japan' } },
    { label: 'Narita International Airport', sub: 'Airport', ref: { place: 'Narita International Airport', label: 'Narita International Airport' } },
    { label: 'Tokyo Tower', sub: undefined, ref: { place: 'Tokyo Tower', label: 'Tokyo Tower' } },
    { label: 'Park Hyatt Tokyo', sub: 'TYOPH', ref: { code: 'TYOPH', label: 'Park Hyatt Tokyo' } },
  ])
  assert.deepEqual(hyattParseSuggestions(null), [])
})

test('Hyatt: a place is geocoded by the search page; nearby bookable hotels come from the directory', async () => {
  const { hyattProgram, hyattParseCenter, hyattNearby } = await import('../src/programs/hyatt.js')
  assert.deepEqual(await hyattProgram.hotelsAt({ code: 'TYOPH', label: 'Park Hyatt Tokyo' }), { exact: { code: 'TYOPH', name: 'Park Hyatt Tokyo' }, nearby: [] })
  const html = 'self.__next_f.push([1,"14:[\\"$\\",\\"$L1f\\",null,{\\"hotelData\\":{\\"centerPoint\\":{\\"id\\":\\"ChIJ\\",\\"latitude\\":35.7719867,\\"longitude\\":140.3928501,\\"name\\":\\"Narita International Airport\\"}}}'
  const center = hyattParseCenter(html)
  assert.deepEqual(center, { lat: 35.7719867, lon: 140.3928501 })
  assert.equal(hyattParseCenter('<html></html>'), null)
  const h = (spiritCode, name, latitude, longitude, extra = {}) => ({ spiritCode, name, awardCategory: { label: '4' }, location: { geolocation: { latitude, longitude } }, openStatus: { key: 'FULLY_BOOKABLE' }, booking: { isExternal: false }, ...extra })
  const dir = {
    tyoph: h('tyoph', 'Park Hyatt Tokyo', 35.68564, 139.690808),
    nrtzt: h('nrtzt', 'Hyatt Regency Tokyo Bay', 35.6668, 140.0127),
    nycph: h('nycph', 'Park Hyatt New York', 40.765, -73.979),
    tyoxx: h('tyoxx', 'Closed', 35.77, 140.39, { openStatus: { key: 'NOT_BOOKABLE' } }),
    tyoex: h('tyoex', 'External', 35.77, 140.39, { booking: { isExternal: true } }),
    nogeo: { spiritCode: 'nogeo', name: 'No location', location: {} },
  }
  assert.deepEqual(hyattNearby(dir, center), [
    { code: 'NRTZT', name: 'Hyatt Regency Tokyo Bay', sub: '36.3 km · Category 4' },
    { code: 'TYOPH', name: 'Park Hyatt Tokyo', sub: '64.1 km · Category 4' },
  ])
  assert.deepEqual(hyattNearby(null, center), [])
})
