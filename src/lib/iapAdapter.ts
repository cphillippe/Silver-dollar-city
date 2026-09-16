/**
 * StoreKit (iOS) + Play Billing (Android) adapter.
 * Uses a Capacitor plugin when present + the matching env flag
 * (VITE_STOREKIT / VITE_PLAY_BILLING). Pages and this APK/IPA stay on the
 * cannotCharge demo until both are set. Grants still go through
 * grantRemoveAds / grantPack — never a second gate.
 */

import { storeFlags } from '../config/store.ts'
import { storeSurface } from './nativeStore.ts'

export interface StorePurchase {
  sku: string
  orderId: string
  token: string
}

export interface BillingPlugin {
  purchase(sku: string): Promise<StorePurchase>
  restore(): Promise<StorePurchase[]>
}

let injected: BillingPlugin | undefined

export function setBillingPluginForTest(plugin: BillingPlugin | undefined) {
  injected = plugin
}

function isPurchase(raw: unknown): raw is StorePurchase {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false
  const value = raw as Record<string, unknown>
  return (
    typeof value.sku === 'string' &&
    value.sku.length > 0 &&
    value.sku.length <= 80 &&
    typeof value.orderId === 'string' &&
    value.orderId.length > 0 &&
    value.orderId.length <= 80 &&
    typeof value.token === 'string' &&
    value.token.length > 0 &&
    value.token.length <= 80
  )
}

function isPlugin(raw: unknown): raw is BillingPlugin {
  if (!raw || typeof raw !== 'object') return false
  const value = raw as Record<string, unknown>
  return typeof value.purchase === 'function' && typeof value.restore === 'function'
}

function capacitorPlugin(): BillingPlugin | undefined {
  if (typeof window === 'undefined') return undefined
  const cap = (
    window as unknown as {
      Capacitor?: { Plugins?: Record<string, unknown> }
    }
  ).Capacitor
  const plugins = cap?.Plugins
  if (!plugins) return undefined
  const candidate =
    plugins.InAppPurchases ??
    plugins.StoreKit ??
    plugins.Billing ??
    plugins.CdvPurchase ??
    plugins.IAP
  return isPlugin(candidate) ? candidate : undefined
}

export function readBillingPlugin(): BillingPlugin | undefined {
  if (injected) return injected
  return capacitorPlugin()
}

function iapFlagOn(): boolean {
  const flags = storeFlags()
  const surface = storeSurface()
  if (surface === 'play') return flags.playBilling
  if (surface === 'app-store') return flags.storeKit
  if (injected) return flags.playBilling || flags.storeKit
  return false
}

/** Plugin + matching store flag. Native Play / StoreKit or a test double. Not store money by itself. */
export function iapCanCharge(): boolean {
  if (!iapFlagOn()) return false
  if (!readBillingPlugin()) return false
  if (injected) return true
  const surface = storeSurface()
  return surface === 'play' || surface === 'app-store'
}

export function isCancelError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const value = error as { status?: unknown; code?: unknown; message?: unknown }
  const blob = `${String(value.status ?? '')} ${String(value.code ?? '')} ${String(value.message ?? '')}`.toLowerCase()
  return (
    blob.includes('cancel') ||
    blob.includes('user_canceled') ||
    blob.includes('paymentcancelled') ||
    blob.includes('skerrorpaymentcancelled')
  )
}

export async function pluginPurchase(sku: string): Promise<StorePurchase> {
  const plugin = readBillingPlugin()
  if (!plugin) throw new Error('billing-plugin-missing')
  const paid = await plugin.purchase(sku)
  if (!isPurchase(paid) || paid.sku !== sku) throw new Error('billing-plugin-bad-receipt')
  return paid
}

export async function pluginRestore(): Promise<StorePurchase[]> {
  const plugin = readBillingPlugin()
  if (!plugin) return []
  const rows = await plugin.restore()
  if (!Array.isArray(rows)) return []
  return rows.filter(isPurchase)
}

export function resetIapAdapterForTest() {
  injected = undefined
}
