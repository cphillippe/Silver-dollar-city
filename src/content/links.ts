import type { MatchArtId } from './matchArt.ts'
import type { LinkChallenge, LinkNode, LinkTriple } from '../types.ts'
import { easyWrongTap } from '../lib/easy.ts'

/**
 * Idea ↔ place ↔ person using claims already on the trail.
 * Do not invent new apologetics here — only spatial memory of existing lines.
 */
export const STREET_LIGHTS = ['ph-road', 'wb-creed', 'daily-lantern'] as const

/** Not claim·reason·source encodes — Love how-to and trail thank-you cards. */
export const STREET_SKIP_IDS = [
  'td-watch',
  'j-trail-1',
  'j-trail-2',
  'j-trail-3',
  'j-trail-5',
  'j-trail-7',
  'ms-bread',
  'hw-hope',
] as const

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

type StreetPlaceId = (typeof PLACE_NODES)[number]['id']
type StreetPersonId = (typeof PERSON_NODES)[number]['id']

interface StreetFact {
  evidenceId: string
  ideaId: string
  tripleId: string
  placeId: StreetPlaceId
  personId: StreetPersonId
  text: string
  caption: string
}

/**
 * Every claim·reason·source fact on the street.
 * Easy Match ids (mercy/father/debt/silas/women/juniper/nora/ansel/hope) keep
 * their existing idea, triple, place, and person bindings.
 * daily-cosmos stays at Why Gate with Ansel — Easy Learn already teaches that home.
 */
