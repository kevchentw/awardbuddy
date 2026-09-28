import { PTG_API, CODE_RE, ipreferDirectory, ipreferSuggest, ipreferHotelsAt, ptgCalendar } from './iprefer.js'

// Preferred Hotels & Resorts booked with Choice Privileges points – a search mode of the Choice program
// (choicehotels.com/ascend/preferred-hotels-partner). Searching needs no login; it uses the same
// ptgapis.com data as I Prefer (see iprefer.js):
//   /rate-calendar/v2?propertyCode=…&program=CH   nights bookable with Choice points, for every date the
//                                        hotel has (about a year) in one response. Each comes with the cash
//                                        rate and its taxes / fees but points 0: a hotel's points are a flat
//                                        rate per night, choice_points_value in the directory
// Booking happens on preferredhotels.com/choicepoints, which needs a Choice Privileges session handed over
// from choicehotels.com ("Start booking" on the partner page); without one it shows a login wall. Its
// booking page doesn't take dates from the URL.
// It's also a search mode on preferredhotels.com (preferred.js).

export const PARTNER_PAGE_URL = 'https://www.choicehotels.com/ascend/preferred-hotels-partner'

export const preferredChoiceCalendarUrl = hotel =>
  `${PTG_API}/rate-calendar/v2?propertyCode=${hotel}&program=CH&adults=1&children=0`

export const preferredChoiceBookUrl = synxisId => `https://preferredhotels.com/choicepoints/book/hotel/${synxisId}`

export const takesChoicePoints = h => h.choicePoints > 0

// One result per bookable night within the span, at the hotel's Choice points rate; the night's taxes and
// fees (paid in cash) go in the room column. info: the hotel's directory entry; a hotel that doesn't take
// Choice points has no results
export function preferredChoiceParseCalendar(data, { hotel, start, end }, info) {
  const results = []
  const days = data?.results
  if (!takesChoicePoints(info ?? {}) || !days || typeof days !== 'object' || Array.isArray(days)) return results
  const currency = data.currency_code ?? 'USD'
  for (const [date, night] of Object.entries(days)) {
    if (date < start || date > end || !night?.is_available || !night.has_inventory || !night.allows_check_in) continue
    const cash = Math.round((Number(night.tax) || 0) + (Number(night.fees) || 0))
    results.push({
      date, hotel, points: info.choicePoints,
      room: cash > 0 ? `+ ${currency === 'USD' ? `$${cash}` : `${cash} ${currency}`} taxes & fees` : undefined,
      bookUrl: info.synxisId ? preferredChoiceBookUrl(info.synxisId) : undefined,
    })
  }
  return results.sort((a, b) => a.date.localeCompare(b.date))
}

export const preferredChoiceProgram = {
  id: 'choice-preferred',
  kind: 'hotel',
  name: 'Preferred Hotels (Choice points)',
  requiresSession: false,
  hotelPlaceholder: 'Hotel name, city, country or code',
  expiredMessage: '⚠ Preferred Hotels rejected the request — refresh the page and try again',

  isHotelCode: text => CODE_RE.test(text),

  async suggestHotels(text) {
    return ipreferSuggest(await ipreferDirectory(), text, takesChoicePoints)
  },

  async hotelsAt(ref) {
    return ipreferHotelsAt(ref.code ? null : await ipreferDirectory(), ref, takesChoicePoints)
  },

  async hotelName(code) {
    return (await ipreferDirectory()).find(h => h.code === code)?.name ?? null
  },

  async onHotelSearch(params) {
    const [data, dir] = await Promise.all([ptgCalendar(preferredChoiceCalendarUrl(params.hotel)), ipreferDirectory()])
    return data === 'SESSION_EXPIRED' ? data : preferredChoiceParseCalendar(data, params, dir.find(h => h.code === params.hotel))
  },
}
