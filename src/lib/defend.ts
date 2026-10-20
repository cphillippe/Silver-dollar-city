import {
  unlockedNightCast,
  type NightCastGuy,
} from '../nightWatch/enemies/cast.ts'
import { enemyHit, NIGHT_ENEMY_ROLE } from '../nightWatch/enemies/hp.ts'
import type { NightRaider } from '../nightWatch/types.ts'
import type { ProgressState, WalkerKind } from '../types.ts'
import { CITY_PLOTS, plotStage, type CityPlotId, type CityStage } from './city.ts'
import { applyIncenseTap, incenseTapAdd } from '../nightWatch/incense.ts'
import { EASY_ROUNDS, easyRound } from '../nightWatch/rounds.ts'
import { easyBossRound, easyShowdownBoss } from '../nightWatch/walkers.ts'
import { prefersReducedMotion } from './juice.ts'
import { combatTier, deployFit, toolTier, unlockedWatchTools, watchTool, WATCH_TOOLS } from './watchTools.ts'

export {
  isNightCastId,
  NIGHT_CAST,
  nightCastById,
  normalizeMet,
  unlockedNightCast,
} from '../nightWatch/enemies/cast.ts'
export type { NightCastGuy } from '../nightWatch/enemies/cast.ts'

export const DEFEND_BRIEF_ID = 'td-watch'
export const DEFEND_HEARTS = 3

export interface GateLeak {
  hearts: number
  /** Hearts removed this step. A gate shield reports 0. */
  lostHearts: number
  /** True when this leak emptied the night. */
  failed: boolean
}

/**
 * A walker that finishes the road leaks. Each leak costs one heart.
 * Empty hearts fail the night. A shield can forgive the cost.
 */
export function applyGateLeaks(hearts: number, leaked: number, shielded = false): GateLeak {
  const count = Number.isFinite(leaked) ? Math.max(0, Math.floor(leaked)) : 0
  const lostHearts = shielded || count === 0 ? 0 : count
  const next = Math.max(0, hearts - lostHearts)
  return { hearts: next, lostHearts, failed: lostHearts > 0 && next <= 0 }
}

/** Easy only. After a paid leak, further leaks in this window cost nothing. */
export const EASY_LEAK_GRACE_MS = 1800
/** Easy only. One round stops at two hearts, except the round-5 tap gate. */
export const EASY_ROUND_HEART_CAP = 2

export interface EasyPaceLeak extends GateLeak {
  graceUntil: number
  lostThisRound: number
}

/**
 * Round 5 is the tap gate, so spaced leaks there can spend the last heart.
 * Every other Easy round still stops at two. Hard does not read this.
 */
export function easyRoundHeartCap(roundIndex: number): number {
  return roundIndex === 4 ? DEFEND_HEARTS : EASY_ROUND_HEART_CAP
}

/** A cleared Easy round gives one heart back, and the bar never passes three. */
/** Hearts never pass the three slots. A fourth heart is not a feature. */
export function easyClearHeart(hearts: number): number {
  const now = Math.max(0, Math.floor(Number(hearts)) || 0)
  if (now <= 0 || now >= DEFEND_HEARTS) return Math.min(now, DEFEND_HEARTS)
  return now + 1
}

/**
 * Easy boss at the exit. The per-round heart cap does not apply.
 * Every heart left goes, and the night ends. Hard does not read this.
 */
export function applyBossExitLeak(hearts: number): GateLeak {
  const left = Number.isFinite(hearts) ? Math.max(0, Math.floor(hearts)) : 0
  return { hearts: 0, lostHearts: left, failed: true }
}

/**
 * Easy rounds 20 and 25 only. An active Mend shield pushes that crown
 * back to here once. The crown stays inside the slow last stretch.
 */
export const CROWN_HOLD_T = 0.9

/** Gap between hearts while an unshielded showdown crown drains the bar. */
export const CROWN_DRAIN_MS = 450

export const CROWN_THROUGH_LINE = 'The crown got through!'
export const CROWN_GATE_LINE = 'The crown reached the gate.'

/**
 * One hold per crown per round, and only while Mend's shield is up.
 * HP and hearts stay. A second arrival, a dark shield, Hard, and any
 * boss that is not round 20 or 25 all pass through.
 */
