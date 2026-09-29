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
