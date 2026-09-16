import { packLesson } from '../content/packCatalog.ts'
import { evidenceFor } from '../content/evidence.ts'
import { panelBlastBeatMedia } from '../content/panelBlast.ts'
import { easyChromeLine, easyWhoWhere } from './easy.ts'
import { gemWordsFor } from './gemSearch.ts'

export type StoryScene =
  | 'tell'
  | 'hurt'
  | 'walk-past'
  | 'help'
  | 'neighbor'
  | 'son-leave'
  | 'hungry'
  | 'father-run'
  | 'hug'
  | 'feast'
  | 'forgive'
  | 'choke'
  | 'seed'
  | 'lamp'
  | 'tomb'
  | 'creed'
  | 'sky'
  | 'keep'
  | 'creek'

/** Still now; a later short loop can drop in without changing Hold. */
export type StoryMediaKind = 'still' | 'loop'

export interface StoryMediaSlot {
  kind: StoryMediaKind
  still?: string
  thumb?: string
  loop?: string
}

/** Prefer a later short loop; otherwise a still. No player — just which src to show. */
export function resolveStoryMedia(media?: StoryMediaSlot): {
  kind: 'still' | 'loop'
  still?: string
  thumb?: string
  loop?: string
} {
  if (media?.loop) return { kind: 'loop', still: media.still, thumb: media.thumb, loop: media.loop }
  return { kind: 'still', still: media?.still, thumb: media?.thumb }
}

export interface StoryPanel {
  id: string
  beatId: string
  text: string
  scene: StoryScene
  fromStory: boolean
  media: StoryMediaSlot
}

const LESSON_SCENES: Record<string, StoryScene[]> = {
  'ph-road': ['hurt', 'walk-past', 'help', 'neighbor'],
  'ph-father': ['son-leave', 'hungry', 'father-run', 'hug', 'feast'],
  'ph-debt': ['forgive', 'choke', 'keep'],
  'ph-seeds': ['tell', 'seed', 'keep'],
  'daily-lantern': ['lamp', 'tell', 'keep'],
  'daily-gems': ['lamp', 'seed', 'keep'],
  'daily-seed': ['seed', 'tell', 'keep'],
  'daily-neighbor': ['hurt', 'help', 'neighbor'],
  'wb-creed': ['creed', 'tomb', 'keep'],
  'wb-women': ['tomb', 'tell', 'keep'],
  'daily-stars': ['sky', 'tell', 'keep'],
  'daily-cosmos': ['sky', 'keep', 'tell'],
  'fg-order': ['keep', 'tell', 'creek'],
  'fg-reason': ['lamp', 'tell', 'keep'],
  'fg-ought': ['keep', 'tell', 'creek'],
  'fg-ground': ['keep', 'tell', 'sky'],
}

