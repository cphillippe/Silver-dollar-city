import type { MatchArtId } from './matchArt.ts'
import type { LinkChallenge, LinkNode, LinkTriple } from '../types.ts'
import { easyWrongTap } from '../lib/easy.ts'

/**
 * Idea ↔ place ↔ person using claims already on the trail.
 * Do not invent new apologetics here — only spatial memory of existing lines.
 */
export const STREET_LIGHTS = ['ph-road', 'wb-creed', 'daily-lantern'] as const

const PLACE_NODES: LinkNode[] = [
  {
    id: 'place-hollow',
    kind: 'place',
    text: 'Story Creek',
    plotId: 'hollow',
  },
  {
    id: 'place-bench',
    kind: 'place',
    text: 'Witness Square',
    plotId: 'bench',
  },
  {
    id: 'place-porch',
    kind: 'place',
    text: 'East porch',
    plotId: 'porch',
  },
  {
    id: 'place-sky',
    kind: 'place',
    text: 'Sky Watch',
    plotId: 'observatory',
  },
  {
    id: 'place-gate',
    kind: 'place',
    text: 'Why Gate',
    plotId: 'gate',
  },
  {
    id: 'place-lookout',
    kind: 'place',
    text: 'Meaning Ridge',
    plotId: 'lookout',
  },
]

const PERSON_NODES: LinkNode[] = [
  {
    id: 'person-mercy',
    kind: 'person',
    text: 'Mercy Wren',
    who: 'mercy',
  },
  {
    id: 'person-silas',
    kind: 'person',
    text: 'Silas Whitman',
    who: 'silas',
  },
  {
    id: 'person-juniper',
    kind: 'person',
    text: 'Juniper Wick',
    who: 'juniper',
  },
  {
    id: 'person-nora',
    kind: 'person',
    text: 'Nora Skye',
    who: 'nora',
  },
  {
    id: 'person-ansel',
    kind: 'person',
    text: 'Ansel Gate',
    who: 'ansel',
  },
  {
    id: 'person-hope',
    kind: 'person',
    text: 'Hope Ridge',
    who: 'hope',
  },
]

const IDEA_NODES: LinkNode[] = [
  {
    id: 'idea-mercy',
    kind: 'idea',
    text: 'Neighbor is the one who shows mercy.',
    evidenceId: 'ph-road',
  },
  {
    id: 'idea-father',
    kind: 'idea',
    text: 'The father runs with mercy before the speech is done.',
    evidenceId: 'ph-father',
  },
  {
    id: 'idea-debt',
    kind: 'idea',
    text: 'Received mercy makes refusing mercy a contradiction.',
    evidenceId: 'ph-debt',
  },
  {
    id: 'idea-silas',
    kind: 'idea',
    text: 'Paul hands on an early public creed: died, buried, raised, appeared.',
    evidenceId: 'wb-creed',
  },
  {
    id: 'idea-women',
    kind: 'idea',
    text: 'The first tomb reports begin with women — an awkward opening if invented for respectability.',
    evidenceId: 'wb-women',
  },
  {
    id: 'idea-juniper',
    kind: 'idea',
    text: 'A lamp is meant to be seen.',
    evidenceId: 'daily-lantern',
  },
  {
    id: 'idea-stars',
    kind: 'idea',
    text: 'The heavens already speak of a Maker; fine-tuning fits that voice.',
    evidenceId: 'daily-stars',
  },
  {
    id: 'idea-cosmos',
    kind: 'idea',
    text: 'The universe exists and did not have to — so a Source is worth naming.',
    evidenceId: 'daily-cosmos',
  },
  {
    id: 'idea-moral',
    kind: 'idea',
    text: 'Duty presents itself as more than taste — and theism is a natural home for that.',
    evidenceId: 'hl-moral',
  },
]

const HARD_NODE_IDS = new Set([
  'idea-mercy',
  'place-hollow',
  'person-mercy',
  'idea-silas',
  'place-bench',
  'person-silas',
  'idea-juniper',
  'place-porch',
  'person-juniper',
])

export const STREET_NODES: LinkNode[] = [...IDEA_NODES, ...PLACE_NODES, ...PERSON_NODES]

