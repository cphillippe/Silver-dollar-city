import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'city.silver.unending',
  appName: 'Silver City',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
  // Play Billing / AdMob plugins register here after the one-time connect
  // in README (Play Console / ads). Empty = cannotCharge demo path.
}

export default config