const STREET_FACTS: StreetFact[] = [
  {
    evidenceId: 'ph-road',
    ideaId: 'idea-mercy',
    tripleId: 'mercy-hollow',
    placeId: 'place-hollow',
    personId: 'person-mercy',
    text: 'Neighbor is the one who shows mercy.',
    caption: 'Neighbor is the one who shows mercy.',
  },
  {
    evidenceId: 'ph-father',
    ideaId: 'idea-father',
    tripleId: 'father-hollow',
    placeId: 'place-hollow',
    personId: 'person-mercy',
    text: 'The father runs with mercy before the speech is done.',
    caption: 'The father runs with mercy before the speech is done.',
  },
  {
    evidenceId: 'ph-seeds',
    ideaId: 'idea-seeds',
    tripleId: 'seeds-hollow',
    placeId: 'place-hollow',
    personId: 'person-mercy',
    text: 'The kingdom arrives in pictures, not slogans.',
    caption: 'The kingdom arrives in pictures.',
  },
  {
    evidenceId: 'ph-debt',
    ideaId: 'idea-debt',
    tripleId: 'debt-hollow',
    placeId: 'place-hollow',
    personId: 'person-mercy',
    text: 'Received mercy makes refusing mercy a contradiction.',
    caption: 'Received mercy makes refusing mercy a contradiction.',
  },
  {
    evidenceId: 'wb-creed',
    ideaId: 'idea-silas',
    tripleId: 'silas-bench',
    placeId: 'place-bench',
    personId: 'person-silas',
    text: 'Paul hands on an early public creed: died, buried, raised, appeared.',
    caption: 'Died, buried, raised, appeared.',
  },
  {
    evidenceId: 'wb-early',
    ideaId: 'idea-early',
    tripleId: 'early-bench',
    placeId: 'place-bench',
    personId: 'person-silas',
    text: 'The resurrection claim sits close to the events, not as a late legend.',
    caption: 'The claim sits close to the events.',
  },
  {
    evidenceId: 'wb-method',
    ideaId: 'idea-method',
    tripleId: 'method-bench',
    placeId: 'place-bench',
    personId: 'person-silas',
    text: 'Ordinary historical tools weigh testimony; they do not replace reading.',
    caption: 'History tools weigh testimony.',
  },
  {
    evidenceId: 'wb-women',
    ideaId: 'idea-women',
    tripleId: 'women-bench',
    placeId: 'place-bench',
    personId: 'person-silas',
    text: 'The first tomb reports begin with women — an awkward opening if invented for respectability.',
    caption: 'Women first saw the tomb.',
  },
  {
    evidenceId: 'daily-names',
    ideaId: 'idea-names',
    tripleId: 'names-bench',
    placeId: 'place-bench',
    personId: 'person-silas',
    text: 'The resurrection claim stacks named witnesses, not one private voice.',
    caption: 'Named witnesses, not one private voice.',
  },
  {
    evidenceId: 'daily-creed',
    ideaId: 'idea-daily-creed',
    tripleId: 'creed-bench',
    placeId: 'place-bench',
    personId: 'person-silas',
    text: 'The creed sits between the event and Paul’s letter.',
    caption: 'The creed sits close to the event.',
  },
  {
    evidenceId: 'daily-empty',
    ideaId: 'idea-empty',
    tripleId: 'empty-bench',
    placeId: 'place-bench',
    personId: 'person-silas',
    text: 'The first Easter reports include an empty place, women, fear, and wonder.',
    caption: 'Easter begins with an empty place.',
  },
  {
    evidenceId: 'daily-lantern',
    ideaId: 'idea-juniper',
    tripleId: 'juniper-porch',
    placeId: 'place-porch',
    personId: 'person-juniper',
    text: 'A lamp is meant to be seen.',
    caption: 'A lamp is meant to be seen.',
  },
  {
    evidenceId: 'daily-gems',
    ideaId: 'idea-gems',
    tripleId: 'gems-porch',
    placeId: 'place-porch',
    personId: 'person-juniper',
    text: 'Jesus taught with pictures you can hold.',
    caption: 'Jesus taught with pictures you can hold.',
  },
  {
    evidenceId: 'daily-seed',
    ideaId: 'idea-seed',
    tripleId: 'seed-porch',
    placeId: 'place-porch',
    personId: 'person-juniper',
    text: 'The same word meets different soils; some seed is lost.',
    caption: 'The same word meets different soils.',
  },
  {
    evidenceId: 'daily-neighbor',
    ideaId: 'idea-neighbor',
    tripleId: 'neighbor-porch',
    placeId: 'place-porch',
    personId: 'person-juniper',
    text: 'Mercy makes a neighbor; pedigree does not.',
    caption: 'Mercy makes a neighbor.',
  },
  {
    evidenceId: 'ob-tuning',
    ideaId: 'idea-tuning',
    tripleId: 'tuning-sky',
    placeId: 'place-sky',
    personId: 'person-nora',
    text: 'The universe is finely tuned for life — that fit points to a Designer.',
    caption: 'Fine-tuning points to a Designer.',
  },
  {
    evidenceId: 'ob-design',
    ideaId: 'idea-design',
    tripleId: 'design-sky',
    placeId: 'place-sky',
    personId: 'person-nora',
    text: 'Fine-tuning is best explained by a mind that intended a habitable world.',
    caption: 'A mind intended a habitable world.',
  },
  {
    evidenceId: 'ob-leibniz',
    ideaId: 'idea-leibniz',
    tripleId: 'leibniz-sky',
    placeId: 'place-sky',
    personId: 'person-nora',
    text: 'Why is there something rather than nothing remains after a cosmological model.',
    caption: 'Why something rather than nothing.',
  },
  {
    evidenceId: 'ob-life',
    ideaId: 'idea-ob-life',
    tripleId: 'ob-life-sky',
    placeId: 'place-sky',
    personId: 'person-nora',
    text: 'Life’s specified information is a mark of mind.',
    caption: 'Life’s information is a mark of mind.',
  },
  {
    evidenceId: 'daily-stars',
    ideaId: 'idea-stars',
    tripleId: 'nora-sky',
    placeId: 'place-sky',
    personId: 'person-nora',
    text: 'The heavens already speak of a Maker; fine-tuning fits that voice.',
    caption: 'The heavens speak of a Maker.',
  },
  {
    evidenceId: 'daily-life',
    ideaId: 'idea-daily-life',
    tripleId: 'daily-life-sky',
    placeId: 'place-sky',
    personId: 'person-nora',
    text: 'Life, place, and mind are not cheap facts.',
    caption: 'Life, place, and mind are not cheap facts.',
  },
  {
    evidenceId: 'daily-cosmos',
    ideaId: 'idea-cosmos',
    tripleId: 'ansel-gate',
    placeId: 'place-gate',
    personId: 'person-ansel',
    text: 'The universe exists and did not have to — so a Source is worth naming.',
    caption: 'The world did not have to exist.',
  },
  {
    evidenceId: 'fg-order',
    ideaId: 'idea-order',
    tripleId: 'order-gate',
    placeId: 'place-gate',
    personId: 'person-ansel',
    text: 'You already trust that the world holds together in Christ.',
    caption: 'The world holds together in Christ.',
  },
  {
    evidenceId: 'fg-reason',
    ideaId: 'idea-reason',
    tripleId: 'reason-gate',
    placeId: 'place-gate',
    personId: 'person-ansel',
    text: 'The reason you already trust needs a real ground.',
    caption: 'Reason needs a real ground.',
  },
  {
    evidenceId: 'fg-ought',
    ideaId: 'idea-ought',
    tripleId: 'ought-gate',
    placeId: 'place-gate',
    personId: 'person-ansel',
    text: 'Finite nature cannot ground the ought you already trust.',
    caption: 'Nature cannot ground ought.',
  },
  {
    evidenceId: 'fg-ground',
    ideaId: 'idea-ground',
    tripleId: 'ground-gate',
    placeId: 'place-gate',
    personId: 'person-ansel',
    text: 'The living God is the foundation of order, reason, and ought.',
    caption: 'The living God is the foundation.',
  },
  {
    evidenceId: 'fg-mover',
    ideaId: 'idea-mover',
    tripleId: 'mover-gate',
    placeId: 'place-gate',
    personId: 'person-ansel',
    text: 'Change here and now needs a first actuality that is not itself a receiver of change.',
    caption: 'Change needs a first actuality.',
  },
  {
    evidenceId: 'fg-contingent',
    ideaId: 'idea-contingent',
    tripleId: 'contingent-gate',
    placeId: 'place-gate',
    personId: 'person-ansel',
    text: 'A world of might-not-have-beens still needs a necessary ground.',
    caption: 'Might-not-have-beens need a necessary ground.',
  },
  {
    evidenceId: 'fg-kalam',
    ideaId: 'idea-kalam',
    tripleId: 'kalam-gate',
    placeId: 'place-gate',
    personId: 'person-ansel',
    text: 'If what begins has a cause and the universe began, it has a cause.',
    caption: 'What begins has a cause.',
  },
  {
    evidenceId: 'fg-limits',
    ideaId: 'idea-limits',
    tripleId: 'limits-gate',
    placeId: 'place-gate',
    personId: 'person-ansel',
    text: 'A cosmological argument is already a great deal — and not yet the sermon on the mount.',
    caption: 'A first cause is not yet the whole gospel.',
  },
  {
    evidenceId: 'daily-scroll',
    ideaId: 'idea-scroll',
    tripleId: 'scroll-gate',
    placeId: 'place-gate',
    personId: 'person-ansel',
    text: 'We hold a river of copies, not the first ink.',
    caption: 'We hold a river of copies.',
  },
  {
    evidenceId: 'daily-isaiah',
    ideaId: 'idea-isaiah',
    tripleId: 'isaiah-gate',
    placeId: 'place-gate',
    personId: 'person-ansel',
    text: 'Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.',
    caption: 'Isaiah’s Servant is Jesus.',
  },
  {
    evidenceId: 'hl-moral',
    ideaId: 'idea-moral',
    tripleId: 'hope-lookout',
    placeId: 'place-lookout',
    personId: 'person-hope',
    text: 'Duty presents itself as more than taste — and theism is a natural home for that.',
    caption: 'Duty is more than taste.',
  },
  {
    evidenceId: 'hl-mind',
    ideaId: 'idea-mind',
    tripleId: 'mind-lookout',
    placeId: 'place-lookout',
    personId: 'person-hope',
    text: 'A story of the world must find a home for mind — including the storyteller.',
    caption: 'The story must house the storyteller’s mind.',
  },
  {
    evidenceId: 'hl-meaning',
    ideaId: 'idea-meaning',
    tripleId: 'meaning-lookout',
    placeId: 'place-lookout',
    personId: 'person-hope',
    text: 'Local meaning can be built — the lookout asks whether it is also received.',
    caption: 'Meaning may be received, not only built.',
  },
  {
    evidenceId: 'hl-beauty',
    ideaId: 'idea-beauty',
    tripleId: 'beauty-lookout',
    placeId: 'place-lookout',
    personId: 'person-hope',
    text: 'Beauty wakes a hunger it cannot feed — hungers usually correspond to real countries.',
    caption: 'Beauty wakes a hunger it cannot feed.',
  },
  {
    evidenceId: 'daily-grace',
    ideaId: 'idea-grace',
    tripleId: 'grace-lookout',
    placeId: 'place-lookout',
    personId: 'person-hope',
    text: 'Grace is gift, not wage; faith receives; boast starves.',
    caption: 'Grace is gift, not wage.',
  },
  {
    evidenceId: 'daily-rest',
    ideaId: 'idea-rest',
    tripleId: 'rest-lookout',
    placeId: 'place-lookout',
    personId: 'person-hope',
    text: 'Tired people are named first; rest is the gift, not a steeper hill.',
    caption: 'Rest is the gift, not a steeper hill.',
  },
  {
    evidenceId: 'daily-door',
    ideaId: 'idea-door',
    tripleId: 'door-lookout',
    placeId: 'place-lookout',
    personId: 'person-hope',
    text: 'Jesus’ “door” is a particular way in with a wide anyone.',
    caption: 'Jesus is a door with a wide anyone.',
  },
]

