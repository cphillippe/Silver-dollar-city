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
import { Vista } from './components/Vista'
import { Welcome } from './components/Welcome'
import { useProgress } from './store/progress'
import type { View } from './types'

export default function App() {
  const { progress } = useProgress()
  const [view, setView] = useState<View>(() => {
    const walked =
      progress.completed.length > 0 || Boolean(progress.lastDailyDate)
    if (progress.started && walked) return { name: 'hub' }
    return { name: 'welcome' }
  })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [view])

  useEffect(() => {
    const theme = progress.theme ?? 'candy'
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme === 'parchment' ? 'light' : 'dark'
  }, [progress.theme])

  useEffect(() => {
    if (view.name !== 'journal' || !view.focusId || view.autoQuiz) return
    const node = document.getElementById(view.focusId)
    node?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [view])

  return (
    <AppShell view={view} onNavigate={setView}>
      {view.name === 'welcome' ? <Welcome onNavigate={setView} /> : null}
      {view.name === 'hub' ? <Hub onNavigate={setView} /> : null}
      {view.name === 'daily' ? <DailyTrail onNavigate={setView} /> : null}
      {view.name === 'area' ? (
        <AreaView areaId={view.areaId} onNavigate={setView} />
      ) : null}
      {view.name === 'challenge' ? (
        <ChallengeScreen
          key={`${view.areaId}-${view.challengeId}`}
          areaId={view.areaId}
          challengeId={view.challengeId}
          onNavigate={setView}
        />
      ) : null}
      {view.name === 'journal' ? (
        <Journal
          focusId={view.focusId}
          autoQuiz={view.autoQuiz}
          onNavigate={setView}
        />
      ) : null}
      {view.name === 'vista' ? <Vista onNavigate={setView} /> : null}
      {view.name === 'settings' ? <Settings onNavigate={setView} /> : null}
      {view.name === 'defend' ? <DefendScreen onNavigate={setView} /> : null}
      {view.name === 'link' ? <LinkScreen onNavigate={setView} /> : null}
    </AppShell>
  )
}
