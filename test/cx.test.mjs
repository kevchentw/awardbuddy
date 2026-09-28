// Run: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cxMilesKey } from '../src/programs/cx.js'

test('cxMilesKey matches the milesInfo key format used by the CX results page', () => {
  const seg = (airline, origin, destination) => ({ airline, origin, destination })
  assert.equal(cxMilesKey([seg('CX', 'HKG', 'NRT')], 'Y'), 'HKG:NRT_CX_STD_ECO')
  assert.equal(cxMilesKey([seg('CX', 'NRT', 'HKG'), seg('CX', 'HKG', 'BOS')], 'Y'), 'NRT:HKG:BOS_CX:CX_STD_ECO:ECO')
  assert.equal(cxMilesKey([seg('QR', 'NRT', 'DOH'), seg('QR', 'DOH', 'BOS')], 'J'), 'NRT:DOH:BOS_QR:QR_STD_BUS:BUS')
  assert.equal(cxMilesKey([seg('CX', 'HKG', 'LHR')], 'N'), 'HKG:LHR_CX_STD_PEY')
  assert.equal(cxMilesKey([seg('CX', 'HKG', 'LHR')], 'F'), 'HKG:LHR_CX_STD_FIR')
})