const IDEA_NODES: LinkNode[] = STREET_FACTS.map((fact) => ({
  id: fact.ideaId,
  kind: 'idea',
  text: fact.text,
  evidenceId: fact.evidenceId,
}))

export const STREET_NODES: LinkNode[] = [...IDEA_NODES, ...PLACE_NODES, ...PERSON_NODES]

export const STREET_TRIPLES: LinkTriple[] = STREET_FACTS.map((fact) => ({
  id: fact.tripleId,
  ideaId: fact.ideaId,
  placeId: fact.placeId,
  personId: fact.personId,
}))

const LINE_TRIPLE: Record<string, string> = Object.fromEntries(
  STREET_FACTS.map((fact) => [fact.evidenceId, fact.tripleId]),
)

export const STREET_FACT_IDS = STREET_FACTS.map((fact) => fact.evidenceId)

/** A sitting of Hard Link the street — one place, at most five facts. */
export interface StreetWalk {
  id: string
  placeId: StreetPlaceId
  placeTitle: string
  personName: string
  triples: LinkTriple[]
}

function splitStreetGroup<T>(items: T[]): T[][] {
  if (items.length <= 5) return [items]
  const groups: T[][] = []
  let i = 0
  while (i < items.length) {
    const remaining = items.length - i
    let n = Math.min(5, remaining)
    if (remaining > 5 && remaining - n < 3) n = remaining - 3
    groups.push(items.slice(i, i + n))
    i += n
  }
  return groups
}

