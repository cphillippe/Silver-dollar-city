import { useMemo, useState } from 'react'
import { shuffle } from '../../lib/shuffle'
import { isEasy } from '../../lib/easy'
import { useProgress } from '../../store/progress'
import type { SequenceChallenge, SequenceItem } from '../../types'
import { GemMark } from '../GemMark'
import { burstStyle } from '../../lib/juice'
import { PuzzleHint } from './PuzzleHint'
import { PuzzleLead } from './PuzzleLead'
import { ResultPanel } from './ResultPanel'
import { WinBurst } from './WinBurst'

interface SequencePlayProps {
  challenge: SequenceChallenge
  onMiss: () => void
  onSolved: () => void
  onPeek?: () => void
}

function decoyFor(
  items: SequenceItem[],
  nextIndex: number,
  placed: Set<string>,
) {
  const need = items[nextIndex]
  if (!need) return null
  const decoys = items.filter((item) => item.id !== need.id && !placed.has(item.id))
  return shuffle(decoys)[0]?.id ?? null
}

function keepDecoy(
  items: SequenceItem[],
  nextIndex: number,
  placed: Set<string>,
  current: string | null,
) {
  const need = items[nextIndex]
  if (current && need && current !== need.id && !placed.has(current)) return current
  return decoyFor(items, nextIndex, placed)
}

