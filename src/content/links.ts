import type { MatchArtId } from './matchArt.ts'
import type { LinkChallenge, LinkNode } from '../types.ts'
import { easyWrongTap } from '../lib/easy.ts'

/**
 * Idea ↔ place ↔ person using claims already on the trail.
 * Do not invent new apologetics here — only spatial memory of existing lines.
 */
export const STREET_LIGHTS = ['ph-road', 'wb-creed', 'daily-lantern'] as const

export const STREET_CHALLENGE: LinkChallenge = {
  kind: 'link',
  id: 'ln-street',
  title: 'Link the street',
  idea: 'an idea lives at a place, with a person',
  prompt: 'Tap a block, then the place or person that belongs with it.',
  context:
    'Mercy at the creek because Jesus stories live there. Silas at the square because names belong in a ledger. Juniper on the east porch because a lamp is meant to be seen.',
  nodes: [
    {
      id: 'idea-mercy',
      kind: 'idea',
      text: 'Neighbor is the one who shows mercy.',
      evidenceId: 'ph-road',
    },
    {
      id: 'place-hollow',
      kind: 'place',
      text: 'Story Creek',
      plotId: 'hollow',
    },
    {
      id: 'person-mercy',
      kind: 'person',
      text: 'Mercy Wren',
      who: 'mercy',
    },
    {
      id: 'idea-silas',
      kind: 'idea',
      text: 'Paul hands on an early public creed: died, buried, raised, appeared.',
      evidenceId: 'wb-creed',
    },
    {
      id: 'place-bench',
      kind: 'place',
      text: 'Witness Square',
      plotId: 'bench',
    },
    {
      id: 'person-silas',
      kind: 'person',
      text: 'Silas Whitman',
      who: 'silas',
    },
    {
      id: 'idea-juniper',
      kind: 'idea',
      text: 'A lamp is meant to be seen.',
      evidenceId: 'daily-lantern',
    },
    {
      id: 'place-porch',
      kind: 'place',
      text: 'East porch',
      plotId: 'porch',
    },
    {
      id: 'person-juniper',
      kind: 'person',
      text: 'Juniper Wick',
      who: 'juniper',
    },
  ],
  triples: [
    {
      id: 'mercy-hollow',
      ideaId: 'idea-mercy',
      placeId: 'place-hollow',
      personId: 'person-mercy',
    },
    {
      id: 'silas-bench',
      ideaId: 'idea-silas',
      placeId: 'place-bench',
      personId: 'person-silas',
    },
    {
      id: 'juniper-porch',
      ideaId: 'idea-juniper',
      placeId: 'place-porch',
      personId: 'person-juniper',
    },
  ],
  teachOnWrong: 'Same story: idea, the lot it lives on, and the person who keeps it — for a reason.',
  deeper:
    'Mercy keeps the creek because Jesus taught in pictures (Luke 10:36). Silas keeps the square because the creed is a public report. Juniper keeps the porch because a lamp is meant to be seen.',
}

export const STREET_BEATS = [
  'Mercy Wren · Story Creek · Neighbor is the one who shows mercy.',
  'Silas Whitman · Witness Square · died, buried, raised, appeared.',
  'Juniper Wick · East porch · A lamp is meant to be seen.',
]

/** Concrete picture for a Link chip — idea borrows its lot’s art unless a card has its own. */
export function linkPicture(
  node: LinkNode,
  challenge: LinkChallenge,
): { plotId?: string; who?: LinkNode['who']; art?: MatchArtId } {
  if (node.who) return { who: node.who }
  if (node.plotId) return { plotId: node.plotId }
  if (node.evidenceId === 'ph-road') {
    return { art: 'ph-road' }
  }
  const triple = challenge.triples.find((item) => item.ideaId === node.id)
  const place = challenge.nodes.find((item) => item.id === triple?.placeId)
  if (place?.plotId) return { plotId: place.plotId }
  const person = challenge.nodes.find((item) => item.id === triple?.personId)
  if (person?.who) return { who: person.who }
  return {}
}

type LinkStep = 'idea' | 'place' | 'person'

const LINK_CLUES: Record<string, Record<LinkStep, string>> = {
  'mercy-hollow': {
    idea: 'Mercy’s Jesus story — the neighbor who stops on the road.',
    place: 'That story lives at the creek.',
    person: 'Mercy keeps that creek.',
  },
  'silas-bench': {
    idea: 'Silas’s public names — died, buried, raised, appeared.',
    place: 'Those names sit at the square.',
    person: 'Silas keeps that square.',
  },
  'juniper-porch': {
    idea: 'Juniper’s lamp — a light meant to be seen.',
    place: 'That lamp lives on the porch.',
    person: 'Juniper keeps that porch.',
  },
}

/** Easy who/where/story hint so the first pick is learnable, not a coin flip. */
export function linkClue(tripleId: string, step: LinkStep): string {
  return LINK_CLUES[tripleId]?.[step] ?? 'Pick the match for this story.'
}

/** Exact Easy card text for the next pick. */
export function linkNeedLabel(tripleId: string, step: LinkStep): string | null {
  const triple = STREET_CHALLENGE.triples.find((item) => item.id === tripleId)
  if (!triple) return null
  const id =
    step === 'idea' ? triple.ideaId : step === 'place' ? triple.placeId : triple.personId
  const node = STREET_CHALLENGE.nodes.find((item) => item.id === id)
  if (!node) return null
  return linkCaption(node, true)
}

/** Easy miss: one line that names the glowing card. */
export function linkMiss(tripleId: string, step: LinkStep): string {
  const tap = linkNeedLabel(tripleId, step)
  return tap ? easyWrongTap(tap) : easyWrongTap('this one')
}

/** Short label under the picture — not the full claim wall. */
export function linkCaption(node: LinkNode, easy: boolean): string {
  if (easy && node.id === 'place-hollow') return 'Mercy’s creek'
  if (node.kind === 'idea') {
    if (node.evidenceId === 'daily-lantern') return 'A lamp is meant to be seen.'
    if (node.evidenceId === 'ph-road') {
      return easy ? 'Neighbor shows mercy.' : 'Neighbor is the one who shows mercy.'
    }
    if (node.evidenceId === 'wb-creed') return 'Died, buried, raised, appeared.'
  }
  return node.text
}

/** Why each street triple lives where it lives. Teach before the match. */
export const STREET_WHYS: Record<(typeof STREET_CHALLENGE.triples)[number]['id'], { easy: string; hard: string }> = {
  'mercy-hollow': {
    easy: 'Mercy lives at the creek because she tells Jesus stories. The neighbor who stops on the road is a picture, so it lives at Story Creek.',
    hard: 'Mercy Wren keeps Story Creek: Jesus taught in pictures by the road and the water. Neighbor is the one who shows mercy — that line belongs with the storyteller, not the clerk.',
  },
  'silas-bench': {
    easy: 'Silas copies names at the square. The old shared belief — died, buried, raised — sits with the public names.',
    hard: 'Silas Whitman keeps Witness Square. Died, buried, raised, appeared is a public creed. It belongs in a ledger hall, not under the oaks.',
  },
  'juniper-porch': {
    easy: 'Juniper’s lamp is on the porch so today’s line can be seen.',
    hard: 'Juniper Wick keeps the east porch. A lamp is meant to be seen — so the morning line lives at the lamp, where the trail starts.',
  },
}
