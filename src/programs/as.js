import { COMMON_AIRPORTS } from '../common/constants.js'
import { sleep } from '../common/search.js'

// Alaska Airlines – no login required

const AS_CABIN_MAP = { 'FIRST': 'F', 'BUSINESS': 'J', 'PREMIUM-COACH': 'N', 'COACH': 'Y' }
const AS_SEARCH_URL = 'https://www.alaskaair.com/search/api/flightresults'
const AS_CAL_URL = 'https://www.alaskaair.com/search/calendar/__data.json'
const AS_CAL_FARE_TYPE = { Y: 'Main', N: 'Partner Premium', J: 'Partner Business', F: 'First Class' }
const AS_DELAY_MS = 800

// The solution key names the fare's cabin (e.g. REFUNDABLE_BUSINESS); sol.cabins is per segment,
// so a mixed-cabin business fare can read ['FIRST', 'BUSINESS'] (AA domestic first + long-haul business)
export function asFareCabin(key, sol) {
  const k = key.toUpperCase()
  if (k.includes('FIRST')) return 'F'
  if (k.includes('BUSINESS')) return 'J'
  if (k.includes('PREMIUM')) return 'N'
  if (/MAIN|COACH|ECONOMY/.test(k)) return 'Y'
  return AS_CABIN_MAP[sol.cabins?.[0]]
}

function asBuildRequest(origin, destination, date) {
  return JSON.stringify({
    origins: [origin], destinations: [destination], dates: [date],
    numADTs: 1, numINFs: 0, numCHDs: 0,
    fareView: 'as_awards', isAwards: true, isMultiCity: false,
    onba: false, dnba: false, sliceId: 0, sessionID: '',
    solutionIDs: [], solutionSetIDs: [], qpxcVersion: '', trackingTags: [],
    isMobileApp: false, isAlaska: false, umnrAgeGroup: '',
    isAddingToAdultRes: false, lockFare: false,
    discount: {
      code: '', status: 0, expirationDate: new Date().toISOString(),
      message: '', memo: '', type: 0, amount: 0, distribution: 0,
      searchContainsDiscountedFare: false, campaignName: '', campaignCode: '',
      validationErrors: [], maxPassengers: 0, minPassengers: 0,
    },
  })
}

function asParseCalendarChunk(body) {
  for (const line of body.split('\n')) {
    if (!line.startsWith('{')) continue
    let chunk
    try { chunk = JSON.parse(line) } catch { continue }
    if (chunk.type !== 'chunk' || !Array.isArray(chunk.data)) continue
    const data = chunk.data
    const resolver = data.find(item => item && typeof item === 'object' && 'calendarDates' in item)
    if (!resolver) continue
    const calList = data[resolver.calendarDates]
    if (!Array.isArray(calList)) continue
    return calList.flatMap(idx => {
      if (typeof idx !== 'number') return []
      const e = data[idx]
      const date = typeof e?.date === 'number' ? data[e.date] : e?.date
      const apRaw = e?.awardPoints
      const ap = typeof apRaw === 'number' ? (Number.isInteger(apRaw) && apRaw < data.length && typeof data[apRaw] === 'number' ? data[apRaw] : apRaw) : null
      return typeof date === 'string' && typeof ap === 'number' && ap > 0 ? [{ date, awardPoints: ap }] : []
    })
  }
  return []
}

