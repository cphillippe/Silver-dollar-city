/**
 * Trail home (A4). The Easy loop: teach order and arc gates, the open line, Home focus,
 * the Match → Lock In view, and the Match-only teach / hold fields (#448).
 * lib/easy.ts re-exports these same bindings. Never import lib/easy here — that would be a cycle.
 */
import type { ProgressState } from '../../types.ts'
import { packEasyOrder } from '../../content/packCatalog.ts'
import { currentLessonTier, needsTierHold, tierRank } from '../../lib/tiers.ts'
import { digPrior, inkPrior, namesPrior, stonePrior } from '../../lib/sourceDig.ts'

/** Why Gate foundation arc — unlock in order after Story Creek; next after prior Easy Hold. */
export const FOUNDATION_ARC = ['fg-order', 'fg-reason', 'fg-ought', 'fg-ground'] as const

export function foundationPrior(id: string): string | undefined {
  const index = (FOUNDATION_ARC as readonly string[]).indexOf(id)
  if (index <= 0) return undefined
  return FOUNDATION_ARC[index - 1]
}

export function foundationReady(progress: Pick<ProgressState, 'easyHeld'>, id: string): boolean {
  const prior = foundationPrior(id)
  if (!prior) return true
  return (progress.easyHeld ?? []).includes(prior)
}

export function digReady(progress: Pick<ProgressState, 'easyHeld'>, id: string): boolean {
  const prior = digPrior(id)
  if (!prior) return true
  return (progress.easyHeld ?? []).includes(prior)
}

export function namesReady(progress: Pick<ProgressState, 'easyHeld'>, id: string): boolean {
  const prior = namesPrior(id)
  if (!prior) return true
  return (progress.easyHeld ?? []).includes(prior)
}

export function stoneReady(progress: Pick<ProgressState, 'easyHeld'>, id: string): boolean {
  const prior = stonePrior(id)
  if (!prior) return true
  return (progress.easyHeld ?? []).includes(prior)
}

export function inkReady(progress: Pick<ProgressState, 'easyHeld'>, id: string): boolean {
  const prior = inkPrior(id)
  if (!prior) return true
  return (progress.easyHeld ?? []).includes(prior)
}

/** Easy street lines in teach order — packs set easyOrder; first is still mercy. */
const FALLBACK_EASY_ORDER = [
  'ph-road',
  'ph-father',
  'ph-debt',
  'fg-order',
  'fg-reason',
  'fg-ought',
  'fg-ground',
  'wb-creed',
  'wb-women',
  'wb-early',
  'wb-method',
  'daily-names',
  'daily-creed',
  'daily-empty',
  'daily-lantern',
  'daily-stars',
  'daily-cosmos',
  'hl-moral',
] as const

const PACK_ORDER = packEasyOrder()
export const EASY_LINE_ORDER = (
  PACK_ORDER.length ? PACK_ORDER : [...FALLBACK_EASY_ORDER]
) as readonly string[]
export const EASY_MATCH_LINE = EASY_LINE_ORDER[0] ?? 'ph-road'

type EasyLoopProgress = Pick<
  ProgressState,
  'easyTaught' | 'easyHeld' | 'lessonTier' | 'lessonScore' | 'tierTaught'
>

/** Easy Learn unlock — Hard taught / completed / held do not count. */
export function easyLineTaught(progress: EasyLoopProgress, id: string): boolean {
  const current = currentLessonTier(progress, id)
  if (current === 'easy') return (progress.easyTaught ?? []).includes(id)
  const taught = progress.tierTaught?.[id]
  if (!taught) return false
  return taught === current || tierRank(taught) >= tierRank(current)
}

/** Easy Hold unlock — Hard or older held lines do not count. */
export function easyLineHeld(progress: EasyLoopProgress, id: string): boolean {
  return (progress.easyHeld ?? []).includes(id)
}

/** Easy loop “learned” means taught on Easy. */
export function easyLineLearned(progress: EasyLoopProgress, id: string): boolean {
  return easyLineTaught(progress, id)
}

/**
 * One Easy triad at a time. Prefer the first line not yet held on Easy,
 * in pack easyOrder — mercy-first (ph-road), Story Creek opening, then the
 * Why Gate foundation arc (order → reason → ought → ground), then Witness
 * Square Dig deeper (creed → women → early → method), then Names that stay
 * (names → creed close → empty), then after the Easy door Stone Court
 * (Tacitus → James → Pliny), then Ink Court (Trajan → Suetonius → Lucian). Each arc stays gated: the next opens only
 * after the prior Easy Hold.
 * After every Easy hold, the next unheld Easy line is Learn — not a Medium jump.
 * When the Easy trail is done, loop the first idea still below Hard.
 * Hard / older taught, completed, held, or learnings do not advance this.
 */