/** All 39 facts, grouped so a visit is ~one area / 3–5 triples — never a 70-link slog. */
export function streetWalks(): StreetWalk[] {
  const walks: StreetWalk[] = []
  for (const place of PLACE_NODES) {
    const facts = STREET_FACTS.filter((fact) => fact.placeId === place.id)
    const groups = splitStreetGroup(facts)
    groups.forEach((group, index) => {
      const more = groups.length > 1 && index > 0
      const keeper = PERSON_NODES.find((node) => node.id === group[0]?.personId)
      walks.push({
        id: more ? `${place.id}-more` : place.id,
        placeId: place.id,
        placeTitle: more ? `${place.text} · more` : place.text,
        personName: keeper?.text ?? '',
        triples: group.map((fact) => ({
          id: fact.tripleId,
          ideaId: fact.ideaId,
          placeId: fact.placeId,
          personId: fact.personId,
        })),
      })
    })
  }
  return walks
}

export function appendStreetLinks(linked: readonly string[], added: readonly string[]): string[] {
  const have = new Set(linked)
  for (const id of added) have.add(id)
  return STREET_TRIPLES.map((item) => item.id).filter((id) => have.has(id))
}

export function streetFactsLeft(linked: readonly string[]): number {
  const have = new Set(linked)
  return STREET_TRIPLES.filter((item) => !have.has(item.id)).length
}

/** ln-street on completed still means the catalog is finished for this walk. */
export function streetIsComplete(progress: {
  streetLinked?: string[]
  completed?: string[]
}): boolean {
  if ((progress.completed ?? []).includes('ln-street')) return true
  return streetFactsLeft(progress.streetLinked ?? []) <= 0
}

export function nextStreetWalk(linked: readonly string[]): StreetWalk | undefined {
  const have = new Set(linked)
  for (const walk of streetWalks()) {
    const rest = walk.triples.filter((item) => !have.has(item.id))
    if (rest.length > 0) return { ...walk, triples: rest }
  }
  return undefined
}

/** Tonight’s Hard street — remaining triples in the next unfinished walk. */
export function hardStreetChallenge(linked: readonly string[]): LinkChallenge {
  const walk = nextStreetWalk(linked)
  return {
    ...STREET_CHALLENGE,
    title: walk ? `Tonight’s street · ${walk.placeTitle}` : STREET_CHALLENGE.title,
    triples: walk?.triples ?? [],
  }
}

export function streetWalkTakeaway(walk: StreetWalk | undefined, left: number): string {
  if (!walk || left <= 0) {
    return STREET_CHALLENGE.deeper ?? 'An idea lives at a place, with a person.'
  }
  const why = STREET_WHYS[walk.triples[0]?.id ?? '']?.hard ?? ''
  const first = (why.split(/(?<=[.!?])\s+/)[0] ?? why).trim()
  const lead = first || `${walk.personName} keeps ${walk.placeTitle}.`
  return lead
}

/** Jericho-road art stays on ph-road’s own tile — never a distractor. */
export function streetDecoyNodes(pool: LinkNode[], wantId: string): LinkNode[] {
  return pool.filter((node) => node.id !== wantId && node.evidenceId !== 'ph-road')
}

export const STREET_CHALLENGE: LinkChallenge = {
  kind: 'link',
  id: 'ln-street',
  title: 'Link the street',
  idea: 'an idea lives at a place, with a person',
  prompt: 'Tap a block, then the place or person that belongs with it.',
  context:
    'An idea lives at a place, with a person. Mercy at the creek because Jesus stories live there. Silas at the square because names belong in a ledger. Juniper on the east porch because a lamp is meant to be seen. Nora at Sky Watch because the heavens already speak of a Maker. Ansel at Why Gate because the world exists and did not have to. Hope at Meaning Ridge because duty, mind, meaning, and beauty look over the town.',
  nodes: STREET_NODES,
  triples: STREET_TRIPLES,
  teachOnWrong: 'Same story: idea, the lot it lives on, and the person who keeps it — for a reason.',
  deeper:
    'Mercy keeps the creek because Jesus taught in pictures (Luke 10:36). Silas keeps the square because the creed is a public report. Juniper keeps the porch because a lamp is meant to be seen. Nora keeps the ridge because the heavens declare a Maker. Ansel keeps the gate because what exists did not have to. Hope keeps the lookout because duty is more than taste.',
}

function streetTriple(id: string): LinkTriple | undefined {
  return STREET_TRIPLES.find((item) => item.id === id)
}

function streetNode(id: string): LinkNode | undefined {
  return STREET_NODES.find((item) => item.id === id)
}

