import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'

/** How long the lock-in burst holds the board before takeaway chips. */
export const WIN_BURST_MS = 1100

export const BURST_SPARKS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

export const GEM_BURST = [0, 1, 2, 3, 4, 5, 6, 7]

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

let gemAudio: AudioContext | null = null

/** Short candy pop — fail quiet if the browser blocks audio. */
export function playGemPop(kind: 'find' | 'win' | 'miss' = 'find') {
  if (typeof window === 'undefined' || prefersReducedMotion()) return
  try {
    gemAudio ??= new AudioContext()
    const ctx = gemAudio
    void ctx.resume()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = kind === 'miss' ? 'sawtooth' : 'triangle'
    const start = kind === 'win' ? 660 : kind === 'miss' ? 180 : 880
    const end = kind === 'win' ? 1320 : kind === 'miss' ? 90 : 240
    osc.frequency.setValueAtTime(start, now)
    osc.frequency.exponentialRampToValueAtTime(end, now + (kind === 'win' ? 0.28 : 0.16))
    gain.gain.setValueAtTime(kind === 'miss' ? 0.04 : 0.11, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + (kind === 'win' ? 0.32 : 0.18))
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.34)
  } catch {
    /* autoplay / WebAudio can fail — juice still reads as motion */
  }
  try {
    if (kind !== 'miss') window.navigator.vibrate?.(kind === 'win' ? [18, 40, 24] : 16)
  } catch {
    /* vibration is optional */
  }
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
