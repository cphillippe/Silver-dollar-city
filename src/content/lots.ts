import type { CityPlotId } from '../lib/city.ts'

/** In-world reason each lot exists. Method-of-loci that matches the story. */
export interface LotStory {
  /** One-word map role on the Eden → Heaven walk. */
  path: string
  whyEasy: string
  whyHard: string
}

export const LOT_STORY: Record<CityPlotId, LotStory> = {
  porch: {
    path: 'Arrive',
    whyEasy: 'You start here. Juniper keeps a lamp so today’s line can be seen.',
    whyHard:
      'The east porch is the morning door. A lamp belongs on a porch because it is meant to be seen — not hidden in a drawer.',
  },
  hollow: {
    path: 'Eden stories',
    whyEasy: 'Mercy tells Jesus stories by the creek. Pictures live where water and oaks are.',
    whyHard:
      'Parable Hollow is the garden of the case. Jesus taught in pictures; Mercy keeps the creek so those stories can walk around inside you.',
  },
  bench: {
    path: 'Names',
    whyEasy: 'Silas copies names at the square. Public reports live in a ledger, not under the oaks.',
    whyHard:
      'The Witness Bench faces the square. Died, buried, raised, appeared is a public creed — Silas keeps it where names and dates are copied.',
  },
  observatory: {
    path: 'Sky',
    whyEasy: 'Nora’s dome looks up. Fine-tuning and the sky’s fit live on the ridge.',
    whyHard:
      'The Observatory sits on the north ridge so you look up. Life’s dials and “why anything at all” belong with a telescope, not a creek story.',
  },
  gate: {
    path: 'Why a world',
    whyEasy: 'Ansel’s stone asks why there is a world at all. That question lives at the gate you walked in by.',
    whyHard:
      'The First Gate is the east-road arch beside the porch. After the sky, you come back to the stone: first mover, might-not-have-been, the beginning argument — then the high ridge.',
  },
  lookout: {
    path: 'Meaning',
    whyEasy: 'Hope’s tower looks over the whole town. Duty, mind, meaning, and beauty live up here.',
    whyHard:
      'High Lookout is the last ridge. Inner life, duty, hunger, and beauty are what it is like to be a person looking down on the walk you kept.',
  },
  journal: {
    path: 'Pages',
    whyEasy: 'River’s house of pages. What you can still say lives here.',
    whyHard:
      'The dossier house is not a new proof. It is the traveler’s memory of proofs — pages River has to be able to say again.',
  },
  lamps: {
    path: 'Remember',
    whyEasy: 'Street lamps remember walks you kept. Juniper’s light grows along the road.',
    whyHard:
      'Star lamps are the same morning light grown into the street. Mastery and nights held make the town remember.',
  },
}

export function lotWhy(id: CityPlotId, easy: boolean): string {
  const row = LOT_STORY[id]
  return easy ? row.whyEasy : row.whyHard
}

export const TOWN_PATH_EASY =
  'Porch lamp → creek stories → square names → ridge sky. Tap a lit place for your scrapbook of links.'

export const TOWN_PATH_HARD =
  'Arrive at the porch. Stories at the creek. Names on the square. Sky, gate, and lookout climb toward Heaven. Tap a lit place to open that idea again.'
