import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import cityMapBg from '../../assets/city/city-map-bg.webp'
import { Avatar } from '../../components/Avatar'
import { StoryPanelArt } from '../../components/StoryPanelArt'
import { WinBurst } from '../../components/challenges/WinBurst'
import { pillarFor } from '../../content'
import { CAST } from '../../content/story'
import { evidenceFor } from '../../content/evidence'
import { ANCHOR, PLOT_IMG } from '../../components/city/CityPlotArt'
import { EASY, easyFacingLine, easyWhyLine, uniqueHoldChoices } from '../../lib/easy'
import { shuffleSeed } from '../../lib/gemSearchGrid'
import { hashString } from '../../lib/dates'
import { playGemPop } from '../../lib/juice'
import { lociStampFor } from '../../lib/lociStamp'
import { storyPanelsFor } from '../../lib/storyPanels'
import { useProgress } from '../../store/progress'
import type { CityPlotId } from '../../lib/city'
import {
  honestyCheckDue,
  pickFormat,
  reviewPrompt,
  reviewRung,
  reviewTargetLine,
  type ReviewFormatId,
} from './reviewFormat'

const THINK_MS = 3000
const DRAIN_MS = 8000

type Phase = 'prompt' | 'think' | 'drain' | 'reveal' | 'honesty'

export interface QuickReviewProps {
  lineId: string
  today: string
  practice?: boolean
  sitting?: { bUsed?: boolean; streak?: number }
  onSittingUpdate?: (next: { bUsed?: boolean; streak?: number }) => void
  onDone: () => void
  debugFormat?: ReviewFormatId
  /** Home route — formats A and C only until Scholar OKs decoys. */
  formatsACOnly?: boolean
  /** Home route — no post-reveal honesty check until decoys are approved. */
  skipHonesty?: boolean
}

function faceForRung(lineId: string, intervalIndex: number, line: string): string {
  return reviewRung(intervalIndex) === 'reason' ? easyWhyLine(line) : easyFacingLine(lineId, line)
}

function threeChoices(
  lineId: string,
  intervalIndex: number,
  correct: string,
  brief: NonNullable<ReturnType<typeof evidenceFor>>,
): string[] {
  const rung = reviewRung(intervalIndex)
  const pool =
    rung === 'reason'
      ? [...brief.reasonChoices]
      : rung === 'source'
        ? [brief.source, ...brief.claimChoices.filter((line) => line !== brief.source)].slice(0, 3)
        : [...brief.claimChoices]
  const face = (line: string) => faceForRung(lineId, intervalIndex, line)
  const unique = uniqueHoldChoices(pool, face, correct)
  let state = hashString(`choices:${lineId}:${intervalIndex}:${correct}`)
  const rand = () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0xffffffff
  }
  return shuffleSeed(unique.slice(0, 3), rand).slice(0, 3)
}

