/** Keep/Toss miss copy. Mix language only when a placed line is in the wrong bin. */

export type SortBinId = 'keep' | 'discard'

export interface SortBinTile {
  bin: SortBinId
}

export interface SortMissInput {
  status: 'idle' | 'wrong' | 'ok'
  misses: number
  /** Lines still on the card, not in Keep or Toss. */
  pending: number
  keep: readonly SortBinTile[]
  discard: readonly SortBinTile[]
  easy: boolean
  teachOnWrong: string
}

export interface SortMissCopy {
  kicker: string
  title: string
  body?: string
}

const EASY_TEACH = 'Keep what belongs with the main idea. Toss the rest.'
const PLAIN_TEACH = 'Keep the lines that belong. Toss (set aside) the rest.'

export function sortBinsMixed(
  keep: readonly SortBinTile[],
  discard: readonly SortBinTile[],
): boolean {
  return (
    keep.some((tile) => tile.bin !== 'keep') ||
    discard.some((tile) => tile.bin !== 'discard')
  )
}

/**
 * An empty Toss and a line still on the card are an unfinished sort, including
 * the first miss. Wrong-bin copy only when a placed line is in the wrong bin.
 */
export function sortMissCopy(input: SortMissInput): SortMissCopy {
  if (input.status === 'ok') {
    return { kicker: 'Snapped', title: 'Keep and toss lock in.' }
  }

  const mixed = sortBinsMixed(input.keep, input.discard)
  const teach = input.status === 'wrong'
  const easyBody = input.easy ? EASY_TEACH : input.teachOnWrong
  const plainBody = input.easy ? EASY_TEACH : PLAIN_TEACH

  if (mixed && input.misses >= 2) {
    return {
      kicker: 'One more look',
      title: 'Those bins still mix.',
      body: teach ? easyBody : undefined,
    }
  }

  if (!mixed && input.pending > 0 && input.misses >= 1) {
    return {
      kicker: 'Still sorting',
      title: 'This line is not sorted yet.',
      body: teach ? plainBody : undefined,
    }
  }

  if (!mixed) {
    return {
      kicker: 'Still sorting',
      title: 'Keep and toss are not locked yet.',
      body: teach ? plainBody : undefined,
    }
  }

  return {
    kicker: 'A line is in the wrong bin',
    title: 'Keep vs toss — shake and sort again.',
    body: teach ? PLAIN_TEACH : undefined,
  }
}
