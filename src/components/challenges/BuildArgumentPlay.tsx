import { useMemo, useState } from 'react'
import { shuffle } from '../../lib/shuffle'
import type { ArgumentCard, BuildArgumentChallenge } from '../../types'
import { burstStyle } from '../../lib/juice'
import { PuzzleHint } from './PuzzleHint'
import { PuzzleLead } from './PuzzleLead'
import { ResultPanel } from './ResultPanel'
import { WinBurst } from './WinBurst'

interface BuildArgumentPlayProps {
  challenge: BuildArgumentChallenge
  onMiss: () => void
  onSolved: () => void
  onPeek?: () => void
}

export function BuildArgumentPlay({
  challenge,
  onMiss,
  onSolved,
  onPeek,
}: BuildArgumentPlayProps) {
  const seed = useMemo(() => shuffle(challenge.cards), [challenge.cards])
  const [order, setOrder] = useState(seed)
  const [seats, setSeats] = useState<(ArgumentCard | null)[]>(seed)
  const [slots, setSlots] = useState<Record<string, ArgumentCard | undefined>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'wrong' | 'ok'>('idle')
  const [shake, setShake] = useState(false)
  const [misses, setMisses] = useState(0)

  function takeCard(id: string) {
    return (
      seats.find((item) => item?.id === id) ??
      Object.values(slots).find((item) => item?.id === id)
    )
  }

  function place(slotId: string) {
    if (status === 'ok' || shake || !selected) return
    const card = takeCard(selected)
    if (!card) return

    const nextSlots = { ...slots }
    const displaced = nextSlots[slotId]
    for (const key of Object.keys(nextSlots)) {
      if (nextSlots[key]?.id === card.id) delete nextSlots[key]
    }
    nextSlots[slotId] = card

    const homeOf = (id: string) => order.findIndex((item) => item.id === id)
    setSeats((current) => {
      const next = current.map((item) => (item?.id === card.id ? null : item))
      if (displaced && displaced.id !== card.id) {
        const home = homeOf(displaced.id)
        if (home >= 0) next[home] = displaced
      }
      return next
    })
    setSlots(nextSlots)
    setSelected(null)
    setStatus('idle')

    const filled = challenge.slots.every((slot) => nextSlots[slot.id])
    if (filled) {
      window.setTimeout(() => evaluate(nextSlots), 80)
    }
  }

  function returnCard(id: string) {
    if (status === 'ok' || shake) return
    const card = takeCard(id)
    if (!card) return
    const home = order.findIndex((item) => item.id === id)
    setSlots((current) => {
      const next = { ...current }
      for (const key of Object.keys(next)) {
        if (next[key]?.id === id) delete next[key]
      }
      return next
    })
    setSeats((current) => {
      if (current.some((item) => item?.id === id)) return current
      const next = [...current]
      if (home >= 0) next[home] = card
      return next
    })
    setSelected(null)
    setStatus('idle')
  }

  function evaluate(currentSlots = slots) {
    const ok = challenge.slots.every(
      (slot) => currentSlots[slot.id]?.id === slot.correctCardId,
    )
    if (ok) {
      setStatus('ok')
      onSolved()
      return
    }
    setStatus('wrong')
    setShake(true)
    setMisses((count) => count + 1)
    onMiss()
    window.setTimeout(() => {
      setShake(false)
      const next = shuffle(challenge.cards)
      setOrder(next)
      setSeats(next)
      setSlots({})
      setSelected(null)
    }, 880)
  }

  return (
    <div className={`play is-build is-onescreen ${shake ? 'is-shake' : ''} ${status === 'ok' ? 'is-win' : ''}`}>
      <WinBurst play={status === 'ok'} />
      <PuzzleLead challenge={challenge} />
      <PuzzleHint text={challenge.context} onPeek={onPeek} />
      <p className="sort-how">
        <strong>Tap a stone</strong> · then a slot
      </p>

      <div className="slot-list">
        {challenge.slots.map((slot, index) => {
          const card = slots[slot.id]
          return (
            <div
              key={slot.id}
              className={`slot ${slot.role}`}
              onClick={() => {
                if (!card) place(slot.id)
              }}
            >
              <span className="slot-label">{slot.label}</span>
              {card ? (
                <button
                  type="button"
                  className="chip in-slot pop-in"
                  style={status === 'ok' ? burstStyle(index, 'mid') : undefined}
                  onClick={(event) => {
                    event.stopPropagation()
                    returnCard(card.id)
                  }}
                >
                  {card.text}
                </button>
              ) : (
                <button
                  type="button"
                  className={`slot-target ${selected ? 'awaiting' : ''}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    place(slot.id)
                  }}
                >
                  {selected ? '↓' : ''}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="bank is-order">
        {order.map((home, index) => {
          const live = seats[index]?.id === home.id
          return (
            <div
              key={home.id}
              className={`sort-tile sort-seat ${live && selected === home.id ? 'is-selected' : ''} ${live ? '' : 'is-gone'} ${live ? '' : 'was-placed'}`}
              style={{
                gridColumn: (index % 2) + 1,
                gridRow: Math.floor(index / 2) + 1,
              }}
            >
              <button
                type="button"
                className={`chip ${live && selected === home.id ? 'is-selected' : ''} ${home.distractor ? 'is-tempt' : ''}`}
                tabIndex={0}
                aria-label={live ? home.text : `Return ${home.text} to its seat`}
                onClick={() => {
                  if (shake) return
                  if (live) setSelected(home.id === selected ? null : home.id)
                  else returnCard(home.id)
                }}
              >
                {home.text}
              </button>
            </div>
          )
        })}
      </div>

      <ResultPanel
        tone={status === 'idle' ? 'idle' : status === 'ok' ? 'ok' : 'teach'}
        kicker={
          status === 'ok'
            ? 'Well reasoned'
            : misses >= 2
              ? 'One more look'
              : 'A link slipped'
        }
        title={
          status === 'ok'
            ? 'The chain locks!'
            : misses >= 2
              ? 'A link slips — tiles bounce back.'
              : 'Shake and rebuild the chain.'
        }
        body={
          status === 'wrong'
            ? misses >= 2
              ? challenge.teachOnWrong
              : 'Premise first, then the conclusion. Leave the decoy in the bank.'
            : undefined
        }
        deeper={challenge.deeper}
      />
    </div>
  )
}
