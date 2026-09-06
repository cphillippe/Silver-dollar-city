import { areas, totalChallenges, totalJournal } from '../content'
import { getNextGoal, useProgress } from '../store/progress'
import type { View } from '../types'

interface WelcomeProps {
  onNavigate: (view: View) => void
}

export function Welcome({ onNavigate }: WelcomeProps) {
  const { progress, start } = useProgress()
  const resumed = progress.started && progress.completed.length > 0
  const goal = getNextGoal(progress)

  function begin() {
    start()
    if (resumed && goal.areaId && goal.challengeId) {
      onNavigate({
        name: 'challenge',
        areaId: goal.areaId,
        challengeId: goal.challengeId,
      })
      return
    }
    if (resumed && goal.kind === 'vista') {
      onNavigate({ name: 'vista' })
      return
    }
    onNavigate({ name: 'area', areaId: 'parable-hollow' })
  }

  return (
    <main className="welcome">
      <div className="welcome-sky" aria-hidden />
      <p className="eyebrow">A mountain-town adventure</p>
      <h1>
        Silver City
        <span>Unending Evidence</span>
      </h1>
      <p className="lede">
        Walk a town of five districts. Play stories, weigh testimony, and build
        the old arguments — carefully, without sneering at doubt. The trail
        always has a next step.
      </p>
      <ul className="welcome-facts">
        <li>
          <strong>{areas.length}</strong>
          <span>areas</span>
        </li>
        <li>
          <strong>{totalChallenges}</strong>
          <span>challenges</span>
        </li>
        <li>
          <strong>{totalJournal}</strong>
          <span>journal cards</span>
        </li>
      </ul>
      <div className="welcome-actions">
        <button type="button" className="btn primary xl" onClick={begin}>
          {resumed ? 'Continue the trail' : 'Begin in Parable Hollow'}
        </button>
        {progress.started ? (
          <button
            type="button"
            className="btn ghost"
            onClick={() => onNavigate({ name: 'hub' })}
          >
            Open the city map
          </button>
        ) : null}
      </div>
      <p className="welcome-note">
        Progress is saved on this device. Content is meant to invite thought,
        not to mock the person who is still walking.
      </p>
    </main>
  )
}
