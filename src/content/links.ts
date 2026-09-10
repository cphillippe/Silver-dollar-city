import type { LinkChallenge } from '../types.ts'

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
    'Mercy at the hollow, Silas at the bench, Juniper on the east porch. Snap idea → place → person.',
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
      text: 'Parable Hollow',
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
      text: 'Witness Bench',
      plotId: 'bench',
    },
    {
      id: 'person-silas',
      kind: 'person',
      text: 'Silas Page',
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
      text: 'Juniper',
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
  teachOnWrong: 'Same story: idea, the lot it lives on, and the person who keeps it.',
  deeper:
    'Reopen each lit node from its place on the town map — where + who + what claim. Luke 10:36: mercy proves who the neighbor is.',
}

export const STREET_BEATS = [
  'Mercy Wren · Parable Hollow · Neighbor is the one who shows mercy.',
  'Silas Page · Witness Bench · died, buried, raised, appeared.',
  'Juniper · East porch · A lamp is meant to be seen.',
]
