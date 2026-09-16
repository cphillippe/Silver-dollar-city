/**
 * Which store this build is talking to. Pages is web. Native Capacitor
 * is App Store (iOS) or Play (Android). Test doubles pin a surface.
 */

export type StoreSurface = 'web' | 'play' | 'app-store'

let testSurface: StoreSurface | null = null

export function setStoreSurfaceForTest(next: StoreSurface | null) {
  testSurface = next
}

export function resetStoreSurfaceForTest() {
  testSurface = null
}

function capacitorPlatform(): string {
  if (typeof window === 'undefined') return ''
  const cap = (
    window as unknown as {
      Capacitor?: {
        isNativePlatform?: () => boolean
        getPlatform?: () => string
      }
    }
  ).Capacitor
  if (!cap?.isNativePlatform?.()) return ''
  return cap.getPlatform?.() ?? ''
}

export function storeSurface(): StoreSurface {
  if (testSurface) return testSurface
  const platform = capacitorPlatform()
  if (platform === 'ios') return 'app-store'
  if (platform === 'android') return 'play'
  return 'web'
}

export function isNativeStore(surface: StoreSurface = storeSurface()): boolean {
  return surface === 'play' || surface === 'app-store'
}
