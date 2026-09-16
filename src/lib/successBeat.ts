import { evidenceFor } from '../content/evidence.ts'
import { packLesson } from '../content/packCatalog.ts'
import { EASY, easyChromeLine, easyWhyLine } from './easy.ts'
import { CLAIM_MERGE_LINE, CLAIM_MERGE_WIN } from './claimMerge.ts'
import { FATHER_RUN_LINE } from './fatherRun.ts'
import { ROAD_MAZE_LINE } from './roadMaze.ts'
import type { GemWord } from './gemSearch.ts'

export interface SuccessBeat {
  title: string
  why: string
  from?: string
}

/** Kid-plain claim · reason · source after Learn or arcade — not a quiz. */
export function lineTakeaway(lineId: string): { claim: string; why: string; from: string } {
  const lesson = packLesson(lineId)
  const brief = evidenceFor(lineId)
  const claim = easyChromeLine(lesson?.claim || brief?.claim || '').replace(/\.$/, '')
  const why = easyWhyLine(lesson?.easy.hold.why || brief?.reason || '')
  const from = lesson?.source || brief?.source || ''
  return { claim, why, from }
}

/** Kid-plain beat after a required gem-word find. */
export function gemTargetBeat(word: GemWord): SuccessBeat {
  if (word.kind === 'person') {
    return { title: `Yes · ${word.label}`, why: 'This person keeps the story.' }
  }
  if (word.kind === 'place') {
    return { title: `Yes · ${word.label}`, why: 'The story lives here.' }
  }
  return { title: `Yes · ${word.label}`, why: 'That’s the main idea.' }
}

/** Kid-plain beat after a bonus word — names the +100 and the extra try. */
export function gemBonusBeat(label: string): SuccessBeat {
  return { title: EASY.bonusToast, why: `${label} · ${EASY.bonusWhy}` }
}

export function matchClaimLine(lineId: string): string {
  const lesson = packLesson(lineId)
  const claim = lesson?.claim || evidenceFor(lineId)?.claim || lesson?.plain || ''
  return easyChromeLine(claim).replace(/\.$/, '')
}

/** After every required chip is found. */
export function matchClearBeat(lineId: string): SuccessBeat {
  const take = lineTakeaway(lineId)
  return {
    title: `Yes · ${take.claim || matchClaimLine(lineId)}`,
    why: take.why || 'You found the story.',
    from: take.from,
  }
}

/** Hold lock-in — names the line they got right, why it stands, and from where. */
export function holdSuccessBeat(claim: string, why: string, from = ''): SuccessBeat {
  const face = easyChromeLine(claim).replace(/\.$/, '')
  const reason = why.replace(/\.$/, '').trim()
  return {
    title: `Yes! ${face}`,
    why: reason ? `${reason}. That’s why this is true.` : EASY.whyStands,
    from,
  }
}

export function fatherWinBeat(): SuccessBeat {
  const take = lineTakeaway(FATHER_RUN_LINE)
  return {
    title: `Yes · ${take.claim}`,
    why: take.why || EASY.fatherWinWhy,
    from: take.from,
  }
}

export function mazeWinBeat(): SuccessBeat {
  const take = lineTakeaway(ROAD_MAZE_LINE)
  return {
    title: `Yes · ${take.claim}`,
    why: take.why || EASY.mazeWinWhy,
    from: take.from,
  }
}

/** After the arcade win — sayable triad, not a why-quiz. Stamp stays MERGED!. */
export function mergeWinBeat(): SuccessBeat {
  const take = lineTakeaway(CLAIM_MERGE_LINE)
  return {
    title: CLAIM_MERGE_WIN,
    why: take.why || (take.claim ? `${take.claim}.` : ''),
    from: take.from,
  }
}