export const STREET_TRIPLES: LinkTriple[] = [
  {
    id: 'mercy-hollow',
    ideaId: 'idea-mercy',
    placeId: 'place-hollow',
    personId: 'person-mercy',
  },
  {
    id: 'father-hollow',
    ideaId: 'idea-father',
    placeId: 'place-hollow',
    personId: 'person-mercy',
  },
  {
    id: 'debt-hollow',
    ideaId: 'idea-debt',
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
    id: 'women-bench',
    ideaId: 'idea-women',
    placeId: 'place-bench',
    personId: 'person-silas',
  },
  {
    id: 'juniper-porch',
    ideaId: 'idea-juniper',
    placeId: 'place-porch',
    personId: 'person-juniper',
  },
  {
    id: 'nora-sky',
    ideaId: 'idea-stars',
    placeId: 'place-sky',
    personId: 'person-nora',
  },
  {
    id: 'ansel-gate',
    ideaId: 'idea-cosmos',
    placeId: 'place-gate',
    personId: 'person-ansel',
  },
  {
    id: 'hope-lookout',
    ideaId: 'idea-moral',
    placeId: 'place-lookout',
    personId: 'person-hope',
  },
]

const HARD_TRIPLE_IDS = ['mercy-hollow', 'silas-bench', 'juniper-porch'] as const

const LINE_TRIPLE: Record<string, (typeof STREET_TRIPLES)[number]['id']> = {
  'ph-road': 'mercy-hollow',
  'ph-father': 'father-hollow',
  'ph-debt': 'debt-hollow',
  'wb-creed': 'silas-bench',
  'wb-women': 'women-bench',
  'daily-lantern': 'juniper-porch',
  'daily-stars': 'nora-sky',
  'daily-cosmos': 'ansel-gate',
  'hl-moral': 'hope-lookout',
}

export const STREET_CHALLENGE: LinkChallenge = {
  kind: 'link',
  id: 'ln-street',
  title: 'Link the street',
  idea: 'an idea lives at a place, with a person',
  prompt: 'Tap a block, then the place or person that belongs with it.',
  context:
    'Mercy at the creek because Jesus stories live there. Silas at the square because names belong in a ledger. Juniper on the east porch because a lamp is meant to be seen.',
  nodes: STREET_NODES.filter((node) => HARD_NODE_IDS.has(node.id)),
  triples: STREET_TRIPLES.filter((triple) =>
    (HARD_TRIPLE_IDS as readonly string[]).includes(triple.id),
  ),
  teachOnWrong: 'Same story: idea, the lot it lives on, and the person who keeps it — for a reason.',
  deeper:
    'Mercy keeps the creek because Jesus taught in pictures (Luke 10:36). Silas keeps the square because the creed is a public report. Juniper keeps the porch because a lamp is meant to be seen.',
}

function streetTriple(id: string): LinkTriple | undefined {
  return STREET_TRIPLES.find((item) => item.id === id)
}

function streetNode(id: string): LinkNode | undefined {
  return STREET_NODES.find((item) => item.id === id)
}

/** Easy Match uses one taught line’s triad — not a jump to another street story. */
export function streetTripleForLine(lineId: string): (typeof STREET_TRIPLES)[number]['id'] {
  return LINE_TRIPLE[lineId] ?? 'mercy-hollow'
}

export function easyStreetChallenge(lineId: string): LinkChallenge {
  const tripleId = streetTripleForLine(lineId)
  const triple = streetTriple(tripleId)
  return {
    ...STREET_CHALLENGE,
    nodes: STREET_NODES,
    triples: triple ? [triple] : [STREET_TRIPLES[0]],
  }
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
  'father-hollow': {
    idea: 'Mercy’s Jesus story — the father who runs first.',
    place: 'That story lives at the creek.',
    person: 'Mercy keeps that creek.',
  },
  'debt-hollow': {
    idea: 'Mercy’s Jesus story — forgiven much, then show mercy.',
    place: 'That story lives at the creek.',
    person: 'Mercy keeps that creek.',
  },
  'silas-bench': {
    idea: 'Silas’s public names — died, buried, raised, appeared.',
    place: 'Those names sit at the square.',
    person: 'Silas keeps that square.',
  },
  'women-bench': {
    idea: 'Silas’s first report — women saw the tomb first.',
    place: 'That report sits at the square.',
    person: 'Silas keeps that square.',
  },
  'juniper-porch': {
    idea: 'Juniper’s lamp — a light meant to be seen.',
    place: 'That lamp lives on the porch.',
    person: 'Juniper keeps that porch.',
  },
  'nora-sky': {
    idea: 'Nora’s sky — the heavens speak of a Maker.',
    place: 'That voice lives at Sky Watch.',
    person: 'Nora keeps that sky.',
  },
  'ansel-gate': {
    idea: 'Ansel’s why — the world exists and did not have to.',
    place: 'That question lives at Why Gate.',
    person: 'Ansel keeps that gate.',
  },
  'hope-lookout': {
    idea: 'Hope’s ridge — duty is more than a taste.',
    place: 'That line lives at Meaning Ridge.',
    person: 'Hope keeps that ridge.',
  },
}

