import { cannotCharge, storeProduct, type BillingOffer } from '../lib/billing'
import { billingSurface } from '../lib/commerce'

interface CheckoutSheetProps {
  offer: BillingOffer
  onConfirm: () => void
  onCancel: () => void
}

/** In-app checkout. Demo cannot charge; Play path uses the IAP adapter. */
export function CheckoutSheet({ offer, onConfirm, onCancel }: CheckoutSheetProps) {
  const product = storeProduct(offer)
  if (!product) return null
  const surface = billingSurface()
  const demo = cannotCharge()
  return (
    <div className="scene-ad checkout-sheet" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      <div className="scene-ad-card">
        <p className="eyebrow">{product.sku}</p>
        <h2 id="checkout-title">{product.title}</h2>
        <p>{product.blurb}</p>
        <p className="teach-chip" role="note">
          {demo
            ? `${product.priceLabel} · this device cannot charge`
            : `${product.priceLabel} · ${surface === 'app-store' ? 'App Store' : 'Play Billing'}`}
        </p>
        <p className="quiet">
          {demo
            ? surface === 'play'
              ? 'Play Billing plugin is not connected. Unlock writes the same grant Play will send later.'
              : surface === 'app-store'
                ? 'StoreKit plugin is not connected. Unlock writes the same grant the App Store will send later.'
                : 'This Pages build cannot charge. Unlock on this device — the same flag Play / App Store IAP will set later.'
            : surface === 'app-store'
              ? 'The App Store will charge this SKU. The same grantRemoveAds / grantPack flags apply.'
              : 'Google Play will charge this SKU. The same grantRemoveAds / grantPack flags apply.'}
        </p>
        <div className="scene-ad-actions">
          <button type="button" className="btn gold xl" onClick={onConfirm}>
            {demo
              ? `Unlock on this device · ${product.priceLabel}`
              : surface === 'app-store'
                ? `Buy with App Store · ${product.priceLabel}`
                : `Buy with Play · ${product.priceLabel}`}
          </button>
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
