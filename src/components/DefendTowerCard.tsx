import { useEffect, useRef, useState } from 'react'
import { CITY_PLOTS, type CityPlotId } from '../lib/city'
import { isFreeSpot } from '../lib/lampPlace'
import { WATCH_ABILITY_LABEL } from '../lib/defend'
import {
  placeTowerCard,
  TOWER_CARD_H,
  TOWER_CARD_W,
  TOWER_TREE_H,
  TOWER_TREE_LESSON_H,
  type TowerCardPoint,
} from '../lib/towerCardPlace'
import { boostCost, combatTier, TIER_MARK, TOOL_TIER_MAX } from '../lib/watchTools'
import {
  canTake,
  LESSON_LOCK,
  PATH_LABEL,
  PATH_LINE,
  stepLocked,
  TREE_BONUS_COST,
  TREE_LOCK,
  TREE_PATHS,
  TREE_STEP_COST,
  type BonusGate,
  type LampPaths,
  type TreePath,
} from '../nightWatch/upgradeTree'

function PathMark({ path }: { path: TreePath }) {
  if (path === 'far') {
    return (
      <svg className="defend-path-mark" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="2" fill="currentColor" />
        <path d="M8 1.6a6.4 6.4 0 0 1 0 12.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 4.2a3.8 3.8 0 0 1 0 7.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    )
  }
  return (
    <svg className="defend-path-mark" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 1.2 9.5 5.8 14.2 6.1 10.6 9.1 11.8 13.8 8 11.2 4.2 13.8 5.4 9.1 1.8 6.1 6.5 5.8Z"
        fill="currentColor"
      />
    </svg>
  )
}

export interface LevelBurst {
  from: number
  to: number
}

export type { TowerCardPoint }

export function DefendTowerCard({
  plotId,
  ability,
  runTier,
  sparks,
  point,
  board,
  onUpgrade,
  onUpgradePath,
  onArmPathBuy,
  paths,
  onPull,
  pullSparks = 0,
  onClose,
  levelBurst = null,
  clearOf = [],
  cameraScale = 0.55,
  roadNote = '',
  /** Easy uses the scaled tier prices. Hard stays at one spark. */
  easy = false,
  /** Pixels at the bottom of the board the card should stay above. */
  reserveBottom = 0,
  /** Same-pillar lessons, and the playtest override. Steps I–III ignore this. */
  gate,
  /** Opens this lamp's Lock In lessons and keeps the night. */
  onOpenLessons,
}: {
  plotId: CityPlotId
  ability: string
  runTier: Record<string, number>
  sparks: number
  point: TowerCardPoint
  board: { w: number; h: number }
  onUpgrade: () => void
  /** Easy tree. Hard keeps the single Upgrade button. */
  onUpgradePath?: (path: TreePath, fromPip?: boolean) => void
  /** Pointer went down on a pip. The round must not advance until that buy lands. */
  onArmPathBuy?: (path: TreePath) => void
  paths?: LampPaths
  /** Plant and between waves. Hidden while walkers are on the road. */
  onPull?: () => void
  /** Sparks this pull returns. A free lamp is 0. */
  pullSparks?: number
  onClose: () => void
  /** I→II / II→III while the level-up burst plays. */
  levelBurst?: LevelBurst | null
  /** Other planted lamps. The card moves so a tap can still reach them. */
  clearOf?: readonly TowerCardPoint[]
  /** Board camera scale. Lamp hits are viewBox units times this. */
  cameraScale?: number
  /** Same reach note the plant ghost shows. Empty when this level already reaches. */
  roadNote?: string
  easy?: boolean
  reserveBottom?: number
  gate?: BonusGate
  onOpenLessons?: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [pullAsk, setPullAsk] = useState(false)
  const tier = combatTier(ability, runTier)
  const maxed = tier >= TOOL_TIER_MAX
  const cost = boostCost(tier)
  const burstCost = 1
  const next = Math.min(TOOL_TIER_MAX, tier + 1)
  const canSpend = !maxed && sparks >= cost
  const label = WATCH_ABILITY_LABEL[ability] ?? 'Love'
  const plotTitle =
    CITY_PLOTS.find((plot) => plot.id === plotId)?.title ??
    (isFreeSpot(plotId) ? 'open ground' : plotId)
  const lessonCue = Boolean(
    easy &&
      paths &&
      TREE_PATHS.some((path) => canTake(paths, path, gate).gate === 'lesson'),
  )
  const cardH = easy && paths ? (lessonCue ? TOWER_TREE_LESSON_H : TOWER_TREE_H) : TOWER_CARD_H
  const placed = placeTowerCard(point, board, clearOf, cameraScale, reserveBottom, cardH)
  const levelLine = maxed ? TIER_MARK[tier] : `${TIER_MARK[next]} · ${cost}✦`
  const bursting = Boolean(levelBurst && levelBurst.to > levelBurst.from)
  const fromMark = bursting ? TIER_MARK[levelBurst!.from] : ''
  const toMark = bursting ? TIER_MARK[levelBurst!.to] : ''

  useEffect(() => {
    setPullAsk(false)
    // Focus the card, not Upgrade. A focused spend button can take the next lamp tap.
    cardRef.current?.focus({ preventScroll: true })
  }, [plotId])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (easy && paths && onUpgradePath) {
    return (
      <div
        ref={cardRef}
        className={`defend-tower-card is-tree is-${placed.side}`}
        data-upgrade-card
        data-upgrade-tree="yes"
        data-upgrade-plot={plotId}
        role="dialog"
        tabIndex={-1}
        aria-label={`Upgrade ${label} at ${plotTitle}`}
        style={{
          left: placed.left,
          top: placed.top,
          width: TOWER_CARD_W,
          ['--stem' as string]: `${Math.round(point.left - placed.left)}px`,
        }}
      >
        {onPull ? (
          <button
            type="button"
            className="defend-tower-pull"
            aria-label={`Pull lamp at ${plotTitle}`}
            onClick={(event) => {
              event.stopPropagation()
              setPullAsk(true)
            }}
          >
            <svg className="defend-tower-trash" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M9 3h6l1 2h5v2H3V5h5l1-2zm-2 6h2v10H7V9zm4 0h2v10h-2V9zm4 0h2v10h-2V9z"
              />
            </svg>
          </button>
        ) : null}
        {pullAsk && onPull ? (
          <div className="defend-pull-confirm" role="alertdialog" aria-label="Pull this lamp?">
            <p className="defend-pull-copy">{`Pull this lamp? You get ${pullSparks} sparks back`}</p>
            <div className="defend-pull-actions">
              <button
                type="button"
                className="defend-pull-keep"
                onClick={(event) => {
                  event.stopPropagation()
                  setPullAsk(false)
                }}
              >
                Keep
              </button>
              <button
                type="button"
                className="defend-pull-do"
                onClick={(event) => {
                  event.stopPropagation()
                  setPullAsk(false)
                  onPull()
                }}
              >
                Pull
              </button>
            </div>
          </div>
        ) : null}
        <p className="defend-tower-tool">{label}</p>
        {TREE_PATHS.map((path) => {
          const rank = paths[path]
          const buy = canTake(paths, path, gate)
          const broke = buy.ok && sparks < buy.cost
          const lessonLocked = buy.gate === 'lesson'
          const pipCosts = [...TREE_STEP_COST, TREE_BONUS_COST]
          return (
            <div
              key={path}
              className="defend-path"
              data-path={path}
              data-rank={rank}
              data-lesson-lock={lessonLocked ? 'yes' : undefined}
            >
              <p className="defend-path-name">
                <span className="defend-path-title">
                  <PathMark path={path} />
                  {PATH_LABEL[path]}
                </span>
                <span className="defend-path-line">{PATH_LINE[path]}</span>
              </p>
              <div className="defend-path-pips">
                {pipCosts.map((stepCost, index) => {
                  const step = index + 1
                  const filled = rank >= step
                  const locked = stepLocked(paths, path, step) || (lessonLocked && step === rank + 1)
                  const next = buy.ok && step === rank + 1
                  const className = `defend-path-pip${filled ? ' is-on' : ''}${locked ? ' is-locked' : ''}${next ? ' is-buy' : ''}`
                  if (next) {
                    return (
                      <button
                        key={step}
                        type="button"
                        className={className}
                        disabled={broke}
                        data-step={step}
                        data-cost={stepCost}
                        data-path-pip={path}
                        aria-label={`${PATH_LABEL[path]} step ${step}, ${buy.cost} sparks`}
                        onPointerDown={(event) => {
                          event.stopPropagation()
                          if (!broke) onArmPathBuy?.(path)
                        }}
                        onPointerUp={(event) => {
                          event.stopPropagation()
                          if (!broke) onUpgradePath(path, true)
                        }}
                        onClick={(event) => {
                          event.stopPropagation()
                          if (!broke) onUpgradePath(path, true)
                        }}
                      >
                        {stepCost}
                      </button>
                    )
                  }
                  return (
                    <span
                      key={step}
                      className={className}
                      data-step={step}
                      data-cost={stepCost}
                      data-locked={locked ? 'yes' : undefined}
                    >
                      {stepCost}
                    </span>
                  )
                })}
              </div>
              {buy.ok ? (
                <button
                  type="button"
                  className="btn primary defend-path-buy"
                  disabled={broke}
                  data-path-buy={path}
                  data-cost={buy.cost}
                  onPointerDown={(event) => {
                    event.stopPropagation()
                    if (!broke) onArmPathBuy?.(path)
                  }}
                  onPointerUp={(event) => {
                    event.stopPropagation()
                    if (!broke) onUpgradePath(path, true)
                  }}
                  onClick={(event) => {
                    event.stopPropagation()
                    if (!broke) onUpgradePath(path, true)
                  }}
                >
                  {broke ? `Need ${buy.cost}` : `${buy.cost}✦`}
                </button>
              ) : lessonLocked ? (
                <div className="defend-lesson-cue" data-lesson-cue={ability} data-pillar={label}>
                  <p className="defend-path-lock" data-path-lock={path}>
                    <svg className="defend-lesson-lock" viewBox="0 0 16 16" aria-hidden="true">
                      <rect x="3.2" y="7" width="9.6" height="6.4" rx="1.4" fill="currentColor" />
                      <path
                        d="M5.2 7V5.1a2.8 2.8 0 0 1 5.6 0V7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                    </svg>
                    {LESSON_LOCK}
                  </p>
                  <p className="defend-lesson-pillar">{label}</p>
                  <button
                    type="button"
                    className="btn defend-lesson-open"
                    data-lesson-open={ability}
                    onClick={(event) => {
                      event.stopPropagation()
                      onOpenLessons?.()
                    }}
                  >
                    {label} lessons
                  </button>
                </div>
              ) : (
                <p className="defend-path-lock" data-path-lock={path}>
                  {buy.reason}
                </p>
              )}
              {buy.ok && stepLocked(paths, path, 2) ? (
                <p className="defend-path-lock" data-path-lock={path}>
                  {TREE_LOCK}
                </p>
              ) : null}
            </div>
          )
        })}
        {roadNote ? (
          <p className="defend-tower-road" data-road-note={roadNote}>
            {roadNote}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div
      ref={cardRef}
      className={`defend-tower-card is-${placed.side}${bursting ? ' is-level-up' : ''}`}
      data-upgrade-card
      data-upgrade-plot={plotId}
      data-tier={tier}
      data-level-bump={bursting ? `${fromMark}-${toMark}` : undefined}
      data-next={maxed ? TIER_MARK[tier] : TIER_MARK[next]}
      data-cost={maxed ? 0 : cost}
      data-can-spend={canSpend ? 'yes' : 'no'}
      role="dialog"
      tabIndex={-1}
      aria-label={`Upgrade ${label} at ${plotTitle}`}
      style={{
        left: placed.left,
        top: placed.top,
        width: TOWER_CARD_W,
        ['--stem' as string]: `${Math.round(point.left - placed.left)}px`,
      }}
    >
      {onPull ? (
        <button
          type="button"
          className="defend-tower-pull"
          aria-label={`Pull lamp at ${plotTitle}`}
          onClick={(event) => {
            event.stopPropagation()
            setPullAsk(true)
          }}
        >
          <svg className="defend-tower-trash" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M9 3h6l1 2h5v2H3V5h5l1-2zm-2 6h2v10H7V9zm4 0h2v10h-2V9zm4 0h2v10h-2V9z"
            />
          </svg>
        </button>
      ) : null}
      {pullAsk && onPull ? (
        <div className="defend-pull-confirm" role="alertdialog" aria-label="Pull this lamp?">
          <p className="defend-pull-copy">{`Pull this lamp? You get ${pullSparks} sparks back`}</p>
          <div className="defend-pull-actions">
            <button
              type="button"
              className="defend-pull-keep"
              onClick={(event) => {
                event.stopPropagation()
                setPullAsk(false)
              }}
            >
              Keep
            </button>
            <button
              type="button"
              className="defend-pull-do"
              onClick={(event) => {
                event.stopPropagation()
                setPullAsk(false)
                onPull()
              }}
            >
              Pull
            </button>
          </div>
        </div>
      ) : null}
      <p className="defend-tower-tool">{label}</p>
      <p
        className={`defend-tower-next${bursting ? ' is-bump' : ''}`}
        key={bursting ? `bump-${fromMark}-${toMark}` : levelLine}
        aria-live="polite"
      >
        {bursting ? (
          <>
            <span className="defend-level-from">{fromMark}</span>
            <span className="defend-level-arrow" aria-hidden="true">
              →
            </span>
            <span className="defend-level-to" data-level={toMark}>
              {toMark}
            </span>
          </>
        ) : (
          levelLine
        )}
      </p>
      {bursting ? (
        <span className="defend-spark-spend" aria-hidden="true">
          {burstCost === 1 ? '−1✦' : `−${burstCost}✦`}
        </span>
      ) : null}
      <p className="defend-tower-gain">{maxed ? 'As strong as it gets' : 'Range ↑  ·  Damage ↑'}</p>
      {roadNote ? (
        <p className="defend-tower-road" data-road-note={roadNote}>
          {roadNote}
        </p>
      ) : null}
      {maxed ? null : (
        <button
          type="button"
          className="btn primary defend-tower-upgrade"
          disabled={!canSpend}
          aria-describedby={canSpend ? undefined : 'defend-tower-need'}
          onClick={(event) => {
            event.stopPropagation()
            onUpgrade()
          }}
        >
          Upgrade
        </button>
      )}
      {!maxed && !canSpend ? (
        <p id="defend-tower-need" className="defend-tower-need">
          {cost > 1 ? `Need ${cost} sparks` : 'Need a spark'}
        </p>
      ) : null}
    </div>
  )
}
