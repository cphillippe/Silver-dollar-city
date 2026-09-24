import { evidenceFor } from '../content/evidence'
import { STORY } from '../content/story'
import { EASY, easyLearnLine, isEasy } from '../lib/easy'
import { EASY_HOME } from '../lib/easyNav'
import { EasyBack } from './EasyBack'
import { TeachUnlock } from './TeachUnlock'
import { useProgress } from '../store/progress'
import type { View } from '../types'

interface LearnScreenProps {
  onNavigate: (view: View) => void
}

/** Easy re-read: unboxed short story. Match play (panel blast / father-run / merge) is the teach. */
export function LearnScreen({ onNavigate }: LearnScreenProps) {
  const { progress } = useProgress()
  const easy = isEasy(progress)
  const lineId = easyLearnLine(progress)
  const brief = evidenceFor(lineId)

  function unlock() {
    onNavigate({ name: 'link' })
  }

  return (
    <main className="challenge-page is-teach" aria-label={STORY.playGoal}>
      {easy ? (
        <EasyBack onNavigate={onNavigate} />
      ) : (
        <button type="button" className="text-link" onClick={() => onNavigate({ name: 'hub' })}>
          ← The town
        </button>
      )}
      {brief ? (
        <TeachUnlock brief={brief} kind="link" unlock={EASY.learnCta} onUnlock={unlock} />
      ) : (
        <section className="recall-gate is-encode teach-gate">
          <p className="quiet">{EASY.readStoryFirst}</p>
          <button type="button" className="btn primary xl" onClick={() => onNavigate(EASY_HOME)}>
            {EASY.home}
          </button>
        </section>
      )}
    </main>
  )
}
