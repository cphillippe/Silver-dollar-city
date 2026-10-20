import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'city.silver.unending',
  appName: 'Silver City',
  webDir: 'dist',
  // No server.url here. The sideload APK points at Pages after sync
  // (scripts/android-live-shell.mjs). The Play AAB keeps this bundled webDir
  // and pins https://localhost (scripts/android-play-shell.mjs). iOS stays bundled.
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: false,
  },
  // Play Billing / StoreKit / AdMob plugins register here after the one-time
  // connect in README (Play Console / App Store Connect / ads). Empty =
  // cannotCharge demo path. @capacitor/share is an npm plugin: cap sync
  // registers it, and MainActivity answers only that plugin. No ad SDK.
}

export default config
