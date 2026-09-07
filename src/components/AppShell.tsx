import type { ReactNode } from 'react'
import { dueCount, getNextGoal, insightScore, useProgress } from '../store/progress'
import { Avatar } from './Avatar'
import type { View } from '../types'

interface AppShellProps {
  view: View
  onNavigate: (view: View) => void
  children: ReactNode
}

export function AppShell({ view, onNavigate, children }: AppShellProps) {
  const { progress, reset } = useProgress()
  const goal = getNextGoal(progress)
  const waiting = dueCount(progress)
  const hideChrome = view.name === 'welcome'
  const playView =
    view.name === 'daily' || view.name === 'challenge' || view.name === 'journal'
  const hideGoalbar = hideChrome || playView || view.name === 'hub'

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
    <div
      className={`app ${hideChrome ? 'is-welcome' : ''} ${playView ? 'is-play' : ''}`}
    >
      <div className="grain" aria-hidden />
      {!hideChrome ? (
        <header className="topbar">
          <button
            type="button"
            className="brand"
            onClick={() => onNavigate({ name: 'hub' })}
          >
            <Avatar who="river" size="sm" />
            Silver City
          </button>
          <nav>
            <button
              type="button"
              className={view.name === 'hub' ? 'is-active' : ''}
              onClick={() => onNavigate({ name: 'hub' })}
            >
              Town
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
            {!playView ? (
              <button
                type="button"
                className={view.name === 'settings' ? 'is-active' : ''}
                onClick={() => onNavigate({ name: 'settings' })}
              >
                Settings
              </button>
            ) : null}
            <button type="button" className="subtle" onClick={confirmReset}>
              Reset
            </button>
          </nav>
        </header>
      ) : null}

      <div className="app-body">{children}</div>

      {!hideGoalbar ? (
        <footer className="goalbar">
          <button type="button" className="goal" onClick={followGoal}>
            <span className="goal-kicker">What’s next</span>
            <strong>{goal.title}</strong>
            <em>{goal.detail}</em>
          </button>
          <p className="score" title="Held lines are claims you rebuilt from memory">
            Held {progress.held.length}
            {waiting ? ` · due ${waiting}` : ''}
            <span className="score-sub"> · insight {insightScore(progress)}</span>
          </p>
        </footer>
      ) : null}
    </div>
  )
}
