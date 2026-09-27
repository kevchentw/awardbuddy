import { sleep, addDays, todayISO } from '../common/search.js'

// IHG One Rewards – no login required.
// The site's own availability API (apis.ihg.com/availability/v1/calendar) takes a public API key and
// returns reward-night pricing per date for a date range, one hotel per request ("Multiple hotel codes
// are not supported"). Dates without availability are left out. It has to be called from www.ihg.com
// (CORS), so the panel runs there.
// Finding hotels by name: locations/v2/destinations autocompletes hotels, cities and airports but only
// gives coordinates; availability/v3/hotels/offers lists the hotel codes around a point; and
// hotels/v3/profiles/{code}/details has the name (one hotel per call).

const IHG_API = 'https://apis.ihg.com'
const IHG_API_KEY = 'se9ym5iAzaW8pxfBjkmgbuGjJcr3Pj6Y'  // public key the site sends with every request
const IHG_HEADERS = { accept: 'application/json', 'x-ihg-api-key': IHG_API_KEY, 'ihg-language': 'en-US' }
const NEARBY_RADIUS_MI = 30
const NEARBY_MAX = 30
const SAME_PLACE_KM = 0.15  // a suggestion this close to a hotel is that hotel
const IHG_DELAY_MS = 600
// Reward Nights rate plans
const REWARD_RATE_PLANS = ['IVAN1', 'IVAN3', 'IVAN5', 'IVAN6', 'IVAN7', 'IVANI']

// Room codes look like KDXN: bed type letter, then a two-letter room category
const BED_TYPE = { K: 'King', C: 'Double', T: 'Twin', Q: 'Queen', S: 'Studio', D: 'Double' }
const ROOM_CATEGORY = {
  AB: 'Accessible', CL: 'Club', DX: 'Deluxe', EX: 'Executive', JR: 'Junior Suite',
  OT: 'One-Bed', PR: 'Premium', SP: 'Superior', ST: 'Standard', SU: 'Suite',
}

export function ihgRoomLabel(code) {
  if (!code || code.length < 3) return code
  return `${BED_TYPE[code[0]] ?? code[0]} ${ROOM_CATEGORY[code.slice(1, 3)] ?? code.slice(1, 3)}`
}

export function ihgBookUrl(hotel, date) {
  const params = new URLSearchParams({
    qDest: hotel, qCiD: date, qCoD: addDays(date, 1), qAdlt: '1', qChld: '0', qRms: '1',
    qWch: '3', qSmP: '1', setPMCookies: 'true', qSrt: 'sDD', qIta: '99801505', qSlnP: '', qSHp: '1',
    qRtP: '6CBARC', srb_u: '1', qSHBrC: '6C',
  })
  return `https://www.ihg.com/hotels/us/en/find-hotels/hotel/rooms?${params}`
}

export function ihgBuildRequest({ hotel, start, end }) {
  return {
    hotelMnemonics: [hotel],
    startDate: start,
    endDate: end,
    lengthOfStay: 1,
    guestCounts: [{ otaCode: 'AQC10', count: 1 }],
    options: {
      includeSellStrategy: 'followChannel',
      returnAmountsAfterTaxForLowestOffer: true,
      returnAverages: true,
      lowestOfferPerRatePlan: true,
      identifyLowestOfferPerRatePlan: true,
    },
    rates: { ratePlanCodes: REWARD_RATE_PLANS },
  }
}

// One result per reward offer (room type) per hotel and date
export function ihgParseCalendar(data) {
  const results = []
  for (const h of data?.data?.hotels ?? []) {
    const hotel = h.hotel?.hotelMnemonic?.toUpperCase()
    if (!hotel) continue
    for (const day of h.calendar ?? []) {
      if (!day.start) continue
      for (const offer of day.offers ?? []) {
        if (!REWARD_RATE_PLANS.includes(offer.ratePlanCode)) continue
        const points = offer.checkInPoints
        if (!(points > 0)) continue
        const inv = offer.inventoryTypesAvailable?.[0]
        results.push({
          date: day.start, hotel, points,
          room: ihgRoomLabel(inv?.inventoryTypeCode),
          roomsLeft: inv?.numberOfAvailableProducts,
          bookUrl: ihgBookUrl(hotel, day.start),
        })
      }
    }
  }
  return results
}

// Autocomplete entries → suggestions; type 'A' is an airport
export function ihgParseDestinations(data) {
  return (Array.isArray(data) ? data : [])
    .filter(d => d.clarifiedLocation && d.latitude != null && d.longitude != null)
    .map(d => ({
      label: d.clarifiedLocation,
      sub: d.type === 'A' ? 'Airport' : undefined,
      ref: { lat: d.latitude, lng: d.longitude, label: d.clarifiedLocation, airport: d.type === 'A' },
    }))
}

