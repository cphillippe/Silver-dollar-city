import { areas, totalJournal } from '../content'
import { ShareInvite } from './ShareInvite'
import { insightScore, useProgress } from '../store/progress'
import type { View } from '../types'

interface VistaProps {
  onNavigate: (view: View) => void
}

export function Vista({ onNavigate }: VistaProps) {
  const { progress } = useProgress()

  return (
    <main className="vista">
      <p className="eyebrow">The trail does not end</p>
      <h1>You have walked the five districts</h1>
      <p className="lede">
        Parables, testimony, a habitable cosmos, a first cause, and the inward
        clues of duty, mind, meaning, and beauty. None of these, alone, is the
        whole case. Together they are a coherent invitation: the world is the
        sort of place that looks authored — and a particular history claims
        that the Author has spoken.
      </p>
      <p>
        Held lines: {progress.held.length} · Insight {insightScore(progress)} ·
        Journal {progress.journal.length}/{totalJournal} · First-try{' '}
        {progress.firstTry.length}
      </p>
      <blockquote>
        “The heavens declare the glory of God, and the sky above proclaims his
        handiwork.”
        <cite>Psalm 19:1</cite>
      </blockquote>
      <div className="welcome-actions">
        <button
          type="button"
          className="btn primary xl"
          onClick={() => onNavigate({ name: 'journal' })}
        >
          Sit with the journal
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => onNavigate({ name: 'hub' })}
        >
          Walk a district again
        </button>
        <ShareInvite />
      </div>
      <ul className="vista-list">
        {areas.map((area) => (
          <li key={area.id}>{area.title}</li>
        ))}
      </ul>
    </main>
  )
}
