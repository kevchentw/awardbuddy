import { useState, useRef } from 'preact/hooks'
import { CABIN_LABELS, CABIN_COLORS, CABIN_ORDER } from '../common/constants.js'
import { useOutsideClick, cx } from './util.js'

const PAGE_SIZE = 50
export const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const stopsOf = r => (r.segs?.length ?? 1) - 1
const hhmm = iso => iso?.slice(11, 16) || ''

function filterAndSort(results, filters, sort, cols) {
  const rows = results.filter(r =>
    (!filters.cabin || r.cabins?.[filters.cabin] != null) &&
    (filters.stops == null || stopsOf(r) <= filters.stops) &&
    (filters.dow == null || new Date(r.date + 'T12:00:00').getDay() === filters.dow))
  const val = r =>
    sort.key === 'date' ? r.date
    : sort.key === 'dur' ? r.duration ?? 9999
    : cols.includes(sort.key) ? r.miles?.[sort.key] ?? Infinity
    : 0
  return rows.sort((a, b) => { const av = val(a), bv = val(b); return av < bv ? -sort.dir : av > bv ? sort.dir : 0 })
}

function CabinCell({ r, c }) {
  const seats = r.cabins?.[c]
  if (seats == null) return <td class="ab-cab-cell">—</td>
  const miles = r.miles?.[c]
  const stops = stopsOf(r)
  return (
    <td class="ab-cab-cell ab-cab-avail">
      {r.segs && <span class="ab-cab-stops">{stops === 0 ? 'direct' : `${stops} stop`}</span>}
      <span class="ab-cab-miles" style={{ color: CABIN_COLORS[c] }}> {miles ? `${(miles / 1000).toFixed(1).replace(/\.0$/, '')}k` : ''}</span>
      {!!r.mixPct?.[c] && c !== 'Y' &&<span style={{ color: '#bbb' }}> {r.mixPct[c]}%mx</span>}
      {seats !== true && <span style={{ color: '#bbb', fontSize: 10 }}> ({seats})</span>}
    </td>
  )
}

export function Pagination({ page, totalPages, total, setPage }) {
  const pages = []
  for (let i = 0; i < totalPages; i++) {
    if (totalPages <= 5 || i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1)
      pages.push(<button key={i} class={cx('ab-flt-btn', i === page && 'active')} onClick={() => setPage(i)}>{i + 1}</button>)
    else if (Math.abs(i - page) === 2) pages.push(<span key={i} style={{ padding: '4px 2px' }}>…</span>)
  }
  const nav = (to, label, disabled) =>
    <button class="ab-flt-btn" disabled={disabled} style={disabled ? { color: '#ccc' } : undefined} onClick={() => setPage(to)}>{label}</button>
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#666', marginTop: 8, paddingTop: 6, borderTop: '1px solid #f0f0f0' }}>
      <span>{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}</span>
      <div style={{ display: 'flex', gap: 3 }}>
        {nav(page - 1, '‹', page === 0)}
        {pages}
        {nav(page + 1, '›', page >= totalPages - 1)}
      </div>
    </div>
  )
}

// Dropdown filter pills; pills: [{ id, label, display, items: [[value, text, style?]] }], null value = no filter.
// children go at the end of the bar (e.g. a reset button).
export function FilterBar({ pills, filters, onChange, children }) {
  const [drop, setDrop] = useState(null)  // { id, top, left } of the open filter dropdown
  const barRef = useRef()
  useOutsideClick(barRef, () => setDrop(null))
  return (
    <div class="ab-flt-bar" ref={barRef}>
      {pills.map(p => {
        const value = filters[p.id], isOpen = drop?.id === p.id
        return (
          <div class="ab-pill" key={p.id}>
            <button class={cx('ab-pill-btn', value !== null && 'active', isOpen && 'open')} onClick={e => {
              if (isOpen) return setDrop(null)
              const r = e.currentTarget.getBoundingClientRect()
              setDrop({ id: p.id, top: r.bottom + 6, left: r.left })
            }}>
              {p.label}{value !== null && <>: <b>{p.display}</b></>} <span class="ab-pill-chevron">▾</span>
            </button>
            {/* position:fixed so the dropdown escapes the panel's overflow clipping */}
            {isOpen && (
              <div class="ab-drop open" style={{ top: drop.top, left: drop.left }}>
                {p.items.map(([v, text, style]) => (
                  <button key={String(v)} class={cx('ab-drop-item', value === v && 'active')} style={style}
                    onClick={() => { onChange({ ...filters, [p.id]: v }); setDrop(null) }}>{text}</button>
                ))}
              </div>
            )}
          </div>
        )
      })}
      {children}
    </div>
  )
}

