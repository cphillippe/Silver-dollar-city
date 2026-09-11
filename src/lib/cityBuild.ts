import { STREET_LIGHTS } from '../content/links.ts'
import {
  CITY_PLOTS,
  nextPlotId,
  plotFill,
  plotStage,
  type CityFills,
  type CityPlotId,
  type CitySnapshot,
  type CityStage,
} from './city.ts'
import { PLOT_IDEAS, mindMapHasLit, streetLinked } from './mindMap.ts'
import type { ProgressState } from '../types.ts'

/** Four visible building looks. 0 is an empty lot. */
export const TIER_MAX = 4

export type CityBuilt = Record<CityPlotId, number>

const STREET_LOTS: CityPlotId[] = ['porch', 'hollow', 'bench']

export const TIER_NAME: Record<number, { hard: string; easy: string }> = {
  0: { hard: 'Lot', easy: 'Empty lot' },
  1: { hard: 'Timber', easy: 'Wood up' },
  2: { hard: 'Raised', easy: 'House up' },
  3: { hard: 'Furnished', easy: 'Rooms in' },
  4: { hard: 'Lit', easy: 'Lamps on' },
}

export const TIER_JOB: Record<number, { hard: string; easy: string }> = {
  0: {
    hard: 'Nothing stands yet. Learn on this street, then raise timber.',
    easy: 'No house yet. Learn here, then put wood up.',
  },
  1: {
    hard: 'The lot is yours. Walk it. The keeper is staking the ground.',
    easy: 'You can walk this place. The person is waiting.',
  },
  2: {
    hard: 'Walls and roof. The keeper lives here. The first idea can light.',
    easy: 'The house stands. The person lives here. One idea can light.',
  },
  3: {
    hard: 'Rooms for more ideas. Dig deeper opens on lines you have kept.',
    easy: 'More rooms. You can Read more on lines you kept.',
  },
  4: {
    hard: 'Lamps hold. Tap a lit idea to say the line again.',
    easy: 'Lamps are on. Tap a lit idea to say it again.',
  },
}

export function emptyCityBuilt(): CityBuilt {
  return {
    porch: 1,
    hollow: 0,
    bench: 0,
    observatory: 0,
    gate: 0,
    lookout: 0,
    journal: 0,
    lamps: 0,
  }
}

export function stageFromTier(tier: number): CityStage {
  if (tier <= 0) return 'empty'
  if (tier === 1) return 'scaffold'
  if (tier >= 4) return 'lit'
  return 'built'
}

function heldOnLot(id: CityPlotId, progress: ProgressState): boolean {
  const known = PLOT_IDEAS[id] ?? []
  const held = progress.held ?? []
  return known.some((item) => held.includes(item))
}

function streetFurnish(id: CityPlotId, progress: ProgressState): boolean {
  return STREET_LOTS.includes(id) && streetLinked(progress)
}

/**
 * Highest look this lot has *earned* by learning.
 * Walks, holds, Link triples, and journal pages — never payment.
 */
export function earnedTier(id: CityPlotId, progress: ProgressState): number {
  const stage = plotStage(id, progress)
  const fill = plotFill(id, progress)
  if (stage === 'empty') return 0
  if (stage === 'scaffold') return 1
  if (stage === 'lit') return 4
  if (id === 'journal' || id === 'lamps') return fill >= 8 ? 3 : 2
  if (fill >= 2) return 3
  if (streetFurnish(id, progress)) return 3
  if (heldOnLot(id, progress)) return 3
  return 2
}

export function snapshotCityBuilt(progress: ProgressState): CityBuilt {
  const next = emptyCityBuilt()
  for (const plot of CITY_PLOTS) {
    next[plot.id] = earnedTier(plot.id, progress)
  }
  return next
}

export function appliedTier(id: CityPlotId, progress: ProgressState): number {
  const map = progress.cityBuilt
  if (!map) return earnedTier(id, progress)
  const n = map[id]
  if (typeof n !== 'number' || !Number.isFinite(n)) return 0
  return Math.max(0, Math.min(TIER_MAX, Math.floor(n)))
}

export function canUpgrade(id: CityPlotId, progress: ProgressState): boolean {
  return earnedTier(id, progress) > appliedTier(id, progress)
}

export function applyUpgrade(progress: ProgressState, id: CityPlotId): ProgressState {
  const earned = earnedTier(id, progress)
  const applied = appliedTier(id, progress)
  if (earned <= applied) return progress
  const cityBuilt = { ...(progress.cityBuilt ?? snapshotCityBuilt(progress)) }
  cityBuilt[id] = applied + 1
  return { ...progress, cityBuilt }
}

export function visualSnapshot(progress: ProgressState): CitySnapshot {
  const snap = {} as CitySnapshot
  for (const plot of CITY_PLOTS) {
    snap[plot.id] = stageFromTier(appliedTier(plot.id, progress))
  }
  return snap
}

