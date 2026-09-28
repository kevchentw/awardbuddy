import { useState } from 'preact/hooks'
import { addRecent } from '../common/search.js'

// Past searches per program (latest first) in the host site's localStorage. A query is the form's
// inputs as plain JSON; add(query) is called as each search starts
export function useRecentSearches(id) {
  const key = `award-buddy:${id}:recent`
  const [list, setList] = useState(() => {
    try { const l = JSON.parse(localStorage.getItem(key)); return Array.isArray(l) ? l : [] } catch { return [] }
  })
  const save = update => setList(l => {
    const next = update(l)
    try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
    return next
  })
  return { list, add: query => save(l => addRecent(l, query)), clear: () => save(() => []) }
}

// Dropdown of past searches; picking one calls onPick(query) (which fills the form and searches)
export function RecentSearches({ recent, label, onPick }) {
  if (!recent.list.length) return null
  return (
    <div class="ab-row">
      <div class="ab-field">
        <select value="" onChange={e => {
          const v = e.currentTarget.value
          e.currentTarget.value = ''
          if (v === 'clear') recent.clear()
          else if (v !== '') onPick(recent.list[+v])
        }}>
          <option value="">↻ Recent searches ({recent.list.length})</option>
          {recent.list.map((q, i) => <option key={i} value={i}>{label(q)}</option>)}
          <option value="clear">✕ Clear recent searches</option>
        </select>
      </div>
    </div>
  )
}
