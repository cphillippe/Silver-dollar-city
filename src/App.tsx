import { useEffect, useState } from 'react'
import { AreaView } from './components/AreaView'
import { AppShell } from './components/AppShell'
import { ChallengeScreen } from './components/ChallengeScreen'
import { DailyTrail } from './components/DailyTrail'
import { Hub } from './components/Hub'
import { Journal } from './components/Journal'
import { Settings } from './components/Settings'
import { DefendScreen } from './components/DefendScreen'
import { LinkScreen } from './components/LinkScreen'
import { Profile } from './components/Profile'
import { Vista } from './components/Vista'
import { Welcome } from './components/Welcome'
import { isEasy } from './lib/easy'
import { useProgress } from './store/progress'
import type { View } from './types'

function easyNightWatchHit(): boolean {
  if (typeof window === 'undefined') return false
  const blob = `${window.location.hash} ${window.location.search} ${window.location.pathname}`
  return /defend|night-?watch/i.test(blob)
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

  function go(next: View) {
    if (easy && next.name === 'defend') {
      setView({ name: 'hub' })
      return
    }
    setView(next)
  }

  useEffect(() => {
    if (!easy) return
    if (view.name === 'defend' || easyNightWatchHit()) {
      setView({ name: 'hub' })
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
      {view.name === 'defend' && !easy ? <DefendScreen onNavigate={go} /> : null}
      {view.name === 'link' ? <LinkScreen onNavigate={go} /> : null}
      {view.name === 'profile' ? <Profile onNavigate={go} /> : null}
    </AppShell>
  )
}
