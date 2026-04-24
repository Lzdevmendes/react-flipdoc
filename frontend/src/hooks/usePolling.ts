import { useEffect, useRef } from 'react'

export function usePolling(fn: () => Promise<any> | void, intervalMs = 2000, active = true) {
  const timerRef = useRef<number | null>(null)
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => {
    let mounted = true
    async function tick() {
      if (!mounted) return
      try { await fnRef.current() } catch (e) { /* ignore */ }
      if (mounted) timerRef.current = window.setTimeout(tick, intervalMs)
    }
    if (active) tick()
    return () => {
      mounted = false
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [intervalMs, active])
}
