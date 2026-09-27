import { sleep, addDays } from '../common/search.js'

// IHG One Rewards – no login required.
// The site's own availability API (apis.ihg.com/availability/v1/calendar) takes a public API key and
// returns reward-night pricing per date for a date range, one hotel per request ("Multiple hotel codes
// are not supported"). Dates without availability are left out. It has to be called from www.ihg.com
// (CORS), so the panel runs there.

const IHG_CALENDAR_URL = 'https://apis.ihg.com/availability/v1/calendar'
const IHG_API_KEY = 'se9ym5iAzaW8pxfBjkmgbuGjJcr3Pj6Y'  // public key the site sends with every request
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
  hotelPlaceholder: 'e.g. TPEKM, TYOIC',
  expiredMessage: '⚠ IHG rejected the request — refresh the page and try again',

  currentHotel: () => ihgHotelFromUrl(location.href),
  // Hotel cards on the site's search results (find-hotels/hotel-search); the card's id is the hotel code
  hotelCards: {
    selector: 'app-hotel-card-list-view[data-testid="hotel-card"]',
    code: card => /^[a-z0-9]{5}$/i.test(card.id) ? card.id.toUpperCase() : null,
    name: card => (card.querySelector('.hotel-name') ?? card.querySelector('h2'))?.textContent,
    anchor: card => card.querySelector('.hotel-selection-btn')?.parentElement ?? card.querySelector('.hotel-body-rhs-container'),
  },

  async onHotelSearch(params) {
    await sleep(IHG_DELAY_MS)
    const res = await fetch(IHG_CALENDAR_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        accept: 'application/json',
        'x-ihg-api-key': IHG_API_KEY,
        'ihg-language': 'en-US',
      },
      credentials: 'include',
      body: JSON.stringify(ihgBuildRequest(params)),
    })
    // 403 is the bot check; a page refresh usually clears it
    if (res.status === 403) return 'SESSION_EXPIRED'
    if (!res.ok) throw new Error(`IHG ${res.status}`)
    return ihgParseCalendar(await res.json())
  },
}
