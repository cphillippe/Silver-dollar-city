import { useState } from 'react'
import { easyFacingLine } from '../../lib/easy'
import { playGemPop } from '../../lib/juice'

interface LockInRecallProps {
  id: string
  claim: string
  /** Both buttons on the reveal call this. The self-mark is not graded and writes nothing. */
  onDone: () => void
}

/**
 * Easy Lock In recall (#843): ask before it shows. The claim stays out of the DOM
 * until "Show me". "I had it" and "Not yet" both open the why slide.
 */
export function LockInRecall({ id, claim, onDone }: LockInRecallProps) {
  const [revealed, setRevealed] = useState(false)

  if (!revealed) {
    return (
      <div className="lockin-recall is-ask">
        <p className="lockin-recall-prompt">What&apos;s the main idea?</p>
        <div className="lockin-recall-cover" aria-hidden="true" />
        <div className="cta-dock">
          <button
            type="button"
            className="btn primary xl lockin-recall-show"
            onClick={() => {
              playGemPop('win')
              setRevealed(true)
            }}
          >
            Show me
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="lockin-recall is-reveal">
      <p className="lockin-recall-claim" role="status">
        {easyFacingLine(id, claim)}
      </p>
      <div className="cta-dock">
        <button type="button" className="btn primary xl lockin-recall-had" onClick={onDone}>
          I had it
        </button>
        <button type="button" className="lockin-recall-not-yet" onClick={onDone}>
          Not yet
        </button>
      </div>
    </div>
  )
}
