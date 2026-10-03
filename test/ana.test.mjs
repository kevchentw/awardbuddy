// Run: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { anaMergeResults, anaMiles, anaParseResults, anaParseZoneCalendar, anaSeason } from '../src/programs/ana.js'
import { zoneCalData } from '../src/ui/util.js'

// obList / segment map as the result page writes them (SEA-HND-FUK, overnight to HND)
const page = (segs) => `var obList = new Array();
var ob = [
${segs.map(s => `new f('0','','<em>Oct<\\/em> <em>16<\\/em> (Fri)','${s.from}','${s.to}','${s.dep}','${s.arr}','${s.flight}',true,'')`).join(',\n')}
]
obList.push(ob);
var ibList = new Array();
${segs.map((s, i) => `addOutboundSegmentInfoMap('0_${i}', 'NH', '${s.flight.slice(2)}', '${s.codes[0]}', '${s.codes[1]}', 'X', '${s.date}')`).join('\n')}
addRecommendation(0, 0, null, '1400', null, 53.1, null, 53.1, false, 1, null, 50000, null);`

const en = [
  { from: 'Seattle', to: 'Tokyo (Haneda)', dep: '16:30', arr: '19:00<span>+1day</span>', flight: 'NH117', codes: ['SEA', 'HND'], date: '20261016' },
  { from: 'Tokyo (Haneda)', to: 'Fukuoka', dep: '06:20', arr: '08:10', flight: 'NH239', codes: ['HND', 'FUK'], date: '20261018' },
]
const ja = [
  { ...en[0], from: '\\u30B7\\u30A2\\u30C8\\u30EB', to: '\\u6771\\u4EAC(\\u7FBD\\u7530)', arr: '19:00\\u7FCC\\u65E5' },
  { ...en[1], from: '\\u6771\\u4EAC(\\u7FBD\\u7530)', to: '\\u798F\\u5CA1' },
]

for (const [lang, segs] of [['English', en], ['Japanese', ja]]) {
  test(`anaParseResults keeps a next-day-arrival segment (${lang} page)`, () => {
    const [r] = anaParseResults(page(segs), '2026-10-16', 'SEA', 'FUK')
    assert.equal(r.origin, 'SEA')
    assert.equal(r.destination, 'FUK')
    assert.deepEqual(r.segs.map(s => [s.flight, s.origin, s.destination, s.dep, s.arr]), [
      ['NH117', 'SEA', 'HND', '2026-10-16T16:30:00', '2026-10-17T19:00:00'],
      ['NH239', 'HND', 'FUK', '2026-10-18T06:20:00', '2026-10-18T08:10:00'],
    ])
    assert.deepEqual(r.miles, { Y: 50000 })
  })
}