export function QuickReview({
  lineId,
  today,
  practice = false,
  sitting,
  onSittingUpdate,
  onDone,
  debugFormat,
  formatsACOnly = false,
  skipHonesty = false,
}: QuickReviewProps) {
  const { progress, recordReview } = useProgress()
  const brief = evidenceFor(lineId)
  const trace = progress.memory[lineId]
  const intervalIndex = trace?.intervalIndex ?? 0
  const lastFormat = trace?.lastFormat
  const [format] = useState<Exclude<ReviewFormatId, 'F'>>(() => {
    if (debugFormat && debugFormat !== 'F') return debugFormat
    return pickFormat(lineId, today, lastFormat, sitting, intervalIndex, {
      acOnly: formatsACOnly,
    })
  })

  const [sourceBeatActive, setSourceBeatActive] = useState(false)
  const [reasonBeatClean, setReasonBeatClean] = useState(false)
  const beatIndex = intervalIndex === 2 && sourceBeatActive ? 3 : intervalIndex

  const [phase, setPhase] = useState<Phase>(() => (format === 'B' ? 'think' : 'prompt'))
  const [revealed, setRevealed] = useState(false)
  const [thinkPct, setThinkPct] = useState(0)
  const [drainPct, setDrainPct] = useState(100)
  const [flashLine, setFlashLine] = useState<string | null>(null)
  const [winBurst, setWinBurst] = useState(false)
  const [pendingClean, setPendingClean] = useState<boolean | null>(null)
  const [wrongMapTaps, setWrongMapTaps] = useState(0)
  const [mapMiss, setMapMiss] = useState(false)
  /** Format C: wrong plot or post-hint correct tap — never a clean recall. */
  const [mapTapClean, setMapTapClean] = useState(true)
  const drainHalf = useRef(false)
  const graded = useRef(false)

  const stamp = lociStampFor(lineId)
  const targetLine = brief ? reviewTargetLine(brief, beatIndex) : ''
  const prompt = reviewPrompt(beatIndex)
  const storyPanel = storyPanelsFor(lineId)[0]

  useEffect(() => {
    setSourceBeatActive(false)
    setReasonBeatClean(false)
    setRevealed(false)
    setPhase(format === 'B' ? 'think' : 'prompt')
    setPendingClean(null)
    setFlashLine(null)
    setWrongMapTaps(0)
    setMapMiss(false)
    setMapTapClean(true)
    graded.current = false
  }, [lineId])

  const choiceLines = useMemo(() => {
    if (!brief) return []
    return threeChoices(lineId, beatIndex, targetLine, brief)
  }, [beatIndex, brief, lineId, targetLine])

  const shuffledDrain = useMemo(() => {
    if (!brief) return []
    let state = hashString(`drain:${today}:${lineId}`)
    const rand = () => {
      state = (state * 1664525 + 1013904223) >>> 0
      return state / 0xffffffff
    }
    return shuffleSeed(choiceLines, rand)
  }, [brief, choiceLines, lineId, today])

  const commitBOutcome = useCallback((clean: boolean) => {
    setPendingClean(clean)
    setRevealed(true)
    setPhase('reveal')
    if (!clean) setFlashLine(targetLine)
  }, [targetLine])

  const finishGrade = useCallback(
    (clean: boolean) => {
      if (graded.current) return
      graded.current = true
      const cardClean =
        intervalIndex === 2 ? clean && reasonBeatClean : clean
      const streak = sitting?.streak ?? 0
      const nextStreak = cardClean ? Math.min(3, streak + 1) : 0
      onSittingUpdate?.({
        bUsed: sitting?.bUsed || format === 'B',
        streak: nextStreak,
      })
      if (!practice && brief) {
        recordReview({
          id: lineId,
          pillar: pillarFor(lineId),
          kind: 'recall',
          today,
          clean: cardClean,
          peeked: !cardClean,
          elaborated: false,
          format,
        })
      }
      const finish = () => onDone()
      if (cardClean && nextStreak === 3) {
        setWinBurst(true)
        window.setTimeout(() => {
          setWinBurst(false)
          finish()
        }, 1200)
        return
      }
      finish()
    },
    [
      brief,
      format,
      intervalIndex,
      lineId,
      onDone,
      onSittingUpdate,
      practice,
      reasonBeatClean,
      recordReview,
      sitting?.bUsed,
      sitting?.streak,
      today,
    ],
  )

  useEffect(() => {
    if (format !== 'B' || phase !== 'think') return
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const pct = Math.min(100, ((now - start) / THINK_MS) * 100)
      setThinkPct(pct)
      if (pct >= 100) {
        setPhase('drain')
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [format, phase])

  useEffect(() => {
    if (format !== 'B' || phase !== 'drain') return
    drainHalf.current = false
    const start = performance.now()
    let frame = 0
    let tickSound = 0
    const tick = (now: number) => {
      const elapsed = now - start
      const pct = Math.max(0, 100 - (elapsed / DRAIN_MS) * 100)
      setDrainPct(pct)
      if (elapsed >= DRAIN_MS / 2) drainHalf.current = true
      if (Math.floor(elapsed / 400) > tickSound) {
        tickSound = Math.floor(elapsed / 400)
        playGemPop('find')
      }
      if (pct <= 0) {
        commitBOutcome(false)
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [commitBOutcome, format, phase])

  if (!brief) {
    return (
      <p className="quiet" role="status">
        No review brief for this line.
      </p>
    )
  }

  const showHonesty =
    !skipHonesty &&
    (format === 'A' || format === 'C') &&
    phase === 'honesty' &&
    honestyCheckDue(lineId, today, beatIndex)

  function plotStage(plotId: CityPlotId): 'built' | 'lit' {
    if (format === 'C' && revealed && plotId === stamp.plotId) return 'lit'
    return 'built'
  }

  function onPlotTap(plotId: CityPlotId) {
    if (format !== 'C' || phase !== 'prompt' || revealed) return
    if (plotId !== stamp.plotId) {
      setWrongMapTaps((count) => count + 1)
      setMapMiss(true)
      setMapTapClean(false)
      return
    }
    setMapMiss(false)
    const hintShowing = wrongMapTaps >= 2
    if (hintShowing) setMapTapClean(false)
    setRevealed(true)
    playGemPop('win')
    setPhase('reveal')
  }

  function onFlipTap() {
    if (format !== 'A' || phase !== 'prompt' || revealed) return
    setRevealed(true)
    playGemPop('win')
    setPhase('reveal')
  }

  function beginSourceBeat() {
    graded.current = false
    setReasonBeatClean(true)
    setSourceBeatActive(true)
    setRevealed(false)
    setPendingClean(null)
    setFlashLine(null)
    setWrongMapTaps(0)
    setMapMiss(false)
    setMapTapClean(true)
    setPhase('prompt')
  }

  function onHadIt() {
    if (!revealed || phase === 'honesty') return
    if (intervalIndex === 2 && !sourceBeatActive) {
      beginSourceBeat()
      return
    }
    if (
      !skipHonesty &&
      (format === 'A' || format === 'C') &&
      honestyCheckDue(lineId, today, beatIndex)
    ) {
      setPhase('honesty')
      return
    }
    const selfGradeClean = format === 'C' ? mapTapClean : true
    finishGrade(selfGradeClean)
  }

  function onNotYet() {
    if (intervalIndex === 2 && !sourceBeatActive && revealed) {
      beginSourceBeat()
      return
    }
    finishGrade(false)
  }

  function onDrainPick(line: string) {
    if (phase !== 'drain') return
    const correct = line === targetLine
    if (correct) {
      playGemPop('win')
      commitBOutcome(true)
      return
    }
    if (!drainHalf.current) playGemPop('bonus')
    commitBOutcome(false)
  }

  function onBNext() {
    finishGrade(pendingClean ?? false)
  }

  function onHonestyPick(line: string) {
    if (line === targetLine) {
      finishGrade(true)
      return
    }
    setFlashLine(targetLine)
    playGemPop('find')
    finishGrade(false)
  }

  const streak = sitting?.streak ?? 0
  const streakLabel = streak >= 2 ? (streak >= 3 ? '3 in a row' : '2 in a row') : null
  const mapPlotHint = wrongMapTaps >= 2
  const mapTapGold = format === 'C' && phase === 'prompt' && !revealed && !mapPlotHint
  const rung = reviewRung(beatIndex)
  const guideName = CAST[stamp.whoId]?.name ?? stamp.whoId

  function acRevealBody() {
    if (!brief) return null
    const showReason = Boolean(brief.reason)
    const showSource = rung === 'source' || (intervalIndex === 2 && sourceBeatActive)
    return (
      <>
        <div className="quick-review-cue quick-review-reveal-cue">
          <Avatar who={stamp.whoId} size="sm" />
          <span>{stamp.placeLabel}</span>
          <span className="quick-review-guide-name">{guideName}</span>
        </div>
        <p className="quick-review-reveal-claim">{brief.claim}</p>
        {showReason ? <p className="quick-review-reveal-reason">{brief.reason}</p> : null}
        {showSource ? <p className="quick-review-reveal-source">{brief.source}</p> : null}
      </>
    )
  }

  function acRevealActions() {
    return (
      <div className="quick-review-actions">
        <button type="button" className="btn gold xl" onClick={onHadIt}>
          I had it
        </button>
        <button type="button" className="text-link" onClick={onNotYet}>
          Not yet
        </button>
      </div>
    )
  }

  return (
    <section className="quick-review" aria-label={EASY.saved}>
      {streakLabel ? (
        <div className="quick-review-streak" role="status">
          {streakLabel}
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`quick-review-streak-pip ${i < streak ? 'is-lit' : ''}`}
              aria-hidden
            />
          ))}
        </div>
      ) : null}
      <WinBurst play={winBurst} stamp="" />

      {format === 'B' && phase === 'think' ? (
        <>
          <div className="quick-review-cue">
            <Avatar who={stamp.whoId} size="sm" />
            <span>{stamp.placeLabel}</span>
          </div>
          <p className="quick-review-prompt">Think first…</p>
          <div className="quick-review-think-bar" aria-hidden>
            <div className="quick-review-think-fill" style={{ width: `${thinkPct}%` }} />
          </div>
        </>
      ) : null}

      {format === 'B' && phase === 'drain' ? (
        <>
          <div className="quick-review-cue">
            <Avatar who={stamp.whoId} size="sm" />
            <span>{stamp.placeLabel}</span>
          </div>
          <p className="quick-review-prompt">{prompt}</p>
          <div className="quick-review-drain-bar is-now" aria-hidden>
            <div className="quick-review-drain-fill" style={{ width: `${drainPct}%` }} />
          </div>
          <div className="quick-review-lines">
            {shuffledDrain.map((line) => (
              <button
                key={line}
                type="button"
                className="match-card recall-card"
                onClick={() => onDrainPick(line)}
              >
                {faceForRung(lineId, beatIndex, line)}
              </button>
            ))}
          </div>
        </>
      ) : null}

      {format === 'C' && (phase === 'prompt' || (phase === 'reveal' && !showHonesty)) ? (
        <>
          {phase === 'prompt' && !revealed ? (
            <div className="quick-review-stage">
              <div className="quick-review-prompt-panel quick-review-prompt-panel--flat">
                <p className="quick-review-prompt quick-review-prompt-title">{prompt}</p>
              </div>
              <div className="quick-review-map" aria-hidden={false}>
                <div className="quick-review-map-frame">
                  <img className="quick-review-map-bg" src={cityMapBg} alt="" draggable={false} />
                  <div className="quick-review-map-plate">
                    {(Object.keys(PLOT_IMG) as CityPlotId[]).map((plotId) => {
                      const anchor = ANCHOR[plotId]
                      const left = (anchor.x / 640) * 100
                      const top = (anchor.y / 420) * 100
                      const stage = plotStage(plotId)
                      const img = PLOT_IMG[plotId as keyof typeof PLOT_IMG]?.[stage]
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
              {mapMiss ? (
                <p className="quick-review-map-miss" role="status">
                  {EASY.reviewMapMiss}
                </p>
              ) : null}
            </div>
          ) : null}
          {revealed ? (
            <div className="quick-review-stage">
              <div className="quick-review-reveal-panel">{acRevealBody()}</div>
              {acRevealActions()}
            </div>
          ) : null}
        </>
      ) : null}

      {format === 'A' && (phase === 'prompt' || phase === 'reveal') && !showHonesty ? (
        <>
          {!revealed ? (
            <div className="quick-review-stage">
              <div className="quick-review-prompt-panel">
                <p className="quick-review-prompt quick-review-prompt-title">{prompt}</p>
              </div>
              <button
                type="button"
                className="quick-review-flip is-now"
                onClick={onFlipTap}
                aria-label="Show me"
              >
                {storyPanel ? (
                  <StoryPanelArt
                    scene={storyPanel.scene}
                    media={storyPanel.media}
                    beatId={storyPanel.beatId}
                    size="thumb"
                  />
                ) : null}
              </button>
            </div>
          ) : (
            <div className="quick-review-stage">
              <div className="quick-review-reveal-panel">{acRevealBody()}</div>
              {acRevealActions()}
            </div>
          )}
        </>
      ) : null}

      {format === 'B' && phase === 'reveal' ? (
        <>
          <p className="quick-review-reveal-line">
            {faceForRung(lineId, beatIndex, targetLine)}
          </p>
          <div className="quick-review-actions">
            <button type="button" className="btn gold xl" onClick={onBNext}>
              Next
            </button>
          </div>
        </>
      ) : null}

      {showHonesty ? (
        <>
          <p className="quick-review-prompt is-now">{prompt}</p>
          <div className="quick-review-lines">
            {choiceLines.map((line) => (
              <button
                key={line}
                type="button"
                className={`match-card recall-card ${flashLine === line ? 'is-flash' : ''}`}
                onClick={() => onHonestyPick(line)}
              >
                {faceForRung(lineId, beatIndex, line)}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </section>
  )
}
