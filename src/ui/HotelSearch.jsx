import { useState, useRef, useEffect } from 'preact/hooks'
import { CONCURRENCY } from '../common/constants.js'
import { runPool, monthSpans, restoreMonths } from '../common/search.js'
import { parseHotelCodes } from '../common/hotels.js'
import { useSearchRun, useSavedResults, SearchSummary, SearchControls } from './searchRun.jsx'
import { MonthRangePicker } from './Calendar.jsx'
import { HotelCalendar, HotelTable } from './HotelResults.jsx'
import { HotelPicker } from './HotelPicker.jsx'

// Hotel award search: points per night for hotel codes × check-in months, one request per hotel and month.
// A hotel program ({ kind: 'hotel', ... }) provides:
//   onHotelSearch({ hotel, start, end }) → results (see common/hotels.js) or 'SESSION_EXPIRED';
//     start/end is an inclusive range of check-in dates within one month; throws when the request fails
//   currentHotel()     code of the hotel page the user is on, if any (preselected on first visit)
//   plus the hotel-finding functions listed in HotelPicker.jsx
// It can also offer search modes, picked from a dropdown: modes: [{ code, name, program, tip?, tipLink? }],
// each mode being a hotel program of its own over the same hotel codes: switching keeps the hotels and months
// (one saved search for all modes) and clears the results
//   pageMode()         mode the page the user is on calls for, if any (else the last one used)

const storeKey = id => `award-buddy:${id}`
function initialForm(program, storeId, carried) {
  if (carried) return carried
  let saved = {}
  try { saved = JSON.parse(localStorage.getItem(storeKey(storeId))) || {} } catch {}
  const current = program.currentHotel?.()
  // Older saves kept the codes as comma-separated text
  const hotels = Array.isArray(saved.hotels) ? saved.hotels.filter(c => typeof c === 'string') : parseHotelCodes(saved.hotels)
  return {
    // On a hotel page with nothing saved, start with that hotel
    hotels: hotels.length ? hotels : current ? [current] : [],
    ...restoreMonths(saved.fromMonth, saved.toMonth),
  }
}
function initialNames(storeId) {
  try { const n = JSON.parse(localStorage.getItem(storeKey(storeId)))?.names; return n && typeof n === 'object' ? n : {} } catch { return {} }
}

const modeKey = program => `award-buddy:${program.id}:mode`
function initialMode(program) {
  let saved
  try { saved = localStorage.getItem(modeKey(program)) } catch {}
  const valid = code => program.modes.some(m => m.code === code)
  const page = program.pageMode?.()
  return valid(page) ? page : valid(saved) ? saved : program.modes[0].code
}

export function HotelSearch({ program, session }) {
  if (!program.modes) return <HotelSearchForm program={program} session={session} />
  return <HotelSearchModes program={program} session={session} />
}

function HotelSearchModes({ program, session }) {
  const [mode, setMode] = useState(() => initialMode(program))
  const query = useRef(null)  // the form's hotels and months, carried over to the next mode
  useEffect(() => { try { localStorage.setItem(modeKey(program), mode) } catch {} }, [mode])
  const active = program.modes.find(m => m.code === mode)
  return (
    <>
      <div class="ab-row">
        <div class="ab-field">
          <label>{program.modeLabel ?? 'Search mode'}</label>
          <select value={mode} onChange={e => setMode(e.currentTarget.value)}>
            {program.modes.map(m => <option key={m.code} value={m.code}>{m.name}</option>)}
          </select>
        </div>
      </div>
      {active.tip && (
        <div class="ab-tip">💡 {active.tip}{active.tipLink && <> <a href={active.tipLink.url} target="_blank" style={{ color: 'var(--ab-color)' }}>{active.tipLink.text}</a></>}</div>
      )}
      {/* Keyed so a mode switch starts afresh (no results from the other mode), from the same query */}
      <HotelSearchForm key={active.code} program={active.program} session={session} storeId={program.id}
        carried={query.current} onFormChange={f => { query.current = f }} />
    </>
  )
}

