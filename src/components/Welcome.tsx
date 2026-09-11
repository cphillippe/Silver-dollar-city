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
    if (progress.easyMode || returning) {
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
        {progress.easyMode ? null : <CityMap mode="poster" onNavigate={onNavigate} />}
        <p className="eyebrow">60 seconds</p>
        <h1>
          Silver City
          <span>Unending Evidence</span>
        </h1>
        {progress.easyMode ? null : <p className="welcome-goal">{STORY.purpose}</p>}
        {progress.easyMode ? null : <p className="welcome-who">{STORY.who}</p>}
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
          <p className="eyebrow">Reading</p>
          <div className="settings-actions">
            <button
              type="button"
              className={`btn ${progress.easyMode ? 'primary' : ''}`}
              aria-pressed={Boolean(progress.easyMode)}
              onClick={() => setEasyMode(true)}
            >
              Easy
            </button>
            <button
              type="button"
              className={`btn ${progress.easyMode ? '' : 'primary'}`}
              aria-pressed={!progress.easyMode}
              onClick={() => setEasyMode(false)}
            >
              Hard
            </button>
          </div>
          <p className="quiet welcome-easy-note">
            {progress.easyMode
              ? 'Easier words · bigger taps. You can change this in Settings.'
              : 'Hard keeps the full voice. You can switch anytime in Settings → Reading. We teach hard words first — a claim is the main idea we hold to be true.'}
          </p>
          {progress.easyMode ? (
            <p className="teach-chip" role="note">
              {EASY.claimTeach}
            </p>
          ) : null}
          <button type="button" className="btn primary xl" onClick={begin}>
            {progress.easyMode
              ? returning
                ? EASY.home
                : 'Play'
              : returning
                ? 'Back to town'
                : 'Begin the trail'}
          </button>
          <p className="welcome-version">{progress.easyMode ? APP_VERSION : `V0 · ${APP_VERSION}`}</p>
        </div>
      </div>
    </main>
  )
}