/** Split pack shortStory on sentence ends — do not rewrite the words. */
export function splitStorySentences(story: string): string[] {
  const trimmed = story.trim()
  if (!trimmed) return []
  const parts = trimmed.match(/[^.!?]+[.!?]+(?:["'”’]*)|[^.!?]+$/g)
  return (parts ?? [trimmed]).map((part) => part.trim()).filter(Boolean)
}

/** Keep later punchlines intact; fold extra opening sentences into the first panels. */
export function packStoryBeats(beats: string[], count: number): string[] {
  if (count <= 0) return []
  if (beats.length === 0) return []
  if (beats.length === count) return [...beats]
  if (beats.length < count) return [...beats]
  const extra = beats.length - count
  const head = beats.slice(0, extra + 1).join(' ')
  return [head, ...beats.slice(extra + 1)]
}

function sceneFromText(text: string, fallback: StoryScene): StoryScene {
  const line = text.toLowerCase()
  if (line.includes('hug') || line.includes('embrace')) return 'hug'
  if (line.includes('feast') || line.includes('welcome')) return 'feast'
  if (/\brun/.test(line) && line.includes('father')) return 'father-run'
  if (line.includes('hungry') || line.includes('ashamed')) return 'hungry'
  if (line.includes('wastes') || line.includes('share early')) return 'son-leave'
  if (line.includes('choke')) return 'choke'
  if (line.includes('bill') || line.includes('forgiv') || line.includes('wipes')) return 'forgive'
  if (line.includes('walk past') || line.includes('religious')) return 'walk-past'
  if (line.includes('compassion') || line.includes('helps') || line.includes('samaritan')) return 'help'
  if (line.includes('hurt') || line.includes('road') || line.includes('wounded')) return 'hurt'
  if (line.includes('neighbor')) return 'neighbor'
  if (line.includes('seed') || line.includes('soil') || line.includes('sower')) return 'seed'
  if (line.includes('lamp') || line.includes('hill') || line.includes('light')) return 'lamp'
  if (line.includes('tomb') || line.includes('raised') || line.includes('buried')) return 'tomb'
  if (line.includes('star') || line.includes('sky') || line.includes('heaven')) return 'sky'
  if (line.includes('died') || line.includes('creed') || line.includes('received')) return 'creed'
  if (line.includes('tells') || line.includes('story')) return 'tell'
  return fallback
}

function padCopy(lineId: string): string[] {
  const lesson = packLesson(lineId)
  const home = easyWhoWhere(lineId)
  const extras: string[] = []
  if (lesson?.easy.gloss) extras.push(lesson.easy.gloss)
  extras.push(`This idea lives at ${home.place}, with ${home.who}.`)
  const claim = lesson?.claim || evidenceFor(lineId)?.claim
  if (claim) extras.push(easyChromeLine(claim))
  return extras
}

function scenesFor(lineId: string, count: number, texts: string[]): StoryScene[] {
  const authored = LESSON_SCENES[lineId]
  const picked: StoryScene[] = []
  for (let i = 0; i < count; i += 1) {
    const fromList = authored?.[Math.min(i, (authored?.length ?? 1) - 1)]
    const text = texts[i] ?? ''
    picked.push(sceneFromText(text, fromList ?? 'keep'))
  }
  return picked
}

/** Comic beats for Easy gem Match — harvest shortStory stays the source of truth. */
export function storyPanelsFor(lineId: string, wordCount = gemWordsFor(lineId).length): StoryPanel[] {
  const lesson = packLesson(lineId)
  const story = lesson?.easy.learn ?? evidenceFor(lineId)?.reason ?? ''
  const sentences = splitStorySentences(story)
  const count = Math.max(3, Math.min(4, wordCount || 4))
  let beats = packStoryBeats(sentences, count)
  const fromStoryCount = beats.length
  const fillers = padCopy(lineId)
  let fill = 0
  while (beats.length < count) {
    const extra = fillers[fill]
    fill += 1
    if (extra && !beats.includes(extra)) {
      beats.push(extra)
      continue
    }
    if (fill > fillers.length) {
      beats.push(easyChromeLine(lesson?.claim || evidenceFor(lineId)?.claim || 'Keep this line.'))
      break
    }
  }
  while (beats.length < count) beats.push('Keep this line.')
  beats = beats.slice(0, count)
  const scenes = scenesFor(lineId, beats.length, beats)
  return beats.map((text, index) => {
    const scene = scenes[index] ?? 'keep'
    return {
      id: `${lineId}-panel-${index}`,
      beatId: `${lineId}:${scene}:${index}`,
      text,
      scene,
      fromStory: index < fromStoryCount,
      media: panelBlastBeatMedia(lineId, index),
    }
  })
}

export function storyCaption(panels: StoryPanel[], opened: number): string {
  if (opened <= 0) return 'Find a word to flip the first panel.'
  const latest = panels[Math.min(opened, panels.length) - 1]
  return latest?.text ?? ''
}

/** Concatenate harvest story panels in order — used to lock father Easy copy. */
export function storyFromPanels(panels: StoryPanel[]): string {
  return panels
    .filter((panel) => panel.fromStory)
    .map((panel) => panel.text)
    .join(' ')
}
