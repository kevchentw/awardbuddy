import { CABIN_LABELS, CABIN_COLORS, CABIN_ORDER } from '../common/constants.js'
import { cx, pad } from './util.js'

export const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

const byCabin = ([a], [b]) => CABIN_ORDER.indexOf(a) - CABIN_ORDER.indexOf(b)
const k = miles => `${(miles / 1000).toFixed(1).replace(/\.0$/, '')}k`
export const inMonthRange = (date, fromMonth, toMonth) => date >= fromMonth && date <= toMonth + '-31'

// calData: { isoDate: { "ORI→DST": { cabin: miles } } }, fromMonth/toMonth: "YYYY-MM"
export function CalendarView({ calData, fromMonth, toMonth }) {
  const multiRoute = new Set(Object.values(calData).flatMap(r => Object.keys(r))).size > 1
  const months = []
  let [y, m] = fromMonth.split('-').map(Number)
  const [ty, tm] = toMonth.split('-').map(Number)
  for (; y < ty || (y === ty && m <= tm); m > 11 ? (y++, m = 1) : m++) months.push([y, m])

  return (
    <div class="ab-cal-months">
      {months.map(([y, m]) => {
        const firstDow = new Date(y, m - 1, 1).getDay()
        const daysInMonth = new Date(y, m, 0).getDate()
        return (
          <div class="ab-cal-month" key={`${y}-${m}`}>
            <div class="ab-cal-month-name">{MONTH_NAMES[m - 1]} {y}</div>
            <div class="ab-cal-grid">
              {DOW.map(d => <div class="ab-cal-dow" key={d}>{d}</div>)}
              {Array.from({ length: firstDow }, (_, i) => <div key={`b${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const avail = calData[`${y}-${pad(m)}-${pad(i + 1)}`]
                if (!avail) return <div class="ab-cal-day" key={i}><div class="ab-cal-day-num">{i + 1}</div></div>
                return (
                  <div class="ab-cal-day avail" key={i}>
                    <div class="ab-cal-day-num">{i + 1}</div>
                    {Object.entries(avail).map(([route, cabins]) => [
                      multiRoute && <div style={{ fontSize: 8, color: '#999', marginTop: 2 }}>{route}</div>,
                      Object.entries(cabins).sort(byCabin).map(([c, miles]) => (
                        <span class="ab-cal-m" style={{ background: CABIN_COLORS[c] }}>
                          {CABIN_LABELS[c].slice(0, 3)}{miles > 0 && ` ${k(miles)}`}
                        </span>
                      )),
                    ])}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Flatten calData into ResultsTable rows (no flight details, cabins without seat counts)
export const calToRows = (calData, fromMonth, toMonth) => Object.entries(calData)
  .filter(([date]) => inMonthRange(date, fromMonth, toMonth))
  .flatMap(([date, routes]) => Object.entries(routes).map(([route, miles]) => {
    const [origin, destination] = route.split('→')
    return { date, origin, destination, miles, cabins: Object.fromEntries(Object.keys(miles).map(c => [c, true])) }
  }))

// Next 14 months as chips: first click picks a single month, a later month extends the range
export function MonthRangePicker({ from, to, onChange }) {
  const now = new Date()
  const months = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    return [`${d.getFullYear()}-${pad(d.getMonth() + 1)}`, `${MONTH_NAMES[d.getMonth()].slice(0, 3)}${d.getMonth() === 0 || i === 0 ? ` ${String(d.getFullYear()).slice(2)}` : ''}`]
  })
  const pick = m => from === to && m > from ? onChange(from, m) : onChange(m, m)
  return (
    <div class="ab-months">
      {months.map(([m, label]) => (
        <button key={m} class={cx('ab-month-btn', m >= from && m <= to && 'sel')} onClick={() => pick(m)}>{label}</button>
      ))}
    </div>
  )
}
