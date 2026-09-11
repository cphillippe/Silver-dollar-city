import { APP_VERSION } from '../config/app'
import { STORY } from '../content/story'
import { EASY } from '../lib/easy'
import { Avatar } from './Avatar'
import { CityMap } from './CityMap'
import { dailyDoneToday, useProgress } from '../store/progress'
import { localDateKey } from '../lib/dates'
import type { View } from '../types'

interface WelcomeProps {
  onNavigate: (view: View) => void
}

export function Welcome({ onNavigate }: WelcomeProps) {
  const { progress, start, setEasyMode } = useProgress()
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
    <main className="welcome is-onescreen is-alive">
      <div className="welcome-sky" aria-hidden />
      <div className="welcome-ridge" aria-hidden />
      <div className="welcome-hero">
        <CityMap mode="poster" onNavigate={onNavigate} />
        <p className="eyebrow">60 seconds</p>
        <h1>
          Silver City
          <span>Unending Evidence</span>
        </h1>
        <p className="welcome-goal">{STORY.purpose}</p>
        <p className="welcome-who">{STORY.who}</p>
        <div className="welcome-cast">
          <figure>
            <Avatar who="river" size="lg" />
            <figcaption>YOU · RIVER</figcaption>
          </figure>
          <span className="welcome-lantern" aria-hidden />
          <figure>
            <Avatar who="juniper" size="lg" />
            <figcaption>GUIDE · JUNIPER</figcaption>
          </figure>
        </div>
        <div className="welcome-actions">
          <label className="welcome-easy">
            <input
              type="checkbox"
              checked={Boolean(progress.easyMode)}
              onChange={(event) => setEasyMode(event.target.checked)}
            />
            New here? Easier words · bigger taps
          </label>
          <p className="quiet welcome-easy-note">
            {progress.easyMode
              ? 'Shorter sentences and bigger taps. You can change this in Settings.'
              : 'Optional. You can turn this on later in Settings → Reading. We teach hard words first — a claim is the main idea we hold to be true.'}
          </p>
          {progress.easyMode ? (
            <p className="teach-chip" role="note">
              {EASY.mainIdeaTeach}
            </p>
          ) : null}
          <button type="button" className="btn primary xl" onClick={begin}>
            {returning ? 'Back to town' : 'Begin the trail'}
          </button>
          <p className="welcome-version">{progress.easyMode ? APP_VERSION : `V0 · ${APP_VERSION}`}</p>
        </div>
      </div>
    </main>
  )
}
