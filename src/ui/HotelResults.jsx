import { useState } from 'preact/hooks'
import { HOTEL_COLORS, lowestByDate, cheapestOnly } from '../common/hotels.js'
import { DOW, MONTH_NAMES } from './Calendar.jsx'
import { FilterBar, Pagination, DOW_LABELS } from './ResultsTable.jsx'
import { cx } from './util.js'

const PAGE_SIZE = 50
const pad = n => String(n).padStart(2, '0')
const k = points => `${(points / 1000).toFixed(1).replace(/\.0$/, '')}k`
const hotelColor = (hotels, code) => HOTEL_COLORS[hotels.indexOf(code) % HOTEL_COLORS.length]

// Month grids with the lowest points per night per hotel on each date.
// hotels: codes in search order (fixes each hotel's color); fromMonth/toMonth: "YYYY-MM"
export function HotelCalendar({ results, hotels, names, fromMonth, toMonth, selected, onSelect }) {
  const byDate = lowestByDate(results)
  const multi = hotels.length > 1
  const months = []
  let [y, m] = fromMonth.split('-').map(Number)
  const [ty, tm] = toMonth.split('-').map(Number)
  for (; y < ty || (y === ty && m <= tm); m > 11 ? (y++, m = 1) : m++) months.push([y, m])

  return (
    <div class="ab-cal-months">
      {multi && (
        <div class="ab-hotel-legend">
          {hotels.map(h => <span key={h}><i style={{ background: hotelColor(hotels, h) }} />{names[h] ?? h}</span>)}
        </div>
      )}
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
                const date = `${y}-${pad(m)}-${pad(i + 1)}`
                const avail = byDate[date]
                if (!avail) return <div class="ab-cal-day" key={i}><div class="ab-cal-day-num">{i + 1}</div></div>
                return (
                  <div class={cx('ab-cal-day avail', selected === date && 'sel')} key={i} title="Show this date only"
                    onClick={() => onSelect(selected === date ? null : date)}>
                    <div class="ab-cal-day-num">{i + 1}</div>
                    {hotels.filter(h => avail[h] != null).map(h => (
                      <span class="ab-cal-m" key={h} style={{ background: hotelColor(hotels, h) }}>
                        {k(avail[h])}
                      </span>
                    ))}
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

// Sortable, filterable list of every reward rate found.
// sharedPills / shared / onSharedChange: filters kept by the caller (they narrow the calendar too),
// shown first in the same filter bar
export function HotelTable({ results, hotels, names, date, onClearDate, sharedPills = [], shared = {}, onSharedChange }) {
  const [sort, setSort] = useState({ key: 'date', dir: 1 })
  const [filters, setFilters] = useState({ hotel: null, dow: null })
  const [cheapest, setCheapest] = useState(true)
  const [page, setPage] = useState(0)
  if (!results.length) return null

  const rows = (cheapest ? cheapestOnly(results) : results).filter(r =>
    (!date || r.date === date) &&
    (!filters.hotel || r.hotel === filters.hotel) &&
    (filters.dow == null || new Date(r.date + 'T12:00:00').getDay() === filters.dow))
  const val = r => sort.key === 'points' ? r.points : r.date
  rows.sort((a, b) => {
    const av = val(a), bv = val(b)
    return av < bv ? -sort.dir : av > bv ? sort.dir : a.points - b.points
  })
  const totalPages = Math.ceil(rows.length / PAGE_SIZE)
  const pg = Math.min(page, Math.max(0, totalPages - 1))
  const multi = hotels.length > 1
  const hasBook = results.some(r => r.bookUrl)
  const hotelName = code => names[code] ?? code

  const pills = [
    ...sharedPills,
    multi && { id: 'hotel', label: 'Hotel', display: filters.hotel && hotelName(filters.hotel),
      items: [[null, 'All hotels'], ...hotels.map(h => [h, hotelName(h), { color: hotelColor(hotels, h) }])] },
    { id: 'dow', label: 'Day of week', display: DOW_LABELS[filters.dow],
      items: [[null, 'Any day'], ...[1, 2, 3, 4, 5, 6, 0].map(n => [n, DOW_LABELS[n]])] },
  ].filter(Boolean)

  function th(key, label) {
    const active = sort.key === key
    return (
      <th style={{ cursor: 'pointer', userSelect: 'none', color: active ? 'var(--ab-color)' : undefined }}
        onClick={() => { setSort(active ? { key, dir: -sort.dir } : { key, dir: 1 }); setPage(0) }}>
        {label} <span style={{ fontSize: 9, color: active ? 'var(--ab-color)' : '#aaa' }}>{active ? (sort.dir === 1 ? '↑' : '↓') : '↕'}</span>
      </th>
    )
  }

  return (
    <div>
      <FilterBar pills={pills} filters={{ ...shared, ...filters }} onChange={f => {
        const own = { hotel: f.hotel, dow: f.dow }
        if (sharedPills.some(p => f[p.id] !== shared[p.id])) onSharedChange(f)
        else setFilters(own)
        setPage(0)
      }}>
        {date && <button class="ab-flt-btn active" onClick={onClearDate}>{date} ✕</button>}
        <button class={cx('ab-flt-btn', cheapest && 'active')} onClick={() => { setCheapest(!cheapest); setPage(0) }}>Cheapest room only</button>
      </FilterBar>
      <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>{rows.length} / {results.length} rate(s)</div>
      <table class="ab-tbl">
        <thead><tr>
          {th('date', 'Date')}
          {multi && <th>Hotel</th>}
          <th>Room</th>
          {th('points', 'Points')}
          <th>Left</th>
          {hasBook && <th />}
        </tr></thead>
        <tbody>
          {rows.slice(pg * PAGE_SIZE, (pg + 1) * PAGE_SIZE).map((r, i) => (
            <tr key={i}>
              <td>{r.date}</td>
              {multi && <td class="ab-hotel-cell" style={{ color: hotelColor(hotels, r.hotel) }} title={`${hotelName(r.hotel)} (${r.hotel})`}>{hotelName(r.hotel)}</td>}
              <td style={{ fontSize: 11, color: '#555' }}>{r.room ?? ''}</td>
              <td class="ab-cab-miles">{r.points.toLocaleString()}</td>
              <td style={{ color: '#888' }}>{r.roomsLeft ?? ''}</td>
              {hasBook && <td>{r.bookUrl && <a href={r.bookUrl} target="_blank" style={{ color: 'var(--ab-color)', fontSize: 11 }}>Book ↗</a>}</td>}
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && <Pagination page={pg} totalPages={totalPages} total={rows.length} setPage={setPage} />}
    </div>
  )
}
