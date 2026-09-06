import { useEffect, useState } from 'react'
import { AreaView } from './components/AreaView'
import { AppShell } from './components/AppShell'
import { ChallengeScreen } from './components/ChallengeScreen'
import { Hub } from './components/Hub'
import { Journal } from './components/Journal'
import { Vista } from './components/Vista'
import { Welcome } from './components/Welcome'
import { useProgress } from './store/progress'
import type { View } from './types'

export default function App() {
  const { progress } = useProgress()
  const [view, setView] = useState<View>(() =>
    progress.started ? { name: 'hub' } : { name: 'welcome' },
  )

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [view])

  useEffect(() => {
    if (view.name !== 'journal' || !view.focusId) return
    const node = document.getElementById(view.focusId)
    node?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [view])

  return (
    <AppShell view={view} onNavigate={setView}>
      {view.name === 'welcome' ? <Welcome onNavigate={setView} /> : null}
      {view.name === 'hub' ? <Hub onNavigate={setView} /> : null}
      {view.name === 'area' ? (
        <AreaView areaId={view.areaId} onNavigate={setView} />
      ) : null}
      {view.name === 'challenge' ? (
        <ChallengeScreen
          areaId={view.areaId}
          challengeId={view.challengeId}
          onNavigate={setView}
        />
      ) : null}
      {view.name === 'journal' ? (
        <Journal focusId={view.focusId} onNavigate={setView} />
      ) : null}
      {view.name === 'vista' ? <Vista onNavigate={setView} /> : null}
    </AppShell>
  )
}