export function holdShowdownCrown(input: {
  easy: boolean
  roundIndex: number
  t: number
  hp: number
  hearts: number
  shieldUp: boolean
  alreadyHeld: boolean
}): { held: boolean; t: number; hp: number; hearts: number; alreadyHeld: boolean } {
  const crown = input.easy && easyShowdownBoss(input.roundIndex) && input.t >= 1
  if (crown && input.shieldUp && !input.alreadyHeld) {
    return {
      held: true,
      t: CROWN_HOLD_T,
      hp: input.hp,
      hearts: input.hearts,
      alreadyHeld: true,
    }
  }
  return {
    held: false,
    t: input.t,
    hp: input.hp,
    hearts: input.hearts,
    alreadyHeld: input.alreadyHeld,
  }
}

/**
 * Hearts still on the bar, then one less, down to 0.
 * The last step is always 0, including a bar that was already empty.
 */
export function crownDrainHearts(hearts: number): number[] {
  const start = Number.isFinite(hearts) ? Math.max(0, Math.floor(hearts)) : 0
  const steps: number[] = []
  for (let left = start - 1; left >= 0; left -= 1) steps.push(left)
  if (steps.length === 0 || steps[steps.length - 1] !== 0) steps.push(0)
  return steps
}

/**
 * A glowing-face tap on Easy deals this much, and no more.
 * It does not grow with the lamp's tier.
 * Fast and plain walkers still drop in a tap or two. Hard does not read this.
 */
export const EASY_GLOW_TAP_DAMAGE = 1

/** Rounds 20–25. A lamp shot nicks at this much. Showdown crowns take none. */
export const EASY_LATE_LAMP_NICK = 6

/**
 * An armored walker still loses this much to glowing taps, then shrugs.
 * The tap keeps popping. The bar stops moving. Lamps have to finish it.
 */
export const TAP_SHRUG_CHIP = 4

/**
 * Bosses from round 15 on still soak taps.
 * A thick walker shrugs only before round 7 (a maze round 6). From round 7
 * every walker keeps taking taps, the same as rounds 1–6. Pressure after that
 * is the wave, not a shrug. Hard does not read this.
 * The lead round 10 boss is `easyLeadBossShrug`.
 */
export function easyTapArmored(
  roundIndex: number,
  gait?: string,
  boss = false,
  armorFrom = 7,
): boolean {
  const round = Math.floor(roundIndex) + 1
  if (boss && round >= 15) return true
  if (gait === 'tough' && round >= armorFrom && round < 7) return true
  return false
}

/**
 * The live lead road. The round 10 boss shrugs after a few taps.
 * Plate sims and the frozen good-seat nights stay on `easyTapArmored`,
 * and a maze night keeps this boss open.
 */
export function easyLeadBossShrug(roundIndex: number, boss = false, armorFrom = 7): boolean {
  if (!boss || armorFrom < 7) return false
  return Math.floor(roundIndex) + 1 === 10
}

/** The round 10 boss has already taken four taps, and this one bounces off. */
export function r10ShrugCue(
  roundIndex: number,
  boss: boolean,
  damage: number,
  armored: boolean,
  armorFrom = 7,
): boolean {
  return armored && damage <= 0 && easyLeadBossShrug(roundIndex, boss, armorFrom)
}

/**
 * The first glowing tap on a round 5 tough opens this much extra.
 * Later taps stay at one. Lamps do not read this, so a night with no taps
 * still meets the old bar.
 */
export const EASY_R5_TOUGH_OPEN = 5

export function easyGlowTapDamage(hp: number, chipped = 0, armored = false, openTough = false): number {
  const left = Math.max(0, Math.floor(hp) || 0)
  const soaked = Math.max(0, Math.floor(chipped) || 0)
  if (armored && soaked >= TAP_SHRUG_CHIP) return 0
  const open = openTough && soaked === 0 ? EASY_R5_TOUGH_OPEN : 0
  return Math.min(left, EASY_GLOW_TAP_DAMAGE + open)
}

/**
 * True when this walker has already shrugged glowing taps.
 * Lamps do not read this. An open walker, including every round 1–6 walker, is never soaked.
 */
export function easyTapSoaked(
  roundIndex: number,
  raider: { tapChip?: number; gait?: string; boss?: boolean },
  armorFrom = 7,
): boolean {
  if (!(roundIndex >= 0)) return false
  const round = Math.floor(roundIndex) + 1
  // Rounds 20 and 25 keep taking taps. The four-chip shrug stays on the other late bosses.
  if (raider.boss && (round === 20 || round === 25)) return false
  const armored =
    easyTapArmored(roundIndex, raider.gait, !!raider.boss, armorFrom) ||
    easyLeadBossShrug(roundIndex, !!raider.boss, armorFrom)
  return armored && (raider.tapChip ?? 0) >= TAP_SHRUG_CHIP
}

