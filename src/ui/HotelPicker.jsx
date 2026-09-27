import { useState, useRef, useEffect } from 'preact/hooks'
import { useOutsideClick, cx } from './util.js'

// Hotel chips with name search, plus a checklist to pick from (hotels near a place, or on the current page).
// Uses these optional hotel-program functions:
//   suggestHotels(text) → [{ label, sub?, ref }]            autocomplete for hotel names, cities, airports
//   hotelsAt(ref)       → { exact?: { code, name }, nearby: [{ code, name?, sub? }] }
//                         exact: the suggestion was one hotel, add it; otherwise pick from nearby
//   hotelName(code)     → name, for hotels added or listed without one
//   pageHotels()        → [{ code, name? }] hotels on the page the user is on, read when the list opens
//   isHotelCode(text)   → true when Enter should add the typed text as a code
// value: selected codes; names: code → name; onChange(codes, names)
export function HotelPicker({ program, value, names, onChange }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [sugs, setSugs] = useState([])
  const [list, setList] = useState(null)  // { title, hotels, loading } checklist being shown
  const [picked, setPicked] = useState([])
  const wrapRef = useRef(), inputRef = useRef()
  useOutsideClick(wrapRef, () => setOpen(false))

  // Debounced autocomplete; drops answers for text the user has since changed
  useEffect(() => {
    const text = query.trim()
    if (text.length < 2 || !program.suggestHotels) { setSugs([]); return }
    let stale = false
    const t = setTimeout(() => program.suggestHotels(text).then(s => !stale && setSugs(s), () => !stale && setSugs([])), 300)
    return () => { stale = true; clearTimeout(t) }
  }, [query])

  function add(hotels) {
    const fresh = hotels.filter(h => !value.includes(h.code))
    const named = Object.fromEntries(hotels.filter(h => h.name).map(h => [h.code, h.name]))
    onChange([...value, ...fresh.map(h => h.code)], { ...names, ...named })
  }
  const remove = code => onChange(value.filter(c => c !== code), names)

  // Checklist; hotels without a name get one looked up, a few at a time
  function showList(title, hotels) {
    setPicked([]); setList({ title, hotels })
    const missing = hotels.filter(h => !h.name && !names[h.code]).map(h => h.code)
    if (!program.hotelName || !missing.length) return
    let i = 0
    const next = async () => {
      while (i < missing.length) {
        const code = missing[i++]
        const name = await program.hotelName(code).catch(() => null)
        if (name) setList(l => l && { ...l, hotels: l.hotels.map(h => h.code === code ? { ...h, name } : h) })
      }
    }
    for (let n = 0; n < 4; n++) next()
  }

  async function choose(s) {
    setOpen(false); setQuery(''); setSugs([])
    setList({ title: s.label, hotels: [], loading: true })
    try {
      const { exact, nearby } = await program.hotelsAt(s.ref)
      if (exact) {
        add([{ ...exact, name: exact.name ?? await program.hotelName?.(exact.code).catch(() => null) }])
        setList(null)
      }
      else showList(`Hotels near ${s.label}`, nearby)
    } catch {
      setList({ title: s.label, hotels: [], error: true })
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Backspace' && !query && value.length) remove(value[value.length - 1])
    else if (e.key === 'Enter') {
      e.preventDefault()
      const typed = query.trim().toUpperCase()
      if (program.isHotelCode?.(typed)) { add([{ code: typed }]); setQuery('') }
      else if (sugs[0]) choose(sugs[0])
    }
    else if (e.key === 'Escape') setOpen(false)
  }

  const toggle = code => setPicked(p => p.includes(code) ? p.filter(c => c !== code) : [...p, code])
  const choosable = list?.hotels.filter(h => !value.includes(h.code)) ?? []
  const nameOf = h => h.name ?? names[h.code]

  return (
    <div ref={wrapRef}>
      <div class="ab-combo">
        <div class="ab-combo-box" onClick={() => inputRef.current?.focus()}>
          {value.map(code => (
            <span class="ab-chip" key={code} title={code}>
              {names[code] ?? code}
              <button class="ab-chip-x" aria-label={`Remove ${code}`} onClick={e => { e.stopPropagation(); remove(code) }}>×</button>
            </span>
          ))}
          <input ref={inputRef} class="ab-combo-input" autocomplete="off"
            placeholder={value.length ? '' : program.hotelPlaceholder ?? 'Hotel name, city or code'} value={query}
            onInput={e => { setQuery(e.currentTarget.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown} />
        </div>
        {open && sugs.length > 0 && (
          <div class="ab-combo-drop">
            {sugs.map((s, i) => (
              // mousedown + preventDefault keeps focus in the input
              <div class="ab-combo-opt" key={i} onMouseDown={e => { e.preventDefault(); choose(s) }}>
                <strong>{s.label}</strong>{s.sub && <span style={{ color: '#999' }}> · {s.sub}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
      {program.pageHotels && !list && (
        <button class="ab-link-btn" style={{ margin: '4px 0 0' }} onClick={() => showList('Hotels on this page', program.pageHotels())}>
          + Pick from hotels on this page
        </button>
      )}
      {list && (
        <div class="ab-hlist">
          <div class="ab-hlist-head">
            <b>{list.title}</b>
            {choosable.length > 0 && (
              <button class="ab-link-btn" onClick={() => setPicked(picked.length === choosable.length ? [] : choosable.map(h => h.code))}>
                {picked.length === choosable.length ? 'Select none' : 'Select all'}
              </button>
            )}
            <button class="ab-link-btn" style={{ marginLeft: 'auto' }} onClick={() => setList(null)}>✕</button>
          </div>
          {list.loading ? <div class="ab-hlist-note">Loading…</div>
            : list.error ? <div class="ab-hlist-note">Couldn't load hotels. Try again.</div>
            : !list.hotels.length ? <div class="ab-hlist-note">No hotels found.</div>
            : <div class="ab-hlist-items">
                {list.hotels.map(h => {
                  const added = value.includes(h.code)
                  return (
                    <label key={h.code} class={cx('ab-hlist-item', added && 'added')}>
                      <input type="checkbox" checked={added || picked.includes(h.code)} disabled={added} onChange={() => toggle(h.code)} />
                      <span class="ab-hlist-name">{nameOf(h) ?? '…'}</span>
                      <span class="ab-hlist-sub">{h.code}{h.sub ? ` · ${h.sub}` : ''}</span>
                    </label>
                  )
                })}
              </div>}
          {picked.length > 0 && (
            <button class="ab-hlist-add" onClick={() => {
              add(list.hotels.filter(h => picked.includes(h.code)).map(h => ({ code: h.code, name: nameOf(h) })))
              setList(null)
            }}>Add {picked.length} hotel(s)</button>
          )}
        </div>
      )}
    </div>
  )
}
