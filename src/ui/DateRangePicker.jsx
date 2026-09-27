import { useState, useRef, useLayoutEffect } from 'preact/hooks'
import { addDays, todayISO } from '../common/search.js'
import { DOW, MONTH_NAMES } from './Calendar.jsx'
import { useOutsideClick, cx } from './util.js'

const pad = n => String(n).padStart(2, '0')

// Click a start day, then an end day. end may be null (single day).
export function DateRangePicker({ start, end, onChange }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => { const t = todayISO(); return { y: +t.slice(0, 4), m: +t.slice(5, 7) - 1 } })
  const [awaitingEnd, setAwaitingEnd] = useState(false)
  const wrapRef = useRef(), inputRef = useRef(), popupRef = useRef()
  useOutsideClick(wrapRef, () => setOpen(false))

  // Popup is position:fixed; place below the input, or above if it would overflow the viewport
  useLayoutEffect(() => {
    if (!open) return
    const r = inputRef.current.getBoundingClientRect(), el = popupRef.current, h = el.offsetHeight
    el.style.top = (r.bottom + 4 + h <= innerHeight ? r.bottom + 4 : r.top - h - 4) + 'px'
    el.style.left = r.left + 'px'
  }, [open, view])

  const today = todayISO()
  function pick(iso) {
    if (!awaitingEnd || iso < start) { onChange(iso, null); setAwaitingEnd(true) }
    else if (iso === start) { onChange(start, null); setAwaitingEnd(false); setOpen(false) }
    else { onChange(start, iso); setAwaitingEnd(false) }
  }
  function preset(n) {
    const anchor = start || todayISO()
    onChange(addDays(anchor, -n), addDays(anchor, n))
    setAwaitingEnd(false)
  }
  function clear(e) {
    e.stopPropagation()
    onChange(null, null); setAwaitingEnd(false); setOpen(false)
  }
  const shift = d => setView(({ y, m }) => { const t = new Date(y, m + d, 1); return { y: t.getFullYear(), m: t.getMonth() } })

  const firstDow = new Date(view.y, view.m, 1).getDay()
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate()
  const text = start ? `${start} — ${end ?? '?'}` : 'Select dates'

  return (
    <div class="ab-drp" ref={wrapRef}>
      <div class={cx('ab-drp-input', open && 'open')} ref={inputRef} onClick={() => setOpen(!open)}>
        <span style={{ fontSize: 14 }}>📅</span>
        <span class="ab-drp-text">{text}</span>
        <button class="ab-drp-clear" title="Clear" onClick={clear}>×</button>
      </div>
      {open && (
        <div class="ab-drp-popup" ref={popupRef}>
          <div class="ab-drp-cal-header">
            <button class="ab-drp-nav" onClick={() => shift(-1)}>‹</button>
            <span class="ab-drp-cal-title">{MONTH_NAMES[view.m]} {view.y}</span>
            <button class="ab-drp-nav" onClick={() => shift(1)}>›</button>
          </div>
          <div class="ab-drp-dow">{DOW.map(d => <span key={d}>{d}</span>)}</div>
          <div class="ab-drp-days">
            {Array.from({ length: firstDow }, (_, i) => <button key={`b${i}`} class="ab-drp-day" disabled />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const iso = `${view.y}-${pad(view.m + 1)}-${pad(i + 1)}`
              const sel = iso === start || iso === end
              const inRange = start && end && iso > start && iso < end
              const past = iso < today
              return <button key={iso} class={cx('ab-drp-day', sel && 'sel', inRange && 'in-range')} onClick={() => !past && pick(iso)} disabled={past}>{i + 1}</button>
            })}
          </div>
          <div class="ab-drp-presets">
            {[1, 3, 7, 14].map(n => <button key={n} class="ab-drp-preset" onClick={() => preset(n)}>±{n}d</button>)}
          </div>
        </div>
      )}
    </div>
  )
}
