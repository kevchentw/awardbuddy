import { COMMON_AIRPORTS } from '../common/constants.js'
import { sleep } from '../common/search.js'

// LifeMiles – requires session token capture via XHR/fetch interception

const LM_SEARCH_URL = 'https://api.lifemiles.com/svc/air-redemption-find-flight-private'
const LM_PAR_URL    = 'https://api.lifemiles.com/svc/air-redemption-par-header-private'
const LM_DELAY_MS   = 1000

const LM_CARRIERS = [
  { code: 'SSA', name: 'Star Alliance' },
  { code: 'SMR', name: 'Smart Search' },
  { code: 'TG',  name: 'Thai Airways' },
  { code: 'AVH', name: 'Avianca + Gol' },
  { code: 'A3',  name: 'Aegean Airlines' },
  { code: 'NH',  name: 'ANA' },
  { code: 'LH',  name: 'Lufthansa' },
  { code: 'SQ',  name: 'Singapore Airlines' },
  { code: 'UA',  name: 'United Airlines' },
]

const lmCaptured = { bearerToken: null, secret: null, sessionData: null, schTokens: null }
let lmParTriggered = false
let lmSessionCallback = null   // called when session becomes ready

function lmNotify() {
  if (lmSessionCallback && lmCaptured.bearerToken && lmCaptured.sessionData) lmSessionCallback()
}

function lmExtractToken(auth, secret) {
  if (auth?.startsWith('Bearer ')) lmCaptured.bearerToken = auth.slice(7)
  if (secret) lmCaptured.secret = secret
  if (lmCaptured.bearerToken && !lmParTriggered) lmSchedulePar()
  lmNotify()
}

function lmExtractSession(data) {
  if (!data?.sch) return
  lmCaptured.sessionData = JSON.stringify({
    sch: data.sch || {}, discounts: data.discounts || [],
    promotionCodes: data.promotionCodes || [],
    suscriptionPaymentStatus: data.suscriptionPaymentStatus || '',
    officeId: data.officeId || '', idCotizacion: data.idCotizacion || '',
  })
  lmNotify()
}

// XHR interception
;(function () {
  const origOpen = XMLHttpRequest.prototype.open
  const origSetHeader = XMLHttpRequest.prototype.setRequestHeader
  const origSend = XMLHttpRequest.prototype.send

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this._abUrl = String(url); this._abHdrs = {}
    return origOpen.apply(this, [method, url, ...rest])
  }
  XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
    if (this._abHdrs) this._abHdrs[name.toLowerCase()] = value
    return origSetHeader.apply(this, [name, value])
  }
  XMLHttpRequest.prototype.send = function (body) {
    const url = this._abUrl || '', hdrs = this._abHdrs || {}
    if (url.includes('api.lifemiles.com')) lmExtractToken(hdrs['authorization'], hdrs['secret'])
    if (url.includes('air-redemption-par-header'))
      this.addEventListener('load', function () { try { lmExtractSession(JSON.parse(this.responseText)) } catch {} })
    if (url.includes('air-redemption-find-flight') && body)
      try { const bd = JSON.parse(String(body)); if (bd?.sch) lmCaptured.schTokens = JSON.stringify(bd.sch) } catch {}
    return origSend.apply(this, [body])
  }
})()

// fetch interception — save original before overwrite
const lmOrigFetch = window.fetch.bind(window)
if (location.hostname === 'www.lifemiles.com') window.fetch = function (input, init) {
  const url = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input)
  const hdrs = init?.headers || (input instanceof Request ? input.headers : null)
  const result = lmOrigFetch(input, init)

  if (url.includes('sso.lifemiles.com') && url.includes('/token'))
    result.then(r => r.clone().json()).then(d => { if (d?.access_token) { lmCaptured.bearerToken = d.access_token; lmNotify(); lmSchedulePar() } }).catch(() => {})

  if (url.includes('api.lifemiles.com') && hdrs) {
    let auth = null, secret = null
    if (hdrs instanceof Headers) { auth = hdrs.get('authorization'); secret = hdrs.get('secret') }
    else if (typeof hdrs === 'object') { auth = hdrs['authorization'] || hdrs['Authorization']; secret = hdrs['secret'] || hdrs['Secret'] }
    lmExtractToken(auth, secret)
  }
  if (url.includes('air-redemption-par-header'))
    result.then(r => r.clone().json()).then(d => lmExtractSession(d)).catch(() => {})
  if (url.includes('air-redemption-find-flight')) {
    const body = init?.body ? String(init.body) : ''
    try { const bd = JSON.parse(body); if (bd?.sch) lmCaptured.schTokens = JSON.stringify(bd.sch) } catch {}
  }
  return result
}

