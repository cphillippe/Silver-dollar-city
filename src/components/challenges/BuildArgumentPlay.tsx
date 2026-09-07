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
  const [bank, setBank] = useState(seed)
  const [slots, setSlots] = useState<Record<string, ArgumentCard | undefined>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'wrong' | 'ok'>('idle')
  const [shake, setShake] = useState(false)
  const [misses, setMisses] = useState(0)

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
    setMisses((count) => count + 1)
    onMiss()
    window.setTimeout(() => {
      setShake(false)
      setBank(shuffle(challenge.cards))
      setSlots({})
    }, 880)
  }

  return (
    <div className={`play ${shake ? 'is-shake' : ''} ${status === 'ok' ? 'is-win' : ''}`}>
      <WinBurst play={status === 'ok'} />
      <PuzzleLead challenge={challenge} />
      <PuzzleHint text={challenge.context} onPeek={onPeek} />

      <div className="slot-list">
        {challenge.slots.map((slot, index) => {
          const card = slots[slot.id]
          return (
            <div key={slot.id} className={`slot ${slot.role}`}>
              <span className="slot-label">{slot.label}</span>
              {card ? (
                <button
                  type="button"
                  className="chip in-slot pop-in"
                  style={status === 'ok' ? burstStyle(index, 'mid') : undefined}
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
