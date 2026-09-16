import { REMOVE_ADS_PRODUCT } from '../config/commerce'
import { EASY, isEasy } from '../lib/easy'
import { useProgress } from '../store/progress'

interface SceneAdProps {
  onContinue: () => void
  onSupport: () => void
}

/**
 * Dismissible pause between home and a lesson.
 * Mount only on hub — never over Match, Hold, or arcade play.
 */
export function SceneAd({ onContinue, onSupport }: SceneAdProps) {
  const { progress } = useProgress()
  const easy = isEasy(progress)
  return (
    <div className="scene-ad" role="dialog" aria-modal="true" aria-labelledby="scene-ad-title">
      <div className="scene-ad-card">
        <p className="eyebrow">Between scenes</p>
        <h2 id="scene-ad-title">A quiet pause</h2>
        <p>
          This slot sits between home and a lesson — never over Match, Hold, or
          the arcade games. On Pages it is a labeled placeholder, not a live ad
          network.
        </p>
        <p className="quiet">{REMOVE_ADS_PRODUCT.blurb}</p>
        <div className="scene-ad-actions">
          <button type="button" className="btn primary xl" onClick={onContinue}>
            Continue the trail
          </button>
          <button type="button" className="btn gold" onClick={onSupport}>
            {easy ? EASY.supportTrail : 'Support the trail'}
          </button>
        </div>
      </div>
    </div>
  )
}