async function lmSchedulePar() {
  if (lmParTriggered || lmCaptured.sessionData) return
  lmParTriggered = true
  await sleep(3000)
  if (lmCaptured.sessionData) return
  try {
    const res = await lmOrigFetch(LM_PAR_URL, {
      method: 'POST', credentials: 'include',
      headers: { 'accept': 'application/json', 'content-type': 'application/json',
        'authorization': `Bearer ${lmCaptured.bearerToken}`, 'realm': 'lifemiles' },
      body: JSON.stringify({
        cabin: '1', ftNum: '',
        internationalization: { language: 'en', country: 'us', currency: 'usd' },
        itineraryName: 'One-Way', itineraryType: 'OW', numOd: 1,
        ods: [{ id: 1, origin: { cityName: 'Miami', cityCode: 'MIA' }, destination: { cityName: 'Bogota', cityCode: 'BOG' } }],
        paxNum: 1, selectedSearchType: 'SMR',
      }),
    })
    lmExtractSession(await res.json())
  } catch {}
}

function lmBuildBody(origin, destination, date, searchType = 'SMR') {
  const session = lmCaptured.sessionData ? JSON.parse(lmCaptured.sessionData) : {}
  let capturedSch = {}
  if (lmCaptured.schTokens) try { capturedSch = JSON.parse(lmCaptured.schTokens) } catch {}
  const sch = { ...(session.sch || {}), ...capturedSch }
  return JSON.stringify({
    internationalization: { language: 'en', country: 'us', currency: 'usd' },
    currencies: [{ currency: 'USD', decimal: 2, rateUsd: 1 }],
    passengers: 1,
    od: { orig: origin, dest: destination, depDate: date, depTime: '' },
    filter: false, codPromo: null,
    idCoti: session.idCotizacion || '', officeId: session.officeId || '', ftNum: '',
    discounts: session.discounts || [], promotionCodes: session.promotionCodes || [],
    context: 'D', channel: 'COM', cabin: '1', itinerary: 'OW', odNum: 1,
    usdTaxValue: '0', getQuickSummary: false, ods: '',
    searchType, searchTypePrioritized: searchType,
    sch, posCountry: 'US',
    odAp: [{ org: origin, dest: destination, cabin: 1 }],
    suscriptionPaymentStatus: session.suscriptionPaymentStatus || '',
  })
}