test('anaParseResults fills in a partner segment, which has no segment-map entry', () => {
  // SEA-LAX on UA (same-day arrival), LAX-HND on NH past midnight; only the NH segment is in the map
  const segs = [
    { from: '\\u30B7\\u30A2\\u30C8\\u30EB', to: '\\u30ED\\u30B5\\u30F3\\u30BC\\u30EB\\u30B9(LAX)', dep: '18:43', arr: '21:32', flight: 'UA1730', codes: ['SEA', 'LAX'], date: '20261016' },
    { from: '\\u30ED\\u30B5\\u30F3\\u30BC\\u30EB\\u30B9(LAX)', to: '\\u6771\\u4EAC(\\u7FBD\\u7530)', dep: '00:50', arr: '05:00\\u7FCC\\u65E5', flight: 'NH105', codes: ['LAX', 'HND'], date: '20261017' },
  ]
  const html = page(segs).replace(/addOutboundSegmentInfoMap\('0_0'.*\n/, '')
  const [r] = anaParseResults(html, '2026-10-16', 'SEA', 'HND')
  assert.equal(r.origin, 'SEA')
  assert.equal(r.destination, 'HND')
  assert.deepEqual(r.segs.map(s => [s.flight, s.origin, s.destination, s.dep, s.arr]), [
    ['UA1730', 'SEA', 'LAX', '2026-10-16T18:43:00', '2026-10-16T21:32:00'],
    ['NH105', 'LAX', 'HND', '2026-10-17T00:50:00', '2026-10-18T05:00:00'],
  ])
})

test('anaParseResults dates a partner connection after an overnight segment', () => {
  const html = page(ja).replace(/addOutboundSegmentInfoMap\('0_1'.*\n/, '')
  const [r] = anaParseResults(html, '2026-10-16', 'SEA', 'FUK')
  assert.deepEqual(r.segs.map(s => [s.origin, s.destination, s.dep]), [
    ['SEA', 'HND', '2026-10-16T16:30:00'],
    ['HND', 'FUK', '2026-10-18T06:20:00'],
  ])
})

test('anaMergeResults folds the per-cabin searches into one row per itinerary', () => {
  const y = anaParseResults(page(en), '2026-10-16', 'SEA', 'FUK')
  const n = anaParseResults(page(en).replace("'1400'", "'950'").replace('50000', '72000'), '2026-10-16', 'SEA', 'FUK')
  const [r, ...rest] = anaMergeResults([y, n])
  assert.equal(rest.length, 0)
  assert.deepEqual(r.cabins, { F: null, J: null, N: true, Y: true })
  assert.deepEqual(r.miles, { Y: 50000, N: 72000 })
})

test('anaParseZoneCalendar pairs the directions of each route from today on', () => {
  const rows = [
    ['Departure', 'Arrival', '2026/10/2', '2026/10/3', '2026/10/31', '2026/11/1'],
    ['NRT', 'LAX', 3, 2, 1, 0],
    ['LAX', 'NRT', 0, 1, 2, 3],
    ['HND', 'SEA', 1, 1, 1, 1],
    ['SEA', 'HND', 2, 2, 2, 2],
  ]
  assert.deepEqual(anaParseZoneCalendar(rows, '2026-10-03'), {
    dates: ['2026-10-03', '2026-10-31', '2026-11-01'],
    routes: [
      { from: 'NRT', to: 'LAX', out: [2, 1, 0], back: [1, 2, 3] },
      { from: 'HND', to: 'SEA', out: [1, 1, 1], back: [2, 2, 2] },
    ],
  })
  // A file left over from years ago has no days left; one that didn't load is null
  assert.deepEqual(anaParseZoneCalendar([['Departure', 'Arrival', '2017/10/29'], ['SIN', 'NRT', 1]], '2026-10-03'), { dates: [], routes: [] })
  assert.equal(anaParseZoneCalendar(null, '2026-10-03'), null)
})

test('zoneCalData keeps the open days of both directions, per cabin, for one route or all', () => {
  const file = (out, back) => ({
    dates: ['2026-10-03', '2026-10-04'],
    routes: [{ from: 'NRT', to: 'LAX', out, back }, { from: 'HND', to: 'SEA', out: [1, 1], back: [3, 0] }],
  })
  const files = { Y: file([3, 1], [0, 2]), J: file([2, 0], [1, 1]), F: null }
  assert.deepEqual(zoneCalData(files, '', (c, date) => c === 'Y' && date === '2026-10-04' ? 25000 : null), {
    '2026-10-03': { 'NRT→LAX': { Y: 0, J: 0 }, 'SEA→HND': { Y: 0, J: 0 } },
    '2026-10-04': { 'LAX→NRT': { Y: 25000 } },
  })
  assert.deepEqual(zoneCalData(files, 'HND⇄SEA'), { '2026-10-03': { 'SEA→HND': { Y: 0, J: 0 } } })
})

test('anaSeason covers every day of the published charts once, and anaMiles reads the chart', () => {
  for (const zone of ['Z2', 'Z3', 'Z4', 'Z5', 'Z6', 'Z7', 'ZA']) {
    for (let d = new Date('2026-01-01T00:00:00Z'); d <= new Date('2028-03-31T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 1)) {
      assert.ok(anaSeason(zone, d.toISOString().slice(0, 10)), `${zone} ${d.toISOString().slice(0, 10)}`)
    }
    assert.equal(anaSeason(zone, '2028-04-01'), null)
  }
  // North America: high season from Dec 19, 2026; low Jan 6 – Feb 28, 2027; regular after
  assert.deepEqual(['2026-12-18', '2026-12-19', '2027-01-06', '2027-03-01'].map(d => anaSeason('Z6', d)), ['R', 'H', 'L', 'R'])
  // Asia 1: Golden Week high season ends May 10 in 2026, low again from May 11
  assert.deepEqual(['2026-05-10', '2026-05-11'].map(d => anaSeason('Z3', d)), ['H', 'L'])
  assert.equal(anaMiles('Z6', 'J', '2026-11-10'), 52500)
  assert.equal(anaMiles('Z6', 'F', '2026-12-25'), 150000)
  assert.equal(anaMiles('Z2', 'F', '2026-11-10'), null)
  assert.equal(anaMiles('Z6', 'Y', '2028-06-01'), null)
})
