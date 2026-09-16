/** Gemini panel-blast stills for Easy Mercy (ph-road) and the father-run (ph-father). */

export type PanelBlastStory = 'ph-road' | 'ph-father'
export type PanelBlastSize = 512 | 1024

export const PANEL_BLAST_VERSION = '1.4.85'

/** Samaritan / Easy road-maze beats — index order is B1…B4. */
export const ROAD_BLAST_IDS = [
  '01-hurt-road',
  '02-walk-past',
  '03-compassion-helps',
  '04-proved-neighbor',
] as const

/**
 * Father-run beats — B3 is 03-speech-road (sorry + headed home).
 * Do not point B3 at a before-* archive. Hug/feast win uses 05.
 */
export const FATHER_BLAST_IDS = [
  '01-share-early',
  '02-far-waste',
  '03-speech-road',
  '04-father-runs',
] as const

export const ROAD_CLAIM_BADGE_ID = 'claim-badge'
export const FATHER_HUG_ID = '05-hug-feast-hint'

const BLAST_BEATS: Record<PanelBlastStory, readonly string[]> = {
  'ph-road': ROAD_BLAST_IDS,
  'ph-father': FATHER_BLAST_IDS,
}

function publicBase(): string {
  const base = import.meta.env?.BASE_URL ?? './'
  return base.endsWith('/') ? base : `${base}/`
}

/** Vite/Pages public href. `base: './'` keeps github.io + Capacitor on the same path. */
export function panelBlastHref(story: PanelBlastStory, id: string, size: PanelBlastSize): string {
  return `${publicBase()}assets/panel-blast/${story}/${id}@${size}.webp`
}

export function panelBlastMedia(story: PanelBlastStory, id: string): {
  kind: 'still'
  still: string
  thumb: string
} {
  return {
    kind: 'still',
    still: panelBlastHref(story, id, 1024),
    thumb: panelBlastHref(story, id, 512),
  }
}

export function isPanelBlastStory(lineId: string): lineId is PanelBlastStory {
  return lineId === 'ph-road' || lineId === 'ph-father'
}

export function panelBlastBeatMedia(
  lineId: string,
  index: number,
): { kind: 'still'; still?: string; thumb?: string } {
  if (!isPanelBlastStory(lineId)) return { kind: 'still' }
  if (lineId === 'ph-father' && index >= FATHER_BLAST_IDS.length) {
    return panelBlastMedia('ph-father', FATHER_HUG_ID)
  }
  const ids = BLAST_BEATS[lineId]
  const id = ids[Math.min(Math.max(index, 0), ids.length - 1)] ?? ids[0]
  return panelBlastMedia(lineId, id)
}

export const ROAD_CLAIM_MEDIA = panelBlastMedia('ph-road', ROAD_CLAIM_BADGE_ID)
export const FATHER_HUG_MEDIA = panelBlastMedia('ph-father', FATHER_HUG_ID)

export const ROAD_HURT_FACE = panelBlastHref('ph-road', '01-hurt-road', 512)
export const ROAD_HELP_FACE = panelBlastHref('ph-road', '03-compassion-helps', 512)
export const FATHER_RUN_FACE = panelBlastHref('ph-father', '04-father-runs', 1024)
export const FATHER_SON_FACE = panelBlastHref('ph-father', '02-far-waste', 1024)
