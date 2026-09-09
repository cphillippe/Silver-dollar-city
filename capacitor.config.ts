import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'city.silver.unending',
  appName: 'Silver City',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
}

export default config
