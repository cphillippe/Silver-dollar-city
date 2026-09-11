import type { Challenge, SequenceItem } from '../types'
import type { EvidenceBrief } from '../content/evidence'
import { plainFor } from '../content/plain'
import { EASY, easyFacingLine, easyStoryCard, isEasy } from '../lib/easy'
import { WORDS, schoolWordsFor } from '../lib/words'
import { learningBeat } from '../lib/learning'
import { learningPicture, toolForEvidence } from '../lib/watchTools'
import { useProgress } from '../store/progress'
import { GemMark } from './GemMark'
import { WordGloss } from './WordGloss'

interface TeachUnlockProps {
  brief: EvidenceBrief
  kind: Challenge['kind']
  onUnlock: () => void
  unlock?: string
  beats?: SequenceItem[]
}

export function unlockLabel(kind: Challenge['kind']) {
  if (kind === 'sort') return 'Unlock the sort'
  if (kind === 'sequence') return 'Unlock the order'
  if (kind === 'build-argument') return 'Unlock the stones'
  if (kind === 'link') return 'Unlock the links'
  return 'Unlock the pairs'
}

/** Story and picture first. Then teach “claim,” then the line. Quiz stays locked. */
export function TeachUnlock({ brief, kind, onUnlock, unlock, beats }: TeachUnlockProps) {
  const { progress } = useProgress()
  const easy = isEasy(progress)
  const tool = toolForEvidence(brief.id)
  const picture = learningPicture(brief.id, tool)
  const plain = plainFor(brief.id)
  const story = easy && plain ? plain.teach : brief.reason
  const school = schoolWordsFor(brief.id, easy)

  if (easy) {
    return (
      <section className="recall-gate is-encode teach-gate easy-story-card" aria-label="Short story">
        <p className="eyebrow">Short story</p>
        {picture ? <GemMark gem={picture} size="sm" /> : null}
        <p className="teach-reason">{easyStoryCard(story)}</p>
        <p className="quiet">{EASY.claimTeach}</p>
        <p className="eyebrow hold-kicker">The main idea you will keep</p>
        <p className="recall-line rehearse-stem">{easyFacingLine(brief.id, brief.claim)}</p>
        <div className="cta-dock easy-story-dock">
          <button type="button" className="btn gold xl" onClick={onUnlock}>
            Continue
          </button>
          <button type="button" className="text-link" onClick={onUnlock}>
            Skip reading
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="recall-gate is-encode teach-gate" aria-label="Today’s line">
      <p className="eyebrow">Learn</p>
      <p className="next-tap">Read this, then unlock the play.</p>
      {picture ? <GemMark gem={picture} size="sm" /> : null}
      <p className="teach-reason">{story}</p>
      <WordGloss words={school} extra={plain?.word} />
      <p className="quiet">{WORDS.claim.teach}</p>
      <p className="eyebrow hold-kicker">The claim you will hold</p>
      <p className="recall-line rehearse-stem">{brief.claim}</p>
      <p className="quiet">
        {WORDS.source.term} — {WORDS.source.sense}: {brief.source}.
      </p>
      <p className="quiet">Pictured as {learningBeat(brief.id)}.</p>
      <p className="quiet">
        Acquire — learn this line so you can hold it. Hold this line to deploy{' '}
        {tool?.label ?? 'Love'} on the night road.
      </p>
      {beats && beats.length > 0 ? (
        <ol className="teach-beats">
          {beats.map((beat) => (
            <li key={beat.id}>{beat.text}</li>
          ))}
        </ol>
      ) : null}
      <button type="button" className="btn primary xl" onClick={onUnlock}>
        {unlock ?? unlockLabel(kind)}
      </button>
    </section>
  )
}
