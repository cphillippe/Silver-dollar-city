import { Capacitor } from '@capacitor/core'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { APP_VERSION } from './config/app'
import { isPlayBuild } from './config/playBuild'
import { inAndroidShell } from './config/shell'
import { pullWebBuild, WEB_UPDATE_EVENT, webRefreshSurface } from './lib/webRefresh'
import { ProgressProvider } from './store/ProgressProvider'
import './index.css'
import './styles/match.css'
import './styles/city.css'
import './styles/defend.css'
import './styles/maze.css'
import './styles/gem.css'
import './styles/gemJar.css'
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
import './styles/shareCard.css'
import './styles/lockInCue.css'

const webSurface = webRefreshSurface({
  play: isPlayBuild(),
  androidShell: inAndroidShell(),
  native: Capacitor.isNativePlatform(),
})

if (webSurface === 'off') {
  // Play and the Android shell load a bundled copy. A worker from an older
  // visit would pin that copy. Neither surface shows a web refresh.
  if ('serviceWorker' in navigator) {
    void navigator.serviceWorker.getRegistrations().then((regs) => {
      for (const reg of regs) void reg.unregister()
    })
  }
} else {
  registerSW({
    immediate: true,
    onNeedReload() {
      window.dispatchEvent(new Event(WEB_UPDATE_EVENT))
    },
    onRegisteredSW(_url, registration) {
      void registration?.update()
    },
  })
  void pullWebBuild(APP_VERSION)
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