function streetFact(evidenceId: string): StreetFact | undefined {
  return STREET_FACTS.find((item) => item.evidenceId === evidenceId)
}

function streetFactByTriple(tripleId: string): StreetFact | undefined {
  return STREET_FACTS.find((item) => item.tripleId === tripleId)
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
  'Nora Skye · Sky Watch · The heavens speak of a Maker.',
  'Ansel Gate · Why Gate · The world did not have to exist.',
  'Hope Ridge · Meaning Ridge · Duty is more than taste.',
]

/** One Hard teach line per lot — not every fact on the street. */
export const STREET_PLACE_WHYS = [
  'Mercy Wren keeps Story Creek: Jesus taught in pictures by the road and the water.',
  'Silas Whitman keeps Witness Square: died, buried, raised, appeared is a public creed.',
  'Juniper Wick keeps the east porch: a lamp is meant to be seen.',
  'Nora Skye keeps Sky Watch: the heavens declare a Maker, and fine-tuning fits that voice.',
  'Ansel Gate keeps Why Gate: the world exists and did not have to.',
  'Hope Ridge keeps Meaning Ridge: duty, mind, meaning, and beauty look over the town.',
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
  const home = streetFact(node.evidenceId ?? '')
  if (home) {
    const lot = PLACE_NODES.find((item) => item.id === home.placeId)
    if (lot?.plotId) return { plotId: lot.plotId }
  }
  return {}
}

type LinkStep = 'idea' | 'place' | 'person'

const PLACE_CLUES: Record<StreetPlaceId, { place: string; person: string }> = {
  'place-hollow': {
    place: 'That story lives at the creek.',
    person: 'Mercy keeps that creek.',
  },
  'place-bench': {
    place: 'Those names sit at the square.',
    person: 'Silas keeps that square.',
  },
  'place-porch': {
    place: 'That lamp lives on the porch.',
    person: 'Juniper keeps that porch.',
  },
  'place-sky': {
    place: 'That voice lives at Sky Watch.',
    person: 'Nora keeps that sky.',
  },
  'place-gate': {
    place: 'That question lives at Why Gate.',
    person: 'Ansel keeps that gate.',
  },
  'place-lookout': {
    place: 'That line lives at Meaning Ridge.',
    person: 'Hope keeps that ridge.',
  },
}

