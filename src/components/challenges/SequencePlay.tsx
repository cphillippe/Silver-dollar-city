import { useMemo, useState } from 'react'
import { shuffle } from '../../lib/shuffle'
import type { SequenceChallenge, SequenceItem } from '../../types'
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

export function SequencePlay({ challenge, onMiss, onSolved, onPeek }: SequencePlayProps) {
  const seed = useMemo(() => shuffle(challenge.items), [challenge.items])
  const [order, setOrder] = useState(seed)
  const [seats, setSeats] = useState<(SequenceItem | null)[]>(seed)
  const [chain, setChain] = useState<(SequenceItem | null)[]>(() =>
    challenge.items.map(() => null),
  )
  const [status, setStatus] = useState<'idle' | 'wrong' | 'ok'>('idle')
  const [shake, setShake] = useState(false)
  const [misses, setMisses] = useState(0)
  const [breakHint, setBreakHint] = useState('')

  function takeItem(id: string) {
    return order.find((entry) => entry.id === id)
  }

  function add(id: string) {
    if (status === 'ok') return
    const item = takeItem(id)
    if (!item) return
    const dest = chain.findIndex((slot) => slot === null)
    if (dest < 0) return
    const nextSeats = seats.map((slot) => (slot?.id === id ? null : slot))
    const nextChain = chain.map((slot, index) => (index === dest ? item : slot))
    setSeats(nextSeats)
    setChain(nextChain)
    setStatus('idle')
    if (nextChain.every(Boolean)) {
      window.setTimeout(() => evaluate(nextChain), 80)
    }
  }

  function remove(id: string) {
    if (status === 'ok') return
    const item = takeItem(id)
    if (!item) return
    const home = order.findIndex((entry) => entry.id === id)
    setChain((current) => current.map((slot) => (slot?.id === id ? null : slot)))
    setSeats((current) => {
      if (current.some((slot) => slot?.id === id)) return current
      const next = [...current]
      if (home >= 0) next[home] = item
      return next
    })
    setStatus('idle')
  }

  function evaluate(nextChain = chain) {
    const filled = nextChain.filter((item): item is SequenceItem => item !== null)
    const correct =
      filled.length === challenge.items.length &&
      nextChain.every((item, index) => item?.id === challenge.items[index]?.id)
    if (correct) {
      setStatus('ok')
      onSolved()
      return
    }
    const breakAt = nextChain.findIndex(
      (item, index) => item?.id !== challenge.items[index]?.id,
    )
    const step = (breakAt === -1 ? filled.length : breakAt) + 1
    const nudge =
      step <= 1
        ? 'The first stone is already off. The claim starts somewhere else.'
        : `The first ${step - 1} sat right. The chain broke at step ${step} — try that stone again.`
    setStatus('wrong')
    setShake(true)
    setMisses((count) => count + 1)
    setBreakHint(nudge)
    onMiss()
    window.setTimeout(() => {
      setShake(false)
      const next = shuffle(challenge.items)
      setOrder(next)
      setSeats(next)
      setChain(challenge.items.map(() => null))
    }, 880)
  }

  const nextIndex = chain.findIndex((slot) => slot === null)

  return (
    <div className={`play is-sequence ${shake ? 'is-shake' : ''} ${status === 'ok' ? 'is-win' : ''}`}>
      <WinBurst play={status === 'ok'} />
      <PuzzleLead challenge={challenge} />
      <PuzzleHint text={challenge.context} onPeek={onPeek} />
      <p className="sort-how">
        <strong>1 · 2 · 3</strong> tap the next stone
      </p>

      <div className="bank is-order">
        {order.map((home, index) => {
          const live = seats[index]?.id === home.id
          const placedAt = chain.findIndex((slot) => slot?.id === home.id)
          return (
            <div
              key={home.id}
              className={`sort-tile sort-seat ${live ? '' : 'is-gone'} ${placedAt >= 0 ? 'was-placed' : ''}`}
              style={{
                gridColumn: (index % 2) + 1,
                gridRow: Math.floor(index / 2) + 1,
              }}
            >
              <button
                type="button"
                className="chip"
                tabIndex={0}
                aria-label={live ? home.text : `Return ${home.text} to its seat`}
                onClick={() => (live ? add(home.id) : remove(home.id))}
              >
                {home.text}
                {placedAt >= 0 ? (
                  <span className="sort-mark" aria-hidden>
                    {placedAt + 1}
                  </span>
                ) : null}
              </button>
            </div>
          )
        })}
      </div>

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
              ? challenge.teachOnWrong
              : 'No lecture — just find the stone that jumped the line.'
            : undefined
        }
        deeper={challenge.deeper}
      />
    </div>
  )
}
