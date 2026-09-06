import { useMemo, useState } from 'react'
import { shuffle } from '../../lib/shuffle'
import type { ArgumentCard, BuildArgumentChallenge } from '../../types'
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

  function place(slotId: string) {
    if (status === 'ok' || !selected) return
    const card =
      bank.find((item) => item.id === selected) ??
      Object.values(slots).find((item) => item?.id === selected)
    if (!card) return

    setBank((current) => current.filter((item) => item.id !== card.id))
    setSlots((current) => {
      const next = { ...current }
      const displaced = next[slotId]
      for (const key of Object.keys(next)) {
        if (next[key]?.id === card.id) delete next[key]
      }
      next[slotId] = card
      if (displaced && displaced.id !== card.id) {
        setBank((bankNow) =>
          bankNow.some((item) => item.id === displaced.id)
            ? bankNow
            : [...bankNow, displaced],
        )
      }
      return next
    })
    setSelected(null)
    setStatus('idle')
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

  function check() {
    const ok = challenge.slots.every(
      (slot) => slots[slot.id]?.id === slot.correctCardId,
    )
    if (ok) {
      setStatus('ok')
      onSolved()
    } else {
      setStatus('wrong')
      onMiss()
    }
  }

  const filled = challenge.slots.every((slot) => slots[slot.id])

  return (
    <div className="play">
      {challenge.context ? <p className="context">{challenge.context}</p> : null}
      <p className="prompt">{challenge.prompt}</p>
      <p className="hint">Select a card, then place it in a slot. Leave the weak claims in the bank.</p>

      <div className="slot-list">
        {challenge.slots.map((slot) => {
          const card = slots[slot.id]
          return (
            <div key={slot.id} className={`slot ${slot.role}`}>
              <span className="slot-label">{slot.label}</span>
              {card ? (
                <button
                  type="button"
                  className="chip in-slot"
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
                  {selected ? 'Place here' : 'Empty'}
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

      {status !== 'ok' ? (
        <button type="button" className="btn primary" disabled={!filled} onClick={check}>
          Test the chain
        </button>
      ) : null}

      <ResultPanel
        tone={status === 'idle' ? 'idle' : status === 'ok' ? 'ok' : 'teach'}
        title={status === 'ok' ? 'The chain is valid.' : 'A link is out of place.'}
        body={status === 'wrong' ? challenge.teachOnWrong : undefined}
        deeper={challenge.deeper}
      />
    </div>
  )
}