// Hotels around a suggestion, nearest first; exact when the suggestion sits on a hotel
export function ihgParseNearby(data, ref) {
  const hotels = [...(data?.hotels ?? [])].filter(h => h.hotelMnemonic)
    .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
  const first = hotels[0]
  // No name: the suggestion text can be a street address, so the picker looks the name up
  if (first && !ref.airport && first.distanceKm < SAME_PLACE_KM) return { exact: { code: first.hotelMnemonic }, nearby: [] }
  return {
    nearby: hotels.slice(0, NEARBY_MAX).map(h => ({
      code: h.hotelMnemonic,
      sub: [h.distanceKm != null && `${h.distanceKm.toFixed(1)} km`, h.availabilityStatus && h.availabilityStatus !== 'OPEN' && h.availabilityStatus.toLowerCase()]
        .filter(Boolean).join(' · '),
    })),
  }
}

// Hotel code from a hotel page URL: …/taipei/tpekm/hoteldetail… or ?qSlH=TPEKM / ?qDest=TPEKM
export function ihgHotelFromUrl(url) {
  const u = new URL(url)
  const code = u.searchParams.get('qSlH') ?? u.pathname.match(/\/([a-z0-9]{5})\/hoteldetail/i)?.[1]
    ?? (u.pathname.includes('/find-hotels/hotel/') ? u.searchParams.get('qDest') : null)
  return code && /^[a-z0-9]{5}$/i.test(code) ? code.toUpperCase() : null
}

export const ihgProgram = {
  id: 'ihg',
  kind: 'hotel',
  name: 'IHG',
  color: '#0D2D52',
  matches: ['www.ihg.com'],
  requiresSession: false,
  hotelPlaceholder: 'Hotel name, city, airport or code',
  expiredMessage: '⚠ IHG rejected the request — refresh the page and try again',

  currentHotel: () => ihgHotelFromUrl(location.href),
  isHotelCode: text => /^[A-Z0-9]{5}$/.test(text),

  // The hotel page the user is on, or the cards on a search results page (each card's id is the code)
  pageHotels() {
    const hotels = [...document.querySelectorAll('app-hotel-card-list-view[data-testid="hotel-card"]')]
      .filter(card => /^[a-z0-9]{5}$/i.test(card.id))
      .map(card => ({
        code: card.id.toUpperCase(),
        name: (card.querySelector('.hotel-name') ?? card.querySelector('h2'))?.textContent.replace(/\s+/g, ' ').trim() || undefined,
      }))
    const current = ihgHotelFromUrl(location.href)
    if (current && !hotels.some(h => h.code === current)) hotels.unshift({ code: current })
    return hotels
  },

  async suggestHotels(text) {
    const res = await fetch(`${IHG_API}/locations/v2/destinations?destination=${encodeURIComponent(text)}`, { headers: IHG_HEADERS })
    return res.ok ? ihgParseDestinations(await res.json()) : []
  },

  // The offers search needs a stay; any near-future night lists the same hotels
  async hotelsAt(ref) {
    const start = addDays(todayISO(), 30)
    const res = await fetch(`${IHG_API}/availability/v3/hotels/offers?fieldset=summary`, {
      method: 'POST',
      headers: { ...IHG_HEADERS, 'content-type': 'application/json; charset=UTF-8' },
      credentials: 'include',
      body: JSON.stringify({
        startDate: start, endDate: addDays(start, 1), hotelMnemonics: null,
        rates: { ratePlanCodes: [{ internal: 'IVANI' }] },
        products: [{ productCode: 'SR', guestCounts: [{ otaCode: 'AQC10', count: 1 }], quantity: 1 }],
        options: { disabilityMode: 'ACCESSIBLE_AND_NON_ACCESSIBLE' },
        geoLocation: [{ latitude: ref.lat, longitude: ref.lng, radius: NEARBY_RADIUS_MI, uom: 'MI' }],
      }),
    })
    if (!res.ok) throw new Error(`IHG ${res.status}`)
    return ihgParseNearby(await res.json(), ref)
  },

  async hotelName(code) {
    const res = await fetch(`${IHG_API}/hotels/v3/profiles/${code}/details?fieldset=brandInfo,profile`, { headers: IHG_HEADERS })
    if (!res.ok) return null
    const h = (await res.json())?.hotelContent?.[0]
    const name = h?.profile?.name?.[0]?.value
    return h?.profile?.gdsName?.replace(/ by IHG$/, '') ?? (name && [h.brandInfo?.brandName, name].filter(Boolean).join(' ')) ?? null
  },

  async onHotelSearch(params) {
    await sleep(IHG_DELAY_MS)
    const res = await fetch(`${IHG_API}/availability/v1/calendar`, {
      method: 'POST',
      headers: { ...IHG_HEADERS, 'content-type': 'application/json; charset=UTF-8' },
      credentials: 'include',
      body: JSON.stringify(ihgBuildRequest(params)),
    })
    // 403 is the bot check; a page refresh usually clears it
    if (res.status === 403) return 'SESSION_EXPIRED'
    if (!res.ok) throw new Error(`IHG ${res.status}`)
    return ihgParseCalendar(await res.json())
  },
}