export function visualFills(progress: ProgressState): CityFills {
  const snap = {} as CityFills
  for (const plot of CITY_PLOTS) {
    snap[plot.id] = visualFill(plot.id, progress)
  }
  return snap
}

export function visualFill(id: CityPlotId, progress: ProgressState): number {
  const applied = appliedTier(id, progress)
  const fill = plotFill(id, progress)
  if (applied <= 1) return 0
  if (applied === 2) return Math.min(Math.max(fill, 1), 1)
  if (applied === 3) return Math.max(2, fill)
  return Math.max(fill, 4)
}

export function anyUpgradeReady(progress: ProgressState): boolean {
  return CITY_PLOTS.some((plot) => canUpgrade(plot.id, progress))
}

export function tierTitle(tier: number, easy: boolean): string {
  const row = TIER_NAME[Math.max(0, Math.min(TIER_MAX, tier))]
  return easy ? row.easy : row.hard
}

export function tierJob(tier: number, easy: boolean): string {
  const row = TIER_JOB[Math.max(0, Math.min(TIER_MAX, tier))]
  return easy ? row.easy : row.hard
}

/** Plain next-step. Teach that upgrades are earned. */
export function nextUpgradeNeed(
  id: CityPlotId,
  progress: ProgressState,
  easy: boolean,
): { ready: boolean; line: string } {
  const applied = appliedTier(id, progress)
  const earned = earnedTier(id, progress)
  if (applied >= TIER_MAX) {
    return {
      ready: false,
      line: easy
        ? 'This building is done. Keep saying the lines so the lamps stay on.'
        : 'This building is finished. Keep the claims so the lamps stay lit.',
    }
  }
  if (earned > applied) {
    return {
      ready: true,
      line: easy
        ? 'Build this — raise the next look you earned by learning, not by paying.'
        : 'You earned the next look by keeping a line. Tap Build this — learning raises the house, not payment.',
    }
  }
  return { ready: false, line: needForTier(id, applied + 1, easy) }
}

/**
 * One sentence: why this tap is wrong, and what is still needed.
 * Pass areaUnlocked + gateLine from the UI so this file stays free of the store.
 * Null means the tap may open the manage sheet.
 */
export function lotTapWhy(
  id: CityPlotId,
  progress: ProgressState,
  easy: boolean,
  areaUnlocked = true,
  gateLine = '',
  dailyDone = false,
): string | null {
  if (!areaUnlocked && gateLine) return gateLine
  if (canUpgrade(id, progress) || mindMapHasLit(id, progress)) return null
  const nextId = nextPlotId(progress, dailyDone)
  if (id === nextId) return null
  if (appliedTier(id, progress) > 0 || earnedTier(id, progress) > 0) return null
  const need = needForTier(id, 1, easy)
  return easy
    ? `This lot is locked. ${need}`
    : `This lot is still empty. ${need}`
}

export function ideaLockWhy(easy: boolean): string {
  return easy
    ? 'This idea is locked. Walk this lot, or connect sentence → place → person, to light it.'
    : 'This idea is locked. Walk this lot — or Link the street — to light it.'
}

function needForTier(id: CityPlotId, want: number, easy: boolean): string {
  if (id === 'porch') {
    if (want <= 1) return easy ? 'Arrive. The porch lot is yours.' : 'Arrive. The east porch lot is yours.'
    if (want === 2) return easy ? 'Walk today’s story once.' : 'Walk today’s trail and keep the morning line.'
    if (want === 3)
      return easy
        ? 'Walk a second morning, or connect sentence → place → person.'
        : 'A second morning, hold the lamp line, or Link the street furnishes the porch.'
    return easy
      ? 'Come back three mornings.'
      : 'Three mornings kept — or hold the lamp line — lights the porch.'
  }
  if (id === 'journal') {
    if (want <= 1) return easy ? 'Store one journal page.' : 'Store one journal page in the house.'
    if (want === 2) return easy ? 'Store four pages.' : 'Four stored pages raise the dossier house.'
    if (want === 3) return easy ? 'Store eight pages.' : 'Eight pages furnish the shelves.'
    return easy ? 'Store twelve pages.' : 'Twelve pages — journal mastery — light the house.'
  }
  if (id === 'lamps') {
    if (want <= 1) return easy ? 'Earn one star.' : 'One star caught on a walk raises the first lamp.'
    if (want === 2) return easy ? 'Earn four stars.' : 'Four stars raise a row of lamps.'
    if (want === 3) return easy ? 'Eight stars, or hold a night.' : 'Eight stars or a Night Watch furnishes the street.'
    return easy ? 'Twelve stars or nights.' : 'Twelve stars and nights remembered light the street.'
  }
  if (want <= 1) {
    return easy
      ? 'Finish the street before this one.'
      : 'Finish the earlier street so this lot unlocks.'
  }
  if (want === 2) {
    return easy ? 'Finish one walk here.' : 'Finish one walk on this lot and keep the takeaway.'
  }
  if (want === 3) {
    if (STREET_LOTS.includes(id)) {
      return easy
        ? 'Finish a second walk here, or connect sentence → place → person.'
        : 'A second walk, a held claim, or Link the street furnishes this house.'
    }
    return easy
      ? 'Finish a second walk here, or keep a main idea from this lot.'
      : 'A second walk or a held claim from this lot furnishes the rooms.'
  }
  return easy
    ? 'Finish every walk here.'
    : 'Finish this street’s walks. Holding those claims lights the lamps.'
}

