import { useState, useRef, useEffect } from 'preact/hooks'
import { CONCURRENCY } from '../common/constants.js'
import { runPool, monthSpans } from '../common/search.js'
import { parseHotelCodes } from '../common/hotels.js'
import { useSearchRun, SearchSummary, SearchControls } from './searchRun.jsx'
import { MonthRangePicker } from './Calendar.jsx'
import { HotelCalendar, HotelTable } from './HotelResults.jsx'
import { HotelPicker } from './HotelPicker.jsx'
import { FilterBar } from './ResultsTable.jsx'

// Hotel award search: points per night for hotel codes × check-in months, one request per hotel and month.
// A hotel program ({ kind: 'hotel', ... }) provides:
//   onHotelSearch({ hotel, start, end }) → results (see common/hotels.js) or 'SESSION_EXPIRED';
//     start/end is an inclusive range of check-in dates within one month; throws when the request fails
//   currentHotel()     code of the hotel page the user is on, if any (preselected on first visit)
//   plus the hotel-finding functions listed in HotelPicker.jsx

function monthISO(offset) {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const storeKey = program => `award-buddy:${program.id}`
function initialForm(program) {
  let saved = {}
  try { saved = JSON.parse(localStorage.getItem(storeKey(program))) || {} } catch {}
  const current = program.currentHotel?.()
  // Older saves kept the codes as comma-separated text
  const hotels = Array.isArray(saved.hotels) ? saved.hotels.filter(c => typeof c === 'string') : parseHotelCodes(saved.hotels)
  return {
    // On a hotel page with nothing saved, start with that hotel
    hotels: hotels.length ? hotels : current ? [current] : [],
    fromMonth: monthISO(0), toMonth: monthISO(2),
  }
}
function initialNames(program) {
  try { const n = JSON.parse(localStorage.getItem(storeKey(program)))?.names; return n && typeof n === 'object' ? n : {} } catch { return {} }
}

export function HotelSearch({ program, session }) {
  const [form, setForm] = useState(() => initialForm(program))
  const set = patch => setForm(f => ({ ...f, ...patch }))
  // code → hotel name; kept out of form so a name arriving mid-search doesn't restart it
  const [names, setNames] = useState(() => initialNames(program))
  useEffect(() => {
    try { localStorage.setItem(storeKey(program), JSON.stringify({ hotels: form.hotels, names })) } catch {}
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

  const [results, setResults] = useState([])
  const [shown, setShown] = useState(null)  // { hotels, fromMonth, toMonth } of the last search, for the calendar
  const [date, setDate] = useState(null)    // calendar day picked to narrow the table
  const [noResults, setNoResults] = useState(false)
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
  // Room categories in the results (Hyatt prices several), cheapest first; likewise only while there's a choice
  const lowest = {}
  for (const r of results) if (r.roomType && !(lowest[r.roomType] <= r.points)) lowest[r.roomType] = r.points
  const roomTypes = Object.keys(lowest).sort((a, b) => lowest[a] - lowest[b])
  const activeRoomType = roomTypes.includes(roomType) ? roomType : null
  const visible = results.filter(r => (!activeRateType || r.rateType === activeRateType) && (!activeRoomType || r.roomType === activeRoomType))
  const pills = [
    rateTypes.length > 1 && { id: 'rateType', label: 'Reward', display: activeRateType && `${activeRateType} only`,
      items: [[null, 'Standard & Premium'], ['Standard', 'Standard only'], ['Premium', 'Premium only']] },
    roomTypes.length > 1 && { id: 'roomType', label: 'Room', display: activeRoomType,
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
        {pills.length > 0 && (
          <FilterBar filters={{ rateType: activeRateType, roomType: activeRoomType }} pills={pills}
            onChange={f => { setRateType(f.rateType); setRoomType(f.roomType); setDate(null) }} />
        )}
        {shown && results.length > 0 && <HotelCalendar results={visible} hotels={shown.hotels} names={names} fromMonth={shown.fromMonth} toMonth={shown.toMonth}
          selected={date} onSelect={setDate} />}
        <HotelTable results={visible} hotels={shown?.hotels ?? []} names={names} date={date} onClearDate={() => setDate(null)} />
        {noResults && <div class="ab-no-results">No award availability found.</div>}
      </div>
    </>
  )
}
