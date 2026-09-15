import { PACK_XML } from './packEmbedded.ts'
import { catalogFromXml, easyOrderIds, lessonById, type PackParseIssue } from './packParse.ts'
import type { PackCatalog, PackLesson, LessonTierId } from './packTypes.ts'

export const PACK_ISSUES: PackParseIssue[] = []
export const PACK_CATALOG: PackCatalog = catalogFromXml(PACK_XML, PACK_ISSUES)

export function packLesson(id: string): PackLesson | undefined {
  return lessonById(PACK_CATALOG, id)
}

export function packEasyOrder(): string[] {
  const ordered = easyOrderIds(PACK_CATALOG)
  return ordered.length ? ordered : PACK_CATALOG.lessons.map((lesson) => lesson.id)
}

function padChoices(keep: string, misses: string[]): [string, string, string] {
  const extra = misses.filter((line) => line && line !== keep)
  return [keep, extra[0] || `${keep} — not this.`, extra[1] || `${keep} — a weaker reading.`]
}

function padWhyChoices(keep: string, misses: string[]): string[] {
  const extra = misses.filter((line) => line && line !== keep)
  const padded = [
    keep,
    extra[0] || `${keep} — not this.`,
    extra[1] || `${keep} — a weaker reading.`,
    ...extra.slice(2),
  ]
  const seen = new Set<string>()
  const next: string[] = []
  for (const line of padded) {
    if (!line || seen.has(line)) continue
    seen.add(line)
    next.push(line)
  }
  return next
}

export function briefFromPack(
  lesson: PackLesson,
  tier: LessonTierId = 'medium',
) {
  const pack = lesson[tier] ?? lesson.medium
  const why = pack.hold.why || lesson.claim
  return {
    id: lesson.id,
    claim: lesson.claim,
    reason: why,
    source: lesson.source,
    claimChoices: padChoices(lesson.claim, pack.hold.claimMisses),
    reasonChoices: padWhyChoices(why, pack.hold.whyMisses),
  }
}

export function packBrief(id: string, tier: LessonTierId = 'medium') {
  const lesson = packLesson(id)
  return lesson ? briefFromPack(lesson, tier) : undefined
}
