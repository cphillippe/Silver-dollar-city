import neighborShowsMercy from '../assets/match/neighbor-shows-mercy.png'

/** Card-specific Match / Link pictures. Not the lot’s creek / bench / lamp glyph. */
export const MATCH_ART = {
  'ph-road': neighborShowsMercy,
} as const

export type MatchArtId = keyof typeof MATCH_ART
