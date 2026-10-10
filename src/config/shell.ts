/**
 * Android shell contract.
 * The phone app loads the live Pages origin. The bundled dist is only the
 * offline fallback. iOS and the website stay on the local build.
 */

/** First-party Pages app. HTTPS only. */
export const PAGES_APP_URL = 'https://cphillippe.github.io/Silver-dollar-city/'

/**
 * Rolling release asset. The shell opens this exact URL.
 * A sideloaded APK still needs a tap to install.
 */
export const SHELL_APK_URL =
  'https://github.com/cphillippe/Silver-dollar-city/releases/download/latest/silver-city.apk'

/** Dismissed shell versionCode. Separate from the game save. */
export const SHELL_DISMISS_KEY = 'silver-city-shell-dismissed'

export interface SilverCityShellBridge {
  getVersionCode: () => number
}

declare global {
  interface Window {
    SilverCityShell?: SilverCityShellBridge
  }
}

/**
 * Native versionCode from a major.minor.patch app version.
 * 1.4.433 → 104433. The patch stays under 1000 so each release is one higher
 * than the last, and the result stays under the update card's ceiling.
 */
export function shellVersionCode(version: string): number {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version)
  if (!match) throw new Error(`bad app version ${version}`)
  const major = Number(match[1])
  const minor = Number(match[2])
  const patch = Number(match[3])
  if (minor >= 100 || patch >= 1000) throw new Error(`version ${version} does not fit the shell code`)
  return major * 100_000 + minor * 1000 + patch
}

export function inAndroidShell(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.SilverCityShell?.getVersionCode === 'function'
  )
}

/** Capacitor's local error page. The live town uses the Pages host. */
export function isBundledShellHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

/**
 * Offer the known APK URL only inside the shell, and only when the published
 * shell versionCode is newer than the installed APK. Web content bumps do not
 * pass this check.
 */
export function shellApkOffer(input: {
  inShell: boolean
  installed: number
  remote: number
  dismissed: number
}): string | null {
  if (!input.inShell) return null
  if (!Number.isInteger(input.installed) || input.installed < 1) return null
  if (!Number.isInteger(input.remote) || input.remote < 1 || input.remote > 1_000_000) {
    return null
  }
  if (input.remote <= input.installed) return null
  if (input.dismissed === input.remote) return null
  return SHELL_APK_URL
}