const LINK_CLUES: Record<string, Record<LinkStep, string>> = {
  'mercy-hollow': {
    idea: 'Mercy’s Jesus story — the neighbor who stops on the road.',
    place: 'The neighbor-road story lives at Story Creek.',
    person: 'Mercy Wren keeps the neighbor who stops.',
  },
  'father-hollow': {
    idea: 'Mercy’s Jesus story — the father who runs first.',
    place: 'The father-run story lives at Story Creek.',
    person: 'Mercy Wren keeps the father who runs.',
  },
  'seeds-hollow': {
    idea: 'Mercy’s Jesus stories — the kingdom arrives in pictures.',
    place: 'That story lives at the creek.',
    person: 'Mercy keeps that creek.',
  },
  'debt-hollow': {
    idea: 'Mercy’s Jesus story — forgiven much, then show mercy.',
    place: 'The forgiven-debt story lives at Story Creek.',
    person: 'Mercy Wren keeps the two servants.',
  },
  'silas-bench': {
    idea: 'Silas’s public names — died, buried, raised, appeared.',
    place: 'Those names sit at the square.',
    person: 'Silas keeps that square.',
  },
  'early-bench': {
    idea: 'Silas’s public names — the claim sits close to the events.',
    place: 'Those names sit at the square.',
    person: 'Silas keeps that square.',
  },
  'method-bench': {
    idea: 'Silas’s ledger — ordinary tools weigh testimony.',
    place: 'Those names sit at the square.',
    person: 'Silas keeps that square.',
  },
  'women-bench': {
    idea: 'Silas’s first report — women saw the tomb first.',
    place: 'That report sits at the square.',
    person: 'Silas keeps that square.',
  },
  'names-bench': {
    idea: 'Silas’s public names — Cephas, the Twelve, five hundred.',
    place: 'Those names sit at the square.',
    person: 'Silas keeps that square.',
  },
  'creed-bench': {
    idea: 'Silas’s handed-on creed — close to the event, then Paul’s letter.',
    place: 'Those names sit at the square.',
    person: 'Silas keeps that square.',
  },
  'empty-bench': {
    idea: 'Silas’s first Easter — empty place, women, fear, and wonder.',
    place: 'That report sits at the square.',
    person: 'Silas keeps that square.',
  },
  'juniper-porch': {
    idea: 'Juniper’s lamp — a light meant to be seen.',
    place: 'That lamp lives on the porch.',
    person: 'Juniper keeps that porch.',
  },
  'gems-porch': {
    idea: 'Juniper’s morning pictures — lamp, seed, and cup you can hold.',
    place: 'That lamp lives on the porch.',
    person: 'Juniper keeps that porch.',
  },
  'seed-porch': {
    idea: 'Juniper’s seed — the same word meets different soils.',
    place: 'That lamp lives on the porch.',
    person: 'Juniper keeps that porch.',
  },
  'neighbor-porch': {
    idea: 'Juniper’s porch line — mercy makes a neighbor.',
    place: 'That lamp lives on the porch.',
    person: 'Juniper keeps that porch.',
  },
  'nora-sky': {
    idea: 'Nora’s sky — the heavens speak of a Maker.',
    place: 'That voice lives at Sky Watch.',
    person: 'Nora keeps that sky.',
  },
  'tuning-sky': {
    idea: 'Nora’s sky — fine-tuning points to a Designer.',
    place: 'That voice lives at Sky Watch.',
    person: 'Nora keeps that sky.',
  },
  'design-sky': {
    idea: 'Nora’s sky — a mind intended a habitable world.',
    place: 'That voice lives at Sky Watch.',
    person: 'Nora keeps that sky.',
  },
  'leibniz-sky': {
    idea: 'Nora’s sky — why something rather than nothing.',
    place: 'That voice lives at Sky Watch.',
    person: 'Nora keeps that sky.',
  },
  'ob-life-sky': {
    idea: 'Nora’s sky — life’s information is a mark of mind.',
    place: 'That voice lives at Sky Watch.',
    person: 'Nora keeps that sky.',
  },
  'daily-life-sky': {
    idea: 'Nora’s sky — life, place, and mind are given.',
    place: 'That voice lives at Sky Watch.',
    person: 'Nora keeps that sky.',
  },
  'ansel-gate': {
    idea: 'Ansel’s why — the world exists and did not have to.',
    place: 'That question lives at Why Gate.',
    person: 'Ansel keeps that gate.',
  },
  'order-gate': {
    idea: 'Ansel’s why — the world holds together in Christ.',
    place: 'That question lives at Why Gate.',
    person: 'Ansel keeps that gate.',
  },
  'reason-gate': {
    idea: 'Ansel’s why — reason needs a real ground.',
    place: 'That question lives at Why Gate.',
    person: 'Ansel keeps that gate.',
  },
  'ought-gate': {
    idea: 'Ansel’s why — nature cannot ground ought.',
    place: 'That question lives at Why Gate.',
    person: 'Ansel keeps that gate.',
  },
  'ground-gate': {
    idea: 'Ansel’s why — the living God is the foundation.',
    place: 'That question lives at Why Gate.',
    person: 'Ansel keeps that gate.',
  },
  'mover-gate': {
    idea: 'Ansel’s why — change needs a first actuality.',
    place: 'That question lives at Why Gate.',
    person: 'Ansel keeps that gate.',
  },
  'contingent-gate': {
    idea: 'Ansel’s why — might-not-have-beens need a necessary ground.',
    place: 'That question lives at Why Gate.',
    person: 'Ansel keeps that gate.',
  },
  'kalam-gate': {
    idea: 'Ansel’s why — what begins has a cause.',
    place: 'That question lives at Why Gate.',
    person: 'Ansel keeps that gate.',
  },
  'limits-gate': {
    idea: 'Ansel’s why — a first cause is not yet the whole gospel.',
    place: 'That question lives at Why Gate.',
    person: 'Ansel keeps that gate.',
  },
  'scroll-gate': {
    idea: 'Ansel’s pages — we hold a river of copies.',
    place: 'That question lives at Why Gate.',
    person: 'Ansel keeps that gate.',
  },
  'isaiah-gate': {
    idea: 'Ansel’s scroll — Isaiah’s Servant is Jesus.',
    place: 'That question lives at Why Gate.',
    person: 'Ansel keeps that gate.',
  },
  'hope-lookout': {
    idea: 'Hope’s ridge — duty is more than a taste.',
    place: 'That line lives at Meaning Ridge.',
    person: 'Hope keeps that ridge.',
  },
  'mind-lookout': {
    idea: 'Hope’s ridge — the story must house the storyteller’s mind.',
    place: 'That line lives at Meaning Ridge.',
    person: 'Hope keeps that ridge.',
  },
  'meaning-lookout': {
    idea: 'Hope’s ridge — meaning may be received, not only built.',
    place: 'That line lives at Meaning Ridge.',
    person: 'Hope keeps that ridge.',
  },
  'beauty-lookout': {
    idea: 'Hope’s ridge — beauty wakes a hunger it cannot feed.',
    place: 'That line lives at Meaning Ridge.',
    person: 'Hope keeps that ridge.',
  },
  'grace-lookout': {
    idea: 'Hope’s ridge — grace is gift, not wage.',
    place: 'That line lives at Meaning Ridge.',
    person: 'Hope keeps that ridge.',
  },
  'rest-lookout': {
    idea: 'Hope’s ridge — rest is the gift, not a steeper hill.',
    place: 'That line lives at Meaning Ridge.',
    person: 'Hope keeps that ridge.',
  },
  'door-lookout': {
    idea: 'Hope’s ridge — Jesus is a door with a wide anyone.',
    place: 'That line lives at Meaning Ridge.',
    person: 'Hope keeps that ridge.',
  },
}

