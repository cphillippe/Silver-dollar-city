/**
 * Live Easy cue ring (`walker-cue-pulse` in defend.css).
 * 0.9s ease-in-out, opacity 0.85 at the ends and 0.3 at the middle.
 * A tap lands only while that pulse reads as glowing, after a human
 * reaction, and not faster than once every 0.3s.
 * The pulse does not change with health. Low HP uses the same windows.
 */

export const CUE_PULSE_S = 0.9
export const CUE_PULSE_BRIGHT = 0.85
export const CUE_PULSE_DIM = 0.3
/** Midpoint of the pulse. At or above this, the ring is the glow window. */
export const CUE_GLOW_AT = (CUE_PULSE_BRIGHT + CUE_PULSE_DIM) / 2
/** Middle of a 250–350ms reaction. */
export const CUE_REACT_S = 0.3
export const CUE_TAP_GAP_S = 0.3

/** CSS ease-in-out is cubic-bezier(0.42, 0, 0.58, 1). */
function easeInOut(x: number): number {
  const x1 = 0.42
  const x2 = 0.58
  let t = Math.min(1, Math.max(0, x))
  for (let i = 0; i < 8; i += 1) {
    const u = 1 - t
    const xt = 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t
    const dx = 3 * u * u * x1 + 6 * u * t * (x2 - x1) + 3 * t * t * (1 - x2)
    if (Math.abs(dx) < 1e-8) break
    t = Math.min(1, Math.max(0, t - (xt - x) / dx))
  }
  const u = 1 - t
  return 3 * u * t * t + t * t * t
}

/** Opacity of the live cue ring at `elapsed` seconds from when the face appeared. */
export function cuePulseOpacity(elapsed: number): number {
  if (!(elapsed >= 0)) return CUE_PULSE_BRIGHT
  const cycle = elapsed % CUE_PULSE_S
  const half = CUE_PULSE_S / 2
  const u = cycle < half ? cycle / half : (cycle - half) / half
  const eased = easeInOut(u)
  if (cycle < half) return CUE_PULSE_BRIGHT + (CUE_PULSE_DIM - CUE_PULSE_BRIGHT) * eased
  return CUE_PULSE_DIM + (CUE_PULSE_BRIGHT - CUE_PULSE_DIM) * eased
}

export function cueGlowOpen(elapsed: number, at = CUE_GLOW_AT): boolean {
  return cuePulseOpacity(elapsed) >= at
}

/** Share of samples inside the glow, from `from` to `to` seconds. */
export function cueGlowDuty(from: number, to: number): number {
  const start = Math.max(0, from)
  const end = Math.max(start, to)
  if (end <= start) return 0
  const dt = 1 / 60
  let open = 0
  let samples = 0
  for (let time = start; time < end; time += dt) {
    samples += 1
    if (cueGlowOpen(time)) open += 1
  }
  return samples ? open / samples : 0
}

export interface CueTapClock {
  wasOpen: boolean
  nextAt: number
  lastTap: number
  windows: number
  skip: boolean
}

export function cueTapClock(): CueTapClock {
  return { wasOpen: false, nextAt: Infinity, lastTap: -1, windows: 0, skip: false }
}

/**
 * One sample of the human glow tapper.
 * `miss` above 0 drops every other window (a 50% miss when `miss` is 0.5).
 * Returns true on the sample where the finger lands.
 */
export function cueTapAt(
  clock: CueTapClock,
  elapsed: number,
  react = CUE_REACT_S,
  gap = CUE_TAP_GAP_S,
  miss = 0,
): boolean {
  const open = cueGlowOpen(elapsed)
  if (open && !clock.wasOpen) {
    clock.windows += 1
    clock.skip = miss > 0 && clock.windows % 2 === 0
    clock.nextAt = clock.skip ? Infinity : elapsed + react
  }
  if (!open) clock.nextAt = Infinity
  clock.wasOpen = open
  if (clock.skip || !open) return false
  if (elapsed + 1e-9 < clock.nextAt) return false
  if (elapsed - clock.lastTap < gap - 1e-9) return false
  clock.lastTap = elapsed
  clock.nextAt = elapsed + gap
  return true
}

/** How many glow taps land in `seconds`, stepped like the live sim (60Hz). */
export function cueGlowTaps(seconds: number, react = CUE_REACT_S, gap = CUE_TAP_GAP_S, miss = 0): number {
  const clock = cueTapClock()
  const dt = 1 / 60
  let taps = 0
  const end = Math.max(0, seconds)
  for (let time = 0; time < end; time += dt) {
    if (cueTapAt(clock, time, react, gap, miss)) taps += 1
  }
  return taps
}