/** What a live Night Watch shot is. A face tap is `manual`. A lamp is not. */
export interface LiveStrikeShot {
  easy: boolean
  manual: boolean
  roundIndex: number
  /** Lamp tier damage. Face taps ignore this and use the glow chip. */
  lampDamage: number
  /** Tough armor starts on this round. Omitted stays round 7, which is A2. */
  armorFrom?: number
  /**
   * Extra damage from a cloud the walker is standing in.
   * Applied only after the glow gate has already called this a hit.
   * A soaked walker or a shrugging boss keeps 0.
   */
  tapBonus?: number
}

export interface LiveStrikeSize {
  damage: number
  armored: boolean
  nextChip: number
}

/**
 * How hard the live shot is, before the hit lands.
 * Round 5's boss is not armored, so a tap and a lamp both cut the bar.
 * The round 10 boss and bosses from round 15 shrug taps after four.
 * From round 7 a thick walker keeps taking taps.
 * Lamps still use their tier. Hard does not read the Easy armor.
 */
export function liveNightDamage(
  raider: { hp: number; tapChip?: number; gait?: string; boss?: boolean },
  shot: LiveStrikeShot,
): LiveStrikeSize {
  const round = Math.floor(shot.roundIndex) + 1
  const showdown = Boolean(raider.boss) && (round === 20 || round === 25)
  const armored =
    !showdown &&
    ((shot.easy && shot.manual && easyTapArmored(shot.roundIndex, raider.gait, !!raider.boss, shot.armorFrom ?? 7)) ||
      (shot.easy && shot.manual && easyLeadBossShrug(shot.roundIndex, !!raider.boss, shot.armorFrom ?? 7)))
  const soaked = raider.tapChip ?? 0
  let lamp = Math.max(0, Math.floor(shot.lampDamage) || 0)
  // Rounds 20–25: lamp shots are a nick. Showdown crowns ignore them.
  // A glowing tap is unchanged, so the late night is the taps.
  if (shot.easy && !shot.manual && round >= 20 && round <= 25) {
    lamp = showdown ? 0 : Math.min(lamp, EASY_LATE_LAMP_NICK)
  }
  const glow = shot.easy && shot.manual ? easyGlowTapDamage(raider.hp, soaked, armored) : lamp
  const openTough =
    glow > 0 &&
    shot.easy &&
    shot.manual &&
    shot.roundIndex === 4 &&
    raider.gait === 'tough' &&
    soaked === 0 &&
    (shot.armorFrom ?? 7) >= 7 &&
    !raider.boss
  let damage = openTough ? Math.min(raider.hp, glow + EASY_R5_TOUGH_OPEN) : glow
  const soakedOut = armored && soaked >= TAP_SHRUG_CHIP
  const shrugging = Boolean(raider.boss) && armored && glow <= 0
  const extra =
    shot.easy && shot.manual ? incenseTapAdd(shot.tapBonus ?? 0, soakedOut, shrugging) : 0
  if (extra > 0) damage = Math.min(raider.hp, applyIncenseTap(damage, extra))
  const nextChip = shot.easy && shot.manual && damage > 0 ? soaked + damage : soaked
  return { damage, armored, nextChip }
}

/**
 * The live shot: size it, then apply `enemyHit` (the same function the lamps use).
 * `DefendScreen` fire() calls these two in that order.
 */
export function liveNightStrike<T extends NightRaider>(
  raider: T,
  shot: LiveStrikeShot,
): LiveStrikeSize & { raider: T; down: boolean } {
  const sized = liveNightDamage(raider, shot)
  const struck = enemyHit(raider, sized.damage)
  return { raider: struck.raider, down: struck.down, ...sized }
}

/**
 * A boss round may open the clear bar only after the boss is down.
 * If the road is empty and the boss is still up, the night is lost.
 */
export function liveBossClearPhase(input: {
  easy: boolean
  bossRound: boolean
  bossDown: boolean
  roadClear: boolean
}): 'play' | 'clear' | 'lost' {
  if (!input.roadClear) return 'play'
  if (input.easy && input.bossRound && !input.bossDown) return 'lost'
  return 'clear'
}

