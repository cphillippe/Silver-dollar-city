import type { ReactNode } from 'react'
import { dueCount, getNextGoal, insightScore, useProgress } from '../store/progress'
import { easyHoldView, isEasy } from '../lib/easy'
import { EASY_HOME, EASY_TOP } from '../lib/easyNav'
import { Avatar } from './Avatar'
import type { View } from '../types'

interface AppShellProps {
  view: View
  onNavigate: (view: View) => void
  children: ReactNode
}

export function AppShell({ view, onNavigate, children }: AppShellProps) {
  const { progress } = useProgress()
  const easy = isEasy(progress)
  const goal = getNextGoal(progress)
  const waiting = dueCount(progress)
  const hideChrome = view.name === 'welcome'
  const easyCompact = easy && !hideChrome
  const playView =
    view.name === 'daily' ||
    view.name === 'challenge' ||
    view.name === 'journal' ||
    view.name === 'defend' ||
    view.name === 'link' ||
    view.name === 'learn' ||
    view.name === 'profile' ||
    view.name === 'shop' ||
    view.name === 'pack-street'
  const townView = view.name === 'hub'
  const hideGoalbar = hideChrome || playView || townView || easy

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

  return (
    <div
      className={`app ${hideChrome ? 'is-welcome' : ''} ${playView || easyCompact ? 'is-play' : ''} ${townView ? 'is-town' : ''}`}
      data-theme={progress.theme ?? 'candy'}
      data-easy={progress.easyMode ? 'on' : 'off'}
    >
      <div className="grain" aria-hidden />
      {!hideChrome ? (
        <header className="topbar">
          <button
            type="button"
            className="brand"
            onClick={() => onNavigate(EASY_HOME)}
          >
            <Avatar who="river" size="sm" />
            Silver City
          </button>
          <nav>
            <button
              type="button"
              className={view.name === 'hub' ? 'is-active' : ''}
              onClick={() => onNavigate(EASY_HOME)}
            >
              {easy ? EASY_TOP.home : 'Town'}
            </button>
            {easy ? null : (
            <button
              type="button"
              className={view.name === 'daily' ? 'is-active' : ''}
              onClick={() => onNavigate({ name: 'daily' })}
            >
              Trail
            </button>
            )}
            <button
              type="button"
              className={view.name === 'journal' ? 'is-active' : ''}
              onClick={() => onNavigate(easy ? easyHoldView(progress) : { name: 'journal' })}
            >
              {easy ? EASY_TOP.lockIn : 'Journal'}
            </button>
            <button
              type="button"
              className={view.name === 'settings' || view.name === 'shop' ? 'is-active' : ''}
              onClick={() => onNavigate({ name: 'settings' })}
            >
              {EASY_TOP.settings}
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
          <p className="score" title={easy ? 'Sentences you kept' : 'Held lines are claims you rebuilt from memory'}>
            {easy ? EASY_TOP.lockIn : 'Held'} {progress.held.length}
            {waiting ? ` · due ${waiting}` : ''}
            {easy ? null : (
              <span className="score-sub"> · insight {insightScore(progress)}</span>
            )}
          </p>
        </footer>
      ) : null}
    </div>
  )
}
