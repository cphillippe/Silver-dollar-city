import {
  COMMERCE_KEY,
  CORE_PACK_ID,
  SHOP_PACKS,
  shopPack,
  type ShopPack,
} from '../config/commerce.ts'

export interface CommerceState {
  removeAds: boolean
  unlockedPacks: string[]
}

const EMPTY: CommerceState = {
  removeAds: false,
  unlockedPacks: [],
}

let memory: CommerceState = EMPTY

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

function sameCommerce(a: CommerceState, b: CommerceState): boolean {
  if (a.removeAds !== b.removeAds) return false
  if (a.unlockedPacks.length !== b.unlockedPacks.length) return false
  return a.unlockedPacks.every((id, i) => id === b.unlockedPacks[i])
}

function isSafePackId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[A-Za-z0-9._:-]{1,64}$/.test(value) &&
    !DANGEROUS_KEYS.has(value)
  )
}

export function emptyCommerce(): CommerceState {
  return { removeAds: false, unlockedPacks: [] }
}

export function normalizeCommerce(raw: unknown): CommerceState {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return emptyCommerce()
  const value = raw as Record<string, unknown>
  const unlocked = Array.isArray(value.unlockedPacks)
    ? value.unlockedPacks.filter(isSafePackId).filter((id) => id !== CORE_PACK_ID)
    : []
  return {
    removeAds: value.removeAds === true,
    unlockedPacks: [...new Set(unlocked)],
  }
}

export function readCommerce(): CommerceState {
  let next = memory
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(COMMERCE_KEY)
      next = raw ? normalizeCommerce(JSON.parse(raw) as unknown) : normalizeCommerce(memory)
    } catch {
      next = normalizeCommerce(memory)
    }
  } else {
    next = normalizeCommerce(memory)
  }
  if (sameCommerce(memory, next)) return memory
  memory = next
  return memory
}

export function writeCommerce(next: CommerceState): CommerceState {
  const clean = normalizeCommerce(next)
  if (sameCommerce(memory, clean)) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(COMMERCE_KEY, JSON.stringify(memory))
    }
    return memory
  }
  memory = clean
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(COMMERCE_KEY, JSON.stringify(clean))
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('silver-city-commerce'))
  }
  return memory
}

function commit(patch: Partial<CommerceState>): CommerceState {
  const current = readCommerce()
  return writeCommerce({
    removeAds: patch.removeAds ?? current.removeAds,
    unlockedPacks: patch.unlockedPacks ?? current.unlockedPacks,
  })
}

export function grantRemoveAds(): CommerceState {
  return commit({ removeAds: true })
}

export function grantPack(id: string): CommerceState {
  const pack = shopPack(id)
  if (!pack || pack.included) return readCommerce()
  const current = readCommerce()
  if (current.unlockedPacks.includes(id)) return current
  return commit({ unlockedPacks: [...current.unlockedPacks, id] })
}

/** Replay this-device receipts. Play restore will hit the same grants. */
export function restoreCommerce(): CommerceState {
  return readCommerce()
}

export function packIsUnlocked(id: string, state: CommerceState = readCommerce()): boolean {
  const pack = shopPack(id)
  if (!pack) return false
  if (pack.included) return true
  return state.unlockedPacks.includes(id)
}

export function unlockedPaidPacks(state: CommerceState = readCommerce()): ShopPack[] {
  return SHOP_PACKS.filter((pack) => !pack.included && packIsUnlocked(pack.id, state))
}

export function billingSurface(): 'play' | 'web' {
  if (typeof window === 'undefined') return 'web'
  const cap = (
    window as unknown as {
      Capacitor?: { isNativePlatform?: () => boolean }
    }
  ).Capacitor
  if (cap?.isNativePlatform?.()) return 'play'
  return 'web'
}

export { EMPTY as EMPTY_COMMERCE }