/** Easy who/where/story hint so the first pick is learnable, not a coin flip. */
export function linkClue(tripleId: string, step: LinkStep): string {
  const written = LINK_CLUES[tripleId]?.[step]
  if (written) return written
  const fact = streetFactByTriple(tripleId)
  if (!fact) return 'Pick the match for this story.'
  if (step === 'idea') return fact.caption
  return PLACE_CLUES[fact.placeId][step]
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

/** Short label under the picture — Match sentence matches the held claim. */
export function linkCaption(node: LinkNode, easy: boolean): string {
  if (easy && node.id === 'place-hollow') return 'Mercy’s creek'
  if (node.kind === 'idea') {
    const fact = streetFact(node.evidenceId ?? '')
    if (fact) return fact.caption
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
  'seeds-hollow': {
    easy: 'Mercy tells kingdom pictures at the creek. The kingdom arrives in pictures, not slogans.',
    hard: 'Mercy Wren keeps Story Creek. Soil, search, a tiny seed — Jesus taught the kingdom in pictures, not slogans.',
  },
  'debt-hollow': {
    easy: 'Mercy tells the forgiven-debt story at the creek. Received mercy must give mercy.',
    hard: 'Mercy Wren keeps Story Creek. Received mercy making refusal a contradiction is a Jesus story of two servants.',
  },
  'silas-bench': {
    easy: 'Silas copies names at the square. The old shared belief — died, buried, raised — sits with the public names.',
    hard: 'Silas Whitman keeps Witness Square. Died, buried, raised, appeared is a public creed. It belongs in a ledger hall, not under the oaks.',
  },
  'early-bench': {
    easy: 'Silas keeps the square. The claim sits close to the events — not a late legend.',
    hard: 'Silas Whitman keeps Witness Square. Paul quotes a received formula and names known people; the claim sits close to the events.',
  },
  'method-bench': {
    easy: 'Silas keeps the square. Ordinary tools weigh testimony; they do not replace reading.',
    hard: 'Silas Whitman keeps Witness Square. Multiple attestation and early reports weigh testimony — they do not skip the texts.',
  },
  'women-bench': {
    easy: 'Silas keeps the square. Women saw the tomb first — an awkward first report.',
    hard: 'Silas Whitman keeps Witness Square. Women as first tomb witnesses is a public report, not a creek picture.',
  },
  'names-bench': {
    easy: 'Silas keeps the square. Named witnesses — not one private voice.',
    hard: 'Silas Whitman keeps Witness Square. Cephas, the Twelve, and more than five hundred are public names, not a private dream.',
  },
  'creed-bench': {
    easy: 'Silas keeps the square. The creed sits close to the event, then Paul’s letter.',
    hard: 'Silas Whitman keeps Witness Square. The creed sits between the event and Paul’s letter — died, buried, raised.',
  },
  'empty-bench': {
    easy: 'Silas keeps the square. Easter begins with an empty place, women, fear, and wonder.',
    hard: 'Silas Whitman keeps Witness Square. The first Easter reports include an empty place — the town does not sand that awkwardness away.',
  },
  'juniper-porch': {
    easy: 'Juniper’s lamp is on the porch so today’s line can be seen.',
    hard: 'Juniper Wick keeps the east porch. A lamp is meant to be seen — so the morning line lives at the lamp, where the trail starts.',
  },
  'gems-porch': {
    easy: 'Juniper’s lamp is on the porch. Jesus taught with pictures you can hold.',
    hard: 'Juniper Wick keeps the east porch. Lamp, seed, and cup are pictures you can hold — gift, not wage.',
  },
  'seed-porch': {
    easy: 'Juniper’s lamp is on the porch. The same word meets different soils.',
    hard: 'Juniper Wick keeps the east porch. The parable invites hearing; it does not flatter every field.',
  },
  'neighbor-porch': {
    easy: 'Juniper’s lamp is on the porch. Mercy makes a neighbor.',
    hard: 'Juniper Wick keeps the east porch. Mercy makes a neighbor; pedigree does not — the morning lamp holds that line.',
  },
  'nora-sky': {
    easy: 'Nora watches the sky. The heavens speak of a Maker.',
    hard: 'Nora Skye keeps Sky Watch. The heavens declare a Maker — that voice belongs on the ridge, not the porch lamp.',
  },
  'tuning-sky': {
    easy: 'Nora watches the sky. Fine-tuning points to a Designer.',
    hard: 'Nora Skye keeps Sky Watch. Life-permitting ranges are extravagantly narrow. Necessity, chance, and a sprawling multiverse get named so they can be set down — time still goes to a Designer who wanted a habitable world.',
  },
  'design-sky': {
    easy: 'Nora watches the sky. A mind intended a habitable world.',
    hard: 'Nora Skye keeps Sky Watch. A Designer who wants observers leads us to expect that fit — blank indifference does not.',
  },
  'leibniz-sky': {
    easy: 'Nora watches the sky. Why something rather than nothing still stands.',
    hard: 'Nora Skye keeps Sky Watch. Models describe a world already given; why there is something rather than nothing remains.',
  },
  'ob-life-sky': {
    easy: 'Nora watches the sky. Life’s information is a mark of mind.',
    hard: 'Nora Skye keeps Sky Watch. Cells store coordinated information — that looks like the work of a mind.',
  },
  'daily-life-sky': {
    easy: 'Nora watches the sky. Life, place, and mind are not cheap facts.',
    hard: 'Nora Skye keeps Sky Watch. Copying cells, a habitable band, and a mind that can do science all look given — the marks of a Maker.',
  },
  'ansel-gate': {
    easy: 'Ansel keeps Why Gate. The world exists — and did not have to.',
    hard: 'Ansel Gate keeps Why Gate. That the universe exists and did not have to is the why-a-world stone.',
  },
  'order-gate': {
    easy: 'Ansel keeps Why Gate. The world holds together in Christ.',
    hard: 'Ansel Gate keeps Why Gate. You already trust order — and Colossians names Christ as the One who holds all things.',
  },
  'reason-gate': {
    easy: 'Ansel keeps Why Gate. Reason needs a real ground.',
    hard: 'Ansel Gate keeps Why Gate. The reason you already trust is not free-floating — John names the Light.',
  },
  'ought-gate': {
    easy: 'Ansel keeps Why Gate. Nature cannot ground ought.',
    hard: 'Ansel Gate keeps Why Gate. Finite nature cannot ground the ought you already trust — the law is on the heart.',
  },
  'ground-gate': {
    easy: 'Ansel keeps Why Gate. The living God is the foundation.',
    hard: 'Ansel Gate keeps Why Gate. The living God is the foundation of order, reason, and ought — in him we live.',
  },
  'mover-gate': {
    easy: 'Ansel keeps Why Gate. Change needs a first actuality.',
    hard: 'Ansel Gate keeps Why Gate. Nothing reduces itself from potential to actual; present change needs a first actuality.',
  },
  'contingent-gate': {
    easy: 'Ansel keeps Why Gate. Might-not-have-beens need a necessary ground.',
    hard: 'Ansel Gate keeps Why Gate. A world of might-not-have-beens still needs a necessary ground — not a shrug.',
  },
  'kalam-gate': {
    easy: 'Ansel keeps Why Gate. What begins has a cause.',
    hard: 'Ansel Gate keeps Why Gate. If what begins has a cause and the universe began, it has a Cause of the beginning.',
  },
  'limits-gate': {
    easy: 'Ansel keeps Why Gate. A first cause is not yet the whole gospel.',
    hard: 'Ansel Gate keeps Why Gate. A cosmological argument is already a great deal — and not yet the sermon on the mount.',
  },
  'scroll-gate': {
    easy: 'Ansel keeps Why Gate. We hold a river of copies, not the first ink.',
    hard: 'Ansel Gate keeps Why Gate. Scribes copy, later hands compare — we hold a river of copies, not the first ink.',
  },
  'isaiah-gate': {
    easy: 'Ansel keeps Why Gate. Isaiah’s Servant is Jesus.',
    hard: 'Ansel Gate keeps Why Gate. Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.',
  },
  'hope-lookout': {
    easy: 'Hope keeps Meaning Ridge. Duty is more than a taste.',
    hard: 'Hope Ridge keeps Meaning Ridge. Duty as more than taste looks over the town from the lookout.',
  },
  'mind-lookout': {
    easy: 'Hope keeps Meaning Ridge. The story must house the storyteller’s mind.',
    hard: 'Hope Ridge keeps Meaning Ridge. Theism is a reply in which mind is present at the beginning, not only an accident at the end.',
  },
  'meaning-lookout': {
    easy: 'Hope keeps Meaning Ridge. Meaning may be received, not only built.',
    hard: 'Hope Ridge keeps Meaning Ridge. Local meaning can be built — the lookout asks whether it is also received.',
  },
  'beauty-lookout': {
    easy: 'Hope keeps Meaning Ridge. Beauty wakes a hunger it cannot feed.',
    hard: 'Hope Ridge keeps Meaning Ridge. Beauty wakes a hunger it cannot feed — hungers usually correspond to real countries.',
  },
  'grace-lookout': {
    easy: 'Hope keeps Meaning Ridge. Grace is gift, not wage.',
    hard: 'Hope Ridge keeps Meaning Ridge. Grace is gift, not wage; faith receives; boast starves.',
  },
  'rest-lookout': {
    easy: 'Hope keeps Meaning Ridge. Rest is the gift, not a steeper hill.',
    hard: 'Hope Ridge keeps Meaning Ridge. Tired people are named first; rest is the gift, not a steeper hill.',
  },
  'door-lookout': {
    easy: 'Hope keeps Meaning Ridge. Jesus is a door with a wide anyone.',
    hard: 'Hope Ridge keeps Meaning Ridge. Jesus’ door is a particular way in with a wide anyone.',
  },
}
