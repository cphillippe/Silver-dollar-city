import type { GemId, SequenceItem } from '../types'
import type { StoryScene } from './storyPanels'
import beat1Tired from '../assets/story-strip/beat1-tired.webp'
import beat2Come from '../assets/story-strip/beat2-come.webp'
import beat3Rest from '../assets/story-strip/beat3-rest.webp'
import creed1Died from '../assets/story-strip/creed1-died.webp'
import creed2Buried from '../assets/story-strip/creed2-buried.webp'
import creed3Raised from '../assets/story-strip/creed3-raised.webp'
import creed4Appeared from '../assets/story-strip/creed4-appeared.webp'
import road1Lawyer from '../assets/story-strip/road1-lawyer.webp'
import road2Robbers from '../assets/story-strip/road2-robbers.webp'
import road3Temple from '../assets/story-strip/road3-temple.webp'
import road4Samaritan from '../assets/story-strip/road4-samaritan.webp'
import road5Inn from '../assets/story-strip/road5-inn.webp'

/** RGBA cutout keys. A later art swap replaces the file and keeps the key. */
export const SEQUENCE_ART: Record<string, string> = {
  'beat1-tired': beat1Tired,
  'beat2-come': beat2Come,
  'beat3-rest': beat3Rest,
  'creed1-died': creed1Died,
  'creed2-buried': creed2Buried,
  'creed3-raised': creed3Raised,
  'creed4-appeared': creed4Appeared,
  'road1-lawyer': road1Lawyer,
  'road2-robbers': road2Robbers,
  'road3-temple': road3Temple,
  'road4-samaritan': road4Samaritan,
  'road5-inn': road5Inn,
}

export interface SequenceBackdrop {
  sky: string
  horizon: string
  ground: string
}

const DEFAULT_BACKDROP: SequenceBackdrop = {
  sky: '#9fd2ff',
  horizon: '#fff0b0',
  ground: '#8fbf6a',
}

const CUTOUT_BACKDROP: Record<string, SequenceBackdrop> = {
  'beat1-tired': { sky: '#ffb36b', horizon: '#ffd59a', ground: '#c98547' },
  'beat2-come': { sky: '#9fd2ff', horizon: '#fff0b0', ground: '#9bcf6e' },
  'beat3-rest': { sky: '#a8e3ff', horizon: '#d9f3ff', ground: '#6bb85a' },
  'creed1-died': { sky: '#d7c4a4', horizon: '#f3e6cf', ground: '#6d8a4e' },
  'creed2-buried': { sky: '#6e5c86', horizon: '#cbb89a', ground: '#7d8a62' },
  'creed3-raised': { sky: '#ffd59a', horizon: '#fff6e0', ground: '#8fbf6a' },
  'creed4-appeared': { sky: '#f3d7a1', horizon: '#fff0c8', ground: '#7fba68' },
  'road1-lawyer': { sky: '#f6e2b8', horizon: '#fff6dd', ground: '#c4a06a' },
  'road2-robbers': { sky: '#f6e2b8', horizon: '#fff6dd', ground: '#c4a06a' },
  'road3-temple': { sky: '#f6e2b8', horizon: '#fff6dd', ground: '#c4a06a' },
  'road4-samaritan': { sky: '#f6e2b8', horizon: '#fff6dd', ground: '#c4a06a' },
  'road5-inn': { sky: '#f6e2b8', horizon: '#fff6dd', ground: '#c4a06a' },
}

/**
 * Easy thumbnail focus. The chip sits at the middle of the card, so the crop
 * has to put the named person there: Jesus (bare brown hair, plain robe) or
 * the priest (white headpiece). Hard keeps the uncropped picture.
 */
export interface SequenceFigure {
  cue: 'Jesus' | 'Priest'
  x: string
  y: string
  ox: string
  oy: string
  scale: number
}

export const SEQUENCE_FIGURE: Record<string, SequenceFigure> = {
  'road1-lawyer': { cue: 'Jesus', x: '75%', y: '2%', ox: '96%', oy: '0%', scale: 2.2 },
  'road3-temple': { cue: 'Priest', x: '58%', y: '8%', ox: '62%', oy: '0%', scale: 2.7 },
  'creed1-died': { cue: 'Jesus', x: '50%', y: '20%', ox: '50%', oy: '28%', scale: 1.25 },
  'creed3-raised': { cue: 'Jesus', x: '63%', y: '4%', ox: '75%', oy: '2%', scale: 2.1 },
  'creed4-appeared': { cue: 'Jesus', x: '23%', y: '4%', ox: '-3%', oy: '2%', scale: 2 },
}

/** Fallback only. ph-road items carry their own cutout keys. */
const ROAD_SCENES: StoryScene[] = ['hurt', 'walk-past', 'help', 'neighbor']

const FOUNDATION_IDS = new Set(['fg-reason', 'fg-ground', 'fg-mover'])

export type SequenceVisual =
  | { kind: 'cutout'; src: string; backdrop: SequenceBackdrop }
  | { kind: 'story'; scene: StoryScene; backdrop: SequenceBackdrop }
  | { kind: 'foundation'; beatId: string; backdrop: SequenceBackdrop }
  | { kind: 'gem'; gem: GemId; backdrop: SequenceBackdrop }

/**
 * Explicit cutout art, then a ph-road story-panel fallback, then FoundationArt for fg-*,
 * then a centered GemMark. Never an empty stretched chip.
 */
export function resolveSequenceVisual(
  challengeId: string,
  item: SequenceItem,
  index: number,
): SequenceVisual {
  if (item.art && SEQUENCE_ART[item.art]) {
    return {
      kind: 'cutout',
      src: SEQUENCE_ART[item.art],
      backdrop: CUTOUT_BACKDROP[item.art] ?? DEFAULT_BACKDROP,
    }
  }
  if (challengeId === 'ph-road' && index >= 1 && index - 1 < ROAD_SCENES.length) {
    return { kind: 'story', scene: ROAD_SCENES[index - 1], backdrop: DEFAULT_BACKDROP }
  }
  if (FOUNDATION_IDS.has(challengeId)) {
    return {
      kind: 'foundation',
      beatId: `${challengeId}:beat:${index}`,
      backdrop: { sky: '#2a0d58', horizon: '#3a1480', ground: '#1a0840' },
    }
  }
  return { kind: 'gem', gem: item.gem ?? 'star', backdrop: DEFAULT_BACKDROP }
}
