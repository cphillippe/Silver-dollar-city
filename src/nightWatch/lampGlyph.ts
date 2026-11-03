import { TREE_LATE_CROSS, TREE_LATE_MAX, type LampPaths } from './upgradeTree.ts'

/**
 * Easy lamp mark. One row per step the player can buy.
 * n is deep path + short path + Bright. The top stage is those caps,
 * not a handwritten total. Add a row here if a later step should draw
 * a dot or a ring. The renderer only reads this table.
 */
const BRIGHT_STEPS = 1

/** Deep path cap + short path cap + the one Bright buy. */
export const LAMP_GLYPH_STEP_MAX = TREE_LATE_MAX + TREE_LATE_CROSS + BRIGHT_STEPS

export const LAMP_GLYPH_VIEW = 24

const CENTER = 12
const STUB = 5
const FULL = 10

export const LAMP_GLYPH_ARMS = ['up', 'right', 'down', 'left'] as const
export type LampGlyphArm = (typeof LAMP_GLYPH_ARMS)[number]

export type LampGlyphPiece =
  | { stage: 0; draw: 'dot' }
  | { stage: number; draw: 'stub' | 'grow'; arm: LampGlyphArm }
  | { stage: number; draw: 'dots' }
  | { stage: number; draw: 'arc'; quarter: 0 | 1 | 2 | 3 }

/**
 * The only stage table. Stages 1–8 match the buys a lamp can take today.
 * Rows after that are ready for a later tree bump. Add a row to draw the next piece.
 */
export const LAMP_GLYPH_STAGES: readonly LampGlyphPiece[] = [
  { stage: 0, draw: 'dot' },
  { stage: 1, draw: 'stub', arm: 'up' },
  { stage: 2, draw: 'stub', arm: 'right' },
  { stage: 3, draw: 'stub', arm: 'down' },
  { stage: 4, draw: 'stub', arm: 'left' },
  { stage: 5, draw: 'grow', arm: 'up' },
  { stage: 6, draw: 'grow', arm: 'right' },
  { stage: 7, draw: 'grow', arm: 'down' },
  { stage: 8, draw: 'grow', arm: 'left' },
  { stage: 9, draw: 'dots' },
  { stage: 10, draw: 'arc', quarter: 0 },
  { stage: 11, draw: 'arc', quarter: 1 },
  { stage: 12, draw: 'arc', quarter: 2 },
  { stage: 13, draw: 'arc', quarter: 3 },
]

/** Last row in the table. A bigger n stays on this stage. */
export const LAMP_GLYPH_TABLE_TOP = LAMP_GLYPH_STAGES.reduce((top, row) => Math.max(top, row.stage), 0)

const bought = LAMP_GLYPH_STAGES.filter((row) => row.stage > 0 && row.stage <= LAMP_GLYPH_STEP_MAX)
if (bought.length < LAMP_GLYPH_STEP_MAX) {
  throw new Error(`lamp glyph table is missing a row for one of the ${LAMP_GLYPH_STEP_MAX} buys`)
}

/** Sky blue, bright amber, and the quiet resting dot. None of these is the gold cue. */
export const LAMP_GLYPH_COLOR = {
  far: '#5eb6ff',
  strong: '#e98a3c',
  rest: 'rgba(255, 246, 232, 0.55)',
} as const

export type LampGlyphTone = keyof typeof LAMP_GLYPH_COLOR

function rank(value: number | undefined): number {
  if (!value || value < 0) return 0
  return Math.min(TREE_LATE_MAX, Math.floor(value))
}

/** Steps bought on this lamp: both paths, plus Bright when it is on. */
export function lampUpgradeCount(paths: LampPaths): number {
  const bright = (paths.bright ?? 0) >= 1 ? 1 : 0
  return rank(paths.far) + rank(paths.strong) + bright
}

/** Stage the table draws. Past the last row, the mark stays on that row. */
export function lampGlyphStage(paths: LampPaths): number {
  return clampGlyphStage(lampUpgradeCount(paths))
}

export function clampGlyphStage(stage: number): number {
  const at = Math.floor(stage)
  if (!Number.isFinite(at) || at <= 0) return 0
  return Math.min(at, LAMP_GLYPH_TABLE_TOP)
}

