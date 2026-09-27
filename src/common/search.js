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
