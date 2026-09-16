/** Source-dig arcade — tap glowing ancient tablets. Not a claim/reason quiz. */

import { packLesson } from '../content/packCatalog.ts'

export const SOURCE_DIG_WIN = 'DUG!'

export const SOURCE_DIG_AGAIN = 'One more dig'

export const SOURCE_DIG_HINT = 'Tap the glowing tablet.'
export const SOURCE_DIG_MISS = 'Miss −25'

export const SOURCE_DIG_TAP_SCORE = 25
export const SOURCE_DIG_WIN_SCORE = 100

export const DIG_ARC = ['wb-creed', 'wb-women', 'wb-early', 'wb-method'] as const

/** Witness leftovers after Dig deeper Hold — names → creed close → empty tomb. */
export const NAMES_ARC = ['daily-names', 'daily-creed', 'daily-empty'] as const

export type DigArcId = (typeof DIG_ARC)[number]
export type NamesArcId = (typeof NAMES_ARC)[number]

export function isDigArc(id: string): id is DigArcId {
  return (DIG_ARC as readonly string[]).includes(id)
}

export function isNamesArc(id: string): id is NamesArcId {
  return (NAMES_ARC as readonly string[]).includes(id)
}

/** Play is tap-in digs. Creed keeps the merge bowl. */
export function isSourceDigLine(id: string): boolean {
  return (
    id === 'wb-women' ||
    id === 'wb-early' ||
    id === 'wb-method' ||
    isNamesArc(id)
  )
}

export function digPrior(id: string): string | undefined {
  const index = (DIG_ARC as readonly string[]).indexOf(id)
  if (index <= 0) return undefined
  return DIG_ARC[index - 1]
}

export function namesPrior(id: string): string | undefined {
  const index = (NAMES_ARC as readonly string[]).indexOf(id)
  if (index <= 0) return undefined
  return NAMES_ARC[index - 1]
}

export interface DigTablet {
  id: number
  era: 'scripture' | 'ancient'
  title: string
  bite: string
}

const TABLETS: Record<string, DigTablet[]> = {
  'wb-women': [
    {
      id: 0,
      era: 'scripture',
      title: 'Luke 24',
      bite: 'Women go to the tomb at dawn and find it empty. They tell what they saw.',
    },
    {
      id: 1,
      era: 'scripture',
      title: 'John 20',
      bite: 'Mary Magdala is named. She says she has seen the Lord.',
    },
    {
      id: 2,
      era: 'ancient',
      title: 'Awkward first',
      bite: 'Women go first. Luke still writes that the men called it idle talk.',
    },
  ],
  'wb-early': [
    {
      id: 0,
      era: 'scripture',
      title: '1 Cor 15',
      bite: 'Paul hands on what the churches already said: Christ died, was buried, was raised, was seen.',
    },
    {
      id: 1,
      era: 'ancient',
      title: 'Ignatius',
      bite: 'Ignatius names Jesus Christ: truly died, truly raised — close to the events.',
    },
    {
      id: 2,
      era: 'ancient',
      title: 'Justin',
      bite: 'Justin tells Trypho the same public line: crucified under Pilate, raised, seen.',
    },
  ],
  'wb-method': [
    {
      id: 0,
      era: 'scripture',
      title: 'Luke 1',
      bite: 'Luke checked what many already wrote. He weighed testimony; he did not replace reading.',
    },
    {
      id: 1,
      era: 'scripture',
      title: '1 Cor 15',
      bite: 'Named witnesses, not one private voice. Paul lists people who saw the risen Christ.',
    },
    {
      id: 2,
      era: 'ancient',
      title: 'Irenaeus',
      bite: 'Irenaeus says the apostles handed the same gospel on. Tools weigh that handing-on.',
    },
  ],
  'daily-names': [
    {
      id: 0,
      era: 'scripture',
      title: '1 Cor 15',
      bite: 'He appeared to Cephas, then to the Twelve. Named people saw the risen Christ.',
    },
    {
      id: 1,
      era: 'scripture',
      title: 'Five hundred',
      bite: 'Then more than five hundred at once — many still living when Paul wrote.',
    },
    {
      id: 2,
      era: 'ancient',
      title: 'Irenaeus',
      bite: 'Irenaeus names the apostles who handed the same gospel on. Public names, not one private voice.',
    },
  ],
  'daily-creed': [
    {
      id: 0,
      era: 'scripture',
      title: '1 Cor 15',
      bite: 'Paul hands on what he received: Christ died for our sins.',
    },
    {
      id: 1,
      era: 'scripture',
      title: 'Buried, raised',
      bite: 'He was buried. He was raised on the third day. The churches already said it.',
    },
    {
      id: 2,
      era: 'ancient',
      title: 'Ignatius',
      bite: 'Ignatius names Jesus Christ: truly died, truly raised — the same public line.',
    },
  ],
  'daily-empty': [
    {
      id: 0,
      era: 'scripture',
      title: 'Luke 24',
      bite: 'They found the stone rolled away. They did not find the body of Jesus.',
    },
    {
      id: 1,
      era: 'scripture',
      title: 'Mark 16',
      bite: 'Women go at dawn. The tomb is empty. Fear and wonder sit together.',
    },
    {
      id: 2,
      era: 'ancient',
      title: 'Ignatius',
      bite: 'Ignatius names Jesus truly raised — not a ghost story over an occupied tomb.',
    },
  ],
}

export function digTablets(lineId: string): DigTablet[] {
  return TABLETS[lineId] ?? TABLETS['wb-women'] ?? []
}

export function digClaim(lineId: string): string {
  return packLesson(lineId)?.claim ?? ''
}

export function mixSeed(seed: number): number {
  let t = seed + 0x6d2b79f5
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/** Shuffle seats; ids stay in teach order so the glow still teaches. */
export function seatTablets(lineId: string, seed: number): DigTablet[] {
  const rows = digTablets(lineId).map((row) => ({ ...row }))
  const seats = [...rows]
  for (let i = seats.length - 1; i > 0; i -= 1) {
    const roll = mixSeed(seed + i)
    const j = Math.floor(roll * (i + 1))
    const a = seats[i]
    const b = seats[j]
    if (a && b) {
      seats[i] = b
      seats[j] = a
    }
  }
  return seats
}
