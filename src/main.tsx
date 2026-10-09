import { Capacitor } from '@capacitor/core'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { inAndroidShell } from './config/shell'
import { ProgressProvider } from './store/ProgressProvider'
import './index.css'
import './styles/match.css'
import './styles/city.css'
import './styles/defend.css'
import './styles/maze.css'
import './styles/gem.css'
import './styles/sortHold.css'
import './styles/storyStrip.css'
import './styles/welcome.css'
import './styles/win.css'
import './styles/gem-less-waste.css'
import './styles/match-art-tight.css'
import './styles/storySnap.css'
import './styles/digReveal.css'
import './styles/matchWin.css'
import './styles/loci-stamp.css'
import './styles/showIt.css'
import './styles/fatherRunHint.css'
import './styles/easyTopbar.css'

if (inAndroidShell()) {
  // The shell loads Pages in the WebView. A worker from an older visit would
  // pin that copy and block the next open from seeing a new deploy.
  if ('serviceWorker' in navigator) {
    void navigator.serviceWorker.getRegistrations().then((regs) => {
      for (const reg of regs) void reg.unregister()
    })
  }
} else if (!Capacitor.isNativePlatform()) {
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
