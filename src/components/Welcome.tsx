import { STORY } from '../content/story'
import { Avatar } from './Avatar'
import { dailyDoneToday, useProgress } from '../store/progress'
import { localDateKey } from '../lib/dates'
import type { View } from '../types'

interface WelcomeProps {
  onNavigate: (view: View) => void
}

export function Welcome({ onNavigate }: WelcomeProps) {
  const { progress, start } = useProgress()
  const today = localDateKey()
  const returning = progress.started && dailyDoneToday(progress, today)

  function begin() {
    start()
    if (returning) {
      onNavigate({ name: 'hub' })
      return
    }
    onNavigate({ name: 'daily' })
  }

  return (
    <main className="welcome">
      <div className="welcome-sky" aria-hidden />
      <div className="welcome-cast" aria-hidden>
        <Avatar who="river" size="xl" />
        <Avatar who="juniper" size="xl" />
      </div>
      <p className="eyebrow">A puzzle trail</p>
      <h1>
        Silver City
        <span>Unending Evidence</span>
      </h1>
      <p className="welcome-goal">{STORY.purpose}</p>
      <p className="welcome-who">{STORY.who}</p>
      <div className="welcome-actions">
        <button type="button" className="btn primary xl" onClick={begin}>
          {returning ? 'Back to the map' : 'Begin the trail'}
        </button>
      </div>
      <p className="welcome-note">
        About a minute. Progress stays on this device. Miss a morning and the
        trail waits.
      </p>
    </main>
  )
}
