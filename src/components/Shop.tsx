import { useState } from 'react'
import {
  PACK_LINE,
  REMOVE_ADS_PRODUCT,
  SHOP_PACKS,
  TRAIL_SUBTITLE,
  packPaywallLine,
} from '../config/commerce'
import {
  billingSurface,
  grantPack,
  grantRemoveAds,
  packIsUnlocked,
  restoreCommerce,
} from '../lib/commerce'
import { EASY, isEasy } from '../lib/easy'
import { useProgress } from '../store/progress'
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

  function afterGrant(note: string) {
    setMessage(note)
  }

  function unlockWeb(kind: 'ads' | 'pack', packId?: string) {
    const ok = window.confirm(
      surface === 'play'
        ? 'Play Billing is not wired in this build. Unlock on this device with the same flag Play will set later?'
        : 'This Pages build cannot charge yet. Unlock on this device? The same flag is what Play IAP will set later.',
    )
    if (!ok) return
    if (kind === 'ads') {
      grantRemoveAds()
      afterGrant('Ads off on this device. Thank you for supporting the trail.')
      return
    }
    if (packId) {
      grantPack(packId)
      afterGrant('Street unlocked on this device.')
    }
  }

  function restore() {
    const next = restoreCommerce()
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
        <p className="eyebrow">{easy ? EASY.supportTrail : 'Support the trail'}</p>
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
          {surface === 'play'
            ? `Play product ${REMOVE_ADS_PRODUCT.sku} will call the same unlock later.`
            : 'This Pages build cannot charge. Unlock on this device — the same flag Play will set later.'}
        </p>
        <div className="settings-actions">
          {removeAds ? (
            <p className="teach-chip" role="status">
              Ads off on this device. Thank you.
            </p>
          ) : (
            <button type="button" className="btn gold" onClick={() => unlockWeb('ads')}>
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
              <li key={pack.id} className={`shop-pack ${pack.included ? 'is-free' : ''} ${open ? 'is-open' : ''}`}>
                <p className="eyebrow">{pack.street}</p>
                <h3>{pack.title}</h3>
                <p>{pack.included ? pack.blurb : packPaywallLine(pack.street)}</p>
                <p className="quiet">{pack.included ? 'Included' : `${PACK_LINE} · ${pack.priceLabel}`}</p>
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
                    onClick={() => unlockWeb('pack', pack.id)}
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
    </main>
  )
}
