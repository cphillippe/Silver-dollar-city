import type { Challenge, SequenceItem } from '../types'
import type { EvidenceBrief } from '../content/evidence'
import { packLesson } from '../content/packCatalog'
import { plainFor } from '../content/plain'
import { EASY, isEasy } from '../lib/easy'
import { storyPlayFor } from '../lib/storyPlay'
import { currentLessonTier } from '../lib/tiers'
import { WORDS, schoolWordsFor } from '../lib/words'
import { learningBeat } from '../lib/learning'
import { learningPicture, toolForEvidence } from '../lib/watchTools'
import { useProgress } from '../store/progress'
import { lociStampFor } from '../lib/lociStamp'
import { LociStamp } from './LociStamp'
import { GemMark } from './GemMark'
import { HeldTriad } from './HeldTriad'
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
  const lesson = packLesson(brief.id)
  const tier = currentLessonTier(progress, brief.id)
  const packLearn = lesson?.[tier]?.learn
  const story = packLearn || (easy && plain ? plain.teach : brief.reason)
  const school = schoolWordsFor(brief.id, easy)

  if (easy) {
    const stamp = lociStampFor(brief.id)
    return (
      <section className="recall-gate is-encode teach-gate easy-story-card" aria-label="Short story">
        <p className="eyebrow">Short story</p>
        {/* Easy Clear 1.4.160: LociStamp hero is the one who·where surface — drop duplicate who/where row (Fixes #206). */}
        {/* Easy Clear 1.4.162: ≤720 peel in welcome.css — tiny stamp · hide GemMark · clamp reason so gold CTA stays above fold (Fixes #208). */}
        {/* Easy Clear 1.4.177: cream stamp dark ink + claim pill wrap (loci-stamp.css / welcome ≤720) — Fixes #231. */}
        <LociStamp stamp={stamp} mode="hero" />
        {picture ? <GemMark gem={picture} size="sm" /> : null}
        <p className="teach-reason">{story}</p>
        {/* Easy Clear 1.4.140: one HeldTriad — Main idea · Why · From (no orphan claim above). */}
        <HeldTriad
          id={brief.id}
          claim={brief.claim}
          reason={brief.reason}
          source={brief.source}
        />
        <div className="cta-dock easy-story-dock">
          <button type="button" className="btn gold xl" onClick={onUnlock}>
            {storyPlayFor(brief.id) === 'father-run'
              ? EASY.runCta
              : storyPlayFor(brief.id) === 'road-maze'
                ? EASY.mazeCta
                : storyPlayFor(brief.id) === 'claim-merge'
                  ? EASY.mergeCta
                  : storyPlayFor(brief.id) === 'source-dig'
                    ? EASY.digCta
                    : storyPlayFor(brief.id) === 'story-snap'
                      ? EASY.snapCta
                      : EASY.findGems}
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
      <p className="eyebrow hold-kicker">The claim you will lock in</p>
      <p className="recall-line rehearse-stem">{brief.claim}</p>
      <p className="quiet">
        {WORDS.source.term} — {WORDS.source.sense}: {brief.source}.
      </p>
      <p className="quiet">Pictured as {learningBeat(brief.id)}.</p>
      <p className="quiet">
        Acquire — learn this line so you can lock it in. Lock in this line to deploy{' '}
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
