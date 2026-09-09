import { useMemo, useState } from 'react'
import { shuffle } from '../../lib/shuffle'
import type { ArgumentCard, BuildArgumentChallenge } from '../../types'
import { burstStyle } from '../../lib/juice'
import { PuzzleHint } from './PuzzleHint'
import { PuzzleLead } from './PuzzleLead'
import { WinBurst } from './WinBurst'

interface BuildArgumentPlayProps {
  challenge: BuildArgumentChallenge
  onMiss: () => void
  onSolved: () => void
  onPeek?: () => void
}

function decoyFor(
  challenge: BuildArgumentChallenge,
  slotIndex: number,
  placed: Set<string>,
) {
  const need = challenge.slots[slotIndex]
  if (!need) return null
  const decoys = challenge.cards.filter(
    (card) => card.id !== need.correctCardId && !placed.has(card.id),
  )
  const temps = decoys.filter((card) => card.distractor)
  const pool = temps.length > 0 ? temps : decoys
  return shuffle(pool)[0]?.id ?? null
}

export function BuildArgumentPlay({
  challenge,
  onMiss,
  onSolved,
  onPeek,
}: BuildArgumentPlayProps) {
  const guided = challenge.id.startsWith('ob-')
  const seed = useMemo(() => shuffle(challenge.cards), [challenge.cards])
  const order = seed
  const [seats, setSeats] = useState<(ArgumentCard | null)[]>(seed)
  const [slots, setSlots] = useState<Record<string, ArgumentCard | undefined>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'wrong' | 'ok'>('idle')
  const [shake, setShake] = useState(false)
  const [misses, setMisses] = useState(0)
  const [wrongIds, setWrongIds] = useState<string[]>([])
  const [decoyId, setDecoyId] = useState(() =>
    guided ? decoyFor(challenge, 0, new Set()) : null,
  )

  const nextSlot = challenge.slots.find((slot) => !slots[slot.id])
  const placed = new Set(
    Object.values(slots)
      .filter((card): card is ArgumentCard => Boolean(card))
      .map((card) => card.id),
  )
  const liveIds = new Set(
    guided
      ? [nextSlot?.correctCardId, decoyId].filter((id): id is string => Boolean(id))
      : order.map((card) => card.id),
  )
  const filled = challenge.slots.every((slot) => slots[slot.id])

  function takeCard(id: string) {
    return (
      seats.find((item) => item?.id === id) ??
      Object.values(slots).find((item) => item?.id === id)
    )
  }

  function bounce(noteMiss = true) {
    setStatus('wrong')
    setShake(true)
    if (noteMiss) {
      setMisses((count) => count + 1)
      onMiss()
    }
    window.setTimeout(() => {
      setShake(false)
      setStatus('idle')
    }, 880)
  }

  function recover() {
    setShake(false)
    setStatus('idle')
    setSelected(null)
  }

  function seatCard(card: ArgumentCard, slotId: string) {
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
    setWrongIds((current) => current.filter((id) => id !== slotId))
    setStatus('idle')
    return nextSlots
  }

  function place(slotId: string) {
    if (status === 'ok' || !selected) return
    const card = takeCard(selected)
    if (!card) return
    if (guided && nextSlot && slotId !== nextSlot.id) return
    if (guided && nextSlot && card.id !== nextSlot.correctCardId) {
      bounce()
      setSelected(null)
      return
    }
    const nextSlots = seatCard(card, slotId)
    if (guided) {
      const dest = challenge.slots.findIndex((slot) => !nextSlots[slot.id])
      setDecoyId(dest >= 0 ? decoyFor(challenge, dest, new Set(
        Object.values(nextSlots)
          .filter((item): item is ArgumentCard => Boolean(item))
          .map((item) => item.id),
      )) : null)
      if (challenge.slots.every((slot) => nextSlots[slot.id])) {
        setStatus('ok')
        onSolved()
      }
    }
  }

  function pickStone(id: string) {
    if (status === 'ok') return
    if (!guided) {
      setSelected(id === selected ? null : id)
      setStatus('idle')
      return
    }
    if (!nextSlot) return
    if (id !== nextSlot.correctCardId) {
      bounce()
      return
    }
    const card = takeCard(id)
    if (!card) return
    const nextSlots = seatCard(card, nextSlot.id)
    const dest = challenge.slots.findIndex((slot) => !nextSlots[slot.id])
    setDecoyId(
      dest >= 0
        ? decoyFor(
            challenge,
            dest,
            new Set(
              Object.values(nextSlots)
                .filter((item): item is ArgumentCard => Boolean(item))
                .map((item) => item.id),
            ),
          )
        : null,
    )
    if (challenge.slots.every((slot) => nextSlots[slot.id])) {
      setStatus('ok')
      onSolved()
    }
  }

  function returnCard(id: string) {
    if (status === 'ok') return
    const card = takeCard(id)
    if (!card) return
    const home = order.findIndex((item) => item.id === id)
    const nextSlots = { ...slots }
    for (const key of Object.keys(nextSlots)) {
      if (nextSlots[key]?.id === id) delete nextSlots[key]
    }
    setSlots(nextSlots)
    setSeats((current) => {
      if (current.some((item) => item?.id === id)) return current
      const next = [...current]
      if (home >= 0) next[home] = card
      return next
    })
    setSelected(null)
    setWrongIds((current) => current.filter((item) => slots[item]?.id !== id))
    setStatus('idle')
    if (guided) {
      const dest = challenge.slots.findIndex((slot) => !nextSlots[slot.id])
      setDecoyId(dest >= 0 ? decoyFor(challenge, dest, placed) : null)
    }
  }

  function evaluate(currentSlots = slots) {
    const wrong = challenge.slots
      .filter((slot) => currentSlots[slot.id]?.id !== slot.correctCardId)
      .map((slot) => slot.id)
    if (wrong.length === 0 && challenge.slots.every((slot) => currentSlots[slot.id])) {
      setStatus('ok')
      setWrongIds([])
      onSolved()
      return
    }
    setWrongIds(wrong)
    bounce()
  }

  return (
    <div
      className={`play is-build is-onescreen ${guided ? 'is-deal' : ''} ${shake ? 'is-shake' : ''} ${status === 'ok' ? 'is-win' : ''}`}
    >
      <WinBurst play={status === 'ok'} />
      <PuzzleLead challenge={challenge} />
      <PuzzleHint text={challenge.context} onPeek={onPeek} />
      <p className="sort-how">
        {guided ? (
          <>
            <strong>Tap the next stone</strong> · two choices
          </>
        ) : (
          <>
            <strong>Tap a stone</strong> · then a slot
          </>
        )}
      </p>

      {misses > 0 && status !== 'ok' ? (
        <p className="match-toast" role="status">
          <strong>{misses >= 2 ? 'One more look.' : 'That stone slipped.'}</strong>{' '}
          {misses >= 2
            ? challenge.teachOnWrong
            : guided
              ? 'Not that stone. Try the other — the chain stays.'
              : 'Tap a red slot to swap. The chain stays; try again.'}
        </p>
      ) : null}

      {misses > 0 && status !== 'ok' ? (
        <button type="button" className="btn tiny match-recover" onClick={recover}>
          Try again
        </button>
      ) : null}

      <div className="slot-list">
        {challenge.slots.map((slot, index) => {
          const card = slots[slot.id]
          const awaiting = guided ? slot.id === nextSlot?.id : !card && Boolean(selected)
          return (
            <div
              key={slot.id}
              className={`slot ${slot.role} ${wrongIds.includes(slot.id) ? 'is-wrong' : ''} ${awaiting ? 'is-now' : ''}`}
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
                  className={`slot-target ${awaiting ? 'awaiting' : ''}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    place(slot.id)
                  }}
                >
                  {awaiting ? '↓' : ''}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {!guided && filled && status !== 'ok' ? (
        <button type="button" className="btn primary build-lock" onClick={() => evaluate()}>
          Check the chain
        </button>
      ) : null}

      <div className="bank is-order">
        {order.map((home, index) => {
          const live = seats[index]?.id === home.id
          const faceDown = guided && live && !liveIds.has(home.id)
          if (guided && !live) return null
          if (faceDown) return null
          return (
            <div
              key={home.id}
              className={`sort-tile sort-seat ${live && selected === home.id ? 'is-selected' : ''} ${live ? '' : 'is-gone'} ${live ? '' : 'was-placed'}`}
              style={
                guided
                  ? undefined
                  : {
                      gridColumn: (index % 2) + 1,
                      gridRow: Math.floor(index / 2) + 1,
                    }
              }
            >
              <button
                type="button"
                className={`chip ${live && selected === home.id ? 'is-selected' : ''} ${home.distractor ? 'is-tempt' : ''}`}
                tabIndex={0}
                aria-label={live ? home.text : `Return ${home.text} to its seat`}
                onClick={() => {
                  if (live) pickStone(home.id)
                  else returnCard(home.id)
                }}
              >
                {home.text}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
