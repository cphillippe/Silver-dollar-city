import { useEffect, useRef, useState, type CSSProperties } from 'react'

/** How long the lock-in burst holds the board before takeaway chips. */
export const WIN_BURST_MS = 760

export const BURST_SPARKS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]

export function burstStyle(
  index: number,
  side: 'keep' | 'discard' | 'mid' = 'mid',
): CSSProperties {
  const dir = side === 'keep' ? -1 : side === 'discard' ? 1 : index % 2 === 0 ? -1 : 1
  const dx = dir * (36 + (index % 4) * 22)
  const dy = -64 - index * 16
  const spin = dir * (16 + index * 11)
  return {
    ['--dx' as string]: `${dx}px`,
    ['--dy' as string]: `${dy}px`,
    ['--spin' as string]: `${spin}deg`,
    animationDelay: `${index * 38}ms`,
  }
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Save immediately, then wait for the burst before swapping the screen. */
export function useJuiceHandoff(already = false) {
  const [ready, setReady] = useState(already)
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  function afterJuice() {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(
      () => setReady(true),
      prefersReducedMotion() ? 480 : WIN_BURST_MS,
    )
  }

  return { juiceDone: ready, afterJuice }
}
