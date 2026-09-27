// Hotel award results shared by every hotel program.
// A result is one bookable reward-night rate (one room type) for one hotel and date:
//   { date: 'YYYY-MM-DD', hotel: code, points (for that one night), room?, roomsLeft?, bookUrl?,
//     rateType? ('Standard' | 'Premium' reward, for programs that price both),
//     roomType? (room category without the night's pricing, e.g. 'Standard Suite', for programs that price several) }
// Hotel names live separately (code → name) since they come from the picker, not the search

// Colors for telling hotels apart in the calendar; wraps around past the last one
export const HOTEL_COLORS = ['#0369a1', '#b45309', '#7c3aed', '#059669', '#be123c', '#374151']

// Lowest points per date per hotel: { date: { hotel: points } }
export function lowestByDate(results) {
  const out = {}
  for (const r of results) {
    const day = out[r.date] ??= {}
    if (day[r.hotel] == null || r.points < day[r.hotel]) day[r.hotel] = r.points
  }
  return out
}

// Keep only the cheapest rate per hotel and date (first one wins on a tie)
export function cheapestOnly(results) {
  const best = new Map()
  for (const r of results) {
    const key = `${r.hotel}|${r.date}`
    if (!best.has(key) || r.points < best.get(key).points) best.set(key, r)
  }
  return [...best.values()]
}

// "tpekm, TYOIC tpekm" → ['TPEKM', 'TYOIC']
export function parseHotelCodes(text) {
  return [...new Set(String(text ?? '').split(/[\s,]+/).map(s => s.trim().toUpperCase()).filter(Boolean))]
}