/**
 * Easy heart pacing. The first leak in a quiet moment costs one heart and
 * opens a short grace. Leaks during that grace, and any leak after this
 * round has already spent its cap, leave the bar alone.
 * Hard keeps `applyGateLeaks` (one heart each, no grace, no cap).
 */
export function applyEasyPaceLeaks(
  hearts: number,
  leaked: number,
  now: number,
  graceUntil: number,
  lostThisRound: number,
  shielded = false,
  cap = EASY_ROUND_HEART_CAP,
): EasyPaceLeak {
  const count = Number.isFinite(leaked) ? Math.max(0, Math.floor(leaked)) : 0
  const spent = Number.isFinite(lostThisRound) ? Math.max(0, Math.floor(lostThisRound)) : 0
  const quiet = Number.isFinite(graceUntil) ? graceUntil : 0
  const room = Number.isFinite(cap) ? Math.max(1, Math.floor(cap)) : EASY_ROUND_HEART_CAP
  if (shielded || count === 0 || now < quiet || spent >= room) {
    return { hearts, lostHearts: 0, failed: false, graceUntil: quiet, lostThisRound: spent }
  }
  const next = Math.max(0, hearts - 1)
  return {
    hearts: next,
    lostHearts: 1,
    failed: next <= 0,
    graceUntil: now + EASY_LEAK_GRACE_MS,
    lostThisRound: spent + 1,
  }
}

/**
 * Easy only the glowing face is a tap. Any other face is a miss.
 * Hard does not use the glow, so this stays a hit and range still decides.
 */
export function cueTapStrike(easy: boolean, glowingFace: boolean): 'hit' | 'miss' {
  if (easy && !glowingFace) return 'miss'
  return 'hit'
}

/**
 * Who wears the gold ring.
 * Rounds 1–4 and 6 keep the lead, and the boss when one is out.
 * Round 5 lights every walker on the road, so a leak cannot slip past a dark face.
 * A shrugged or fogged walker stays dark. Hard does not use the glow.
 */
export function easyFaceGlows<
  T extends { id: number; turned?: string; t?: number; tapChip?: number; gait?: string; boss?: boolean; fog?: boolean },
>(raider: T, raiders: readonly T[], roundIndex = -1, armorFrom = 7): boolean {
  if (raider.turned || raider.fog) return false
  if (easyTapSoaked(roundIndex, raider, armorFrom)) return false
  if (Math.floor(roundIndex) === 4) return true
  if (raider.boss) return true
  return easyTapTarget(raiders, roundIndex, armorFrom)?.id === raider.id
}

/**
 * Pointer on a walker, then the glow gate, then the caller strikes.
 * Before round 5 a normal walker still has to be the glowing lead.
 * On round 5 every walker on the road is a hit. The boss is always a hit
 * when it is not soaked. After four chips the round 10 boss still takes the
 * tap, so the bounce can say Shrugs. Hard does not use the glow.
 */
export function easyPointerTapGate<
  T extends { id: number; turned?: string; t?: number; boss?: boolean; tapChip?: number; gait?: string; fog?: boolean },
>(
  easy: boolean,
  raider: T,
  raiders: readonly T[],
  roundIndex = -1,
  armorFrom = 7,
): 'hit' | 'miss' {
  if (raider.turned || raider.fog) return 'miss'
  const soaked = easyTapSoaked(roundIndex, raider, armorFrom)
  if (easy && Math.floor(roundIndex) === 4 && !soaked) return 'hit'
  if (easy && raider.boss && !soaked) return 'hit'
  if (easy && easyLeadBossShrug(roundIndex, !!raider.boss, armorFrom)) return 'hit'
  const cue = easyTapTarget(raiders, roundIndex, armorFrom)
  return cueTapStrike(easy, cue?.id === raider.id)
}

/** A counted Easy miss from the glow gate. A hit has no reason. */
export type EasyGateMiss = 'dark' | 'fog' | 'soaked'

/**
 * Why the Easy glow gate refused this face.
 * Fog wins, then a shrugged walker, then any other face that is not glowing.
 * A hit returns null. Hard does not read this.
 */
export function easyGateMissReason<
  T extends { id: number; turned?: string; t?: number; boss?: boolean; tapChip?: number; gait?: string; fog?: boolean },