export function plotTag(id: CityPlotId): string {
  switch (id) {
    case 'porch':
      return 'Porch'
    case 'hollow':
      return 'Hollow'
    case 'bench':
      return 'Bench'
    case 'observatory':
      return 'Sky'
    case 'gate':
      return 'Why Gate'
    case 'lookout':
      return 'Lookout'
    case 'journal':
      return 'Pages'
    case 'lamps':
      return 'Lamps'
  }
}

/** Easy map chips — full place names, not Hollow / Square / Porch. */
export function easyPlotTag(id: CityPlotId): string {
  if (id === 'hollow') return 'Parable Hollow'
  if (id === 'bench') return 'Witness Bench'
  if (id === 'porch') return 'East porch'
  if (id === 'lamps') return 'Star lamps'
  return plotTag(id)
}

/** Named Easy chips. Fewer than every lot — stacked, measured for 390×844. */
export const EASY_NAMED_PLOTS: CityPlotId[] = ['hollow', 'lamps', 'journal', 'bench', 'porch']

/** Easy portraits sit on the buildings, not on the name-chip band. */
export const EASY_FOLK_LIFT = 56

/**
 * Chip centers in the 640×420 viewBox. Street names sit in a bottom band
 * under portraits; Pages sits above the mid lot. Inset from the 24px corner.
 */
export const EASY_TAG_SLOT: Record<CityPlotId, { x: number; y: number }> = {
  hollow: { x: 96, y: 388 },
  lamps: { x: 208, y: 388 },
  journal: { x: 268, y: 198 },
  bench: { x: 392, y: 388 },
  porch: { x: 536, y: 388 },
  gate: { x: 498, y: 230 },
  observatory: { x: 410, y: 96 },
  lookout: { x: 508, y: 52 },
}

/** City of Heaven — left of the ridge city, clear of the clipped corner. */
export const HEAVEN_TAG = { x: 418, y: 36 }

/** Keep chips inside the rounded SVG (24px CSS ≈ 39 viewBox units at 390px). */
export const EASY_MAP_SAFE = { x0: 44, y0: 26, x1: 596, y1: 412 }

export function easyTagLines(tag: string): string[] {
  return tag.includes(' ') ? tag.split(' ') : [tag]
}

export function easyTagMetrics(id: CityPlotId) {
  const tag = easyPlotTag(id)
  const lines = easyTagLines(tag)
  const slot = EASY_TAG_SLOT[id]
  const longest = Math.max(...lines.map((line) => line.length))
  const w = Math.max(70, longest * 8.4 + 16)
  const h = lines.length * 13 + 6
  const x0 = slot.x - w / 2
  const x1 = slot.x + w / 2
  const y0 = slot.y - 14
  const y1 = y0 + h
  return { id, tag, lines, x0, x1, y0, y1, w, h }
}

export function easyTagsFit(ids: CityPlotId[] = EASY_NAMED_PLOTS) {
  const boxes = ids.map(easyTagMetrics)
  const { x0: sx0, y0: sy0, x1: sx1, y1: sy1 } = EASY_MAP_SAFE
  const gap = 8
  for (const box of boxes) {
    if (box.x0 < sx0 || box.x1 > sx1 || box.y0 < sy0 || box.y1 > sy1) {
      return { ok: false, reason: `${box.id} outside safe`, boxes }
    }
  }
  for (let i = 0; i < boxes.length; i += 1) {
    for (let j = i + 1; j < boxes.length; j += 1) {
      const a = boxes[i]
      const b = boxes[j]
      const hit =
        a.x0 < b.x1 + gap && a.x1 + gap > b.x0 && a.y0 < b.y1 + gap && a.y1 + gap > b.y0
      if (hit) return { ok: false, reason: `${a.id} overlaps ${b.id}`, boxes }
    }
  }
  return { ok: true, reason: '', boxes }
}

export const STREET_LIGHT_PLOTS = STREET_LIGHTS