export function asParseResponse(data, origin, destination, date) {
  if (!data?.rows) return []
  const results = []
  for (const row of data.rows) {
    const byCabin = {}
    for (const [key, sol] of Object.entries(row.solutions ?? {})) {
      const c = asFareCabin(key, sol); if (!c) continue
      if (!byCabin[c] || sol.atmosPoints < byCabin[c].atmosPoints) byCabin[c] = sol
    }
    const cabins = { F: null, J: null, N: null, Y: null }, miles = {}
    let segCabins
    for (const [c, sol] of Object.entries(byCabin)) {
      cabins[c] = sol.seatsRemaining
      if (sol.atmosPoints > 0) miles[c] = sol.atmosPoints
      const perSeg = (sol.cabins ?? []).map(raw => AS_CABIN_MAP[raw] || 'Y')
      if (perSeg.some(sc => sc !== c)) (segCabins ??= {})[c] = perSeg
    }
    if (!Object.values(cabins).some(v => v !== null)) continue
    const segs = (row.segments ?? []).map(seg => ({
      airline: seg.publishingCarrier.carrierCode,
      flight: seg.publishingCarrier.carrierCode + seg.publishingCarrier.flightNumber,
      origin: seg.departureStation, destination: seg.arrivalStation,
      dep: seg.departureTime, arr: seg.arrivalTime,
    }))
    const bookUrl = `https://www.alaskaair.com/search/results?A=1&O=${origin}&D=${destination}&OD=${date}&OT=Anytime&RT=false&UPG=none&ShoppingMethod=onlineaward&locale=en-us`
    results.push({ date, origin, destination, segs, cabins, miles, duration: row.duration, bookUrl, ...(segCabins ? { segCabins } : {}) })
  }
  return results
}

export const asProgram = {
  id: 'as',
  name: 'Alaska Airlines',
  color: '#00467F',
  cabins: ['F', 'J', 'N', 'Y'],
  airports: COMMON_AIRPORTS,
  requiresSession: false,
  matches: ['www.alaskaair.com'],

  async onSearch({ origin, destination, date }) {
    await sleep(AS_DELAY_MS)
    try {
      const res = await fetch(AS_SEARCH_URL, {
        method: 'POST',
        headers: { 'content-type': 'text/plain;charset=UTF-8', 'adrum': 'isAjax:true' },
        credentials: 'include',
        body: asBuildRequest(origin, destination, date),
      })
      if (!res.ok) return []
      const data = await res.json()
      return asParseResponse(data, origin, destination, date)
    } catch { return [] }
  },

  async onCalendarSearch(origin, destination, cabins, fromMonth, toMonth, onProgress) {
    const cabinsToSearch = (cabins.length ? cabins : ['F', 'J', 'N', 'Y']).filter(c => c in AS_CAL_FARE_TYPE)
    const [fy, fm] = fromMonth.split('-').map(Number)
    const [ty, tm] = toMonth.split('-').map(Number)
    const months = []
    for (let y = fy, m = fm; y < ty || (y === ty && m <= tm); m > 11 ? (y++, m = 1) : m++)
      months.push(`${y}-${String(m).padStart(2, '0')}`)
    const total = cabinsToSearch.length * months.length
    let done = 0
    const byDate = {}
    for (const cabin of cabinsToSearch) {
      for (const yearMonth of months) {
        onProgress?.(null, { done, total, label: `Searching ${cabin} – ${yearMonth}` })
        await sleep(AS_DELAY_MS)
        try {
          const params = new URLSearchParams({
            O: origin, D: destination, OD: `${yearMonth}-01`, A: '1', RT: 'false',
            RequestType: 'Calendar', ShoppingMethod: 'onlineaward', locale: 'en-us',
            FareType: AS_CAL_FARE_TYPE[cabin], 'x-sveltekit-invalidated': '11',
          })
          const res = await fetch(`${AS_CAL_URL}?${params}`, {
            headers: { adrum: 'isAjax:true' },
            credentials: 'include',
          })
          if (!res.ok) { done++; continue }
          const body = await res.text()
          const partial = {}
          for (const { date, awardPoints } of asParseCalendarChunk(body)) {
            if (date < fromMonth || date > toMonth + '-31') continue
            if (!byDate[date]) byDate[date] = {}
            byDate[date][cabin] = awardPoints
            partial[date] = { ...(partial[date] ?? {}), [cabin]: awardPoints }
          }
          done++
          onProgress?.(Object.keys(partial).length ? partial : null, { done, total })
        } catch { done++ }
      }
    }
    return byDate
  },
}