/** Easy who/where/story hint so the first pick is learnable, not a coin flip. */
export function linkClue(tripleId: string, step: LinkStep): string {
  return LINK_CLUES[tripleId]?.[step] ?? 'Pick the match for this story.'
}

/** Exact Easy card text for the next pick. */
export function linkNeedLabel(tripleId: string, step: LinkStep): string | null {
  const triple = streetTriple(tripleId)
  if (!triple) return null
  const id =
    step === 'idea' ? triple.ideaId : step === 'place' ? triple.placeId : triple.personId
  const node = streetNode(id)
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
    if (node.evidenceId === 'ph-father') return 'The father runs with mercy.'
    if (node.evidenceId === 'ph-debt') return 'Received mercy must give mercy.'
    if (node.evidenceId === 'wb-creed') return 'Died, buried, raised, appeared.'
    if (node.evidenceId === 'wb-women') return 'Women first saw the tomb.'
    if (node.evidenceId === 'daily-stars') return 'The heavens speak of a Maker.'
    if (node.evidenceId === 'daily-cosmos') return 'The world did not have to exist.'
    if (node.evidenceId === 'hl-moral') return 'Duty is more than taste.'
  }
  return node.text
}

/** Why each street triple lives where it lives. Teach before the match. */
export const STREET_WHYS: Record<string, { easy: string; hard: string }> = {
  'mercy-hollow': {
    easy: 'Mercy lives at the creek because she tells Jesus stories. The neighbor who stops on the road is a picture, so it lives at Story Creek.',
    hard: 'Mercy Wren keeps Story Creek: Jesus taught in pictures by the road and the water. Neighbor is the one who shows mercy — that line belongs with the storyteller, not the clerk.',
  },
  'father-hollow': {
    easy: 'Mercy tells the father-run story at the creek. The father runs with mercy, so it lives at Story Creek.',
    hard: 'Mercy Wren keeps Story Creek. The father runs before the speech is done — a Jesus story, not a square report.',
  },
  'debt-hollow': {
    easy: 'Mercy tells the forgiven-debt story at the creek. Received mercy must give mercy.',
    hard: 'Mercy Wren keeps Story Creek. Received mercy making refusal a contradiction is a Jesus story of two servants.',
  },
  'silas-bench': {
    easy: 'Silas copies names at the square. The old shared belief — died, buried, raised — sits with the public names.',
    hard: 'Silas Whitman keeps Witness Square. Died, buried, raised, appeared is a public creed. It belongs in a ledger hall, not under the oaks.',
  },
  'women-bench': {
    easy: 'Silas keeps the square. Women saw the tomb first — an awkward first report.',
    hard: 'Silas Whitman keeps Witness Square. Women as first tomb witnesses is a public report, not a creek picture.',
  },
  'juniper-porch': {
    easy: 'Juniper’s lamp is on the porch so today’s line can be seen.',
    hard: 'Juniper Wick keeps the east porch. A lamp is meant to be seen — so the morning line lives at the lamp, where the trail starts.',
  },
  'nora-sky': {
    easy: 'Nora watches the sky. The heavens speak of a Maker.',
    hard: 'Nora Skye keeps Sky Watch. The heavens declare a Maker — that voice belongs on the ridge, not the porch lamp.',
  },
  'ansel-gate': {
    easy: 'Ansel keeps Why Gate. The world exists — and did not have to.',
    hard: 'Ansel Gate keeps Why Gate. That the universe exists and did not have to is the why-a-world stone.',
  },
  'hope-lookout': {
    easy: 'Hope keeps Meaning Ridge. Duty is more than a taste.',
    hard: 'Hope Ridge keeps Meaning Ridge. Duty as more than taste looks over the town from the lookout.',
  },
}
