import { evidenceFor } from '../content/evidence'
import { STORY } from '../content/story'
import { EASY, easyLearnLine, isEasy } from '../lib/easy'
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
      <button type="button" className="text-link" onClick={() => onNavigate({ name: 'hub' })}>
        ← {easy ? EASY.home : 'The town'}
      </button>
      {brief ? (
        <TeachUnlock brief={brief} kind="link" unlock={EASY.learnCta} onUnlock={unlock} />
      ) : (
        <section className="recall-gate is-encode teach-gate">
          <p className="quiet">{EASY.readStoryFirst}</p>
          <button type="button" className="btn primary xl" onClick={() => onNavigate({ name: 'hub' })}>
            {EASY.home}
          </button>
        </section>
      )}
    </main>
  )
}
