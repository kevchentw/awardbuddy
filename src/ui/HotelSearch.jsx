import { useState, useRef, useEffect } from 'preact/hooks'
import { CONCURRENCY } from '../common/constants.js'
import { runPool, monthSpans } from '../common/search.js'
import { parseHotelCodes } from '../common/hotels.js'
import { useSearchRun, SearchSummary, SearchControls } from './searchRun.jsx'
import { MonthRangePicker } from './Calendar.jsx'
import { HotelCalendar, HotelTable } from './HotelResults.jsx'
import { watchHotelCards } from './hotelButtons.js'

// Hotel award search: points per night for hotel codes × check-in months, one request per hotel and month.
// A hotel program ({ kind: 'hotel', ... }) provides:
//   onHotelSearch({ hotel, start, end }) → results (see common/hotels.js) or 'SESSION_EXPIRED';
//     start/end is an inclusive range of check-in dates within one month; throws when the request fails
//   currentHotel()     code of the hotel page the user is on, if any
//   hotelPlaceholder   example codes for the input
//   hotelCards         where to add a "Search in Award Buddy" button on the site's results (see hotelButtons.js)

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
  const hotels = typeof saved.hotels === 'string' ? saved.hotels : ''
  return {
    // On a hotel page with nothing saved, start with that hotel
    hotels: hotels || current || '',
    fromMonth: monthISO(0), toMonth: monthISO(2),
    names: saved.names && typeof saved.names === 'object' ? saved.names : {},  // code → hotel name, from the site's cards
  }
}

export function HotelSearch({ program, session, openPanel }) {
  const [form, setForm] = useState(() => initialForm(program))
  const set = patch => setForm(f => ({ ...f, ...patch }))
  useEffect(() => {
    const { hotels, names } = form
    try { localStorage.setItem(storeKey(program), JSON.stringify({ hotels, names })) } catch {}
  }, [form])

  const run = useSearchRun(form)
  const { ctl, setStatus, setProgress } = run

  // A card button on the site adds that hotel to the form and opens the panel
  useEffect(() => program.hotelCards && watchHotelCards(program.hotelCards, program.color, (code, name) => {
    setForm(f => {
      const codes = parseHotelCodes(f.hotels)
      return {
        ...f,
        hotels: codes.includes(code) ? f.hotels : [...codes, code].join(', '),
        names: name ? { ...f.names, [code]: name } : f.names,
      }
    })
    run.setCollapsed(false)
    openPanel()
  }), [])

  const [results, setResults] = useState([])
  const [shown, setShown] = useState(null)  // { hotels, fromMonth, toMonth } of the last search, for the calendar
  const [date, setDate] = useState(null)    // calendar day picked to narrow the table
  const [noResults, setNoResults] = useState(false)
  const latest = useRef()
  latest.current = form

  const hotels = parseHotelCodes(form.hotels)
  const spans = form.fromMonth && form.toMonth ? monthSpans(form.fromMonth, form.toMonth) : []
  const current = program.currentHotel?.()

  async function search() {
    if (run.stopIfRunning()) return
    const f = latest.current
    const codes = parseHotelCodes(f.hotels)
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
      all.push(...(result || []).map(r => ({ hotelName: f.names[r.hotel], ...r })))
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

  const summary = [
    hotels.join(', ') || '?',
    `${form.fromMonth} – ${form.toMonth}`,
  ].join(' · ')

  return (
    <>
      {run.collapsed ? <SearchSummary run={run} text={summary} /> : <>
      <div class="ab-row">
        <div class="ab-field">
          <label>
            Hotel codes (comma separated)
            {current && !hotels.includes(current) && (
              <button class="ab-link-btn" onClick={() => set({ hotels: [...hotels, current].join(', ') })}>+ Add this hotel ({current})</button>
            )}
          </label>
          <input type="text" placeholder={program.hotelPlaceholder ?? 'Hotel codes'} value={form.hotels}
            onInput={e => set({ hotels: e.currentTarget.value })} />
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
        {shown && results.length > 0 && <HotelCalendar results={results} hotels={shown.hotels} fromMonth={shown.fromMonth} toMonth={shown.toMonth}
          selected={date} onSelect={setDate} />}
        <HotelTable results={results} hotels={shown?.hotels ?? []} date={date} onClearDate={() => setDate(null)} />
        {noResults && <div class="ab-no-results">No award availability found.</div>}
      </div>
    </>
  )
}
