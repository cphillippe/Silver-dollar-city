import { EASY, easyFacingLine, easyWhyLine, isEasy } from '../lib/easy'
import { WORDS } from '../lib/words'
import { useProgress } from '../store/progress'

interface HeldTriadProps {
  id: string
  claim: string
  reason: string
  source: string
  /** Learn teaches the three-part line; Hold/Journal says it tomorrow. */
  kicker?: string
  /** Learn already printed the claim — keep why · source under it. */
  omitClaim?: boolean
}

/** Kid-plain claim · reason · source. Not a quiz. */
export function HeldTriad({
  id,
  claim,
  reason,
  source,
  kicker,
  omitClaim = false,
}: HeldTriadProps) {
  const { progress } = useProgress()
  const easy = isEasy(progress)
  const claimFace = easy ? easyFacingLine(id, claim) : claim
  const reasonFace = easy ? easyWhyLine(reason) : reason
  return (
    <dl className="held-triad" aria-label="Claim, reason, and source">
      {kicker ? <p className="eyebrow">{kicker}</p> : null}
      {omitClaim ? null : (
        <div>
          <dt>{easy ? EASY.mainIdea : WORDS.claim.term}</dt>
          <dd className="recall-line rehearse-stem">{claimFace}</dd>
        </div>
      )}
      <div>
        <dt>{easy ? EASY.sayWhy : WORDS.reason.term}</dt>
        <dd>{reasonFace}</dd>
      </div>
      <div>
        <dt>{easy ? EASY.sayFrom : WORDS.source.term}</dt>
        <dd>{source}</dd>
      </div>
    </dl>
  )
}
