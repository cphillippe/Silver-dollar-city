/**
 * Production-shaped billing. Pages cannot charge unless a Play Billing
 * plugin AND VITE_PLAY_BILLING are present. Demo purchases write a receipt
 * + the same grant Play will send later. Restore re-applies receipts, then
 * asks the plugin when it can charge. No store money until that connect.
 */

import {
  PLAY_SKUS,
  REMOVE_ADS_PRODUCT,
  SHOP_PACKS,
  shopPack,
} from '../config/commerce.ts'
import {
  iapCanCharge,
  isCancelError,
  pluginPurchase,
  pluginRestore,
} from './iapAdapter.ts'
import {
  grantPack,
  grantRemoveAds,
  packIsUnlocked,
  readCommerce,
  writeCommerce,
  emptyCommerce,
  type CommerceState,
} from './commerce.ts'

export const RECEIPTS_KEY = 'silver-city-receipts-v1'

export type BillingKind = 'remove-ads' | 'pack'

export interface BillingOffer {
  kind: BillingKind
  packId?: string
}

export interface StoreProduct {
  kind: BillingKind
  packId?: string
  sku: string
  title: string
  blurb: string
  priceLabel: string
}

export interface PurchaseReceipt {
  orderId: string
  sku: string
  kind: BillingKind
  packId?: string
  purchasedAt: string
  token: string
  source: 'web-demo' | 'play-demo' | 'play'
}

export type PurchaseStatus = 'purchased' | 'already' | 'canceled' | 'unavailable'

export interface PurchaseResult {
  status: PurchaseStatus
  cannotCharge: boolean
  receipt?: PurchaseReceipt
  commerce: CommerceState
}

const EMPTY_RECEIPTS: PurchaseReceipt[] = []
let receiptMemory: PurchaseReceipt[] = EMPTY_RECEIPTS

function billingSource(): PurchaseReceipt['source'] {
  if (typeof window === 'undefined') return 'web-demo'
  const cap = (
    window as unknown as {
      Capacitor?: { isNativePlatform?: () => boolean }
    }
  ).Capacitor
  if (cap?.isNativePlatform?.()) return 'play-demo'
  return 'web-demo'
}

export function cannotCharge(): boolean {
  return !iapCanCharge()
}

export function offerFromSku(sku: string): BillingOffer | undefined {
  if (sku === PLAY_SKUS.removeAds) return { kind: 'remove-ads' }
  const pack = SHOP_PACKS.find((row) => row.sku === sku && !row.included)
  if (!pack) return undefined
  return { kind: 'pack', packId: pack.id }
}

export function storeProduct(offer: BillingOffer): StoreProduct | undefined {
  if (offer.kind === 'remove-ads') {
    return {
      kind: 'remove-ads',
      sku: REMOVE_ADS_PRODUCT.sku,
      title: REMOVE_ADS_PRODUCT.title,
      blurb: REMOVE_ADS_PRODUCT.blurb,
      priceLabel: REMOVE_ADS_PRODUCT.priceLabel,
    }
  }
  const packId = offer.packId
  if (!packId) return undefined
  const pack = shopPack(packId)
  if (!pack || pack.included) return undefined
  return {
    kind: 'pack',
    packId: pack.id,
    sku: pack.sku,
    title: pack.title,
    blurb: pack.blurb,
    priceLabel: pack.priceLabel,
  }
}

function isSafeReceipt(raw: unknown): raw is PurchaseReceipt {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false
  const value = raw as Record<string, unknown>
  if (typeof value.orderId !== 'string' || value.orderId.length > 80) return false
  if (typeof value.sku !== 'string' || value.sku.length > 80) return false
  if (value.kind !== 'remove-ads' && value.kind !== 'pack') return false
  if (typeof value.purchasedAt !== 'string' || value.purchasedAt.length > 40) return false
  if (typeof value.token !== 'string' || value.token.length > 80) return false
  if (value.source !== 'web-demo' && value.source !== 'play-demo' && value.source !== 'play') {
    return false
  }
  if (value.kind === 'pack' && typeof value.packId !== 'string') return false
  return true
}

export function normalizeReceipts(raw: unknown): PurchaseReceipt[] {
  if (!Array.isArray(raw)) return []
  const next: PurchaseReceipt[] = []
  const seen = new Set<string>()
  for (const item of raw) {
    if (!isSafeReceipt(item)) continue
    if (seen.has(item.orderId)) continue
    seen.add(item.orderId)
    next.push(item)
    if (next.length >= 32) break
  }
  return next
}

export function readReceipts(): PurchaseReceipt[] {
  let next = receiptMemory
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(RECEIPTS_KEY)
      next = raw ? normalizeReceipts(JSON.parse(raw) as unknown) : normalizeReceipts(receiptMemory)
    } catch {
      next = normalizeReceipts(receiptMemory)
    }
  } else {
    next = normalizeReceipts(receiptMemory)
  }
  receiptMemory = next
  return receiptMemory
}