export function easyLoopLine(progress: EasyLoopProgress): string {
  for (const id of EASY_LINE_ORDER) {
    if (easyLineHeld(progress, id)) continue
    if (!foundationReady(progress, id)) continue
    if (!digReady(progress, id)) continue
    if (!namesReady(progress, id)) continue
    if (!stoneReady(progress, id)) continue
    if (!inkReady(progress, id)) continue
    return id
  }
  for (const id of EASY_LINE_ORDER) {
    if (currentLessonTier(progress, id) !== 'hard') return id
  }
  return EASY_MATCH_LINE
}

/** Next Easy story — same line as Match and Hold until that triad is held. */
export function easyLearnLine(progress: EasyLoopProgress): string {
  return easyLoopLine(progress)
}

export function easyMatchLine(progress: EasyLoopProgress): string {
  return easyLoopLine(progress)
}

export function easyHoldLine(progress: EasyLoopProgress): string {
  return easyLoopLine(progress)
}

/** Easy Match is the story — open for the current loop line. */
export function easyMatchReady(progress: EasyLoopProgress): boolean {
  void progress
  return true
}

/**
 * Gold home tap for the open triad. Match teaches through the lesson play.
 * After the board is cleared (taught), Hold is next. After Hold, the next
 * line’s Match. Learn stays a re-read, not the gate — cold coach lists
 * Match first so “now” matches the real next action (Fixes #187).
 */
export type EasyHomeFocus = 'learn' | 'match' | 'hold'

export function easyHomeFocus(progress: EasyLoopProgress): EasyHomeFocus {
  const id = easyLoopLine(progress)
  if (!easyLineTaught(progress, id)) return 'match'
  if (!easyLineHeld(progress, id) || needsTierHold(progress, id)) return 'hold'
  return 'match'
}

/** Hold practice for the open triad — hide the saved-line filing cabinet. */
export function easyHoldPractice(progress: EasyLoopProgress): boolean {
  const id = easyLoopLine(progress)
  if (!easyLineTaught(progress, id)) return false
  if (!easyLineHeld(progress, id)) return true
  return needsTierHold(progress, id)
}

export function easyHoldView(progress: EasyLoopProgress): {
  name: 'journal'
  focusId?: string
  autoQuiz?: boolean
} {
  if (easyHoldPractice(progress)) {
    return { name: 'journal', focusId: easyHoldLine(progress), autoQuiz: true }
  }
  return { name: 'journal' }
}

/**
 * Open triad after Welcome / Home / a lot tap.
 * Untaught → Match arcade (gem, Source Dig, or the line’s other play).
 * Taught → Lock In. A quiz must not stand in for an untaught Match (Fixes #448).
 */
export function easyTrailView(
  progress: EasyLoopProgress,
): { name: 'link' } | ReturnType<typeof easyHoldView> {
  if (easyHomeFocus(progress) === 'hold') return easyHoldView(progress)
  return { name: 'link' }
}

/** Match clear — Lock In can open before the save flush lands. */
export function progressAfterMatchTaught<T extends EasyLoopProgress>(
  progress: T,
  id: string,
): T {
  return {
    ...progress,
    easyTaught: markEasyTaught(progress, id),
    tierTaught: {
      ...(progress.tierTaught ?? {}),
      [id]: currentLessonTier(progress, id),
    },
  }
}

/**
 * Easy-loop teach. Only Match writes easyTaught / tierTaught.
 * Area walks and Daily may record the general taught list; they must not
 * skip gem Match or Source Dig (Fixes #448).
 */
export function easyTeachFields(
  progress: EasyLoopProgress,
  id: string,
  fromMatch: boolean,
): { easyTaught: string[]; tierTaught: NonNullable<EasyLoopProgress['tierTaught']> } {
  if (!fromMatch) {
    return {
      easyTaught: progress.easyTaught ?? [],
      tierTaught: progress.tierTaught ?? {},
    }
  }
  const next = progressAfterMatchTaught(progress, id)
  return {
    easyTaught: next.easyTaught ?? [],
    tierTaught: next.tierTaught ?? {},
  }
}

/** A quiz or area encode cannot hold a line Match has not taught. */
export function easyHoldFields(progress: EasyLoopProgress, id: string): string[] {
  if (!easyLineTaught(progress, id)) return progress.easyHeld ?? []
  return markEasyHeld(progress, id)
}

function appendUnique(list: string[] | undefined, id: string): string[] {
  const next = list ?? []
  return next.includes(id) ? next : [...next, id]
}

/** Record an Easy Learn. Hard-mode teach does not write this. */
export function markEasyTaught(progress: EasyLoopProgress, id: string): string[] {
  return appendUnique(progress.easyTaught, id)
}

/** Record an Easy Hold. Hard or older held lines do not write this. */
export function markEasyHeld(progress: EasyLoopProgress, id: string): string[] {
  return appendUnique(progress.easyHeld, id)
}
