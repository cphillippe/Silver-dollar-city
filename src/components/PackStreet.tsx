import { useState } from 'react'
import { paidStreetForPack } from '../content/paidStreets'
import { shopPack, packPaywallLine } from '../config/commerce'
import { localDateKey } from '../lib/dates'
import { packIsUnlocked } from '../lib/commerce'
import { checkoutOffer, packStreetLocked, type BillingOffer } from '../lib/billing'
import { EASY, isEasy } from '../lib/easy'
import { RecallGate } from './RecallGate'
import { CheckoutSheet } from './CheckoutSheet'
import { useCommerce } from './AdSlot'
import { useProgress } from '../store/progress'
import type { View } from '../types'

interface PackStreetProps {
  packId: string
  onNavigate: (view: View) => void
}

export function PackStreet({ packId, onNavigate }: PackStreetProps) {
  const { progress, recordHeld, recordLessonHold, recordReview } = useProgress()
  const easy = isEasy(progress)
  const commerce = useCommerce()
  const street = paidStreetForPack(packId)
  const pack = shopPack(packId)
  const unlocked = packIsUnlocked(packId, commerce)
  const [phase, setPhase] = useState<'learn' | 'hold'>('learn')
  const [checkout, setCheckout] = useState<BillingOffer | null>(null)

  if (!street) {
    return (
      <main className="pack-street page">
        <button type="button" className="text-link" onClick={() => onNavigate({ name: 'shop' })}>
          ← Street Packs
        </button>
        <p>That street is not in this build.</p>
      </main>
    )
  }

  if (!unlocked) {
    return (
      <main className="pack-street page is-locked" aria-label={street.place}>
        <button type="button" className="text-link" onClick={() => onNavigate({ name: 'shop' })}>
          ← Street Packs
        </button>
        <header className="page-head">
          <p className="eyebrow">{street.place} · locked</p>
          <h1>{street.title}</h1>
          <p>
            This street is extra. The core Easy trail stays free — never a paywall on Mercy,
            Match, or Hold.
          </p>
          <p className="quiet">{packPaywallLine(street.place)}</p>
          {pack ? (
            <p className="teach-chip" role="note">
              {pack.priceLabel} · {pack.sku}
            </p>
          ) : null}
        </header>
        <button
          type="button"
          className="btn gold xl"
          onClick={() => setCheckout({ kind: 'pack', packId })}
        >
          Unlock {street.place}
          {pack ? ` · ${pack.priceLabel}` : ''}
        </button>
        <button type="button" className="btn" onClick={() => onNavigate({ name: 'shop' })}>
          Street Packs
        </button>
        {checkout ? (
          <CheckoutSheet
            offer={checkout}
            onConfirm={() => {
              void checkoutOffer(checkout).then((result) => {
                setCheckout(null)
                if (result.status === 'purchased' || result.status === 'already') {
                  if (!packStreetLocked(packId, result.commerce)) setPhase('learn')
                }
              })
            }}
            onCancel={() => setCheckout(null)}
          />
        ) : null}
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
