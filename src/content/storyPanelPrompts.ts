import type { StoryScene } from '../lib/storyPanels.ts'

/**
 * Authoritative Gemini stills for Easy panel blast.
 * Keyed to live `beatId`s so generated files drop into
 * `src/assets/story/panel-*.webp` 1:1. No copy in the image.
 * Do not rewrite harvest shortStory to fit a prompt.
 */
export const CANDY_PANEL_STYLE = [
  'Flat candy 2D game comic panel, square 1:1, phone-readable at ~160px.',
  'Gumdrop and marshmallow people, strawberry and lollipop hills, gold-brick candy road, sunset candy sky, soft sparkles.',
  'Thick clean shapes, saturated pastels, no outlines of photoreal skin.',
  'No letters, no words, no captions, no speech bubbles, no UI chrome.',
  'PG, no gore, no open wounds, no blood, no photorealism, no 3D cinema lighting.',
].join(' ')

export interface GeminiPanelPrompt {
  beatId: string
  lineId: 'ph-road' | 'ph-father'
  scene: StoryScene
  /** Live Match flip, or a spare still if we later unpack a 5th beat. */
  slot: 'live' | 'spare'
  file: string
  prompt: string
}

const ROAD: GeminiPanelPrompt[] = [
  {
    beatId: 'ph-road:hurt:0',
    lineId: 'ph-road',
    scene: 'hurt',
    slot: 'live',
    file: 'panel-hurt.webp',
    prompt: `${CANDY_PANEL_STYLE} A small candy traveler in a red gumdrop hood lies on a gold-brick candy road, eyes closed, one tiny bandage, sad but gentle. Soft strawberry hills and a sunset. Hurt, not graphic.`,
  },
  {
    beatId: 'ph-road:walk-past:1',
    lineId: 'ph-road',
    scene: 'walk-past',
    slot: 'live',
    file: 'panel-walk-past.webp',
    prompt: `${CANDY_PANEL_STYLE} Two candy figures walk away down the gold-brick road: one purple gumdrop robe, one cream marshmallow robe, backs to camera. A small hurt candy traveler rests in the foreground, not bloody. They do not stop. Same candy world as the other mercy panels — not illustrated realism.`,
  },
  {
    beatId: 'ph-road:help:2',
    lineId: 'ph-road',
    scene: 'help',
    slot: 'live',
    file: 'panel-help.webp',
    prompt: `${CANDY_PANEL_STYLE} A strawberry-hood candy helper kneels and wraps a soft green cloth around a sitting purple gumdrop traveler. A pink candy heart sparkles above. Kind faces, gold-brick road, berry hills.`,
  },
  {
    beatId: 'ph-road:neighbor:3',
    lineId: 'ph-road',
    scene: 'neighbor',
    slot: 'live',
    file: 'panel-neighbor.webp',
    prompt: `${CANDY_PANEL_STYLE} Two candy people face each other on the gold-brick road: strawberry-hood helper offering a hand, swirl-hair marshmallow traveler listening. A small gold question mark and a tiny heart float between them. Who proved to be the neighbor — shown as a silent beat, no text.`,
  },
]

const FATHER: GeminiPanelPrompt[] = [
  {
    beatId: 'ph-father:son-leave:spare',
    lineId: 'ph-father',
    scene: 'son-leave',
    slot: 'spare',
    file: 'panel-son-leave.webp',
    prompt: `${CANDY_PANEL_STYLE} A young candy son walks away down the gold-brick road with a small candy sack, leaving a warm candy house behind. Not angry — early share, far from home. Spare still if Match later unpacks this beat.`,
  },
  {
    beatId: 'ph-father:hungry:0',
    lineId: 'ph-father',
    scene: 'hungry',
    slot: 'live',
    file: 'panel-hungry.webp',
    prompt: `${CANDY_PANEL_STYLE} A thin candy son sits hungry and ashamed on the gold-brick road, empty candy sack nearby, practicing a small hired-hand speech with folded hands. Far from a tiny candy house on the horizon. Gentle, not grim.`,
  },
  {
    beatId: 'ph-father:father-run:1',
    lineId: 'ph-father',
    scene: 'father-run',
    slot: 'live',
    file: 'panel-father-run.webp',
    prompt: `${CANDY_PANEL_STYLE} LOCKED BEAT: a joyful candy father in a gold robe RUNS down the gold-brick road toward the viewer, arms wide, beard flying. Behind him the son is still a tiny distant figure, far away. The father is already running while the son is still far. Mercy before any speech. Motion lines, strawberry hills, sunset.`,
  },
  {
    beatId: 'ph-father:hug:2',
    lineId: 'ph-father',
    scene: 'hug',
    slot: 'live',
    file: 'panel-hug.webp',
    prompt: `${CANDY_PANEL_STYLE} Candy father wraps the returned son in a wide hug on the gold-brick road. Warm gold robe, relieved faces, no crowd yet. Soft sparkles.`,
  },
  {
    beatId: 'ph-father:feast:3',
    lineId: 'ph-father',
    scene: 'feast',
    slot: 'live',
    file: 'panel-feast.webp',
    prompt: `${CANDY_PANEL_STYLE} A candy feast the father prepared: round table, fruit tarts, a welcome banner made of icing (no readable letters — swirl shapes only). Father and son sit together. The welcome is the father’s idea.`,
  },
]

export const GEMINI_PANEL_PROMPTS: GeminiPanelPrompt[] = [...ROAD, ...FATHER]

export function geminiPromptFor(beatId: string): GeminiPanelPrompt | undefined {
  return GEMINI_PANEL_PROMPTS.find((row) => row.beatId === beatId)
}