export function SequencePlay({ challenge, onMiss, onSolved, onPeek }: SequencePlayProps) {
  const { progress } = useProgress()
  const seed = useMemo(() => shuffle(challenge.items), [challenge.items])
  const progressive = isEasy(progress) || challenge.items.length >= 4
  const [order, setOrder] = useState(seed)
  const [seats, setSeats] = useState<(SequenceItem | null)[]>(seed)
  const [chain, setChain] = useState<(SequenceItem | null)[]>(() =>
    challenge.items.map(() => null),
  )
  const [decoyId, setDecoyId] = useState(() =>
    progressive ? decoyFor(challenge.items, 0, new Set()) : null,
  )
  const [status, setStatus] = useState<'idle' | 'wrong' | 'ok'>('idle')
  const [shake, setShake] = useState(false)
  const [misses, setMisses] = useState(0)
  const [breakHint, setBreakHint] = useState('')

  function takeItem(id: string) {
    return order.find((entry) => entry.id === id)
  }

  function placedIds(nextChain = chain) {
    return new Set(
      nextChain.filter((item): item is SequenceItem => item !== null).map((item) => item.id),
    )
  }

  function resetBoard() {
    const next = shuffle(challenge.items)
    setOrder(next)
    setSeats(next)
    setChain(challenge.items.map(() => null))
    setDecoyId(progressive ? decoyFor(challenge.items, 0, new Set()) : null)
  }

  function add(id: string) {
    if (status === 'ok' || shake) return
    const item = takeItem(id)
    if (!item) return
    const dest = chain.findIndex((slot) => slot === null)
    if (dest < 0) return
    const need = challenge.items[dest]
    if (!need) return
    if (item.id !== need.id) {
      const nextMisses = misses + 1
      setStatus('wrong')
      setShake(true)
      setMisses(nextMisses)
      setBreakHint(
        dest <= 0
          ? 'The first stone is already off. The claim starts somewhere else.'
          : `The first ${dest} sat right. The chain broke at step ${dest + 1} — try that stone again.`,
      )
      onMiss()
      window.setTimeout(() => {
        setShake(false)
        if (nextMisses >= 2) resetBoard()
        setStatus('idle')
      }, 880)
      return
    }
    const nextSeats = seats.map((slot) => (slot?.id === id ? null : slot))
    const nextChain = chain.map((slot, index) => (index === dest ? item : slot))
    setSeats(nextSeats)
    setChain(nextChain)
    const nextDest = nextChain.findIndex((slot) => slot === null)
    setDecoyId(
      progressive && nextDest >= 0
        ? keepDecoy(challenge.items, nextDest, placedIds(nextChain), decoyId)
        : null,
    )
    setStatus('idle')
    if (nextChain.every(Boolean)) {
      setStatus('ok')
      onSolved()
    }
  }

  function remove(id: string) {
    if (status === 'ok' || shake) return
    const item = takeItem(id)
    if (!item) return
    const home = order.findIndex((entry) => entry.id === id)
    const nextChain = chain.map((slot) => (slot?.id === id ? null : slot))
    setChain(nextChain)
    setSeats((current) => {
      if (current.some((slot) => slot?.id === id)) return current
      const next = [...current]
      if (home >= 0) next[home] = item
      return next
    })
    const nextDest = nextChain.findIndex((slot) => slot === null)
    setDecoyId(
      progressive && nextDest >= 0
        ? keepDecoy(challenge.items, nextDest, placedIds(nextChain), decoyId)
        : null,
    )
    setStatus('idle')
  }

  const nextIndex = chain.findIndex((slot) => slot === null)
  const liveIds = new Set(
    progressive
      ? [challenge.items[nextIndex]?.id, decoyId].filter((id): id is string => Boolean(id))
      : order.map((item) => item.id),
  )

  return (
    <div
      className={`play is-sequence ${progressive ? 'is-deal' : ''} ${shake ? 'is-shake' : ''} ${status === 'ok' ? 'is-win' : ''}`}
    >
      <WinBurst play={status === 'ok'} />
      <PuzzleLead challenge={challenge} />
      <PuzzleHint text={challenge.context} id={challenge.id} onPeek={onPeek} />
      <p className="sort-how is-order-how">
        {challenge.items.map((item, index) => (
          <span
            key={item.id}
            className={`order-step ${index === nextIndex ? 'is-now' : ''} ${chain[index] ? 'is-done' : ''}`}
          >
            {index === nextIndex ? index + 1 : ''}
          </span>
        ))}
        tap the next stone
      </p>

      <div className="bank is-order">
        {order.map((home, index) => {
          const live = seats[index]?.id === home.id
          const placedAt = chain.findIndex((slot) => slot?.id === home.id)
          const faceDown = progressive && live && !liveIds.has(home.id)
          if (progressive && !live) return null
          if (faceDown) return null
          return (
            <div
              key={home.id}
              className={`sort-tile sort-seat ${live ? 'is-live' : 'is-gone'} ${faceDown ? 'is-facedown' : ''} ${placedAt >= 0 ? 'was-placed' : ''}`}
            >
              {faceDown ? (
                <span className="stone-back" aria-hidden />
              ) : (
                <button
                  type="button"
                  className="chip"
                  tabIndex={0}
                  aria-label={live ? home.text : `Return ${home.text} to its seat`}
                  onClick={() => (live ? add(home.id) : remove(home.id))}
                >
                  {home.gem ? <GemMark gem={home.gem} size="sm" /> : null}
                  {home.text}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {progressive ? null : (
        <ol className="chain">
          {challenge.items.map((item, index) => {
            const placed = chain[index]
            const awaiting = index === nextIndex && status !== 'ok'
            return (
              <li
                key={item.id}
                className={`sort-seat ${placed ? 'filled' : 'empty'} ${awaiting ? 'awaiting' : ''}`}
              >
                <span className="chain-index">{index + 1}</span>
                {placed ? (
                  <button
                    type="button"
                    className="chip in-chain"
                    style={status === 'ok' ? burstStyle(index, 'mid') : undefined}
                    onClick={() => remove(placed.id)}
                    >
                    {placed.gem ? <GemMark gem={placed.gem} size="sm" /> : null}
                    {placed.text}
                  </button>
                ) : (
                  <span className="placeholder" aria-hidden>
                    {awaiting ? '↓' : ''}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      )}

      <ResultPanel
        tone={status === 'idle' ? 'idle' : status === 'ok' ? 'ok' : 'teach'}
        kicker={
          status === 'ok'
            ? 'Well reasoned'
            : misses >= 2
              ? 'One more look'
              : 'The chain bounced'
        }
        title={
          status === 'ok'
            ? 'The path locks in.'
            : misses >= 2
              ? 'Not that order — tiles bounce back.'
              : breakHint || 'Shake and try the chain again.'
        }
        body={
          status === 'wrong'
            ? misses >= 2
              ? isEasy(progress)
                ? 'Tap the stone that comes next.'
                : challenge.teachOnWrong
              : 'No lecture — just find the stone that jumped the line.'
            : undefined
        }
        deeper={challenge.deeper}
      />
    </div>
  )
}