>(
  raider: T,
  raiders: readonly T[],
  roundIndex = -1,
  armorFrom = 7,
): EasyGateMiss | null {
  if (easyPointerTapGate(true, raider, raiders, roundIndex, armorFrom) !== 'miss') return null
  if (raider.fog) return 'fog'
  if (easyTapSoaked(roundIndex, raider, armorFrom)) return 'soaked'
  return 'dark'
}

/**
 * The tap handler path: gate, then the live strike.
 * A miss never touches HP. `DefendScreen` fireAtRaider uses the same gate.
 */
export function applyEasyPointerTap<T extends NightRaider>(
  raider: T,
  raiders: readonly T[],
  shot: LiveStrikeShot,
): { miss: true } | { miss: false; strike: LiveStrikeSize & { raider: T; down: boolean } } {
  if (easyPointerTapGate(shot.easy, raider, raiders, shot.roundIndex) === 'miss') return { miss: true }
  return {
    miss: false,
    strike: liveNightStrike(raider, { ...shot, manual: true }),
  }
}
export const DEFEND_WAVE_SIZE = 6
/** Hard night length. Easy reads `EASY_ROUNDS` instead. */
export const DEFEND_NIGHT_WAVES = 5

/** Easy is the round table. Hard stays five waves. */
export function nightLength(easy: boolean): number {
  return easy ? EASY_ROUNDS.length : DEFEND_NIGHT_WAVES
}
/** Waves 1–4 stay under the old six. Wave 5 is the denser upgrade gate. */
export const DEFEND_WAVE_PACK = [4, 4, 5, 5, 8] as const
/** Easy soft TD: cap live unturned walkers before spawning the next. Rounds 1–6 stay here. */
export const EASY_WAVE_LIVE = 3

/** Round the live night is spawning. 0 keeps the rounds 1–6 cap. */
let easyCrowdRound = 0

/** The tick sets this before `holdSpawn`, so a late night can field more than three. */
export function noteEasyCrowdRound(roundIndex: number): void {
  const index = Math.floor(roundIndex)
  easyCrowdRound = Number.isFinite(index) ? Math.max(0, index) : 0
}

/**
 * How many unturned walkers A2 may keep on the road.
 * Rounds 1–6 stay at `EASY_WAVE_LIVE`. From round 7 the road holds six, and from round 11 it holds eight.
 * A maze map's own `liveCap` still wins when one is bound.
 */
export function easyCrowdCap(roundIndex = easyCrowdRound): number {
  const index = Math.floor(roundIndex)
  if (!Number.isFinite(index) || index < 6) return EASY_WAVE_LIVE
  if (index < 10) return 6
  return 8
}

export { DEFEND_ANCHOR, DEFEND_PATH, pathClearance, pathPoint } from '../nightWatch/path/data.ts'

/** First six slots are one of each WalkerKind; later rows are extra taunts only. */
export const RAID_CAST: { text: string; kind: WalkerKind }[] = [
  { text: 'Mercy is optional', kind: 'skeptic' },
  { text: 'Only your own', kind: 'image-bearer' },
  { text: 'Keep walking', kind: 'spiritual' },
  { text: 'Trade your lamp', kind: 'pagan' },
  { text: 'Only atoms speak', kind: 'physical' },
  { text: 'Mind is weather', kind: 'metaphysical' },
  { text: "You're wrong", kind: 'skeptic' },
  { text: 'Many tired gods', kind: 'pagan' },
]

export const RAID_LINES = RAID_CAST.map((item) => item.text)

export function wavePackSize(waveIndex: number): number {
  const index = Math.min(
    DEFEND_WAVE_PACK.length - 1,
    Math.max(0, Math.floor(waveIndex) || 0),
  )
  return DEFEND_WAVE_PACK[index]
}

export interface WaveCombat {
  size: number
  /** Multiplier on the Easy/Hard walk speed. */
  speedScale: number
  /** Multiplier on the spawn gap. Below 1 spawns sooner. */
  spawnScale: number
  /** Added to the kind's base HP. Wave 5 Easy is the gate. */
  hpBonus: number
}

/**
 * Easy reads one row of the round table. Hard keeps a flat pace.
 * Walkers enter at the gate, so the crossing includes the whole road.
 */
export function waveCombat(waveIndex: number, easy: boolean): WaveCombat {
  if (easy) {
    const round = easyRound(waveIndex)
    return {
      size: round.count + (easyBossRound(waveIndex) ? 1 : 0),
      speedScale: round.speed,
      spawnScale: round.spawn,
      hpBonus: round.hp,
    }
  }
  return { size: wavePackSize(waveIndex), speedScale: 1, spawnScale: 1, hpBonus: 0 }
}

