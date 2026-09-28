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
  assert.deepEqual(rows.map(r => [r.date, r.hotel, r.points, r.room, r.roomType]), [
    ['2026-11-02', 'TYOPH', 45000, 'Standard Room · Off-peak', 'Standard Room'],
    ['2026-11-03', 'TYOPH', 55000, 'Standard Room · Standard', 'Standard Room'],
    ['2026-11-03', 'TYOPH', 110000, 'Premium Suite · Standard', 'Premium Suite'],
    ['2026-11-06', 'TYOPH', 70000, 'NEW_TYPE', 'NEW_TYPE'],
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

test('Choice: calendar variables and one row per bookable night, within the span', async () => {
  const { choiceCalendarVariables, choiceParseCalendar } = await import('../src/programs/choice.js')
  assert.deepEqual(choiceCalendarVariables({ hotel: 'JP056', start: '2026-11-02', end: '2026-11-30' }), {
    hotelCode: 'JP056', startDate: '2026-11-02', endDate: '2026-11-30', adults: 1, minors: 0, ratePlanCodes: ['SRD'], currencyCode: 'HOTEL_DEFAULT_CURRENCY',
  })
  const rate = (startDate, points, availableForSale = true) => ({ startDate, points, availableForSale })
  const data = { data: { getHotelAvailabilityCalendarRates: { calendarRates: [
    rate('2026-11-03', 20000), rate('2026-11-02', 16000), rate('2026-11-04', 0, false), rate('2026-11-05', 0), null, rate('2026-12-01', 20000),
  ] } } }
  const rows = choiceParseCalendar(data, { hotel: 'JP056', start: '2026-11-02', end: '2026-11-30' })
  assert.deepEqual(rows.map(r => [r.date, r.hotel, r.points]), [['2026-11-02', 'JP056', 16000], ['2026-11-03', 'JP056', 20000]])
  assert.equal(rows[0].bookUrl, 'https://www.choicehotels.com/hotel/jp056?checkInDate=2026-11-02&checkOutDate=2026-11-03&ratePlanCode=SRD')
  // An unknown code is a 400 with NONEXISTENT_HOTEL_INFO and no data
  assert.deepEqual(choiceParseCalendar({ errors: [{ message: 'INVALID_ARGUMENT: {"NONEXISTENT_HOTEL_INFO":"The hotel id is invalid."}' }], data: { getHotelAvailabilityCalendarRates: null } },
    { hotel: 'ZZ999', start: '2026-11-01', end: '2026-11-30' }), [])
  assert.deepEqual(choiceParseCalendar(null, { hotel: 'JP056', start: '2026-11-01', end: '2026-11-30' }), [])
})

test('Choice: hotel code from hotel page URLs', async () => {
  const { choiceHotelFromUrl } = await import('../src/programs/choice.js')
  assert.equal(choiceHotelFromUrl('https://www.choicehotels.com/japan/tokyo/comfort-inn-hotels/jp056?checkInDate=2026-11-02'), 'JP056')
  assert.equal(choiceHotelFromUrl('https://www.choicehotels.com/california/anaheim/quality-inn-hotels/cah59'), 'CAH59')
  assert.equal(choiceHotelFromUrl('https://www.choicehotels.com/hotel/jp056'), 'JP056')
  assert.equal(choiceHotelFromUrl('https://www.choicehotels.com/japan/narita/narita-airport-nrt-hotels?placeId=ChIJ'), null)
  assert.equal(choiceHotelFromUrl('https://www.choicehotels.com/'), null)
})

test('Choice: hotels on a search results page, plus the hotel page the user is on', async () => {
  const { choicePageHotels } = await import('../src/programs/choice.js')
  const h2 = (code, name) => ({ id: `search-page-list-card-property-name_${code}`, textContent: name })
  const doc = { querySelectorAll: () => [h2('JP120', ' Comfort Inn\n Chiba Hamano '), h2('JP026', 'Comfort Hotel Narita'), h2('JP026', 'Comfort Hotel Narita'), h2('bad', 'x')] }
  assert.deepEqual(choicePageHotels(doc, 'https://www.choicehotels.com/japan/narita/narita-airport-nrt-hotels'), [
    { code: 'JP120', name: 'Comfort Inn Chiba Hamano' },
    { code: 'JP026', name: 'Comfort Hotel Narita' },
  ])
  assert.deepEqual(choicePageHotels({ querySelectorAll: () => [] }, 'https://www.choicehotels.com/japan/tokyo/comfort-inn-hotels/jp056'), [{ code: 'JP056' }])
})

test('Choice: autocomplete places, and the hotels around one (exact when it sits on a hotel)', async () => {
  const { choiceParseSuggestions, choiceNearby } = await import('../src/programs/choice.js')
  assert.deepEqual(choiceParseSuggestions({ data: { searchPoisByTerm: [
    { placeId: 'ChIJVze', placeType: 'Airport', displayName: 'Narita Airport (NRT), 1-1 Furugome, Narita, Chiba, Japan' },
    { placeId: 'ChIJ51c', placeType: 'CountrySubdivision', displayName: 'Tokyo, Japan' },
    { placeId: null, displayName: 'No id' },
  ] } }), [
    { label: 'Narita Airport (NRT)', sub: 'Airport · 1-1 Furugome, Narita, Chiba, Japan', ref: { placeId: 'ChIJVze', label: 'Narita Airport (NRT), 1-1 Furugome, Narita, Chiba, Japan' } },
    { label: 'Tokyo', sub: 'Japan', ref: { placeId: 'ChIJ51c', label: 'Tokyo, Japan' } },
  ])
  assert.deepEqual(choiceParseSuggestions(null), [])
  const h = (code, name, latitude, longitude, status = 'ACTIVE') => ({ code, details: { name, status, geoLocation: { latitude, longitude } } })
  const hotels = [
    h('JP083', 'Comfort Hotel ERA Tokyo Higashi Kanda', 35.69454, 139.779826),
    h('JP056', 'Comfort Hotel Tokyo Kanda', 35.693547, 139.774469),
    h('JP999', 'Closed', 35.6936, 139.7744, 'INACTIVE'),
    { code: 'JP000', details: { name: 'No location' } },
  ]
  const kanda = { placeType: 'Resort', latitude: 35.6935692, longitude: 139.7743707 }
  assert.deepEqual(choiceNearby(hotels, kanda), { exact: { code: 'JP056', name: 'Comfort Hotel Tokyo Kanda' }, nearby: [] })
  assert.deepEqual(choiceNearby(hotels, { ...kanda, placeType: 'Airport' }), { nearby: [
    { code: 'JP056', name: 'Comfort Hotel Tokyo Kanda', sub: '0.0 km' },
    { code: 'JP083', name: 'Comfort Hotel ERA Tokyo Higashi Kanda', sub: '0.5 km' },
  ] })
  assert.deepEqual(choiceNearby(null, kanda), { nearby: [] })
})

test('I Prefer: calendar URL and one row per bookable night, within the span', async () => {
  const { ipreferCalendarUrl, ipreferParseCalendar } = await import('../src/programs/iprefer.js')
  assert.equal(ipreferCalendarUrl('PARHD'), 'https://ptgapis.com/rate-calendar/v2?propertyCode=PARHD&adults=1&children=0&rateCode=IPPOINTS')
  const night = (points, more) => ({ is_available: true, has_inventory: true, allows_check_in: true, allows_check_out: true, rate: 0, tax: 0, points, ...more })
  const data = { currency_code: 'USD', count: 6, results: {
    '2026-11-03': night(100000), '2026-11-02': night(75000), '2026-11-04': night(100000, { has_inventory: false }),
    '2026-11-05': night(0), '2026-11-06': night(100000, { allows_check_in: false }), '2026-12-01': night(100000),
  } }
  const span = { hotel: 'PARHD', start: '2026-11-02', end: '2026-11-30' }
  const rows = ipreferParseCalendar(data, span, '/hotels/france/lhotel-du-collectionneur-paris')
  assert.deepEqual(rows.map(r => [r.date, r.hotel, r.points]), [['2026-11-02', 'PARHD', 75000], ['2026-11-03', 'PARHD', 100000]])
  assert.equal(rows[0].bookUrl, 'https://iprefer.com/hotels/france/lhotel-du-collectionneur-paris?arrivalDate=2026-11-02&departureDate=2026-11-03&rateType=RN')
  assert.equal(ipreferParseCalendar(data, span)[0].bookUrl, undefined)
  // No reward nights (or an unknown code) comes back as results: []
  assert.deepEqual(ipreferParseCalendar({ currency_code: 'USD', count: 0, results: [] }, span), [])
  assert.deepEqual(ipreferParseCalendar(null, span), [])
})

const ipreferDirectoryData = { success: true, count: 5, properties: {
  843: { field_item_code: 'PARHD', field_display_title: 'L’Hôtel du Collectionneur Paris', field_address: { locality: 'Paris' }, field_geolocation: { lat: '48.876981', lng: '2.306973' }, field_state_name: null, field_country_name: 'France', field_i_prefer_book_with_points: '1', entity_url: '/hotels/france/lhotel-du-collectionneur-paris', field_synxis_id: '58345', participates_in_choice_points: '1', choice_points_value: '60000' },
  900: { field_item_code: 'PARNA', field_display_title: 'Hotel Napoleon', field_address: { locality: 'Paris' }, field_geolocation: { lat: '48.874', lng: '2.296' }, field_country_name: 'France', field_i_prefer_book_with_points: '1', entity_url: '/hotels/france/hotel-napoleon' },
  901: { field_item_code: 'CDGVE', field_display_title: 'Versailles Palace', field_address: { locality: 'Versailles' }, field_geolocation: { lat: '48.8049', lng: '2.1204' }, field_country_name: 'France', field_i_prefer_book_with_points: '1' },
  902: { field_item_code: 'PARXX', field_display_title: 'Cash Only Paris', field_address: { locality: 'Paris' }, field_geolocation: { lat: '48.87', lng: '2.30' }, field_country_name: 'France', field_i_prefer_book_with_points: '0', field_synxis_id: '1', participates_in_choice_points: '1', choice_points_value: '45000' },
  903: { field_item_code: 'BILNH', field_display_title: 'Northern Hotel', field_address: { locality: 'Billings' }, field_geolocation: { lat: '45.78', lng: '-108.50' }, field_state_name: 'Montana', field_country_name: 'United States', field_i_prefer_book_with_points: '1' },
  904: { field_item_code: 'bad!', field_display_title: 'Broken' },
} }

test('I Prefer: directory, and text search over points-bookable hotels, cities, states and countries', async () => {
  const { ipreferParseDirectory, ipreferSuggest } = await import('../src/programs/iprefer.js')
  const dir = ipreferParseDirectory(ipreferDirectoryData)
  assert.deepEqual(dir.map(h => h.code), ['PARHD', 'PARNA', 'CDGVE', 'PARXX', 'BILNH'])
  assert.deepEqual(dir[0], { code: 'PARHD', name: 'L’Hôtel du Collectionneur Paris', city: 'Paris', state: undefined, country: 'France', lat: 48.876981, lng: 2.306973, path: '/hotels/france/lhotel-du-collectionneur-paris', points: true, synxisId: '58345', choicePoints: 60000 })
  assert.deepEqual(ipreferSuggest(dir, 'par'), [
    { label: 'Paris', sub: 'France', ref: { city: 'Paris', country: 'France', label: 'Paris' } },
    { label: 'L’Hôtel du Collectionneur Paris', sub: 'Paris, France', ref: { code: 'PARHD', label: 'L’Hôtel du Collectionneur Paris' } },
  ])
  // Accents and punctuation don't matter; matches start at a word
  assert.deepEqual(ipreferSuggest(dir, 'hotel du').map(s => s.ref.code), ['PARHD'])
  assert.deepEqual(ipreferSuggest(dir, 'aris'), [])
  assert.deepEqual(ipreferSuggest(dir, 'montana'), [{ label: 'Montana', sub: 'United States', ref: { state: 'Montana', label: 'Montana' } }])
  assert.deepEqual(ipreferSuggest(dir, 'fra').map(s => s.label), ['France'])
  assert.deepEqual(ipreferSuggest(dir, 'bilnh').map(s => s.ref.code), ['BILNH'])
  assert.deepEqual(ipreferSuggest(dir, '  '), [])
})

test('I Prefer: a hotel suggestion is that hotel; a city lists hotels around it, a country its hotels by name', async () => {
  const { ipreferParseDirectory, ipreferHotelsAt } = await import('../src/programs/iprefer.js')
  const dir = ipreferParseDirectory(ipreferDirectoryData)
  assert.deepEqual(ipreferHotelsAt(null, { code: 'PARHD', label: 'L’Hôtel' }), { exact: { code: 'PARHD', name: 'L’Hôtel' }, nearby: [] })
  const paris = ipreferHotelsAt(dir, { city: 'Paris', country: 'France', label: 'Paris' })
  assert.deepEqual(paris.nearby.map(h => h.code), ['PARHD', 'PARNA', 'CDGVE'])
  assert.match(paris.nearby[2].sub, /^Versailles · \d+\.\d km$/)
  assert.deepEqual(ipreferHotelsAt(dir, { country: 'France', label: 'France' }).nearby.map(h => [h.code, h.sub]),
    [['PARNA', 'Paris'], ['PARHD', 'Paris'], ['CDGVE', 'Versailles']])
  assert.deepEqual(ipreferHotelsAt(dir, { state: 'Montana', label: 'Montana' }).nearby.map(h => h.code), ['BILNH'])
  assert.deepEqual(ipreferHotelsAt(dir, { city: 'Nowhere', country: 'France' }), { nearby: [] })
})

test('I Prefer: hotel code from a hotel page, and hotels on a search results page matched by name', async () => {
  const { ipreferHotelFromPage, ipreferPageHotels, ipreferParseDirectory } = await import('../src/programs/iprefer.js')
  const html = String.raw`self.__next_f.push([1,"{\"similar\":{\"title\":\"PARNA - Hotel Napoleon\",\"entityUrl\":{\"path\":\"/hotels/france/hotel-napoleon\"}},\"property\":{\"nid\":843,\"title\":\"PARHD - L’Hotel du Collectionneur Paris\",\"entityUrl\":{\"path\":\"/hotels/france/lhotel-du-collectionneur-paris\",\"__typename\":\"EntityCanonicalUrl\"}}"])`
  assert.equal(ipreferHotelFromPage(html, 'https://iprefer.com/hotels/france/lhotel-du-collectionneur-paris?arrivalDate=2026-11-10'), 'PARHD')
  assert.equal(ipreferHotelFromPage(html, 'https://iprefer.com/hotels/france/hotel-napoleon/'), 'PARNA')
  assert.equal(ipreferHotelFromPage(html, 'https://iprefer.com/hotels/france/other-hotel'), null)
  assert.equal(ipreferHotelFromPage(html, 'https://iprefer.com/search?rateType=IPPOINTS'), null)
  const dir = ipreferParseDirectory(ipreferDirectoryData)
  const el = textContent => ({ textContent })
  const doc = { querySelectorAll: () => [el('Hotel\n  Napoleon'), el("L'Hotel du Collectionneur Paris"), el('Hotel Napoleon'), el('Not in directory')] }
  assert.deepEqual(ipreferPageHotels(doc, dir, null), [
    { code: 'PARNA', name: 'Hotel Napoleon' },
    { code: 'PARHD', name: 'L’Hôtel du Collectionneur Paris' },
  ])
  assert.deepEqual(ipreferPageHotels({ querySelectorAll: () => [] }, dir, 'BILNH'), [{ code: 'BILNH' }])
})

test('I Prefer, Choice points mode: calendar URL, one row per bookable night at the flat Choice rate', async () => {
  const { preferredChoiceCalendarUrl, preferredChoiceParseCalendar } = await import('../src/programs/preferred-choice.js')
  assert.equal(preferredChoiceCalendarUrl('MLAIH'), 'https://ptgapis.com/rate-calendar/v2?propertyCode=MLAIH&program=CH&adults=1&children=0')
  const night = (more) => ({ is_available: true, has_inventory: true, allows_check_in: true, allows_check_out: true, rate: 768, tax: 53, fees: 0, points: 0, ...more })
  const data = { currency_code: 'USD', count: 5, results: {
    '2026-11-03': night({ tax: 52.6, fees: 4 }), '2026-11-02': night(), '2026-11-04': night({ is_available: false }),
    '2026-11-05': night({ has_inventory: false }), '2026-11-06': night({ tax: 0 }), '2026-12-01': night(),
  } }
  const span = { hotel: 'MLAIH', start: '2026-11-02', end: '2026-11-30' }
  const info = { code: 'MLAIH', synxisId: '26919', choicePoints: 55000 }
  const rows = preferredChoiceParseCalendar(data, span, info)
  assert.deepEqual(rows.map(r => [r.date, r.hotel, r.points, r.room]), [
    ['2026-11-02', 'MLAIH', 55000, '+ $53 taxes & fees'],
    ['2026-11-03', 'MLAIH', 55000, '+ $57 taxes & fees'],
    ['2026-11-06', 'MLAIH', 55000, undefined],
  ])
  assert.equal(rows[0].bookUrl, 'https://preferredhotels.com/choicepoints/book/hotel/26919')
  assert.equal(preferredChoiceParseCalendar({ ...data, currency_code: 'EUR' }, span, info)[0].room, '+ 53 EUR taxes & fees')
  // A hotel that doesn't take Choice points, no nights, or no answer: nothing
  assert.deepEqual(preferredChoiceParseCalendar(data, span, { code: 'MLAIH' }), [])
  assert.deepEqual(preferredChoiceParseCalendar(data, span, undefined), [])
  assert.deepEqual(preferredChoiceParseCalendar({ currency_code: 'USD', count: 0, results: [] }, span, info), [])
})

test('I Prefer, Choice points mode: search and lists keep hotels that take Choice points', async () => {
  const { ipreferParseDirectory, ipreferSuggest, ipreferHotelsAt } = await import('../src/programs/iprefer.js')
  const dir = ipreferParseDirectory(ipreferDirectoryData)
  const choice = h => h.choicePoints > 0
  assert.deepEqual(dir.filter(choice).map(h => [h.code, h.choicePoints]), [['PARHD', 60000], ['PARXX', 45000]])
  // PARXX isn't bookable with I Prefer points but takes Choice points
  assert.deepEqual(ipreferSuggest(dir, 'cash only').map(s => s.ref.code), [])
  assert.deepEqual(ipreferSuggest(dir, 'cash only', choice).map(s => s.ref.code), ['PARXX'])
  assert.deepEqual(ipreferHotelsAt(dir, { city: 'Paris', country: 'France' }, choice).nearby.map(h => h.code).sort(), ['PARHD', 'PARXX'])
})

test('I Prefer: on iprefer.com and preferredhotels.com, an I Prefer points mode and a Choice points mode', async () => {
  const { ipreferProgram } = await import('../src/programs/preferred.js')
  const { choiceProgram } = await import('../src/programs/choice.js')
  assert.ok(['iprefer.com', 'preferredhotels.com'].every(ipreferProgram.matchHost))
  assert.ok(!ipreferProgram.matchHost('www.choicehotels.com'))
  assert.equal(choiceProgram.modes, undefined)
  assert.deepEqual(ipreferProgram.modes.map(m => [m.code, m.program.id]), [['iprefer', 'iprefer'], ['choice', 'choice-preferred']])
  assert.ok(ipreferProgram.modes.every(m => typeof m.program.pageHotels === 'function' && typeof m.program.currentHotel === 'function'))
  // The Choice points mode is picked on the Choice portal
  globalThis.location = { pathname: '/choicepoints/search' }
  assert.equal(ipreferProgram.pageMode(), 'choice')
  globalThis.location = { pathname: '/hotels/france/hotel-napoleon' }
  assert.equal(ipreferProgram.pageMode(), null)
  delete globalThis.location
})

test('I Prefer: search cards plus the hotel or booking page the user is on, per mode', async () => {
  const { preferredSynxisFromUrl, preferredPageHotels } = await import('../src/programs/preferred.js')
  const { ipreferParseDirectory, bookableWithPoints } = await import('../src/programs/iprefer.js')
  const { takesChoicePoints } = await import('../src/programs/preferred-choice.js')
  assert.equal(preferredSynxisFromUrl('https://preferredhotels.com/choicepoints/book/hotel/58345?x=1'), '58345')
  assert.equal(preferredSynxisFromUrl('https://preferredhotels.com/choicepoints/search'), null)
  const dir = ipreferParseDirectory(ipreferDirectoryData)
  const el = textContent => ({ textContent })
  const doc = { querySelectorAll: () => [el('Cash Only Paris'), el('Hotel Napoleon')] }
  // Choice points: Hotel Napoleon doesn't take them; the booking page's hotel comes first
  assert.deepEqual(preferredPageHotels(doc, dir, 'https://preferredhotels.com/choicepoints/book/hotel/58345', takesChoicePoints), [
    { code: 'PARHD' },
    { code: 'PARXX', name: 'Cash Only Paris' },
  ])
  // I Prefer points: Cash Only Paris isn't bookable with them; a hotel page is matched by its path
  assert.deepEqual(preferredPageHotels(doc, dir, 'https://preferredhotels.com/hotels/france/lhotel-du-collectionneur-paris/', bookableWithPoints), [
    { code: 'PARHD' },
    { code: 'PARNA', name: 'Hotel Napoleon' },
  ])
  assert.deepEqual(preferredPageHotels(doc, dir, 'https://preferredhotels.com/destination/311311/Paris', bookableWithPoints).map(h => h.code), ['PARNA'])
})
