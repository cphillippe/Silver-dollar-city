import { EASY } from '../../lib/easy'
import { localDateKey } from '../../lib/dates'
import { easyReadMarkedTomorrow } from '../../content/goldenPath'
import { useProgress } from '../../store/progress'
import type { View } from '../../types'

interface LockInEmptyProps {
  onNavigate: (view: View) => void
}

/** Easy Lock In tab when nothing is waiting to lock (#858). One gold Home; plain Read when available. */
export function LockInEmpty({ onNavigate }: LockInEmptyProps) {
  const { progress } = useProgress()
  const today = localDateKey()
  const readAvailable = !easyReadMarkedTomorrow(progress, today)

  return (
    <main className="journal is-easy-hold is-lock-in-empty" aria-label="Lock In">
      <header className="page-head journal-head">
        <p className="eyebrow">{EASY.saved}</p>
        <p>Nothing to lock in yet.</p>
      </header>
      <button
        type="button"
        className="btn primary xl snap-bins"
        onClick={() => onNavigate({ name: 'hub' })}
      >
        {EASY.home}
      </button>
      {readAvailable ? (
        <button type="button" className="text-link" onClick={() => onNavigate({ name: 'daily' })}>
          Read
        </button>
      ) : null}
    </main>
  )
}