/**
 * Climb pool is guys 1..level, level = cleared + 1.
 * Wave 5 biases toward tanks already in that pool — it never opens a locked guy.
 */
export function raidForWave(
  cleared: number,
  index: number,
  waveIndex = 0,
  easy = false,
): NightCastGuy {
  const pool = unlockedNightCast(cleared)
  const gate = !easy && waveIndex >= DEFEND_NIGHT_WAVES - 1
  if (gate) {
    const tanks = pool.filter((guy) => NIGHT_ENEMY_ROLE[guy.kind] === 'tank')
    if (tanks.length > 0 && index % 2 === 0) {
      return tanks[Math.floor(index / 2) % tanks.length]
    }
  }
  return pool[index % pool.length]
}

export function emptyDefense() {
  return { cleared: 0, nights: [] as string[], met: [] as string[] }
}

export function nightsCleared(progress: ProgressState): number {
  return progress.defense?.cleared ?? 0
}

export function padStage(id: CityPlotId, progress: ProgressState): CityStage {
  return plotStage(id, progress)
}

/** Built and lit lots can hold a lamp. The porch can hold one even as timber. */
export function defendPads(progress: ProgressState): CityPlotId[] {
  return CITY_PLOTS.map((plot) => plot.id).filter((id) => {
    const stage = plotStage(id, progress)
    if (id === 'porch') return stage !== 'empty'
    return stage === 'built' || stage === 'lit'
  })
}

export function towerRange(stage: CityStage): number {
  if (stage === 'lit') return 136
  if (stage === 'built') return 118
  return 96
}

export function towerCooldown(stage: CityStage): number {
  if (stage === 'lit') return 380
  if (stage === 'built') return 520
  return 700
}

/**
 * A2 path walker face in viewBox units. Sized for width-led contain on a tall phone
 * (whole 798×1134 plate); keeps ~40 CSS px once the stage is not height-shrunk.
 */
export const PATH_WALKER_FACE_U = 72
/** Tap hit radius on the path (same proportion as the original 36-wide / r22). */
export const PATH_WALKER_HIT_R = (PATH_WALKER_FACE_U * 22) / 36
/** Face center above the path anchor. The beam and the hit flash share it. */
export const PATH_WALKER_FACE_DY = -PATH_WALKER_FACE_U / 6

/**
 * Easy face tap in viewBox units, centered on the face.
 * At the 375-wide phone cover scale (~0.47) the disc is about 75 CSS px,
 * so a thumb lands on the gold ring and not the feet.
 */
export const EASY_FACE_HIT_R = 80

/** Counted Easy misses. A stray board tap is not one of these. */
export type EasyCountedMiss = EasyGateMiss | 'board-near' | 'late'

export interface EasyTapWhy {
  dark: number
  fog: number
  soaked: number
  'board-near': number
  late: number
}

export interface EasyTapScore {
  hits: number
  misses: number
  damage: number
  why: EasyTapWhy
  stray: number
}

export function freshEasyTapScore(): EasyTapScore {
  return {
    hits: 0,
    misses: 0,
    damage: 0,
    why: { dark: 0, fog: 0, soaked: 0, 'board-near': 0, late: 0 },
    stray: 0,
  }
}

/** A stray board tap is the only tap that does not count. */
export function easyMissCounts(kind: EasyCountedMiss | 'stray'): boolean {
  return kind !== 'stray'
}

/**
 * Board tap beside the faces. `faces` are live unturned face centers.
 * Farther than two face discs from every one is stray and is not counted.
 * An empty seat uses this same distance. It is not exempt.
 */
export function easyBoardTapKind(
  point: { x: number; y: number },
  faces: readonly { x: number; y: number }[],
): 'board-near' | 'stray' {
  const limit = EASY_FACE_HIT_R * 2
  for (const face of faces) {
    if (dist(point, face) <= limit) return 'board-near'
  }
  return 'stray'
}

/** True when the board point sits on an empty seat ring. The kind does not change. */
export function easyMissOnSeat(
  point: { x: number; y: number },
  seats: readonly { x: number; y: number }[],
  radius: number,
): boolean {
  if (!(radius > 0)) return false
  for (const seat of seats) {
    if (dist(point, seat) <= radius) return true
  }
  return false
}

