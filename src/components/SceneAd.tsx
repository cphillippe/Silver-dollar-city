import { REMOVE_ADS_PRODUCT, SCENE_PAUSE_COPY } from '../config/commerce'

interface SceneAdProps {
  onContinue: () => void
  onSupport: () => void
}

/**
 * Dismissible pause between home and a lesson.
 * Mount only on hub — never over Match, Hold, or arcade play.
 */
export function SceneAd({ onContinue, onSupport }: SceneAdProps) {
  return (
    <div className="scene-ad" role="dialog" aria-modal="true" aria-labelledby="scene-ad-title">
      <div className="scene-ad-card">
        <p className="eyebrow">Between scenes</p>
        <h2 id="scene-ad-title">A quiet pause</h2>
        <p>{SCENE_PAUSE_COPY}</p>
        <p className="quiet">Never over Match, Hold, or arcade play.</p>
        <div className="scene-ad-actions">
          <button type="button" className="btn primary xl" onClick={onContinue}>
            Continue the trail
          </button>
          <button type="button" className="btn gold" onClick={onSupport}>
            {REMOVE_ADS_PRODUCT.title}
          </button>
        </div>
      </div>
    </div>
  )
}
