import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'

/** How long the lock-in burst holds the board before takeaway chips. */
export const WIN_BURST_MS = 1100

export const BURST_SPARKS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

export function burstStyle(
  index: number,
  side: 'keep' | 'discard' | 'mid' = 'mid',
): CSSProperties {
  const dir = side === 'keep' ? -1 : side === 'discard' ? 1 : index % 2 === 0 ? -1 : 1
  const dx = dir * (52 + (index % 4) * 34)
  const dy = -110 - index * 28
  const spin = dir * (28 + index * 18)
  return {
    ['--dx' as string]: `${dx}px`,
    ['--dy' as string]: `${dy}px`,
    ['--spin' as string]: `${spin}deg`,
    animationDelay: `${index * 42}ms`,
  }
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Wait for the burst, then swap to takeaway. Progress saves after juiceDone. */
export function useJuiceHandoff(already = false) {
  const [ready, setReady] = useState(already)
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const afterJuice = useCallback(() => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(
      () => setReady(true),
      prefersReducedMotion() ? 900 : WIN_BURST_MS,
    )
  }, [])

  return { juiceDone: ready, afterJuice }
}
