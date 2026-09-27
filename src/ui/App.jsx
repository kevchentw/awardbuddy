import { render } from 'preact'
import { useState, useRef, useEffect } from 'preact/hooks'
import { CABIN_LABELS, CABIN_COLORS, CONCURRENCY } from '../common/constants.js'
import { getDates, runPool, parseNumberList, combos } from '../common/search.js'
import { CSS } from './styles.js'
import { AirportCombo } from './AirportCombo.jsx'
import { DateRangePicker } from './DateRangePicker.jsx'
import { ResultsTable } from './ResultsTable.jsx'
import { CalendarView, MonthRangePicker, calToRows, inMonthRange } from './Calendar.jsx'
import { cx } from './util.js'

// Airport list (combo) or comma-separated text (programs without an airport list)
const codes = v => Array.isArray(v) ? v : v.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)

function monthISO(offset) {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// Extra inputs a search mode needs (e.g. stopover cities, stay lengths). Each field yields a list of
// values and every combination is searched for each route and date.
// Field types: 'airports' (chips), 'numbers' ("3-5, 7"), otherwise a single text value.
const optionFields = (program, form) => program.optionsFor?.(form.carrier) ?? []
function optionRaw(fd, form) {
  const v = form.options[fd.key] ?? fd.default
  return fd.type === 'airports' ? (Array.isArray(v) ? v : []) : String(v ?? '')
}
function optionCombos(program, form) {
  return combos(Object.fromEntries(optionFields(program, form).map(fd => {
    const v = optionRaw(fd, form)
    return [fd.key, fd.type === 'airports' ? v : fd.type === 'numbers' ? parseNumberList(v) : v.trim() ? [v.trim()] : []]
  })))
}

// Last-used route/cabin/carrier/options per program, in the host site's localStorage
const storeKey = program => `award-buddy:${program.id}`
function loadSaved(program) {
  try { return JSON.parse(localStorage.getItem(storeKey(program))) || {} } catch { return {} }
}
// Saved value only if it has the same shape as the default (combo array vs. comma text)
const sameShape = (v, fallback) => v != null && typeof v === typeof fallback && Array.isArray(v) === Array.isArray(fallback) ? v : fallback

function initialForm(program) {
  const saved = loadSaved(program)
  return {
    origins: sameShape(saved.origins, program.airports ? [] : ''),
    dests: sameShape(saved.dests, program.airports ? [] : 'NRT'),
    start: null, end: null,
    fromMonth: monthISO(0), toMonth: monthISO(2),
    carrier: program.carriers?.some(c => c.code === saved.carrier) ? saved.carrier : program.carriers?.[0]?.code,
    options: saved.options && typeof saved.options === 'object' ? saved.options : {},
    cabins: Array.isArray(saved.cabins) ? saved.cabins.filter(c => program.cabins.includes(c)) : [],
  }
}

function summary(program, form, calMode) {
  const route = `${codes(form.origins).join(', ') || '?'} → ${codes(form.dests).join(', ') || '?'}`
  const when = calMode ? `${form.fromMonth} – ${form.toMonth}` : form.start ? `${form.start} – ${form.end || form.start}` : '?'
  const cabins = form.cabins.length ? form.cabins.map(c => CABIN_LABELS[c]).join('/') : 'Any cabin'
  const carrier = program.carriers?.find(c => c.code === form.carrier)?.name
  const opts = optionFields(program, form).map(fd => `${fd.label} ${[optionRaw(fd, form)].flat().join(', ') || '?'}`)
  return [route, when, cabins, carrier, ...opts].filter(Boolean).join(' · ')
}

function requestHint(program, form, calMode) {
  const routes = codes(form.origins).length * codes(form.dests).length
  if (!routes) return ''
  if (calMode) {
    if (!form.fromMonth || !form.toMonth || form.toMonth < form.fromMonth) return ''
    const per = program.calendarRequestsPerRoute?.(form.fromMonth, form.toMonth, form.cabins) ?? 1
    return `~${routes * per} request(s) (${routes} route(s)${per > 1 ? ` × ${per}` : ''})`
  }
  if (!form.start) return ''
  const days = getDates(form.start, form.end || form.start).length
  const opts = optionFields(program, form).length ? optionCombos(program, form).length : 1
  return `~${routes * days * opts} request(s) (${routes} route(s) × ${days} day(s)${opts > 1 ? ` × ${opts} combos` : ''})`
}

function useSession(program) {
  const check = () => ({
    ready: !program.requiresSession || program.isSessionReady(),
    url: program.getSessionUrl?.() || program.loginUrl,
  })
  const [session, setSession] = useState(check)
  useEffect(() => {
    if (!program.requiresSession || !program.onSessionReady) return
    const update = () => setSession(check())
    program.onSessionReady(update)
    // Poll in case the token arrived before mount or the program never calls back
    const poll = setInterval(() => { update(); if (program.isSessionReady()) clearInterval(poll) }, 1000)
    return () => clearInterval(poll)
  }, [])
  return session
}

function App({ program }) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [calMode, setCalMode] = useState(false)
  const [form, setForm] = useState(() => initialForm(program))
  const set = patch => setForm(f => ({ ...f, ...patch }))
  // Some programs' airport list and calendar support depend on the selected carrier / search mode
  const airports = program.airportsFor?.(form.carrier) ?? program.airports
  const hasCalendar = !!program.onCalendarSearch && (program.calendarFor?.(form.carrier) ?? true)
  useEffect(() => { if (!hasCalendar) setCalMode(false) }, [hasCalendar])
  useEffect(() => {
    const { origins, dests, cabins, carrier, options } = form
    try { localStorage.setItem(storeKey(program), JSON.stringify({ origins, dests, cabins, carrier, options })) } catch {}
  }, [form])
  const [collapsed, setCollapsed] = useState(false)  // form folds to a one-line summary once a search starts
  const session = useSession(program)

  const [searching, setSearching] = useState(false)
  const [btnLabel, setBtnLabel] = useState(null)  // 'Stopping…' / 'Restarting…' override while searching
  const [status, setStatus] = useState('')
  const [progress, setProgress] = useState(null)  // 0–100, null hides the bar
  const [results, setResults] = useState([])
  const [cal, setCal] = useState(null)            // { data, fromMonth, toMonth }
  const [noResults, setNoResults] = useState(false)

  // Search loop reads the latest inputs via ref so a queued re-run picks up edits
  const latest = useRef()
  latest.current = { form, calMode }
  const ctl = useRef({ searching: false, stop: false, rerun: false }).current

  // Editing inputs mid-search aborts and re-runs with the new values
  useEffect(() => {
    if (!ctl.searching) return
    ctl.rerun = true; ctl.stop = true
    setBtnLabel('Restarting…')
  }, [form])

  function begin() {
    ctl.searching = true; ctl.stop = false; ctl.t0 = Date.now()
    setSearching(true); setBtnLabel(null); setProgress(0); setNoResults(false); setCollapsed(true)
  }
  // Wall-clock time since begin(), e.g. "8.4s" or "2m 05s"
  function elapsed() {
    const sec = (Date.now() - ctl.t0) / 1000
    return sec < 60 ? `${sec.toFixed(1)}s` : `${Math.floor(sec / 60)}m ${String(Math.floor(sec % 60)).padStart(2, '0')}s`
  }
  function end() {
    ctl.searching = false
    setSearching(false); setBtnLabel(null)
  }

  async function search() {
    if (ctl.searching) { ctl.stop = true; ctl.rerun = false; setBtnLabel('Stopping…'); return }
    const { form: f, calMode } = latest.current
    const origins = codes(f.origins), dests = codes(f.dests)
    const cabinFilter = [...f.cabins]

    if (calMode) {
      const { fromMonth, toMonth } = f
      if (!origins.length || !dests.length || !fromMonth || !toMonth) { setStatus('⚠ Fill in all fields'); return }
      begin()
      setResults([])
      setStatus('Fetching calendar…')
      const merged = {}
      const found = () => Object.keys(merged).filter(d => inMonthRange(d, fromMonth, toMonth)).length
      setCal({ data: merged, fromMonth, toMonth })
      let route = ''
      const onProgress = (partial, meta) => {
        if (partial) {
          for (const [date, cabinMiles] of Object.entries(partial)) {
            merged[date] ??= {}
            merged[date][route] = { ...merged[date][route], ...cabinMiles }
          }
          setCal({ data: { ...merged }, fromMonth, toMonth })
        }
        if (meta) {
          setProgress(meta.done / meta.total * 100)
          setStatus(`${meta.label ? meta.label + ' ' : ''}(${meta.done}/${meta.total}) · ${found()} date(s) found`)
        } else setStatus(`${found()} date(s) found…`)
      }
      for (const o of origins) {
        for (const d of dests) {
          if (ctl.stop) break
          route = `${o}→${d}`
          const result = await program.onCalendarSearch(o, d, cabinFilter, fromMonth, toMonth, onProgress)
          if (result === 'SESSION_EXPIRED') {
            setStatus(program.expiredMessage ?? '⚠ Session expired — navigate to the award booking page to refresh')
            end(); return
          }
        }
      }
      end()
      setProgress(null)
      setStatus(`Done in ${elapsed()}. ${found()} date(s) with availability.`)
      if (ctl.rerun) { ctl.rerun = false; search() }
      return
    }

    const from = f.start, to = f.end || f.start
    const optionSets = optionCombos(program, f)
    if (!origins.length || !dests.length || !from || !optionSets.length) { setStatus('⚠ Fill in all fields'); return }
    const dates = getDates(from, to)
    const total = origins.length * dests.length * dates.length * optionSets.length
    begin()
    setCal(null); setResults([]); setStatus('')

    let done = 0
    const all = []
    const tasks = origins.flatMap(o => dests.flatMap(d => dates.flatMap(date => optionSets.map(options => async () => {
      if (ctl.stop) return
      const result = await program.onSearch({ origin: o, destination: d, date, cabinFilter, carrier: f.carrier, options })
      if (result === 'SESSION_EXPIRED') {
        ctl.stop = true
        setStatus(program.expiredMessage ?? '⚠ Session expired — search a flight on the site to refresh')
        return
      }
      done++
      setProgress(done / total * 100)
      setStatus(`${done} / ${total} done`)
      // Cabin filter applied here once, so programs return everything they parsed
      all.push(...(result || []).filter(r => !cabinFilter.length || cabinFilter.some(c => r.cabins?.[c] != null)))
      setResults([...all])
    }))))

    await runPool(tasks, CONCURRENCY)

    end()
    if (ctl.rerun) { ctl.rerun = false; search(); return }
    if (!ctl.stop) {
      setProgress(null)
      setStatus(`Done in ${elapsed()}. Found ${all.length} result(s) across ${total} searches.`)
      if (!all.length) setNoResults(true)
    } else if (all.length) setStatus(s => `${s} (${all.length} found so far)`)
  }

  const toggleCabin = c => set({ cabins: form.cabins.includes(c) ? form.cabins.filter(x => x !== c) : [...form.cabins, c] })
  const airportField = (key, label, placeholder) => (
    <div class="ab-field">
      <label>{airports ? label : `${label}${key === 'origins' ? ' (comma separated)' : ''}`}</label>
      {airports
        ? <AirportCombo airports={airports} value={form[key]} onChange={v => set({ [key]: v })} />
        : <input type="text" placeholder={placeholder} value={form[key]} onInput={e => set({ [key]: e.currentTarget.value })} />}
    </div>
  )

  return (
    <>
      <style>{CSS}</style>
      <button id="ab-fab" title={`Award Buddy – ${program.name}`} onClick={() => setOpen(!open)}>✈</button>
      {/* Hidden rather than unmounted so form and table state survive closing */}
      <div id="ab-panel" class={cx(!open && 'hidden', expanded && 'ab-expanded')}>
        <div class="ab-header">
          <span>✈ Award Buddy – {program.name}</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button title="Expand" style={{ fontSize: 20, lineHeight: 1 }} onClick={() => setExpanded(!expanded)}>{expanded ? '⤡' : '⤢'}</button>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>
        </div>
        {program.requiresSession && (session.ready
          ? <div class="ab-session-bar ok"><div class="ab-dot" /> Session ready</div>
          : <div class="ab-session-bar waiting">
              <div class="ab-dot" /> Waiting for session…
              {program.triggerSession
                ? <button style={{ marginLeft: 6, fontSize: 12 }} onClick={() => program.triggerSession()}>Get session</button>
                : session.url && <a href={session.url} target="_blank" style={{ color: 'inherit', marginLeft: 6 }}>→ Get session</a>}
            </div>)}
        <div class="ab-body">
          {collapsed ? (
            <div class="ab-summary">
              <span>{summary(program, form, calMode)}</span>
              <button onClick={() => setCollapsed(false)}>Edit</button>
            </div>
          ) : <>
          {program.carriers && (
            <div class="ab-row">
              <div class="ab-field">
                <label>{program.carrierLabel ?? 'Carrier'}</label>
                <select value={form.carrier} onChange={e => set({ carrier: e.currentTarget.value })}>
                  {program.carriers.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </div>
            </div>
          )}
          {optionFields(program, form).length > 0 && (
            <div class="ab-row">
              {optionFields(program, form).map(fd => (
                <div class="ab-field" key={fd.key}>
                  <label>{fd.label}</label>
                  {fd.type === 'airports'
                    ? <AirportCombo airports={airports} value={optionRaw(fd, form)} onChange={v => set({ options: { ...form.options, [fd.key]: v } })} />
                    : <input type="text" placeholder={fd.placeholder} value={optionRaw(fd, form)}
                        onInput={e => set({ options: { ...form.options, [fd.key]: e.currentTarget.value } })} />}
                </div>
              ))}
            </div>
          )}
          {hasCalendar && (
            <div class="ab-mode-toggle">
              <button class={cx('ab-mode-btn', !calMode && 'active')} onClick={() => setCalMode(false)}>Search</button>
              <button class={cx('ab-mode-btn', calMode && 'active')} onClick={() => setCalMode(true)}>Calendar</button>
            </div>
          )}
          <div class="ab-row">
            {airportField('origins', 'Origins', 'e.g. TPE, TSA')}
            {airportField('dests', 'Destinations', 'e.g. NRT, HND')}
          </div>
          {calMode ? (
            <div class="ab-row">
              <div class="ab-field"><label>Months (click start, then end)</label>
                <MonthRangePicker from={form.fromMonth} to={form.toMonth} onChange={(fromMonth, toMonth) => set({ fromMonth, toMonth })} /></div>
            </div>
          ) : (
            <div class="ab-row">
              <div class="ab-field">
                <label>Dates</label>
                <DateRangePicker start={form.start} end={form.end} onChange={(start, end) => set({ start, end })} />
              </div>
            </div>
          )}
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 5 }}>Cabin (leave all off = any)</label>
            <div class="ab-cabins">
              {program.cabins.map(c => (
                <button key={c} class="ab-cabin-btn" onClick={() => toggleCabin(c)}
                  style={form.cabins.includes(c) ? { background: CABIN_COLORS[c], color: '#fff', borderColor: 'transparent' } : undefined}>
                  {CABIN_LABELS[c]}
                </button>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 6, minHeight: 14 }}>{requestHint(program, form, calMode)}</div>
          </>}
          <button class="ab-search-btn" disabled={!session.ready && !searching} onClick={search}>
            {btnLabel ?? (searching ? 'Stop' : 'Search')}
          </button>
          <div class="ab-status">{status}</div>
          {progress !== null && <div class="ab-progress"><div class="ab-progress-bar" style={{ width: `${progress}%` }} /></div>}
          <div>
            {cal && <CalendarView calData={cal.data} fromMonth={cal.fromMonth} toMonth={cal.toMonth} />}
            <ResultsTable results={cal ? calToRows(cal.data, cal.fromMonth, cal.toMonth) : results} />
            {noResults && <div class="ab-no-results">No award availability found.</div>}
          </div>
        </div>
      </div>
    </>
  )
}

export function mountPanel(program) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  host.style.setProperty('--ab-color', program.color)
  render(<App program={program} />, host.attachShadow({ mode: 'open' }))
}
