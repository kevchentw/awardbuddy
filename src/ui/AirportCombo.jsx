import { useState, useRef } from 'preact/hooks'
import { useOutsideClick } from './util.js'

// Multi-select airport chips with type-to-filter dropdown; Enter on an unlisted 3-letter code adds it as typed
export function AirportCombo({ airports, value, onChange }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(), inputRef = useRef()
  useOutsideClick(wrapRef, () => setOpen(false))

  const q = query.toLowerCase()
  const opts = open
    ? airports.filter(a => !value.includes(a.code) && (a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q))).slice(0, 20)
    : []
  const add = code => { onChange([...value, code]); setQuery('') }

  function onKeyDown(e) {
    if (e.key === 'Backspace' && !query && value.length) onChange(value.slice(0, -1))
    else if (e.key === 'Enter') {
      e.preventDefault()
      const typed = query.trim().toUpperCase()
      const exact = opts.find(a => a.code === typed)
      if (exact || opts[0]) add((exact ?? opts[0]).code)
      else if (/^[A-Z]{3}$/.test(typed) && !value.includes(typed)) add(typed)
    }
    else if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div class="ab-combo" ref={wrapRef}>
      <div class="ab-combo-box" onClick={() => inputRef.current?.focus()}>
        {value.map(code => (
          <span class="ab-chip" key={code}>
            {code}
            <button class="ab-chip-x" aria-label={`Remove ${code}`}
              onClick={e => { e.stopPropagation(); onChange(value.filter(c => c !== code)) }}>×</button>
          </span>
        ))}
        <input ref={inputRef} class="ab-combo-input" autocomplete="off"
          placeholder={value.length ? '' : 'Search…'} value={query}
          onInput={e => { setQuery(e.currentTarget.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown} />
      </div>
      {opts.length > 0 && (
        <div class="ab-combo-drop">
          {opts.map(a => (
            // mousedown + preventDefault keeps focus in the input
            <div class="ab-combo-opt" key={a.code} onMouseDown={e => { e.preventDefault(); add(a.code); setOpen(false) }}>
              <strong>{a.code}</strong> {a.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
