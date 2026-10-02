// Run: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { anaMergeResults, anaParseResults } from '../src/programs/ana.js'

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
  assert.deepEqual(r.cabins, { F: null, J: null, N: 1, Y: 1 })
  assert.deepEqual(r.miles, { Y: 50000, N: 72000 })
})