/** Pointer that produced a counted miss. `none` is a tap with no pointer type. */
export type NightPointerKind = 'mouse' | 'touch' | 'pen' | 'none'

export function nightPointerKind(value: string | null | undefined): NightPointerKind {
  if (value === 'mouse' || value === 'touch' || value === 'pen') return value
  return 'none'
}

/**
 * Playtest line for one counted miss. `seat` notes an empty seat without exempting it.
 * `dx`/`dy` are the tap minus the nearest live face, in viewBox units. Log only.
 */
export function nightMissLine(
  reason: string,
  x: number,
  y: number,
  round: number,
  leadId: number | string,
  leadChangedMsAgo: number,
  seat = false,
  dx = 0,
  dy = 0,
  ptr: NightPointerKind | string = 'none',
): string {
  const px = Math.round(Number(x) || 0)
  const py = Math.round(Number(y) || 0)
  const ago = Math.max(0, Math.round(Number(leadChangedMsAgo) || 0))
  const seatBit = seat ? ' seat=1' : ''
  const aimX = Math.round(Number(dx) || 0)
  const aimY = Math.round(Number(dy) || 0)
  const kind = nightPointerKind(ptr)
  return `nw-miss ${reason} ${px} ${py} r${Math.floor(round) || 0} lead=${leadId} leadChangedMsAgo=${ago}${seatBit} dx=${aimX} dy=${aimY} ptr=${kind}`
}

/** Playtest line for a board tap that is not counted. */
export function nightStrayLine(x: number, y: number): string {
  return `nw-stray ${Math.round(Number(x) || 0)} ${Math.round(Number(y) || 0)}`
}

/** Playtest readout. `near` is the board-near count. */
export function easyTapReadout(score: EasyTapScore, boss: string): string {
  const why = score.why
  return `Taps ${score.hits} hit · ${score.misses} miss (dark ${why.dark} · fog ${why.fog} · near ${why['board-near']}) · ${score.damage} dmg · Boss ${boss}`
}
/**
 * The boss body draws 1.72× from the feet, so the crown sits above the
 * plain face disc. This radius still centers on the glow and covers that crown.
 */
export const EASY_CROWN_HIT_R = Math.round(EASY_FACE_HIT_R * 1.72)

/** CSS px across the easy face disc at `scale` (board px per viewBox unit). */
export function easyFaceHitPx(scale: number): number {
  if (!(scale > 0)) return 0
  return EASY_FACE_HIT_R * 2 * scale
}

/**
 * Tap-juice face in CSS px. Brief squash → heaven only — keep it near the path face,
 * not a giant portrait (Fixes #469).
 */
export const EASY_WALKER_FACE_PX = 44
/** Juice wrapper only. Easy path taps use the face disc (`EASY_FACE_HIT_R`). */
export const EASY_WALKER_HIT_PX = 72
export const EASY_CUE_HOLD_MS = 1800
export const EASY_MISS_HOLD_MS = 1400

/** One Easy TAP mode: live wave, not plant / lost / win. */
export function easyTapMode(easy: boolean, phase: string, won: boolean): boolean {
  return easy && phase === 'wave' && !won
}

/**
 * Front-most unturned walker who can still take a glowing tap.
 * Once a walker has shrugged, the glow moves to the next one.
 * Omit the round and the lead stays the cue, which is how rounds 1–6 were locked.
 */
export function easyTapTarget<
  T extends { turned?: string; t?: number; tapChip?: number; gait?: string; boss?: boolean; fog?: boolean },
>(raiders: readonly T[], roundIndex = -1, armorFrom = 7): T | undefined {
  let pick: T | undefined
  let bestT = -1
  for (const item of raiders) {
    if (item.turned || item.fog) continue
    if (easyTapSoaked(roundIndex, item, armorFrom)) continue
    const t = item.t ?? 0
    if (t >= bestT) {
      bestT = t
      pick = item
    }
  }
  return pick
}

export function easyHoldSpawn(walkingUnturned: number, liveCap = EASY_WAVE_LIVE): boolean {
  return walkingUnturned >= liveCap
}

/**
 * Every walker enters at the gate. Spacing comes from spawn timing
 * (`spawnEvery` / `holdSpawn`), not from starting partway up the road.
 */
export function easySpawnT(_spawnIndex: number): number {
  return 0
}

/**
 * The phone picture first holds the walker here. The gate itself sits off
 * the right edge, under the bottom of the screen.
 */
