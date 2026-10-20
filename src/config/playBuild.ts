/**
 * Play bundle flags. Blank env keeps Pages and the sideload shell as they are.
 * Same read as the store flags (`readVite` in `src/config/store.ts`).
 *
 * VITE_PLAY_BUILD  — this bundle is the Play app (local files, not the Pages shell).
 * VITE_PLAY_SHOP   — Play shop. Default off. The free Easy trail stays open.
 * Founder / lamp code is not gated here. A later free gift can ship with the shop still off.
 */

let testPlayBuild: boolean | null = null
let testPlayShop: boolean | null = null

function readVite(key: string): string {
  try {
    const env = (import.meta as ImportMeta).env as Record<string, string | undefined>
    const raw = env?.[key]
    return typeof raw === 'string' ? raw.trim() : ''
  } catch {
    return ''
  }
}

function truthy(raw: string): boolean {
  const value = raw.toLowerCase()
  return value === '1' || value === 'true' || value === 'yes' || value === 'on'
}

export function setPlayBuildForTest(next: boolean | null) {
  testPlayBuild = next
}

export function setPlayShopForTest(next: boolean | null) {
  testPlayShop = next
}

export function resetPlayBuildForTest() {
  testPlayBuild = null
  testPlayShop = null
}

/** True only for a bundle built with VITE_PLAY_BUILD. */
export function isPlayBuild(): boolean {
  if (testPlayBuild !== null) return testPlayBuild
  return truthy(readVite('VITE_PLAY_BUILD'))
}

/**
 * Shop, prices, and purchase UI.
 * Pages and the sideload shell stay open. A Play bundle stays closed
 * until VITE_PLAY_SHOP is set.
 */
export function playShopEnabled(): boolean {
  if (!isPlayBuild()) return true
  if (testPlayShop !== null) return testPlayShop
  return truthy(readVite('VITE_PLAY_SHOP'))
}

/** Play bundle with the shop flag off. No purchase UI and no purchase calls. */
export function playShopClosed(): boolean {
  return isPlayBuild() && !playShopEnabled()
}

export const SHOP_OPENS_SOON = 'Shop opens soon'