/**
 * Stroke follows the path with the higher rank.
 * A tie (both paths equal and above zero) uses Strong, the path a spender opens first.
 */
export function lampGlyphTone(paths: LampPaths): LampGlyphTone {
  const far = rank(paths.far)
  const strong = rank(paths.strong)
  if (far > strong) return 'far'
  if (strong > 0) return 'strong'
  return 'rest'
}

/** Path for one arm. The stub is the inner half. Grow is only the new outer half. */
export function lampGlyphArmPath(arm: LampGlyphArm, draw: 'stub' | 'grow'): string {
  if (arm === 'up') {
    return draw === 'stub'
      ? `M${CENTER} ${CENTER} V${CENTER - STUB}`
      : `M${CENTER} ${CENTER - STUB} V${CENTER - FULL}`
  }
  if (arm === 'right') {
    return draw === 'stub'
      ? `M${CENTER} ${CENTER} H${CENTER + STUB}`
      : `M${CENTER + STUB} ${CENTER} H${CENTER + FULL}`
  }
  if (arm === 'down') {
    return draw === 'stub'
      ? `M${CENTER} ${CENTER} V${CENTER + STUB}`
      : `M${CENTER} ${CENTER + STUB} V${CENTER + FULL}`
  }
  return draw === 'stub'
    ? `M${CENTER} ${CENTER} H${CENTER - STUB}`
    : `M${CENTER - STUB} ${CENTER} H${CENTER - FULL}`
}

/** One corner of the ring, clockwise from the top. */
export function lampGlyphArcPath(quarter: number): string {
  const ring = [
    [CENTER, CENTER - 11],
    [CENTER + 11, CENTER],
    [CENTER, CENTER + 11],
    [CENTER - 11, CENTER],
    [CENTER, CENTER - 11],
  ]
  const at = ((Math.floor(quarter) % 4) + 4) % 4
  const [x1, y1] = ring[at]
  const [x2, y2] = ring[at + 1]
  return `M${x1} ${y1} A11 11 0 0 1 ${x2} ${y2}`
}

const GAP = 4.6

/** Four dots in the diagonal gaps, clear of the arms. */
export function lampGlyphGapDots(): ReadonlyArray<{ cx: number; cy: number }> {
  return [
    { cx: CENTER + GAP, cy: CENTER - GAP },
    { cx: CENTER + GAP, cy: CENTER + GAP },
    { cx: CENTER - GAP, cy: CENTER + GAP },
    { cx: CENTER - GAP, cy: CENTER - GAP },
  ]
}

export interface LampGlyphMark {
  key: string
  stage: number
  draw: 'dot' | 'stroke' | 'gap'
  d?: string
  cx?: number
  cy?: number
  r?: number
}

/** Every mark painted at this stage. Dots at 9 count as four. Later rows only append. */
export function lampGlyphMarks(stage: number): LampGlyphMark[] {
  const at = clampGlyphStage(stage)
  const rows = at <= 0 ? LAMP_GLYPH_STAGES.filter((row) => row.draw === 'dot') : LAMP_GLYPH_STAGES.filter((row) => row.stage > 0 && row.stage <= at)
  const marks: LampGlyphMark[] = []
  for (const row of rows) {
    if (row.draw === 'dot') {
      marks.push({ key: 'dot', stage: 0, draw: 'dot', cx: CENTER, cy: CENTER, r: 1.35 })
    } else if (row.draw === 'stub' || row.draw === 'grow') {
      marks.push({ key: `${row.draw}-${row.arm}`, stage: row.stage, draw: 'stroke', d: lampGlyphArmPath(row.arm, row.draw) })
    } else if (row.draw === 'dots') {
      lampGlyphGapDots().forEach((dot, index) => {
        marks.push({ key: `gap-${index}`, stage: row.stage, draw: 'gap', cx: dot.cx, cy: dot.cy, r: 1.15 })
      })
    } else if (row.draw === 'arc') {
      marks.push({ key: `arc-${row.quarter}`, stage: row.stage, draw: 'stroke', d: lampGlyphArcPath(row.quarter) })
    }
  }
  return marks
}
