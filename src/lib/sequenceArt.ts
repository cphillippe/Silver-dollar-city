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
import lantern1Dark from '../assets/story-strip/lantern1-dark.webp'
import lantern2Lamp from '../assets/story-strip/lantern2-lamp.webp'
import lantern3Found from '../assets/story-strip/lantern3-found.webp'
import dcreed1Rose from '../assets/story-strip/dcreed1-rose.webp'
import dcreed2Tell from '../assets/story-strip/dcreed2-tell.webp'
import dcreed3Letter from '../assets/story-strip/dcreed3-letter.webp'
import reason1Think from '../assets/story-strip/reason1-think.webp'
import reason2Ground from '../assets/story-strip/reason2-ground.webp'
import reason3Light from '../assets/story-strip/reason3-light.webp'
import reason4Stands from '../assets/story-strip/reason4-stands.webp'

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
  'lantern1-dark': lantern1Dark,
  'lantern2-lamp': lantern2Lamp,
  'lantern3-found': lantern3Found,
  'dcreed1-rose': dcreed1Rose,
  'dcreed2-tell': dcreed2Tell,
  'dcreed3-letter': dcreed3Letter,
  'reason1-think': reason1Think,
  'reason2-ground': reason2Ground,
  'reason3-light': reason3Light,
  'reason4-stands': reason4Stands,
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
  'lantern1-dark': { sky: '#2c3a6b', horizon: '#4b5a8f', ground: '#3d4a3a' },
  'lantern2-lamp': { sky: '#33427a', horizon: '#ffd98a', ground: '#4a5a3e' },
  'lantern3-found': { sky: '#3a4a86', horizon: '#ffe2a0', ground: '#6b7a4a' },
  'dcreed1-rose': { sky: '#ffd59a', horizon: '#fff6e0', ground: '#8fbf6a' },
  'dcreed2-tell': { sky: '#f3d7a1', horizon: '#fff0c8', ground: '#7fba68' },
  'dcreed3-letter': { sky: '#e9d6b5', horizon: '#fff3dc', ground: '#b89a72' },
  'reason1-think': { sky: '#bfe3ff', horizon: '#fff3cf', ground: '#e2c58f' },
  'reason2-ground': { sky: '#bfe3ff', horizon: '#fff3cf', ground: '#9fc47a' },
  'reason3-light': { sky: '#ffe6a3', horizon: '#fffbe8', ground: '#f2d48a' },
  'reason4-stands': { sky: '#ffe9b8', horizon: '#fff8e6', ground: '#9fc47a' },
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

/**
 * Easy short-strip crop. A 3-frame row is a tall portrait, so the picture
 * covers the card and this point stays in the window. Heads stay whole.
 */
export const SEQUENCE_CROP: Record<string, { x: string; y: string }> = {
  'beat1-tired': { x: '48%', y: '0%' },
  'beat2-come': { x: '68%', y: '0%' },
  'beat3-rest': { x: '46%', y: '0%' },
  'lantern1-dark': { x: '28%', y: '0%' },
  'lantern2-lamp': { x: '22%', y: '0%' },
  'lantern3-found': { x: '45%', y: '0%' },
  'dcreed1-rose': { x: '50%', y: '0%' },
  'dcreed2-tell': { x: '30%', y: '0%' },
  'dcreed3-letter': { x: '45%', y: '0%' },
}

export const SEQUENCE_FIGURE: Record<string, SequenceFigure> = {
  'road1-lawyer': { cue: 'Jesus', x: '75%', y: '2%', ox: '96%', oy: '0%', scale: 2.2 },
  'road3-temple': { cue: 'Priest', x: '58%', y: '8%', ox: '62%', oy: '0%', scale: 2.7 },
  'creed1-died': { cue: 'Jesus', x: '50%', y: '20%', ox: '50%', oy: '28%', scale: 1.25 },
  'creed3-raised': { cue: 'Jesus', x: '63%', y: '4%', ox: '75%', oy: '2%', scale: 2.1 },
  'creed4-appeared': { cue: 'Jesus', x: '23%', y: '4%', ox: '-3%', oy: '2%', scale: 2 },
  'reason3-light': { cue: 'Jesus', x: '45%', y: '4%', ox: '45%', oy: '2%', scale: 1.8 },
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