export function writeReceipts(rows: PurchaseReceipt[]): PurchaseReceipt[] {
  const clean = normalizeReceipts(rows)
  receiptMemory = clean
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(RECEIPTS_KEY, JSON.stringify(clean))
  }
  return receiptMemory
}

function appendReceipt(receipt: PurchaseReceipt): PurchaseReceipt[] {
  const current = readReceipts()
  if (current.some((row) => row.orderId === receipt.orderId)) return current
  return writeReceipts([...current, receipt])
}

export function applyReceipt(receipt: PurchaseReceipt): CommerceState {
  if (receipt.kind === 'remove-ads' && receipt.sku === PLAY_SKUS.removeAds) {
    return grantRemoveAds()
  }
  if (receipt.kind === 'pack' && receipt.packId) {
    return grantPack(receipt.packId)
  }
  return readCommerce()
}

/** Re-apply every receipt. Survives a wiped flag store on this device. */
export function restorePurchases(): CommerceState {
  const rows = readReceipts()
  if (!rows.length) return readCommerce()
  for (const receipt of rows) applyReceipt(receipt)
  return readCommerce()
}

let receiptSeq = 0

function nextOrderId(sku: string): string {
  receiptSeq += 1
  const tail = sku.replace(/[^a-z0-9]/gi, '').slice(-8) || 'sku'
  return `sc-${Date.now().toString(36)}-${receiptSeq}-${tail}`
}

function alreadyOwns(offer: BillingOffer, state: CommerceState = readCommerce()): boolean {
  if (offer.kind === 'remove-ads') return state.removeAds
  if (offer.packId) return packIsUnlocked(offer.packId, state)
  return false
}

/** Demo path. Never charges. Same grant Play will send after a live IAP. */
export function purchaseOffer(offer: BillingOffer): PurchaseResult {
  const product = storeProduct(offer)
  if (!product) {
    return { status: 'unavailable', cannotCharge: true, commerce: readCommerce() }
  }
  if (alreadyOwns(offer)) {
    return { status: 'already', cannotCharge: true, commerce: readCommerce() }
  }
  const orderId = nextOrderId(product.sku)
  const receipt: PurchaseReceipt = {
    orderId,
    sku: product.sku,
    kind: product.kind,
    packId: product.packId,
    purchasedAt: new Date().toISOString(),
    token: orderId,
    source: billingSource(),
  }
  appendReceipt(receipt)
  const commerce = applyReceipt(receipt)
  return { status: 'purchased', cannotCharge: true, receipt, commerce }
}

/**
 * CheckoutSheet confirm. Uses Play Billing when the adapter can charge;
 * otherwise the cannotCharge demo grant.
 */
export async function checkoutOffer(offer: BillingOffer): Promise<PurchaseResult> {
  const product = storeProduct(offer)
  if (!product) {
    return { status: 'unavailable', cannotCharge: cannotCharge(), commerce: readCommerce() }
  }
  if (alreadyOwns(offer)) {
    return { status: 'already', cannotCharge: cannotCharge(), commerce: readCommerce() }
  }
  if (!iapCanCharge()) return purchaseOffer(offer)
  try {
    const paid = await pluginPurchase(product.sku)
    const receipt: PurchaseReceipt = {
      orderId: paid.orderId,
      sku: product.sku,
      kind: product.kind,
      packId: product.packId,
      purchasedAt: new Date().toISOString(),
      token: paid.token,
      source: 'play',
    }
    appendReceipt(receipt)
    return { status: 'purchased', cannotCharge: false, receipt, commerce: applyReceipt(receipt) }
  } catch (error) {
    if (isCancelError(error)) {
      return { status: 'canceled', cannotCharge: false, commerce: readCommerce() }
    }
    return { status: 'unavailable', cannotCharge: false, commerce: readCommerce() }
  }
}

export function cancelPurchase(): PurchaseResult {
  return { status: 'canceled', cannotCharge: cannotCharge(), commerce: readCommerce() }
}

/** Local receipts, then Play restore when the adapter can charge. */
export async function restoreFromStore(): Promise<CommerceState> {
  if (iapCanCharge()) {
    try {
      const rows = await pluginRestore()
      for (const row of rows) {
        const offer = offerFromSku(row.sku)
        const product = offer ? storeProduct(offer) : undefined
        if (!offer || !product) continue
        const receipt: PurchaseReceipt = {
          orderId: row.orderId,
          sku: product.sku,
          kind: product.kind,
          packId: product.packId,
          purchasedAt: new Date().toISOString(),
          token: row.token,
          source: 'play',
        }
        appendReceipt(receipt)
        applyReceipt(receipt)
      }
    } catch {
      // Keep local receipts if Play restore fails.
    }
  }
  return restorePurchases()
}

export function resetBilling(): CommerceState {
  writeReceipts([])
  return writeCommerce(emptyCommerce())
}

export function packStreetLocked(packId: string, state: CommerceState = readCommerce()): boolean {
  const pack = shopPack(packId)
  if (!pack || pack.included) return false
  return !packIsUnlocked(packId, state)
}
