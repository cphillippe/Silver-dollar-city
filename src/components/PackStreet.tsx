import { useState } from 'react'
import { paidStreetForPack } from '../content/paidStreets'
import { localDateKey } from '../lib/dates'
import { packIsUnlocked } from '../lib/commerce'
import { EASY, isEasy } from '../lib/easy'
import { RecallGate } from './RecallGate'
import { useProgress } from '../store/progress'
import type { View } from '../types'

interface PackStreetProps {
  packId: string
  onNavigate: (view: View) => void
}

export function PackStreet({ packId, onNavigate }: PackStreetProps) {
  const { progress, recordHeld, recordLessonHold, recordReview } = useProgress()
  const easy = isEasy(progress)
  const street = paidStreetForPack(packId)
  const unlocked = packIsUnlocked(packId)
  const [phase, setPhase] = useState<'learn' | 'hold'>('learn')

  if (!street) {
    return (
      <main className="pack-street page">
        <button type="button" className="text-link" onClick={() => onNavigate({ name: 'shop' })}>
          ← Packs
        </button>
        <p>That street is not in this build.</p>
      </main>
    )
  }

  if (!unlocked) {
    return (
      <main className="pack-street page">
        <button type="button" className="text-link" onClick={() => onNavigate({ name: 'shop' })}>
          ← Packs
        </button>
        <header className="page-head">
          <p className="eyebrow">{street.place}</p>
          <h1>{street.title}</h1>
          <p>This street is extra. The core Easy trail stays free — never a paywall on Mercy, Match, or Hold.</p>
        </header>
        <button type="button" className="btn gold xl" onClick={() => onNavigate({ name: 'shop' })}>
          Unlock in Packs
        </button>
      </main>
    )
  }

  return (
    <main className="pack-street page" aria-label={street.place}>
      <button type="button" className="text-link" onClick={() => onNavigate({ name: 'hub' })}>
        ← {easy ? EASY.home : 'The town'}
      </button>
      {phase === 'learn' ? (
        <section className="easy-story-card" aria-label={street.title}>
          <p className="eyebrow">
            {street.place} · {street.who}
          </p>
          <h1>{street.title}</h1>
          <p className="teach-reason">{street.story}</p>
          <p className="teach-chip" role="note">
            {street.brief.claim}
          </p>
          <p className="quiet">{street.brief.source}</p>
          <button type="button" className="btn primary xl" onClick={() => setPhase('hold')}>
            {EASY.holdNext}
          </button>
        </section>
      ) : (
        <RecallGate
          brief={street.brief}
          kicker={easy ? EASY.rememberSentence : undefined}
          onHeld={({ clean }) => {
            recordHeld(street.id)
            recordReview({
              id: street.id,
              pillar: street.packId,
              kind: 'encode',
              today: localDateKey(),
              clean,
              peeked: false,
              elaborated: false,
            })
            recordLessonHold(street.id, clean)
            onNavigate({ name: 'journal' })
          }}
        />
      )}
    </main>
  )
}
