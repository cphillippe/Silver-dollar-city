import { EASY } from '../../lib/easy'
import { localDateKey } from '../../lib/dates'
import { easyReadMarkedTomorrow } from '../../content/goldenPath'
import { SKILL_LADDER, skillsFor } from '../../lib/gemJar'
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
  const jarPts = progress.matchLifetime ?? 0
  const jarSkillIds = skillsFor(jarPts)

  return (
    <main className="journal is-easy-hold is-lock-in-empty" aria-label="Lock In">
      <header className="page-head journal-head">
        <p className="eyebrow">{EASY.saved}</p>
        <p>
          Nothing to lock in yet.{jarPts ? ` · ${EASY.jarName} ${jarPts.toLocaleString('en-US')}` : ''}
        </p>
        {jarSkillIds.length ? (
          <div className="dossier-marks" aria-label="Gem Jar skills">
            {SKILL_LADDER.filter((skill) => jarSkillIds.includes(skill.id)).map((skill) => (
              <span key={skill.id} className="held-mark" data-gem-skill={skill.id}>
                {skill.name}
              </span>
            ))}
          </div>
        ) : null}
      </header>
      <div className="cta-dock">
        <button
          type="button"
          className="btn primary xl snap-bins"
          onClick={() => onNavigate({ name: 'hub' })}
        >
          {EASY.home}
        </button>
      </div>
      {readAvailable ? (
        <button type="button" className="text-link" onClick={() => onNavigate({ name: 'daily' })}>
          Read
        </button>
      ) : null}
    </main>
  )
}
