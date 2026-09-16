import { cannotCharge, storeProduct, type BillingOffer } from '../lib/billing'
import { billingSurface } from '../lib/commerce'

interface CheckoutSheetProps {
  offer: BillingOffer
  onConfirm: () => void
  onCancel: () => void
}

/** In-app checkout. Honest: this build cannot charge. Same grant Play will send. */
export function CheckoutSheet({ offer, onConfirm, onCancel }: CheckoutSheetProps) {
  const product = storeProduct(offer)
  if (!product) return null
  const surface = billingSurface()
  return (
    <div className="scene-ad checkout-sheet" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      <div className="scene-ad-card">
        <p className="eyebrow">{product.sku}</p>
        <h2 id="checkout-title">{product.title}</h2>
        <p>{product.blurb}</p>
        <p className="teach-chip" role="note">
          {product.priceLabel} · this device cannot charge
        </p>
        <p className="quiet">
          {cannotCharge()
            ? surface === 'play'
              ? 'Play Billing is not in this build. Unlock writes the same grant Play will send later.'
              : 'This Pages build cannot charge. Unlock on this device — the same flag Play IAP will set later.'
            : 'Charge when a live store is wired.'}
        </p>
        <div className="scene-ad-actions">
          <button type="button" className="btn gold xl" onClick={onConfirm}>
            Unlock on this device · {product.priceLabel}
          </button>
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
