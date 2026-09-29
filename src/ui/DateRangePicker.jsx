import { useState, useRef, useLayoutEffect, useEffect } from 'preact/hooks'
import { addDays, todayISO, getDates, parseDateRange } from '../common/search.js'
import { DOW, MONTH_NAMES } from './Calendar.jsx'
import { useOutsideClick, cx, pad } from './util.js'

const MONTHS_AHEAD = 12   // how far past the current month the calendar pages
const monthOf = iso => ({ y: +iso.slice(0, 4), m: +iso.slice(5, 7) - 1 })
const monthIdx = ({ y, m }) => y * 12 + m
// Local date for a (possibly overflowing) year/month/day, e.g. day 0 = last day of the previous month
const isoOf = (y, m, d) => { const t = new Date(y, m, d); return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}` }
const formatRange = (start, end) => start ? (end ? `${start} — ${end}` : start) : ''

// Type a range ("10/1-10/5", "2026-10-01 — 2026-10-05") or click a start day, then an end day.
// end may be null (single day).
export function DateRangePicker({ start, end, onChange }) {
  const today = todayISO()
  const first = monthOf(today), last = monthOf(isoOf(first.y, first.m + MONTHS_AHEAD, 1))
  const clampMonth = v => monthIdx(v) < monthIdx(first) ? first : monthIdx(v) > monthIdx(last) ? last : v

  const [open, setOpen] = useState(false)
  const [view, setView] = useState(first)
  const [pickMonth, setPickMonth] = useState(false)   // month grid instead of days
  const [awaitingEnd, setAwaitingEnd] = useState(false)
  const [hover, setHover] = useState(null)            // day under the pointer / keyboard focus, for the range preview
  const [focusDay, setFocusDay] = useState(null)      // day the arrow keys move from
  const [draft, setDraft] = useState(null)            // typed text not applied yet
  const [bad, setBad] = useState(false)
  const wrapRef = useRef(), inputRef = useRef(), popupRef = useRef(), wantFocus = useRef(null)
  useOutsideClick(wrapRef, () => close())

  // Popup is position:fixed; place below the input, or above if it would overflow the viewport.
  // The panel body scrolls, so follow the input while open.
  useLayoutEffect(() => {
    if (!open) return
    const place = () => {
      const r = wrapRef.current.getBoundingClientRect(), el = popupRef.current
      el.style.top = (r.bottom + 4 + el.offsetHeight <= innerHeight ? r.bottom + 4 : r.top - el.offsetHeight - 4) + 'px'
      el.style.left = Math.max(4, Math.min(r.left, innerWidth - el.offsetWidth - 4)) + 'px'
    }
    place()
    const root = wrapRef.current.getRootNode()
    root.addEventListener('scroll', place, true)
    addEventListener('scroll', place, true)
    addEventListener('resize', place)
    return () => {
      root.removeEventListener('scroll', place, true)
      removeEventListener('scroll', place, true)
      removeEventListener('resize', place)
    }
  }, [open])

  // Keyboard navigation moves focus once the day's button is rendered
  useEffect(() => {
    if (!wantFocus.current) return
    popupRef.current?.querySelector(`[data-iso="${wantFocus.current}"]`)?.focus()
    wantFocus.current = null
  })

  // Reopening starts from the picked month and a fresh start-day click
  function show() {
    if (open) return
    setView(clampMonth(monthOf(start || today)))
    setPickMonth(false); setAwaitingEnd(false); setHover(null); setFocusDay(null)
    setOpen(true)
  }
  function close() {
    setOpen(false); setAwaitingEnd(false); setHover(null)
  }
  // Apply typed text; false (and flagged red) if it can't be read
  function commit() {
    if (draft === null) return true
    const r = parseDateRange(draft, today)
    if (!r) { setBad(true); return false }
    onChange(r.start, r.end)
    setDraft(null); setBad(false)
    if (r.start) setView(clampMonth(monthOf(r.start)))
    return true
  }
  function revert() { setDraft(null); setBad(false) }

  function pick(iso) {
    revert()
    if (!awaitingEnd || iso < start) {
      onChange(iso, null); setAwaitingEnd(true)
      if (!inView(iso)) setView(monthOf(iso))
    }
    else if (iso === start) { onChange(start, null); close() }
    else { onChange(start, iso); close() }
  }
  function preset(n) {
    const anchor = start || today, from = addDays(anchor, -n)
    onChange(from < today ? today : from, addDays(anchor, n))
    revert(); close()
  }
  function clear(e) {
    e.stopPropagation()
    onChange(null, null); revert(); close()
  }
  function moveFocus(iso) {
    if (iso < today || monthIdx(monthOf(iso)) > monthIdx(last)) return
    wantFocus.current = iso
    setFocusDay(iso); setHover(iso); setView(monthOf(iso))
  }
  const shift = d => setView(({ y, m }) => pickMonth ? { y: y + d, m } : monthOf(isoOf(y, m + d, 1)))

  function onInputKey(e) {
    if (e.key === 'Enter') { if (commit()) close() }
    else if (e.key === 'ArrowDown') {
      e.preventDefault(); show(); setPickMonth(false)
      moveFocus(start && start >= today ? start : today)
    }
  }
  function onDayKey(e) {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key]
    if (!step || !e.target.dataset.iso) return
    e.preventDefault()
    moveFocus(addDays(e.target.dataset.iso, step))
  }
  function onKey(e) {
    if (e.key !== 'Escape' || !open) return
    e.stopPropagation()
    revert(); close(); inputRef.current.focus()
  }

  const canBack = pickMonth ? view.y > first.y : monthIdx(view) > monthIdx(first)
  const canFwd = pickMonth ? view.y < last.y : monthIdx(view) < monthIdx(last)
  const days = start ? getDates(start, end || start).length : 0

  // Always 6 weeks so the popup keeps its size (and the nav buttons their place) from month to month
  const firstDow = new Date(view.y, view.m, 1).getDay()
  const cells = Array.from({ length: 42 }, (_, i) => isoOf(view.y, view.m, i - firstDow + 1))
  const inView = iso => iso && monthOf(iso).m === view.m && monthOf(iso).y === view.y
  const tabDay = [focusDay, start, end].find(d => inView(d) && d >= today) ?? cells.find(d => inView(d) && d >= today)

  return (
    <div class="ab-drp" ref={wrapRef} onKeyDown={onKey}>
      <div class={cx('ab-drp-input', open && 'open', bad && 'bad')} onClick={() => { inputRef.current.focus(); show() }}>
        <span style={{ fontSize: 14 }}>📅</span>
        <input ref={inputRef} class="ab-drp-text" placeholder="e.g. 10/1-10/5, or pick below" spellcheck={false}
          value={draft ?? formatRange(start, end)}
          onInput={e => {
            const text = e.target.value, r = parseDateRange(text, today)
            setDraft(text); setBad(false); show()
            if (r?.start) setView(clampMonth(monthOf(r.start)))   // calendar follows what's typed
          }}
          onKeyDown={onInputKey}
          onBlur={() => { if (!commit()) revert() }} />
        {days > 0 && draft === null && <span class="ab-drp-count">{days} day{days > 1 ? 's' : ''}</span>}
        {(start || draft) && <button class="ab-drp-clear" title="Clear" onClick={clear}>×</button>}
      </div>
      {open && (
        <div class="ab-drp-popup" ref={popupRef}>
          <div class="ab-drp-cal-header">
            <button class="ab-drp-nav" onClick={() => shift(-1)} disabled={!canBack}>‹</button>
            <button class="ab-drp-cal-title" title={pickMonth ? 'Back to days' : 'Pick a month'} onClick={() => setPickMonth(!pickMonth)}>
              {pickMonth ? view.y : `${MONTH_NAMES[view.m]} ${view.y}`} <span class="ab-drp-caret">{pickMonth ? '▴' : '▾'}</span>
            </button>
            <button class="ab-drp-nav" onClick={() => shift(1)} disabled={!canFwd}>›</button>
          </div>
          <div class="ab-drp-body">
            {pickMonth ? (
              <div class="ab-drp-months">
                {MONTH_NAMES.map((name, m) => {
                  const idx = monthIdx({ y: view.y, m })
                  const out = idx < monthIdx(first) || idx > monthIdx(last)
                  const sel = start && monthIdx(monthOf(start)) <= idx && idx <= monthIdx(monthOf(end || start))
                  return <button key={m} class={cx('ab-drp-month', sel && 'sel')} disabled={out}
                    onClick={() => { setView({ y: view.y, m }); setPickMonth(false) }}>{name.slice(0, 3)}</button>
                })}
              </div>
            ) : [
              <div class="ab-drp-dow" key="dow">{DOW.map(d => <span key={d}>{d}</span>)}</div>,
              <div class="ab-drp-days" key="days" onKeyDown={onDayKey} onMouseLeave={() => setHover(null)}>
                {cells.map(iso => {
                  const sel = iso === start || iso === end
                  const inRange = start && end && iso > start && iso < end
                  const preview = awaitingEnd && hover && iso > start && iso <= hover
                  return <button key={iso} data-iso={iso} tabIndex={iso === tabDay ? 0 : -1}
                    class={cx('ab-drp-day', !inView(iso) && 'other', sel && 'sel', inRange && 'in-range', preview && 'preview')}
                    disabled={iso < today} onClick={() => pick(iso)} onMouseEnter={() => setHover(iso)}>{+iso.slice(8)}</button>
                })}
              </div>,
            ]}
          </div>
          <div class="ab-drp-presets">
            {[1, 3, 7, 14].map(n => <button key={n} class="ab-drp-preset" title={`${n} day(s) either side of ${start || 'today'}`} onClick={() => preset(n)}>±{n}d</button>)}
          </div>
        </div>
      )}
    </div>
  )
}
