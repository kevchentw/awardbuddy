import { useState, useRef, useEffect } from 'preact/hooks'

// Search lifecycle shared by the flight and hotel forms: start/stop, re-run when the inputs change
// mid-search, status line, progress bar and elapsed time.
// The search loop checks run.ctl.stop between requests; ctl.rerun means "start again once stopped".
export function useSearchRun(form) {
  const [searching, setSearching] = useState(false)
  const [btnLabel, setBtnLabel] = useState(null)  // 'Stopping…' / 'Restarting…' override while searching
  const [status, setStatus] = useState('')
  const [progress, setProgress] = useState(null)  // 0–100, null hides the bar
  const [collapsed, setCollapsed] = useState(false)  // form folds to a one-line summary once a search starts
  const ctl = useRef({ searching: false, stop: false, rerun: false }).current

  // Editing inputs mid-search aborts and re-runs with the new values
  useEffect(() => {
    if (!ctl.searching) return
    ctl.rerun = true; ctl.stop = true
    setBtnLabel('Restarting…')
  }, [form])

  return {
    ctl, searching, btnLabel, status, setStatus, progress, setProgress, collapsed, setCollapsed,
    // Returns true when the click should stop the running search instead of starting one
    stopIfRunning() {
      if (!ctl.searching) return false
      ctl.stop = true; ctl.rerun = false; setBtnLabel('Stopping…')
      return true
    },
    begin() {
      ctl.searching = true; ctl.stop = false; ctl.t0 = Date.now()
      setSearching(true); setBtnLabel(null); setProgress(0); setCollapsed(true)
    },
    end() {
      ctl.searching = false
      setSearching(false); setBtnLabel(null)
    },
    // Wall-clock time since begin(), e.g. "8.4s" or "2m 05s"
    elapsed() {
      const sec = (Date.now() - ctl.t0) / 1000
      return sec < 60 ? `${sec.toFixed(1)}s` : `${Math.floor(sec / 60)}m ${String(Math.floor(sec % 60)).padStart(2, '0')}s`
    },
  }
}

// Last search's results in this tab's sessionStorage so a page reload doesn't lose them.
// state: what to save (plain JSON); restore(saved): puts it back when the page loads (not on a later
// remount, e.g. a hotel mode switch, which starts with no results).
// Saved whenever a search isn't running, once one has run in this page (a stopped search keeps what it found)
const restoredKeys = new Set()
export function useSavedResults(id, run, state, restore) {
  const key = `award-buddy:${id}:results`
  useEffect(() => {
    if (restoredKeys.has(key)) return
    restoredKeys.add(key)
    let saved
    try { saved = JSON.parse(sessionStorage.getItem(key)) } catch {}
    if (!saved?.state) return
    restore(saved.state)
    const at = new Date(saved.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    run.setStatus(`Showing results of the last search (${at}). Search again to refresh.`)
  }, [])
  useEffect(() => {
    if (run.searching || !run.ctl.t0) return
    try { sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), state })) } catch {}
  }, [run.searching, ...Object.values(state)])
}

// Collapsed-form summary line with an Edit button
export function SearchSummary({ run, text }) {
  return (
    <div class="ab-summary">
      <span>{text}</span>
      <button onClick={() => run.setCollapsed(false)}>Edit</button>
    </div>
  )
}

// Search/Stop button, status line and progress bar
export function SearchControls({ run, session, onSearch }) {
  return (
    <>
      <button class="ab-search-btn" disabled={!session.ready && !run.searching} onClick={onSearch}>
        {run.btnLabel ?? (run.searching ? 'Stop' : 'Search')}
      </button>
      <div class="ab-status">{run.status}</div>
      {run.progress !== null && <div class="ab-progress"><div class="ab-progress-bar" style={{ width: `${run.progress}%` }} /></div>}
    </>
  )
}
