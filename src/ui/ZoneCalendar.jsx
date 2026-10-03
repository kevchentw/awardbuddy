import { useState, useEffect } from 'preact/hooks'
import { CABIN_LABELS, CABIN_COLORS } from '../common/constants.js'
import { CalendarView, calToRows } from './Calendar.jsx'
import { ResultsTable } from './ResultsTable.jsx'
import { zoneCalData } from './util.js'

// Calendar mode for an airline award calendar published per zone (ANA): pick a zone, see the days with
// open seats on every route of the zone, on the usual calendar and results table.
// program.zoneCalendar: { zones, cabins, cabinsFor(zone), statuses, statusHint, note,
//   load(zone, cabin, status) → { dates, routes: [{ from, to, out, back }] } | null }
// Optional: chart(zone) → { cabin: [low, regular, high] }, chartUrl, miles(zone, cabin, date) → miles | null
// Day states: 3 wide open, 2 open, 1 tight / waitlisted, 0 unavailable; open means 2 or 3

// Selection kept in the host site's localStorage
const storeKey = program => `award-buddy:${program.id}:zonecal`
function loadSel(program) {
  try { return JSON.parse(localStorage.getItem(storeKey(program))) || {} } catch { return {} }
}

export function ZoneCalendar({ program }) {
  const zc = program.zoneCalendar
  const [sel, setSel] = useState(() => {
    const saved = loadSel(program)
    return {
      zone: zc.zones.some(z => z.value === saved.zone) ? saved.zone : '',
      cabins: Array.isArray(saved.cabins) ? saved.cabins.filter(c => zc.cabins.includes(c)) : [],
      status: zc.statuses.some(s => s.value === saved.status) ? saved.status : zc.statuses[0].value,
      route: typeof saved.route === 'string' ? saved.route : '',
    }
  })
  const set = patch => setSel(s => ({ ...s, ...patch }))
  useEffect(() => { try { localStorage.setItem(storeKey(program), JSON.stringify(sel)) } catch {} }, [sel])

  // No class picked means every class the zone has
  const allowed = sel.zone ? zc.cabinsFor(sel.zone) : zc.cabins
  const cabins = sel.cabins.filter(c => allowed.includes(c))
  const wanted = cabins.length ? cabins : allowed
  const toggleCabin = c => set({ cabins: sel.cabins.includes(c) ? sel.cabins.filter(x => x !== c) : [...sel.cabins, c] })

  const [files, setFiles] = useState(null)   // { cabin: parsed file | null }
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!sel.zone) { setFiles(null); return }
    let live = true
    setLoading(true)
    ;(async () => {
      const out = {}
      for (const c of wanted) out[c] = await zc.load(sel.zone, c, sel.status)
      if (live) { setFiles(out); setLoading(false) }
    })()
    return () => { live = false }
  }, [sel.zone, sel.status, wanted.join()])

  const loaded = files ? Object.values(files).filter(Boolean) : []
  const routes = [...new Set(loaded.flatMap(f => f.routes.map(r => `${r.from}⇄${r.to}`)))]
  const route = routes.includes(sel.route) ? sel.route : ''
  const calData = files ? zoneCalData(files, route, (c, date) => zc.miles?.(sel.zone, c, date)) : {}
  const chart = sel.zone && zc.chart?.(sel.zone)
  const allDates = loaded.flatMap(f => f.dates).sort()
  const fromMonth = allDates[0]?.slice(0, 7), toMonth = allDates.at(-1)?.slice(0, 7)
  const days = Object.keys(calData).length

  return (
    <div>
      <div class="ab-tip">💡 {zc.note}</div>
      <div class="ab-row">
        <div class="ab-field">
          <label>Zone</label>
          <select value={sel.zone} onChange={e => set({ zone: e.currentTarget.value, route: '' })}>
            <option value="">Please select</option>
            {zc.zones.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}
          </select>
        </div>
        <div class="ab-field">
          <label>Route</label>
          <select value={route} disabled={!routes.length} onChange={e => set({ route: e.currentTarget.value })}>
            <option value="">All routes</option>
            {routes.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div class="ab-row">
        <div class="ab-field">
          <label>Member status</label>
          <select value={sel.status} onChange={e => set({ status: e.currentTarget.value })}>
            {zc.statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {sel.status !== zc.statuses[0].value && <div class="ab-zc-hint">{zc.statusHint}</div>}
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 5 }}>Cabin (leave all off = any)</label>
        <div class="ab-cabins">
          {zc.cabins.map(c => (
            <button key={c} class="ab-cabin-btn" disabled={!allowed.includes(c)} onClick={() => toggleCabin(c)}
              style={cabins.includes(c) ? { background: CABIN_COLORS[c], color: '#fff', borderColor: 'transparent' } : undefined}>
              {CABIN_LABELS[c]}
            </button>
          ))}
        </div>
      </div>
      {chart && (
        <details class="ab-zc-chart" open>
          <summary>Required miles, one way between Japan and this zone</summary>
          <table class="ab-tbl">
            <thead><tr><th>Cabin</th><th>Low</th><th>Regular</th><th>High</th></tr></thead>
            <tbody>
              {zc.cabins.filter(c => chart[c]).map(c => (
                <tr key={c}>
                  <td style={{ color: CABIN_COLORS[c], fontWeight: 600 }}>{CABIN_LABELS[c]}</td>
                  {chart[c].map((m, i) => <td key={i}>{m.toLocaleString('en-US')}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          <div class="ab-zc-hint">Round trip is twice. The season is the departure day's; see <a href={zc.chartUrl} target="_blank">ANA's charts</a>.</div>
        </details>
      )}
      <div class="ab-status">
        {!sel.zone ? 'Pick a zone to see its open days.'
          : loading ? 'Loading…'
          : !loaded.length ? '⚠ Couldn\'t load the calendar. Try again in a moment.'
          : `${days} date(s) with open seats.`}
      </div>
      {!loading && days > 0 && <>
        <CalendarView calData={calData} fromMonth={fromMonth} toMonth={toMonth} />
        <ResultsTable results={calToRows(calData, fromMonth, toMonth)} />
      </>}
    </div>
  )
}