// storeId: where the search is saved (a program with modes shares one); carried: form to start from instead
// of the saved one; onFormChange(form): told of every change
function HotelSearchForm({ program, session, storeId = program.id, carried, onFormChange }) {
  const [form, setForm] = useState(() => initialForm(program, storeId, carried))
  const set = patch => setForm(f => ({ ...f, ...patch }))
  // code → hotel name; kept out of form so a name arriving mid-search doesn't restart it
  const [names, setNames] = useState(() => initialNames(storeId))
  useEffect(() => {
    try { localStorage.setItem(storeKey(storeId), JSON.stringify({ hotels: form.hotels, fromMonth: form.fromMonth, toMonth: form.toMonth, names })) } catch {}
    onFormChange?.(form)
  }, [form, names])
  // Look up names for hotels added by code (or saved before names existed)
  useEffect(() => {
    if (!program.hotelName) return
    for (const code of form.hotels.filter(c => !names[c])) {
      program.hotelName(code).then(name => name && setNames(n => ({ ...n, [code]: name })), () => {})
    }
  }, [form.hotels])

  const run = useSearchRun(form)
  const { ctl, setStatus, setProgress } = run
  // A search still running when the form goes away (mode switch) stops at its next request
  useEffect(() => () => { ctl.stop = true; ctl.rerun = false }, [])

  const [results, setResults] = useState([])
  const [shown, setShown] = useState(null)  // { hotels, fromMonth, toMonth } of the last search, for the calendar
  const [date, setDate] = useState(null)    // calendar day picked to narrow the table
  const [noResults, setNoResults] = useState(false)
  // program.id rather than storeId: each search mode keeps its own results
  useSavedResults(program.id, run, { results, shown, noResults }, saved => {
    setResults(saved.results ?? []); setShown(saved.shown ?? null); setNoResults(!!saved.noResults)
  })
  const [rateType, setRateType] = useState(null)  // 'Standard' / 'Premium' reward, for the calendar and table
  const [roomType, setRoomType] = useState(null)  // room category (Hyatt: 'Standard Suite', …), likewise
  const latest = useRef()
  latest.current = form

  const hotels = form.hotels
  const spans = form.fromMonth && form.toMonth ? monthSpans(form.fromMonth, form.toMonth) : []

  async function search() {
    if (run.stopIfRunning()) return
    const f = latest.current
    const codes = f.hotels
    const spans = monthSpans(f.fromMonth, f.toMonth)
    if (!codes.length || !spans.length) { setStatus('⚠ Fill in all fields'); return }
    run.begin()
    setNoResults(false); setResults([]); setDate(null); setStatus('')
    setShown({ hotels: codes, fromMonth: f.fromMonth, toMonth: f.toMonth })

    const total = spans.length * codes.length
    let done = 0, failed = 0
    const all = []
    const tasks = spans.flatMap(({ start, end }) => codes.map(hotel => async () => {
      if (ctl.stop) return
      let result
      try {
        result = await program.onHotelSearch({ hotel, start, end })
      } catch { failed++ }
      if (result === 'SESSION_EXPIRED') {
        ctl.stop = true
        setStatus(program.expiredMessage ?? '⚠ Session expired — refresh the page and try again')
        return
      }
      done++
      setProgress(done / total * 100)
      setStatus(`${done} / ${total} done`)
      all.push(...(result || []))
      setResults([...all])
    }))

    await runPool(tasks, CONCURRENCY)

    run.end()
    if (ctl.rerun) { ctl.rerun = false; search(); return }
    if (!ctl.stop) {
      setProgress(null)
      const failNote = failed ? ` ${failed} request(s) failed.` : ''
      setStatus(`Done in ${run.elapsed()}. Found ${all.length} rate(s) across ${total} request(s).${failNote}`)
      if (!all.length) setNoResults(true)
    } else if (all.length) setStatus(s => `${s} (${all.length} found so far)`)
  }

  // Reward types in the results (Hilton prices Standard and Premium); the filter only applies while they're there
  const rateTypes = ['Standard', 'Premium'].filter(t => results.some(r => r.rateType === t))
  const activeRateType = rateTypes.includes(rateType) ? rateType : null
  // Room categories in the results (Hyatt prices several), cheapest first; likewise only while there's a choice.
  // Taken from the chosen reward type's rates so the two filters never leave nothing (and no filter bar) to show
  const lowest = {}
  for (const r of results) if (r.roomType && (!activeRateType || r.rateType === activeRateType) && !(lowest[r.roomType] <= r.points)) lowest[r.roomType] = r.points
  const roomTypes = Object.keys(lowest).sort((a, b) => lowest[a] - lowest[b])
  const activeRoomType = roomTypes.includes(roomType) ? roomType : null
  const visible = results.filter(r => (!activeRateType || r.rateType === activeRateType) && (!activeRoomType || r.roomType === activeRoomType))
  const pills = [
    rateTypes.length > 1 && { id: 'rateType', label: 'Reward', display: activeRateType && `${activeRateType} only`,
      items: [[null, 'Standard & Premium'], ['Standard', 'Standard only'], ['Premium', 'Premium only']] },
    (roomTypes.length > 1 || activeRoomType) && { id: 'roomType', label: 'Room', display: activeRoomType,
      items: [[null, 'All rooms'], ...roomTypes.map(t => [t, t])] },
  ].filter(Boolean)

  const summary = [
    hotels.map(c => names[c] ?? c).join(', ') || '?',
    `${form.fromMonth} – ${form.toMonth}`,
  ].join(' · ')

  return (
    <>
      {run.collapsed ? <SearchSummary run={run} text={summary} /> : <>
      <div class="ab-row">
        <div class="ab-field">
          <label>Hotels</label>
          <HotelPicker program={program} value={form.hotels} names={names} onChange={(hotels, n) => { set({ hotels }); setNames(n) }} />
        </div>
      </div>
      <div class="ab-row">
        <div class="ab-field"><label>Months (click start, then end)</label>
          <MonthRangePicker from={form.fromMonth} to={form.toMonth} onChange={(fromMonth, toMonth) => set({ fromMonth, toMonth })} /></div>
      </div>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 6, minHeight: 14 }}>
        {hotels.length > 0 && spans.length > 0 && `~${hotels.length * spans.length} request(s) (${hotels.length} hotel(s) × ${spans.length} month(s))`}
      </div>
      </>}
      <SearchControls run={run} session={session} onSearch={search} />
      <div>
        {shown && results.length > 0 && <HotelCalendar results={visible} hotels={shown.hotels} names={names} fromMonth={shown.fromMonth} toMonth={shown.toMonth}
          selected={date} onSelect={setDate} />}
        <HotelTable results={visible} hotels={shown?.hotels ?? []} names={names} date={date} onClearDate={() => setDate(null)}
          sharedPills={pills} shared={{ rateType: activeRateType, roomType: activeRoomType }}
          onSharedChange={f => { setRateType(f.rateType); setRoomType(f.roomType); setDate(null) }} />
        {noResults && <div class="ab-no-results">No award availability found.</div>}
      </div>
    </>
  )
}
