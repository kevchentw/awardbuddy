// All date math on 'YYYY-MM-DD' strings goes through UTC so local DST shifts can't skip/repeat days
export function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

export function getDates(start, end) {
  const dates = []
  for (let cur = start; cur <= end; cur = addDays(cur, 1)) dates.push(cur)
  return dates
}

// Local calendar date (toISOString would give the UTC date)
export function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

export async function runPool(tasks, concurrency) {
  const results = []
  let i = 0
  async function worker() {
    while (i < tasks.length) { const idx = i++; results[idx] = await tasks[idx]() }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))
  return results
}

// "3-5, 7" → [3, 4, 5, 7]; any malformed part → [] so the form reports it as unfilled
export function parseNumberList(text) {
  const out = new Set()
  for (const part of String(text ?? '').split(',').map(s => s.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/)
    if (!m) return []
    const a = Number(m[1]), b = Number(m[2] ?? m[1])
    if (b < a || b - a > 60) return []
    for (let n = a; n <= b; n++) out.add(n)
  }
  return [...out]
}

// { a: [1, 2], b: ['x'] } → [{ a: 1, b: 'x' }, { a: 2, b: 'x' }]
export function combos(lists) {
  return Object.entries(lists).reduce(
    (acc, [key, values]) => acc.flatMap(c => values.map(v => ({ ...c, [key]: v }))), [{}])
}

// "YYYY-MM" range → one { start, end } date span per month; the first span starts no earlier than minDate
export function monthSpans(fromMonth, toMonth, minDate = todayISO()) {
  const spans = []
  let [y, m] = fromMonth.split('-').map(Number)
  const [ty, tm] = toMonth.split('-').map(Number)
  for (; y < ty || (y === ty && m <= tm); m > 11 ? (y++, m = 1) : m++) {
    const ym = `${y}-${String(m).padStart(2, '0')}`
    const end = `${ym}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, '0')}`
    const start = `${ym}-01` < minDate ? minDate : `${ym}-01`
    if (start <= end) spans.push({ start, end })
  }
  return spans
}

// "YYYY-MM" of the month `offset` months from now
export function monthISO(offset = 0) {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const isDate = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)
const isMonth = v => typeof v === 'string' && /^\d{4}-\d{2}$/.test(v)

// Saved date range with the days already past dropped (none left → no dates)
export function restoreDates(start, end, today = todayISO()) {
  if (!isDate(start)) return { start: null, end: null }
  end = isDate(end) && end > start ? end : null
  if ((end ?? start) < today) return { start: null, end: null }
  if (start >= today) return { start, end }
  return { start: today, end: end > today ? end : null }
}

// "2026-10-01", "10/1" or "10-1" → ISO date; a date without a year is the next one on or after `from`
function parseDay(text, from) {
  const m = text.match(/^(?:(\d{4})[-/.])?(\d{1,2})[-/.](\d{1,2})$/)
  if (!m) return null
  const [, y, mo, d] = m.map(Number)
  const make = year => {
    const iso = `${year}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    return addDays(iso, 0) === iso ? iso : null   // rejects 2/30 and friends
  }
  if (m[1]) return make(y)
  const year = +from.slice(0, 4), iso = make(year)
  return iso && iso < from ? make(year + 1) : iso
}

// Typed date range → { start, end } (end null for one day), or null if it can't be read or starts
// before today. Takes "2026-10-01 — 2026-10-05", "2026-10-01~10-05", "10/1-10/5", "10/1 to 10/5",
// a single day, or empty text (clears the range).
export function parseDateRange(text, today = todayISO()) {
  text = String(text ?? '').trim()
  if (!text) return { start: null, end: null }
  let parts = text.split(/\s*(?:—|–|~|→|\bto\b)\s*|\s+-\s+|\s+/).filter(Boolean)
  // "10/1-10/5" / "2026-10-01-2026-10-05": split at the hyphen with a date on both sides
  if (parts.length === 1 && !parseDay(parts[0], today)) {
    const at = [...text.matchAll(/-/g)].map(h => h.index)
      .find(i => parseDay(text.slice(0, i), today) && parseDay(text.slice(i + 1), today))
    if (at !== undefined) parts = [text.slice(0, at), text.slice(at + 1)]
  }
  if (parts.length > 2) return null
  const start = parseDay(parts[0], today)
  if (!start || start < today) return null
  if (parts.length === 1) return { start, end: null }
  const end = parseDay(parts[1], start)
  if (!end || end < start) return null
  return { start, end: end > start ? end : null }
}

// Saved month range starting no earlier than this month (all past or invalid → this month + 2)
export function restoreMonths(fromMonth, toMonth, now = monthISO(0), fallbackTo = monthISO(2)) {
  if (!isMonth(fromMonth) || !isMonth(toMonth) || toMonth < fromMonth || toMonth < now) return { fromMonth: now, toMonth: fallbackTo }
  return { fromMonth: fromMonth < now ? now : fromMonth, toMonth }
}

// Recent-searches list with `query` put first: an identical earlier one is moved up, and it keeps `max`
export function addRecent(list, query, max = 10) {
  const key = JSON.stringify(query)
  return [query, ...list.filter(q => JSON.stringify(q) !== key)].slice(0, max)
}
