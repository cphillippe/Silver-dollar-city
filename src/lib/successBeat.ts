import { evidenceFor } from '../content/evidence.ts'
import { packLesson } from '../content/packCatalog.ts'
import { EASY, easyChromeLine, easyWhyLine } from './easy.ts'
import { FATHER_RUN_CLAIM } from './fatherRun.ts'
import type { GemWord } from './gemSearch.ts'

export interface SuccessBeat {
  title: string
  why: string
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
  return { title: `+100 · ${label}!`, why: EASY.bonusWhy }
}

export function matchClaimLine(lineId: string): string {
  const lesson = packLesson(lineId)
  const claim = lesson?.claim || evidenceFor(lineId)?.claim || lesson?.plain || ''
  return easyChromeLine(claim).replace(/\.$/, '')
}

/** After every required chip is found. */
export function matchClearBeat(lineId: string): SuccessBeat {
  const lesson = packLesson(lineId)
  const why = easyWhyLine(lesson?.easy.hold.why || evidenceFor(lineId)?.reason || '')
  return {
    title: `Yes · ${matchClaimLine(lineId)}`,
    why: why || 'You found the story.',
  }
}

/** Hold lock-in — names the line they got right. */
export function holdSuccessBeat(claim: string, why: string): SuccessBeat {
  const face = easyChromeLine(claim).replace(/\.$/, '')
  return { title: `Yes! ${face}`, why }
}

export function fatherWinBeat(): SuccessBeat {
  return { title: `Yes · ${FATHER_RUN_CLAIM.replace(/\.$/, '')}`, why: EASY.fatherWinWhy }
}
