import { Capacitor } from '@capacitor/core'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { ProgressProvider } from './store/ProgressProvider'
import './index.css'

if (!Capacitor.isNativePlatform()) {
  registerSW({ immediate: true })
}

const root = document.getElementById('root')
if (!root) {
  throw new Error('Root element missing')
}

createRoot(root).render(
  <StrictMode>
    <ProgressProvider>
      <App />
    </ProgressProvider>
  </StrictMode>,
)
