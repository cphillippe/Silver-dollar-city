import { useState } from 'react'
import {
  PACK_LINE,
  REMOVE_ADS_PRODUCT,
  SHOP_PACKS,
  TRAIL_NAME,
  TRAIL_SUBTITLE,
  packPaywallLine,
} from '../config/commerce'
import { billingSurface, packIsUnlocked } from '../lib/commerce'
import {
  cancelPurchase,
  cannotCharge,
  checkoutOffer,
  packStreetLocked,
  restoreFromStore,
  type BillingOffer,
} from '../lib/billing'
import { EASY, isEasy } from '../lib/easy'
import { useProgress } from '../store/progress'
import { CheckoutSheet } from './CheckoutSheet'
import { useCommerce } from './AdSlot'
import type { View } from '../types'

interface ShopProps {
  onNavigate: (view: View) => void
}

export function Shop({ onNavigate }: ShopProps) {
  const { progress } = useProgress()
  const easy = isEasy(progress)
  const commerce = useCommerce()
  const removeAds = commerce.removeAds
  const surface = billingSurface()
  const [message, setMessage] = useState('')
  const [checkout, setCheckout] = useState<BillingOffer | null>(null)

  function afterGrant(note: string) {
    setMessage(note)
  }

  async function confirmCheckout() {
    if (!checkout) return
    const offer = checkout
    const result = await checkoutOffer(offer)
    setCheckout(null)
    if (result.status === 'canceled' || result.status === 'unavailable') {
      afterGrant('Purchase did not finish.')
      return
    }
    if (result.status === 'already') {
      afterGrant(
        offer.kind === 'remove-ads'
          ? 'Ads were already off on this device.'
          : 'That street is already unlocked on this device.',
      )
      if (offer.kind === 'pack' && offer.packId && !packStreetLocked(offer.packId, result.commerce)) {
        onNavigate({ name: 'pack-street', packId: offer.packId })
      }
      return
    }
    if (offer.kind === 'remove-ads') {
      afterGrant('Ads off on this device. Thank you for supporting the trail.')
      return
    }
    if (offer.kind === 'pack' && offer.packId) {
      afterGrant('Street unlocked on this device.')
      onNavigate({ name: 'pack-street', packId: offer.packId })
    }
  }

  async function restore() {
    const next = await restoreFromStore()
    if (next.removeAds || next.unlockedPacks.length) {
      afterGrant(
        next.removeAds
          ? 'Restored on this device — ads off, packs you unlocked are here.'
          : 'Restored on this device — your unlocked streets are here.',
      )
      return
    }
      afterGrant(
        surface === 'play'
          ? 'Nothing to restore here yet. On Play, this will ask Google Play for the same SKUs.'
          : surface === 'app-store'
            ? 'Nothing to restore here yet. On iPhone, this will ask the App Store for the same SKUs.'
            : 'Nothing to restore on this device yet.',
      )
  }

  function openStreet(packId: string) {
    if (!packIsUnlocked(packId, commerce)) return
    onNavigate({ name: 'pack-street', packId })
  }

  return (
    <main className="shop page" aria-label="Support the trail">
      <button type="button" className="text-link" onClick={() => onNavigate({ name: 'hub' })}>
        ← {easy ? EASY.home : 'The town'}
      </button>

      <header className="page-head">
        <p className="eyebrow">{TRAIL_NAME}</p>
        <h1>Street Packs</h1>
        <p>{TRAIL_SUBTITLE}</p>
        <p>
          The Easy trail stays free. Journal pages you already hold stay open.
          Street Packs add new walks only.
        </p>
      </header>

      <section className="settings-card" aria-label="Remove ads">
        <p className="eyebrow">{REMOVE_ADS_PRODUCT.sku}</p>
        <h2>{REMOVE_ADS_PRODUCT.title}</h2>
        <p>{REMOVE_ADS_PRODUCT.blurb}</p>
        <p className="quiet">
          {cannotCharge()
            ? surface === 'play'
              ? `Play product ${REMOVE_ADS_PRODUCT.sku} uses the IAP adapter when the plugin is connected.`
              : surface === 'app-store'
                ? `App Store product ${REMOVE_ADS_PRODUCT.sku} uses StoreKit when the plugin is connected.`
                : 'This Pages build cannot charge. Unlock on this device — the same flag Play / App Store will set later.'
            : surface === 'app-store'
              ? 'StoreKit will charge this SKU. Restore asks the App Store for the same products.'
              : 'Play Billing will charge this SKU. Restore asks Google Play for the same products.'}
        </p>
        <div className="settings-actions">
          {removeAds ? (
            <p className="teach-chip" role="status">
              Ads off on this device. Thank you.
            </p>
          ) : (
            <button type="button" className="btn gold" onClick={() => setCheckout({ kind: 'remove-ads' })}>
              {REMOVE_ADS_PRODUCT.title} · {REMOVE_ADS_PRODUCT.priceLabel}
            </button>
          )}
          <button type="button" className="btn" onClick={restore}>
            Restore
          </button>
        </div>
      </section>

      <section className="settings-card" aria-label="Street Packs">
        <p className="eyebrow">{easy ? EASY.packs : 'Street Packs'}</p>
        <h2>Street Packs</h2>
        <p className="quiet">{PACK_LINE}</p>
        <ul className="shop-pack-list">
          {SHOP_PACKS.map((pack) => {
            const open = packIsUnlocked(pack.id, commerce)
            return (
              <li key={pack.id} className={`shop-pack ${pack.included ? 'is-free' : ''} ${open ? 'is-open' : 'is-locked'}`}>
                <p className="eyebrow">{pack.included ? pack.street : open ? pack.street : `${pack.street} · locked`}</p>
                <h3>{pack.title}</h3>
                <p>{pack.included ? pack.blurb : packPaywallLine(pack.street)}</p>
                <p className="quiet">
                  {pack.included
                    ? 'Included'
                    : open
                      ? `${PACK_LINE} · unlocked on this device`
                      : `${PACK_LINE} · ${pack.priceLabel} · ${pack.sku}`}
                </p>
                {pack.included ? (
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => onNavigate({ name: 'hub' })}
                  >
                    Walk the free trail
                  </button>
                ) : open ? (
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => openStreet(pack.id)}
                  >
                    Open {pack.street}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn gold"
                    onClick={() => setCheckout({ kind: 'pack', packId: pack.id })}
                  >
                    Unlock {pack.street} · {pack.priceLabel}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      {message ? <p className="settings-msg">{message}</p> : null}
      {checkout ? (
        <CheckoutSheet
          offer={checkout}
          onConfirm={confirmCheckout}
          onCancel={() => {
            cancelPurchase()
            setCheckout(null)
          }}
        />
      ) : null}
    </main>
  )
}
