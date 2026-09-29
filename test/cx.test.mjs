// Run: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cxMilesKey, cxMilesCandidates, cxSegCabinsFromKey } from '../src/programs/cx.js'

const seg = (airline, origin, destination) => ({ airline, origin, destination })

test('cxMilesKey matches the milesInfo key format used by the CX results page', () => {
  assert.equal(cxMilesKey([seg('CX', 'HKG', 'NRT')], ['Y']), 'HKG:NRT_CX_STD_ECO')
  assert.equal(cxMilesKey([seg('CX', 'NRT', 'HKG'), seg('CX', 'HKG', 'BOS')], ['Y', 'Y']), 'NRT:HKG:BOS_CX:CX_STD_ECO:ECO')
  assert.equal(cxMilesKey([seg('QR', 'NRT', 'DOH'), seg('QR', 'DOH', 'BOS')], ['J', 'J']), 'NRT:DOH:BOS_QR:QR_STD_BUS:BUS')
  assert.equal(cxMilesKey([seg('JL', 'NRT', 'HKG'), seg('CX', 'HKG', 'JFK')], ['Y', 'N']), 'NRT:HKG:JFK_JL:CX_STD_ECO:PEY')
})

test('cxMilesCandidates uses booking classes for per-segment cabins', () => {
  const segs = [seg('CX', 'NRT', 'HKG'), seg('CX', 'HKG', 'JFK')]
  assert.deepEqual(cxMilesCandidates(segs, 'N', ['T', 'T']), ['NRT:HKG:JFK_CX:CX_STD_PEY:PEY'])
  assert.deepEqual(cxMilesCandidates(segs, 'J', ['X', 'U']), ['NRT:HKG:JFK_CX:CX_STD_ECO:BUS'])
})

test('cxMilesCandidates tries lower cabins for an unknown booking class', () => {
  const segs = [seg('JL', 'NRT', 'HKG'), seg('CX', 'HKG', 'JFK')]
  assert.deepEqual(cxMilesCandidates(segs, 'N', ['Y', 'T']), [
    'NRT:HKG:JFK_JL:CX_STD_PEY:PEY',
    'NRT:HKG:JFK_JL:CX_STD_ECO:PEY',
  ])
  assert.deepEqual(cxMilesCandidates([seg('CX', 'HKG', 'NRT')], 'Y'), ['HKG:NRT_CX_STD_ECO'])
})

test('cxSegCabinsFromKey reads back each segment cabin', () => {
  assert.deepEqual(cxSegCabinsFromKey('NRT:HKG:JFK_JL:CX_STD_ECO:PEY'), ['Y', 'N'])
  assert.deepEqual(cxSegCabinsFromKey('HKG:NRT_CX_STD_FIR'), ['F'])
})
