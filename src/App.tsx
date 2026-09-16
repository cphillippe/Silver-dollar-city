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
import { adsAreVisible, isBetweenSceneTransition, scenePauseMountsOn } from './config/ads'
import { liveInterstitialReady, showBetweenSceneInterstitial } from './lib/adAdapter'
import { isEasy } from './lib/easy'
import { useProgress } from './store/progress'
import type { View } from './types'

const AD_COOLDOWN_MS = 20_000

function easyNightWatchHit(): boolean {
  if (typeof window === 'undefined') return false
  const blob = `${window.location.hash} ${window.location.search} ${window.location.pathname}`
  return /defend|night-?watch/i.test(blob)
}

function isLessonEnterView(view: View): boolean {
  return (
    view.name === 'learn' ||
    view.name === 'link' ||
    view.name === 'daily' ||
    view.name === 'challenge' ||
    view.name === 'pack-street'
  )
}

function isSceneLeaveView(view: View): boolean {
  return isLessonEnterView(view) || view.name === 'journal'
}

export default function App() {
  const { progress } = useProgress()
  const easy = isEasy(progress)
  const [view, setView] = useState<View>(() => {
    const walked =
      progress.completed.length > 0 || Boolean(progress.lastDailyDate)
    if (progress.started && walked) return { name: 'hub' }
    return { name: 'welcome' }
  })
  const [sceneAd, setSceneAd] = useState(false)
  const [pending, setPending] = useState<View | null>(null)
  const lastAdAt = useRef(0)

  function go(next: View, skipAd = false) {
    if (easy && next.name === 'defend') {
      setSceneAd(false)
      setPending(null)
      setView({ name: 'hub' })
      return
    }

    const adsOn = !skipAd && adsAreVisible()
    const cooled = Date.now() - lastAdAt.current >= AD_COOLDOWN_MS
    const between = isBetweenSceneTransition(view.name, next.name)

    if (adsOn && cooled && between && view.name === 'hub' && isLessonEnterView(next)) {
      lastAdAt.current = Date.now()
      setPending(next)
      if (liveInterstitialReady() && scenePauseMountsOn(view.name)) {
        void showBetweenSceneInterstitial(view.name).then((result) => {
          if (result === 'live') {
            setSceneAd(false)
            setPending(null)
            setView(next)
            return
          }
          setSceneAd(true)
        })
        return
      }
      setSceneAd(true)
      return
    }

    if (adsOn && cooled && between && isSceneLeaveView(view) && next.name === 'hub') {
      lastAdAt.current = Date.now()
      setPending(null)
      setView({ name: 'hub' })
      if (liveInterstitialReady() && scenePauseMountsOn('hub')) {
        void showBetweenSceneInterstitial('hub').then((result) => {
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
    setSceneAd(false)
    setPending(null)
    setView({ name: 'shop' })
  }

  useEffect(() => {
    if (!easy) return
    if (view.name === 'defend' || easyNightWatchHit()) {
      if (view.name !== 'hub') setView({ name: 'hub' })
    }
  }, [easy, view.name])

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
      {view.name === 'daily' ? <DailyTrail onNavigate={go} /> : null}
      {view.name === 'area' ? (
        <AreaView areaId={view.areaId} onNavigate={go} />
      ) : null}
      {view.name === 'challenge' ? (
        <ChallengeScreen
          key={`${view.areaId}-${view.challengeId}`}
          areaId={view.areaId}
          challengeId={view.challengeId}
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
      {view.name === 'defend' && !easy ? <DefendScreen onNavigate={go} /> : null}
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
