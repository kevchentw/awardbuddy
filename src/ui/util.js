import { useEffect, useRef } from 'preact/hooks'

export const cx = (...names) => names.filter(Boolean).join(' ')
export const pad = n => String(n).padStart(2, '0')

// Calls onOutside when a click lands outside ref's element (composedPath sees through the shadow root)
export function useOutsideClick(ref, onOutside) {
  const cb = useRef(onOutside)
  cb.current = onOutside
  useEffect(() => {
    const handler = e => { if (ref.current && !e.composedPath().includes(ref.current)) cb.current() }
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [])
}

// Zone calendar files ({ cabin: { dates, routes } }, see ZoneCalendar.jsx) → calData for the open days:
// { date: { "NRT→LAX": { cabin: miles } } }, miles from milesFor(cabin, date) or 0 when unknown
export function zoneCalData(byCabin, route, milesFor) {
  const data = {}
  for (const [cabin, file] of Object.entries(byCabin)) {
    for (const r of file?.routes ?? []) {
      if (route && route !== `${r.from}⇄${r.to}`) continue
      for (const [key, states] of [[`${r.from}→${r.to}`, r.out], [`${r.to}→${r.from}`, r.back]]) {
        states.forEach((s, i) => {
          if (s < 2) return
          const date = file.dates[i]
          data[date] ??= {}
          data[date][key] = { ...data[date][key], [cabin]: milesFor?.(cabin, date) ?? 0 }
        })
      }
    }
  }
  return data
}
