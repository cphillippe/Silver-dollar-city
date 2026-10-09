import { useEffect, useRef, useState } from 'react'
import { AreaView } from './components/AreaView'
import { AppShell } from './components/AppShell'
import { ChallengeScreen } from './components/ChallengeScreen'
import { DailyTrail } from './components/DailyTrail'
import { Hub } from './components/Hub'
import { Journal } from './components/Journal'
import { PackStreet } from './components/PackStreet'
import { Settings } from './components/Settings'
import { Shop } from './components/Shop'
import { DefendScreen } from './components/DefendScreen'
import { LearnScreen } from './components/LearnScreen'
import { LinkScreen } from './components/LinkScreen'
import { Profile } from './components/Profile'
import { SceneAd } from './components/SceneAd'
import { Vista } from './components/Vista'
import { Welcome } from './components/Welcome'
import { findPlayable } from './content'
import { adsAreVisible, quietPauseAllowed, scenePauseMountsOn } from './config/ads'
import { liveInterstitialReady, showBetweenSceneInterstitial } from './lib/adAdapter'
import { offerStoresComingNotice } from './lib/supportToast'
import { useProgress } from './store/progress'
import type { View } from './types'

const AD_COOLDOWN_MS = 20_000

function sequenceBoot(): View | null {
  if (typeof window === 'undefined') return null
  const id = new URLSearchParams(window.location.search).get('sequence')
  if (!id) return null
  const found = findPlayable(id)
  if (!found || found.challenge.kind !== 'sequence') return null
  if (id.startsWith('daily-')) return { name: 'daily', forceId: id }
  return { name: 'challenge', areaId: found.areaId, challengeId: id }
}

export default function App() {
  const { progress } = useProgress()
  const [view, setView] = useState<View>(() => {
    const forced = sequenceBoot()
    if (forced) return forced
    const walked =
      progress.completed.length > 0 || Boolean(progress.lastDailyDate)
    if (progress.started && walked) return { name: 'hub' }
    return { name: 'welcome' }
  })
  const [sceneAd, setSceneAd] = useState(false)
  const [pending, setPending] = useState<View | null>(null)
  const lastAdAt = useRef(0)

  function go(next: View, skipAd = false) {
    const adsOn = !skipAd && adsAreVisible()
    const cooled = Date.now() - lastAdAt.current >= AD_COOLDOWN_MS
    // Allow-list only: clean Home after a finished scene. Cooldown stays here.
    if (adsOn && cooled && quietPauseAllowed(view, next) && scenePauseMountsOn(next.name)) {
      lastAdAt.current = Date.now()
      setPending(null)
      setView(next)
      if (liveInterstitialReady()) {
        void showBetweenSceneInterstitial(next.name).then((result) => {
          if (result === 'live') {
            setSceneAd(false)
            return
          }
          setSceneAd(true)
        })
        return
      }
      setSceneAd(true)
      return
    }

    setSceneAd(false)
    setPending(null)
    setView(next)
  }

  function continueFromAd() {
    const dest = pending ?? { name: 'hub' as const }
    setSceneAd(false)
    setPending(null)
    setView(dest)
  }

  function supportFromAd() {
    const dest = pending ?? { name: 'hub' as const }
    setSceneAd(false)
    setPending(null)
    setView(dest)
    offerStoresComingNotice()
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [view])

  useEffect(() => {
    const theme = progress.theme ?? 'candy'
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme === 'parchment' ? 'light' : 'dark'
    document.documentElement.dataset.easy = progress.easyMode ? 'on' : 'off'
  }, [progress.theme, progress.easyMode])

  useEffect(() => {
    if (view.name !== 'journal' || !view.focusId || view.autoQuiz) return
    const node = document.getElementById(view.focusId)
    node?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [view])

  return (
    <AppShell view={view} onNavigate={go}>
      {view.name === 'welcome' ? <Welcome onNavigate={go} /> : null}
      {view.name === 'hub' ? (
        <Hub onNavigate={go} openPlot={view.mindPlot} />
      ) : null}
      {view.name === 'daily' ? (
        <DailyTrail onNavigate={go} forceId={view.forceId} debugStrip={view.debugStrip} />
      ) : null}
      {view.name === 'area' ? (
        <AreaView areaId={view.areaId} onNavigate={go} />
      ) : null}
      {view.name === 'challenge' ? (
        <ChallengeScreen
          key={`${view.areaId}-${view.challengeId}`}
          areaId={view.areaId}
          challengeId={view.challengeId}
          debugStrip={view.debugStrip}
          onNavigate={go}
        />
      ) : null}
      {view.name === 'journal' ? (
        <Journal
          focusId={view.focusId}
          autoQuiz={view.autoQuiz}
          onNavigate={go}
        />
      ) : null}
      {view.name === 'vista' ? <Vista onNavigate={go} /> : null}
      {view.name === 'settings' ? <Settings onNavigate={go} /> : null}
      {view.name === 'shop' ? <Shop onNavigate={go} /> : null}
      {view.name === 'pack-street' ? (
        <PackStreet packId={view.packId} onNavigate={go} />
      ) : null}
      {view.name === 'defend' ? <DefendScreen onNavigate={go} /> : null}
      {view.name === 'link' ? (
        <LinkScreen
          key={view.debugLine ?? 'loop'}
          debugLine={view.debugLine}
          onNavigate={go}
        />
      ) : null}
      {view.name === 'learn' ? <LearnScreen onNavigate={go} /> : null}
      {view.name === 'profile' ? <Profile onNavigate={go} /> : null}
      {sceneAd && scenePauseMountsOn(view.name) ? (
        <SceneAd onContinue={continueFromAd} onSupport={supportFromAd} />
      ) : null}
    </AppShell>
  )
}
