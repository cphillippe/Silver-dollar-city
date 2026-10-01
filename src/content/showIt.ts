import { panelBlastHref } from './panelBlast.ts'

/** Easy show-it pilot — first Easy beat only (Fixes #439). */
export const SHOW_IT_LINE = 'ph-road'

/** Only visible instructional copy on the show-it card. Two words. */
export const SHOW_IT_PROMPT = 'Who helped?'

export const SHOW_IT_WORD_CAP = 6

export function showItWordCount(copy: string): number {
  return copy.trim().split(/\s+/).filter(Boolean).length
}

function publicBase(): string {
  const base = import.meta.env?.BASE_URL ?? './'
  return base.endsWith('/') ? base : `${base}/`
}

export function showItHref(file: string): string {
  return `${publicBase()}assets/show-it/${file}`
}

export interface ShowItChoice {
  id: string
  /** Screen-reader name. Not painted as visible copy. */
  label: string
  src: string
}

/**
 * ph-road clip, then three panel-blast stills.
 * Correct picture is the helper (compassion-helps).
 */
export const PH_ROAD_SHOW_IT = {
  clip: showItHref('ph-road-showit.webm'),
  poster: showItHref('ph-road-showit-poster.jpg'),
  prompt: SHOW_IT_PROMPT,
  correctId: '03-compassion-helps',
  choices: [
    {
      id: '01-hurt-road',
      label: 'Hurt on the road',
      src: panelBlastHref('ph-road', '01-hurt-road', 1024),
    },
    {
      id: '02-walk-past',
      label: 'Walked past',
      src: panelBlastHref('ph-road', '02-walk-past', 1024),
    },
    {
      id: '03-compassion-helps',
      label: 'Helper',
      src: panelBlastHref('ph-road', '03-compassion-helps', 1024),
    },
  ] as const satisfies readonly ShowItChoice[],
}