function lmParseResponse(data, origin, destination, date) {
  if (data.status !== 'success') return []
  const results = []
  for (const trip of (data.tripsList || [])) {
    const flights = trip.flightsDetail || []
    const baseSegs = flights.map((leg, i) => {
      const dep = `${leg.departingDate}T${leg.departingTime}:00`
      const arr = `${leg.arrivalDate}T${leg.arrivalTime}:00`
      const seg = { airline: leg.marketingCompany || '', flight: (leg.marketingCompany || '') + (leg.flightNumber || ''),
        origin: leg.departingCityCode, destination: leg.arrivalCityCode, dep, arr, transit: 0,
        durationMins: Math.floor((new Date(arr) - new Date(dep)) / 60000) }
      if (i > 0) {
        const prev = flights[i - 1]
        seg.transit = Math.floor((new Date(dep) - new Date(`${prev.arrivalDate}T${prev.arrivalTime}:00`)) / 60000)
      }
      return seg
    })

    const products = trip.products || []
    const ecoMiles = {}, ecoSeats = {}
    for (const p of products) {
      if (p.soldOut || p.cabinCode !== 1) continue
      for (const f of (p.flights || []))
        if (!f.soldOut && f.miles && (!ecoMiles[f.id] || f.miles < ecoMiles[f.id]))
          { ecoMiles[f.id] = f.miles; ecoSeats[f.id] = f.remainingSeats }
    }

    const comboMap = {}
    for (const p of products) {
      if (p.soldOut || (p.cabinCode !== 1 && p.cabinCode !== 2)) continue
      let totalMiles = 0, minSeats = Infinity, valid = true
      const segCabins = {}, segSeatsMap = {}
      for (const f of (p.flights || [])) {
        if (!f.soldOut && f.miles) {
          segCabins[f.id] = p.cabinCode === 2 ? 'J' : 'Y'
          segSeatsMap[f.id] = f.remainingSeats
          totalMiles += f.miles; minSeats = Math.min(minSeats, f.remainingSeats)
        } else if (ecoMiles[f.id]) {
          segCabins[f.id] = 'Y'; segSeatsMap[f.id] = ecoSeats[f.id] || 0
          totalMiles += ecoMiles[f.id]; minSeats = Math.min(minSeats, ecoSeats[f.id] || 0)
        } else { valid = false; break }
      }
      if (!valid || !totalMiles) continue
      const segKey = baseSegs.map(s => segCabins[`${s.airline}${s.flight.replace(s.airline, '')}`] || 'Y').join('+')
      const seats = minSeats === Infinity ? 0 : minSeats
      if (!comboMap[segKey] || totalMiles < comboMap[segKey].miles)
        comboMap[segKey] = { miles: totalMiles, seats, segCabins: { ...segCabins } }
    }
    if (!Object.keys(comboMap).length) continue

    let eco = null, biz = null, bizKey = null
    for (const [key, combo] of Object.entries(comboMap)) {
      if (key.includes('J')) { if (!biz || combo.miles < biz.miles) { biz = combo; bizKey = key } }
      else { if (!eco || combo.miles < eco.miles) eco = combo }
    }

    // build per-seg cabin array for the winning biz combo
    let segCabinsJ = null, mixPct = {}
    if (biz && bizKey) {
      segCabinsJ = baseSegs.map(s => biz.segCabins[`${s.airline}${s.flight.replace(s.airline, '')}`] || 'Y')
      const totalMins = baseSegs.reduce((s, seg) => s + (seg.durationMins || 0), 0)
      const jMins = baseSegs.reduce((s, seg, i) => s + (segCabinsJ[i] === 'J' ? (seg.durationMins || 0) : 0), 0)
      if (jMins < totalMins && totalMins > 0) mixPct.J = Math.round(jMins / totalMins * 100)
    }

    const [h, m] = (trip.duration || '0:0').split(':').map(Number)
    const bookUrl = `https://www.lifemiles.com/fly/redemption?orig=${origin}&dest=${destination}&depDate=${date}&cabin=1&paxNum=1`
    results.push({
      date, origin, destination, segs: baseSegs,
      cabins: { F: null, J: biz?.seats ?? null, N: null, Y: eco?.seats ?? null },
      miles: { ...(biz ? { J: biz.miles } : {}), ...(eco ? { Y: eco.miles } : {}) },
      duration: (h || 0) * 60 + (m || 0),
      ...(segCabinsJ ? { segCabinsJ } : {}),
      ...(Object.keys(mixPct).length ? { mixPct } : {}),
      bookUrl,
    })
  }
  return results
}

export const lifemilesProgram = {
  id: 'lifemiles',
  name: 'LifeMiles',
  color: '#E31837',
  cabins: ['J', 'Y'],
  airports: COMMON_AIRPORTS,
  carriers: LM_CARRIERS,
  requiresSession: true,
  matches: ['www.lifemiles.com'],

  // called by ui.js to wire up session-ready callback → enables the search button
  onSessionReady(cb) { lmSessionCallback = cb },

  isSessionReady() { return !!(lmCaptured.bearerToken && lmCaptured.sessionData) },

  async onSearch({ origin, destination, date, carrier }) {
    await sleep(LM_DELAY_MS)
    try {
      const res = await lmOrigFetch(LM_SEARCH_URL, {
        method: 'POST', credentials: 'include',
        headers: {
          'accept': 'application/json', 'content-type': 'application/json',
          'authorization': `Bearer ${lmCaptured.bearerToken}`, 'realm': 'lifemiles',
          ...(lmCaptured.secret ? { 'secret': lmCaptured.secret } : {}),
        },
        body: lmBuildBody(origin, destination, date, carrier || 'SMR'),
      })
      const data = await res.json()
      if (data.fault || (data.status && data.status !== 'success' && !data.tripsList)) return 'SESSION_EXPIRED'
      return lmParseResponse(data, origin, destination, date)
    } catch { return [] }
  },
}
