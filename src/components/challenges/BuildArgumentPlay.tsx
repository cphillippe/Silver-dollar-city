import { useMemo, useState } from 'react'
import { shuffle } from '../../lib/shuffle'
import type { ArgumentCard, BuildArgumentChallenge } from '../../types'
import { PuzzleHint } from './PuzzleHint'
import { ResultPanel } from './ResultPanel'

interface BuildArgumentPlayProps {
  challenge: BuildArgumentChallenge
  onMiss: () => void
  onSolved: () => void
}

export function BuildArgumentPlay({
  challenge,
  onMiss,
  onSolved,
}: BuildArgumentPlayProps) {
  const seed = useMemo(() => shuffle(challenge.cards), [challenge.cards])
  const [bank, setBank] = useState(seed)
  const [slots, setSlots] = useState<Record<string, ArgumentCard | undefined>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'wrong' | 'ok'>('idle')
  const [shake, setShake] = useState(false)

  function place(slotId: string) {
    if (status === 'ok' || !selected) return
    const card =
      bank.find((item) => item.id === selected) ??
      Object.values(slots).find((item) => item?.id === selected)
    if (!card) return

    const nextSlots = { ...slots }
    const displaced = nextSlots[slotId]
    for (const key of Object.keys(nextSlots)) {
      if (nextSlots[key]?.id === card.id) delete nextSlots[key]
    }
    nextSlots[slotId] = card
    let nextBank = bank.filter((item) => item.id !== card.id)
    if (displaced && displaced.id !== card.id) {
      nextBank = nextBank.some((item) => item.id === displaced.id)
        ? nextBank
        : [...nextBank, displaced]
    }
    setBank(nextBank)
    setSlots(nextSlots)
    setSelected(null)
    setStatus('idle')

    const filled = challenge.slots.every((slot) => nextSlots[slot.id])
    if (filled) {
      window.setTimeout(() => evaluate(nextSlots), 80)
    }
  }

  function returnCard(slotId: string) {
    if (status === 'ok') return
    const card = slots[slotId]
    if (!card) return
    setSlots((current) => {
      const next = { ...current }
      delete next[slotId]
      return next
    })
    setBank((current) => [...current, card])
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
    onMiss()
    window.setTimeout(() => {
      setShake(false)
      setBank(shuffle(challenge.cards))
      setSlots({})
    }, 520)
  }

  return (
    <div className={`play ${shake ? 'is-shake' : ''} ${status === 'ok' ? 'is-win' : ''}`}>
      <PuzzleHint text={challenge.context} />
      <p className="prompt">{challenge.prompt}</p>
      <p className="hint">Slot the chain. Leave the decoys in the bank — it checks when full.</p>

      <div className="slot-list">
        {challenge.slots.map((slot) => {
          const card = slots[slot.id]
          return (
            <div key={slot.id} className={`slot ${slot.role}`}>
              <span className="slot-label">{slot.label}</span>
              {card ? (
                <button
                  type="button"
                  className="chip in-slot pop-in"
                  onClick={() => returnCard(slot.id)}
                >
                  {card.text}
                </button>
              ) : (
                <button
                  type="button"
                  className={`slot-target ${selected ? 'awaiting' : ''}`}
                  onClick={() => place(slot.id)}
                >
                  {selected ? 'Drop here' : 'Empty'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="bank">
        {bank.map((card) => (
          <button
            key={card.id}
            type="button"
            className={`chip ${selected === card.id ? 'is-selected' : ''} ${card.distractor ? 'is-tempt' : ''}`}
            onClick={() => setSelected(card.id === selected ? null : card.id)}
          >
            {card.text}
          </button>
        ))}
      </div>

      <ResultPanel
        tone={status === 'idle' ? 'idle' : status === 'ok' ? 'ok' : 'teach'}
        title={status === 'ok' ? 'The chain locks!' : 'A link slips — tiles bounce back.'}
        body={status === 'wrong' ? challenge.teachOnWrong : undefined}
        deeper={challenge.deeper}
      />
    </div>
  )
}
