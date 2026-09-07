import type { ReactNode } from 'react'
import { getNextGoal, insightScore, useProgress } from '../store/progress'
import type { View } from '../types'

interface AppShellProps {
  view: View
  onNavigate: (view: View) => void
  children: ReactNode
}

export function AppShell({ view, onNavigate, children }: AppShellProps) {
  const { progress, reset } = useProgress()
  const goal = getNextGoal(progress)
  const hideChrome = view.name === 'welcome'

  function followGoal() {
    if (goal.kind === 'daily') {
      onNavigate({ name: 'daily' })
      return
    }
    if (goal.kind === 'welcome') {
      onNavigate({ name: 'welcome' })
      return
    }
    if (goal.kind === 'vista') {
      onNavigate({ name: 'vista' })
      return
    }
    if (goal.challengeId && goal.areaId) {
      onNavigate({
        name: 'challenge',
        areaId: goal.areaId,
        challengeId: goal.challengeId,
      })
      return
    }
    if (goal.areaId) {
      onNavigate({ name: 'area', areaId: goal.areaId })
    }
  }

  function confirmReset() {
    const ok = window.confirm(
      'Clear all saved progress on this device and return to the start?',
    )
    if (!ok) return
    reset()
    onNavigate({ name: 'welcome' })
  }

  return (
    <div className={`app ${hideChrome ? 'is-welcome' : ''}`}>
      <div className="grain" aria-hidden />
      {!hideChrome ? (
        <header className="topbar">
          <button
            type="button"
            className="brand"
            onClick={() => onNavigate({ name: 'hub' })}
          >
            <span className="brand-mark" aria-hidden />
            Silver City
          </button>
          <nav>
            <button
              type="button"
              className={view.name === 'hub' ? 'is-active' : ''}
              onClick={() => onNavigate({ name: 'hub' })}
            >
              Map
            </button>
            <button
              type="button"
              className={view.name === 'daily' ? 'is-active' : ''}
              onClick={() => onNavigate({ name: 'daily' })}
            >
              Trail
            </button>
            <button
              type="button"
              className={view.name === 'journal' ? 'is-active' : ''}
              onClick={() => onNavigate({ name: 'journal' })}
            >
              Journal
            </button>
            <button type="button" className="subtle" onClick={confirmReset}>
              Reset
            </button>
          </nav>
        </header>
      ) : null}

      <div className="app-body">{children}</div>

      {!hideChrome ? (
        <footer className="goalbar">
          <button type="button" className="goal" onClick={followGoal}>
            <span className="goal-kicker">What’s next</span>
            <strong>{goal.title}</strong>
            <em>{goal.detail}</em>
          </button>
          <p className="score" title="Held lines are claims you rebuilt from memory">
            Held {progress.held.length}
            <span className="score-sub"> · insight {insightScore(progress)}</span>
          </p>
        </footer>
      ) : null}
    </div>
  )
}