export const EASY_ON_SCREEN_T = 0.55
/** A spawned walker reaches that picture within this many seconds. */
export const EASY_ON_SCREEN_SEC = 5
const EASY_WALK_T_PER_SEC = 0.01

/**
 * Live spawn only. Slow rounds were waiting about a minute at the gate.
 * Start close enough that the face is in the picture within five seconds.
 * Round speed stays the 1.4.424 table. The sim still starts at `easySpawnT`.
 */
export function easyLiveSpawnT(speedScale = 1): number {
  const speed = Math.max(0.2, Number(speedScale) || 1)
  const lead = EASY_ON_SCREEN_SEC * EASY_WALK_T_PER_SEC * speed
  return Math.max(0, Math.min(EASY_ON_SCREEN_T, EASY_ON_SCREEN_T - lead))
}

/** Playtest line: walker id, board x/y, and path progress at first draw. */
export function nightSpawnLine(id: number, x: number, y: number, t: number): string {
  const px = Math.round(Number(x) || 0)
  const py = Math.round(Number(y) || 0)
  const progress = Math.round((Number(t) || 0) * 1000) / 1000
  return `nw-spawn ${Math.floor(id) || 0} ${px} ${py} ${progress}`
}

export function easyTapPersonCount(raiders: { turned?: string }[]): number {
  return easyTapTarget(raiders) ? 1 : 0
}

/** Easy TAP: a face tap always turns. Hard still matches tool to walker kind. */
export function easyTapFit(easy: boolean, toolId: string, kind: WalkerKind): 'match' | 'weak' {
  if (easy) return 'match'
  return deployFit(toolId, kind)
}

/**
 * A tap on a living walker face.
 * Easy always hits, even when no lamp reaches that walker.
 * Hard hits only when a lamp is in range.
 * A tap that misses the face is a miss for both.
 */
export function faceTapStrike(easy: boolean, onFace: boolean, lampInRange: boolean): 'hit' | 'miss' {
  if (!onFace) return 'miss'
  if (easy) return 'hit'
  return lampInRange ? 'hit' : 'miss'
}

/** Easy wins on 6 downs even if a flyer is still on the board. Hard waits for an empty road. */
export function waveIsClear(
  easy: boolean,
  downed: number,
  spawned: number,
  walking: number,
  size = DEFEND_WAVE_SIZE,
): boolean {
  if (easy) return downed >= size
  return spawned >= size && walking === 0
}

export function waveSpeed(easy = false): number {
  if (easy) return prefersReducedMotion() ? 0.008 : 0.01
  return prefersReducedMotion() ? 0.042 : 0.086
}

export function waveSpawnEvery(easy = false): number {
  if (easy) return prefersReducedMotion() ? 4.2 : 3.8
  return prefersReducedMotion() ? 2.05 : 1.08
}

/** Catalog ids. Later tools are more WATCH_TOOLS rows — do not hard-code a 4-id board. */
export type WatchAbility = string

export const WATCH_ABILITIES = WATCH_TOOLS.map((tool) => tool.id)

export const WATCH_ABILITY_LABEL: Record<string, string> = Object.fromEntries(
  WATCH_TOOLS.map((tool) => [tool.id, tool.label]),
)

/** City of Heaven on the ridge — same seat as the overworld teaser. */
export const HEAVEN_POINT = { x: 572, y: 36 }

export function unlockedWatchAbilities(progress: ProgressState): string[] {
  return unlockedWatchTools(progress).map((tool) => tool.id)
}

export function heavenPoint(
  from: { x: number; y: number },
  t: number,
  to = HEAVEN_POINT,
): { x: number; y: number } {
  const clamped = Math.min(1, Math.max(0, t))
  return {
    x: from.x + (to.x - from.x) * clamped,
    y: from.y + (to.y - from.y) * clamped,
  }
}

export function abilityRange(
  ability: string,
  stage: CityStage,
  progress: ProgressState,
  runTier?: Record<string, number>,
): number {
  const tool = watchTool(ability)
  const tier = runTier ? combatTier(ability, runTier) : tool ? toolTier(tool, progress) : 1
  const reach = (tier - 1) * 18
  return towerRange(stage) + reach
}

export function heavenSpeed(tier = 1, easy = false): number {
  return waveSpeed(easy) * (1.7 + Math.max(0, tier - 1) * 0.08)
}

export function dist(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}