export function ResultsTable({ results }) {
  const [sort, setSort] = useState({ key: 'date', dir: 1 })
  const [filters, setFilters] = useState({ cabin: null, stops: null, dow: null })
  const [page, setPage] = useState(0)
  if (!results.length) return null

  const cols = CABIN_ORDER.filter(c => results.some(r => r.cabins?.[c] !== undefined))
  const rows = filterAndSort(results, filters, sort, cols)
  const totalPages = Math.ceil(rows.length / PAGE_SIZE)
  const pg = Math.min(page, Math.max(0, totalPages - 1))
  const detailed = results.some(r => r.segs)  // calendar rows have no flight details
  const hasStopover = results.some(r => r.stopover)
  const stopCounts = [...new Set(results.map(stopsOf))].sort((a, b) => a - b)

  const pills = [
    { id: 'cabin', label: 'Cabin', display: CABIN_LABELS[filters.cabin],
      items: [[null, 'All cabins'], ...cols.map(c => [c, CABIN_LABELS[c], { color: CABIN_COLORS[c] }])] },
    detailed && { id: 'stops', label: 'Stops', display: filters.stops === 0 ? 'Direct' : `≤${filters.stops}`,
      items: [[null, 'Any'], ...stopCounts.map(n => [n, n === 0 ? 'Direct' : `≤${n} stop`])] },
    { id: 'dow', label: 'Day of week', display: DOW_LABELS[filters.dow],
      items: [[null, 'Any day'], ...[1, 2, 3, 4, 5, 6, 0].map(n => [n, DOW_LABELS[n]])] },
  ].filter(Boolean)

  function th(key, label, color) {
    const active = sort.key === key
    return (
      <th style={{ cursor: 'pointer', userSelect: 'none', color: active ? 'var(--ab-color)' : color }}
        onClick={() => { setSort(active ? { key, dir: -sort.dir } : { key, dir: 1 }); setPage(0) }}>
        {label} <span style={{ fontSize: 9, color: active ? 'var(--ab-color)' : '#aaa' }}>{active ? (sort.dir === 1 ? '↑' : '↓') : '↕'}</span>
      </th>
    )
  }

  return (
    <div>
      <FilterBar pills={pills} filters={filters} onChange={f => { setFilters(f); setPage(0) }}>
        {(sort.key !== 'date' || sort.dir !== 1) && (
          <button class="ab-flt-btn" style={{ marginLeft: 'auto' }} onClick={() => { setSort({ key: 'date', dir: 1 }); setPage(0) }}>↺ Reset sort</button>
        )}
      </FilterBar>
      <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>{rows.length} / {results.length} result(s)</div>
      <table class="ab-tbl">
        <thead><tr>
          {th('date', 'Date')}
          <th>Orig</th><th>Dest</th>
          {hasStopover && <th>Stopover</th>}
          {detailed && <><th>Flight</th><th>Dep</th><th>Arr</th>{th('dur', 'Dur')}</>}
          {cols.map(c => th(c, CABIN_LABELS[c], CABIN_COLORS[c]))}
        </tr></thead>
        <tbody>
          {rows.slice(pg * PAGE_SIZE, (pg + 1) * PAGE_SIZE).map((r, i) => (
            <tr key={i}>
              <td>{r.date}</td>
              <td class="ab-route">{r.origin}</td>
              <td class="ab-route">{r.destination}</td>
              {hasStopover && <td class="ab-route">{r.stopover ? `${r.stopover.at} · ${r.stopover.days}d` : ''}</td>}
              {detailed && <><td style={{ fontSize: 11, color: '#555', lineHeight: 1.4 }}>
                {r.segs?.map((s, j) => {
                  const cabs = [...new Set([r.segCabinsJ?.[j], ...Object.values(r.segCabins ?? {}).map(sc => sc[j])].filter(Boolean))]
                  return (
                    <div key={j}>
                      {s.flight}
                      {cabs.map(cab => <span key={cab}> <span title={CABIN_LABELS[cab]} style={{ fontSize: 9, fontWeight: 600, padding: '0 3px', borderRadius: 2, background: CABIN_COLORS[cab], color: '#fff' }}>{cab}</span></span>)}
                    </div>
                  )
                })}
              </td>
              <td>{hhmm(r.segs?.[0]?.dep)}</td>
              <td>{hhmm(r.segs?.[r.segs.length - 1]?.arr)}</td>
              <td style={{ color: '#888' }}>{r.duration ? `${Math.floor(r.duration / 60)}h${String(r.duration % 60).padStart(2, '0')}m` : ''}</td></>}
              {cols.map(c => <CabinCell key={c} r={r} c={c} />)}
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && <Pagination page={pg} totalPages={totalPages} total={rows.length} setPage={setPage} />}
    </div>
  )
}
