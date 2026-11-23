import { useCallback, useEffect, useRef, useState } from 'react'
import cityMapBg from '../../assets/city/city-map-bg.webp'
import { ANCHOR, PLOT_IMG } from '../../components/city/CityPlotArt'
import { EASY, easyFacingLine } from '../../lib/easy'
import { playGemPop } from '../../lib/juice'
import { lociStampFor } from '../../lib/lociStamp'
import type { CityPlotId } from '../../lib/city'
import { reviewPrompt } from '../review/reviewFormat'
import type { EncodeFormatId } from '../review/encodeFormat'
import { LockInRecall } from './LockInRecall'

const THINK_MS = 3000

interface LockInEncodeRecallProps {
  id: string
  claim: string
  format: EncodeFormatId
  onDone: () => void
}

type Phase = 'ask' | 'reveal'

/**
 * Easy Lock In encode recall — format A/B/C from the Quick Review pool.
 * Claim, reason and source stay in content; this shell only varies how the claim is asked.
 */
export function LockInEncodeRecall({ id, claim, format, onDone }: LockInEncodeRecallProps) {
  if (format === 'A') {
    return <LockInRecall id={id} claim={claim} onDone={onDone} />
  }
  return <LockInEncodeRecallBC id={id} claim={claim} format={format} onDone={onDone} />
}

function LockInEncodeRecallBC({
  id,
  claim,
  format,
  onDone,
}: Omit<LockInEncodeRecallProps, 'format'> & { format: Exclude<EncodeFormatId, 'A'> }) {
  const stamp = lociStampFor(id)
  const prompt = reviewPrompt(0)
  const faced = easyFacingLine(id, claim)

  const [phase, setPhase] = useState<Phase>('ask')
  const [thinkPct, setThinkPct] = useState(0)
  const [wrongMapTaps, setWrongMapTaps] = useState(0)
  const thinkDone = useRef(false)

  useEffect(() => {
    thinkDone.current = false
    setPhase('ask')
    setThinkPct(0)
    setWrongMapTaps(0)
  }, [id, format])

  useEffect(() => {
    if (format !== 'B' || phase !== 'ask') return
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const pct = Math.min(100, ((now - start) / THINK_MS) * 100)
      setThinkPct(pct)
      if (pct >= 100) {
        thinkDone.current = true
        setPhase('reveal')
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [format, phase])

  const onPlotTap = useCallback(
    (plotId: CityPlotId) => {
      if (format !== 'C' || phase !== 'ask') return
      if (plotId !== stamp.plotId) {
        setWrongMapTaps((count) => count + 1)
        return
      }
      playGemPop('win')
      setPhase('reveal')
    },
    [format, phase, stamp.plotId],
  )

  const mapPlotHint = wrongMapTaps >= 2
  const mapTapGold = format === 'C' && phase === 'ask' && !mapPlotHint

  if (phase === 'reveal') {
    return (
      <div className="lockin-encode is-reveal" data-encode-format={format}>
        <p className="lockin-recall-claim" role="status">
          {faced}
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

  if (format === 'B') {
    return (
      <div className="lockin-encode is-ask lockin-encode-b quick-review" data-encode-format="B">
        <p className="quick-review-prompt">Think first…</p>
        <div className="quick-review-think-bar" aria-hidden>
          <div className="quick-review-think-fill" style={{ width: `${thinkPct}%` }} />
        </div>
      </div>
    )
  }

  return (
    <div className="lockin-encode is-ask lockin-encode-c quick-review" data-encode-format="C">
      <div className="quick-review-stage">
        <div className="quick-review-prompt-panel quick-review-prompt-panel--flat">
          <p className="quick-review-prompt quick-review-prompt-title">{prompt}</p>
        </div>
        <div className="quick-review-map">
          <div className="quick-review-map-frame">
            <img className="quick-review-map-bg" src={cityMapBg} alt="" draggable={false} />
            <div className="quick-review-map-plate">
              {(Object.keys(PLOT_IMG) as CityPlotId[]).map((plotId) => {
                const anchor = ANCHOR[plotId]
                const left = (anchor.x / 640) * 100
                const top = (anchor.y / 420) * 100
                const img = PLOT_IMG[plotId as keyof typeof PLOT_IMG]?.built
                const hint = mapPlotHint && plotId === stamp.plotId
                if (!img) return null
                return (
                  <button
                    key={plotId}
                    type="button"
                    data-plot-id={plotId}
                    className={`quick-review-plot-hit ${hint ? 'is-now' : ''}`}
                    style={{ left: `${left}%`, top: `${top}%` }}
                    onClick={() => onPlotTap(plotId)}
                    aria-label={`${prompt}. ${EASY.reviewMapTap}`}
                  >
                    <img src={img} alt="" draggable={false} />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        <p className={`quick-review-map-tap ${mapTapGold ? 'is-now' : ''}`}>{EASY.reviewMapTap}</p>
        {wrongMapTaps > 0 ? (
          <p className="quick-review-map-miss" role="status">
            {EASY.reviewMapMiss}
          </p>
        ) : null}
      </div>
    </div>
  )
}