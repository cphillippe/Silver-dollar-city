import { areas, totalChallenges, totalJournal } from '../content'
import { dailyForDate } from '../content/daily'
import { localDateKey } from '../lib/dates'
import { ShareInvite } from './ShareInvite'
import { useProgress } from '../store/progress'
import type { View } from '../types'

interface WelcomeProps {
  onNavigate: (view: View) => void
}

export function Welcome({ onNavigate }: WelcomeProps) {
  const { progress, start } = useProgress()
  const resumed = progress.started && progress.completed.length > 0
  const today = dailyForDate(localDateKey())

  function walkDaily() {
    start()
    onNavigate({ name: 'daily' })
  }

  function beginDistricts() {
    start()
    if (resumed && progress.lastAreaId && progress.lastChallengeId) {
      onNavigate({
        name: 'challenge',
        areaId: progress.lastAreaId,
        challengeId: progress.lastChallengeId,
      })
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
        Snap pairs, sort claims, lock a chain — then fold the teaching and
        rebuild one line from memory. Fun is the delivery. The point is what
        you can still say: a claim, a reason, a source.
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
        <button type="button" className="btn primary xl" onClick={walkDaily}>
          Walk today’s trail
        </button>
        <p className="welcome-daily-line">{today.districtFlavor}</p>
        <button type="button" className="btn ghost" onClick={beginDistricts}>
          {resumed ? 'Continue the districts' : 'Begin in Parable Hollow'}
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
      <ShareInvite />
      <p className="welcome-note">
        Progress is saved on this device. Miss a morning and the trail waits —
        your journal stays. Invite a friend to try remembering what they
        unlocked, not only to chase a streak.
      </p>
    </main>
  )
}
