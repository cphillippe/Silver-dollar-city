/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_PLAY_BILLING?: string
  readonly VITE_STOREKIT?: string
  readonly VITE_ADS_ENABLED?: string
  readonly VITE_ADMOB_APP_ID?: string
  readonly VITE_ADMOB_APP_ID_IOS?: string
  readonly VITE_ADMOB_INTERSTITIAL_ID?: string
  readonly VITE_ADMOB_INTERSTITIAL_ID_IOS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
