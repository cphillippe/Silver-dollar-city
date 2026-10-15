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
  BRIGHT_COST,
  BRIGHT_LINE,
  canBuyBright,
  canTake,
  LESSON_LOCK,
  PATH_LABEL,
  PATH_LINE,
  stepLocked,
  TREE_BONUS_COST,
  TREE_LOCK,
  TREE_PATHS,
  TREE_BONUS_MAX,
  TREE_LATE_COST,
  TREE_STEP_COST,
  lateStepOpen,
  wavePipVisible,
  type BonusGate,
  type LampPaths,
  type TreePath,
} from '../nightWatch/upgradeTree'
import {
  BELL_CARD,
  BELL_LABEL,
  BELL_VERSE_CITE,
  BELL_SLOW,
  bellRank,
  canUpgradeBell,
  isBell,
} from '../nightWatch/bell'
import {
  INCENSE_CARD,
  INCENSE_LABEL,
  INCENSE_TAP,
  INCENSE_VERSE_CITE,
  canUpgradeIncense,
  incenseLinger,
  incenseRank,
  isIncense,
} from '../nightWatch/incense'
import {
  CROSS_CARD,
  CROSS_LABEL,
  CROSS_SOONER,
  CROSS_VERSE_CITE,
  canUpgradeCross,
  crossRank,
  isCross,
} from '../nightWatch/cross'
import {
  CANDLE_CARD,
  CANDLE_HELP,
  CANDLE_LABEL,
  CANDLE_LOCK,
  CANDLE_VERSE,
  CANDLE_VERSE_CITE,
  canTakeCandle,
  candleStepLocked,
  isCandle,
} from '../nightWatch/candle'

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
  onBuyBright,
  showBright = false,
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
  /** True while walkers are on the road. Plant and the clear keep the full card. */
  midWave = false,
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
  onBuyBright?: () => void
  /** Round 7 and later. Earlier rounds keep the card as it was. */
  showBright?: boolean
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
  midWave?: boolean
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
  const label = isIncense(ability)
    ? INCENSE_LABEL
    : isCross(ability)
      ? CROSS_LABEL
      : isBell(ability)
        ? BELL_LABEL
        : isCandle(ability)
          ? CANDLE_LABEL
          : (WATCH_ABILITY_LABEL[ability] ?? 'Love')
  const plotTitle =
    CITY_PLOTS.find((plot) => plot.id === plotId)?.title ??
    (isFreeSpot(plotId) ? 'open ground' : plotId)
  const lessonCue = Boolean(
    easy &&
      !midWave &&
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

  if (easy && isCross(ability) && paths && onUpgradePath) {
    const cardH = 228
    const placed = placeTowerCard(point, board, clearOf, cameraScale, reserveBottom, cardH)
    const rank = crossRank(paths)
    const buy = canUpgradeCross(paths)
    const broke = buy.ok && sparks < buy.cost
    return (
      <div
        ref={cardRef}
        className={`defend-tower-card is-tree is-cross is-${placed.side}`}
        data-upgrade-card
        data-upgrade-tree="cross"
        data-cross-card="yes"
        data-cross-sooner={CROSS_SOONER[rank]}
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
        <p className="defend-cross-line" data-cross-card-line="yes">
          {CROSS_CARD}
          <span className="defend-candle-cite">{` ${CROSS_VERSE_CITE}`}</span>
        </p>
        <div className="defend-path" data-path="sooner" data-rank={rank}>
          <p className="defend-path-name">
            <span className="defend-path-title">Sooner</span>
            <span className="defend-path-line">Lamps beside it</span>
          </p>
          <div className="defend-path-pips">
            {CROSS_SOONER.map((sooner, index) => {
              const pct = Math.round(sooner * 100)
              const filled = rank >= index
              const next = buy.ok && index === rank + 1
              const className = `defend-path-pip${filled ? ' is-on' : ''}${next ? ' is-buy' : ''}`
              if (next) {
                return (
                  <button
                    key={pct}
                    type="button"
                    className={className}
                    disabled={broke}
                    data-step={index + 1}
                    data-cost={buy.cost}
                    data-cross-step={pct}
                    aria-label={`Sooner ${pct} percent, ${buy.cost} sparks`}
                    onPointerDown={(event) => {
                      event.stopPropagation()
                      if (!broke) onArmPathBuy?.('strong')
                    }}
                    onClick={(event) => {
                      event.stopPropagation()
                      if (!broke) onUpgradePath('strong', true)
                    }}
                  >
                    {`${pct}%`}
                  </button>
                )
              }
              return (
                <span key={pct} className={className} data-step={index + 1} data-cross-step={pct}>
                  {`${pct}%`}
                </span>
              )
            })}
          </div>
          {buy.ok ? (
            <button
              type="button"
              className="btn primary defend-path-buy"
              disabled={broke}
              data-path-buy="sooner"
              data-cost={buy.cost}
              onPointerDown={(event) => {
                event.stopPropagation()
                if (!broke) onArmPathBuy?.('strong')
              }}
              onClick={(event) => {
                event.stopPropagation()
                if (!broke) onUpgradePath('strong', true)
              }}
            >
              {broke ? `Need ${buy.cost}` : `${buy.cost}✦`}
            </button>
          ) : (
            <p className="defend-path-lock" data-path-lock="sooner">
              {buy.reason}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (easy && isBell(ability) && paths && onUpgradePath) {
    const cardH = 228
    const placed = placeTowerCard(point, board, clearOf, cameraScale, reserveBottom, cardH)
    const rank = bellRank(paths)
    const buy = canUpgradeBell(paths)
    const broke = buy.ok && sparks < buy.cost
    return (
      <div
        ref={cardRef}
        className={`defend-tower-card is-tree is-bell is-${placed.side}`}
        data-upgrade-card
        data-upgrade-tree="bell"
        data-bell-card="yes"
        data-bell-slow={BELL_SLOW[rank]}
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
        <p className="defend-bell-line" data-bell-card-line="yes">
          {BELL_CARD}
          <span className="defend-candle-cite">{` ${BELL_VERSE_CITE}`}</span>
        </p>
        <div className="defend-path" data-path="slow" data-rank={rank}>
          <p className="defend-path-name">
            <span className="defend-path-title">Slow</span>
            <span className="defend-path-line">Walkers in the ring</span>
          </p>
          <div className="defend-path-pips">
            {BELL_SLOW.map((slow, index) => {
              const pct = Math.round(slow * 100)
              const filled = rank >= index
              const next = buy.ok && index === rank + 1
              const className = `defend-path-pip${filled ? ' is-on' : ''}${next ? ' is-buy' : ''}`
              if (next) {
                return (
                  <button
                    key={pct}
                    type="button"
                    className={className}
                    disabled={broke}
                    data-step={index + 1}
                    data-cost={buy.cost}
                    data-bell-step={pct}
                    aria-label={`Slow ${pct} percent, ${buy.cost} sparks`}
                    onPointerDown={(event) => {
                      event.stopPropagation()
                      if (!broke) onArmPathBuy?.('strong')
                    }}
                    onClick={(event) => {
                      event.stopPropagation()
                      if (!broke) onUpgradePath('strong', true)
                    }}
                  >
                    {`${pct}%`}
                  </button>
                )
              }
              return (
                <span key={pct} className={className} data-step={index + 1} data-bell-step={pct}>
                  {`${pct}%`}
                </span>
              )
            })}
          </div>
          {buy.ok ? (
            <button
              type="button"
              className="btn primary defend-path-buy"
              disabled={broke}
              data-path-buy="slow"
              data-cost={buy.cost}
              onPointerDown={(event) => {
                event.stopPropagation()
                if (!broke) onArmPathBuy?.('strong')
              }}
              onClick={(event) => {
                event.stopPropagation()
                if (!broke) onUpgradePath('strong', true)
              }}
            >
              {broke ? `Need ${buy.cost}` : `${buy.cost}✦`}
            </button>
          ) : (
            <p className="defend-path-lock" data-path-lock="slow">
              {buy.reason}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (easy && isIncense(ability) && paths && onUpgradePath) {
    const cardH = 228
    const placed = placeTowerCard(point, board, clearOf, cameraScale, reserveBottom, cardH)
    const rank = incenseRank(paths)
    const buy = canUpgradeIncense(paths)
    const broke = buy.ok && sparks < buy.cost
    return (
      <div
        ref={cardRef}
        className={`defend-tower-card is-tree is-incense is-${placed.side}`}
        data-upgrade-card
        data-upgrade-tree="incense"
        data-incense-card="yes"
        data-incense-tap={INCENSE_TAP[rank]}
        data-incense-linger={incenseLinger(rank)}
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
        <p className="defend-incense-line" data-incense-card-line="yes">
          {INCENSE_CARD}
          <span className="defend-candle-cite">{` ${INCENSE_VERSE_CITE}`}</span>
        </p>
        <div className="defend-path" data-path="tap" data-rank={rank}>
          <p className="defend-path-name">
            <span className="defend-path-title">Tap</span>
            <span className="defend-path-line">Inside the cloud</span>
          </p>
          <div className="defend-path-pips">
            {INCENSE_TAP.map((bonus, index) => {
              const filled = rank >= index
              const next = buy.ok && index === rank + 1
              const className = `defend-path-pip${filled ? ' is-on' : ''}${next ? ' is-buy' : ''}`
              if (next) {
                return (
                  <button
                    key={index}
                    type="button"
                    className={className}
                    disabled={broke}
                    data-step={index + 1}
                    data-cost={buy.cost}
                    data-incense-step={bonus}
                    aria-label={`Tap plus ${bonus}, ${buy.cost} sparks`}
                    onPointerDown={(event) => {
                      event.stopPropagation()
                      if (!broke) onArmPathBuy?.('strong')
                    }}
                    onClick={(event) => {
                      event.stopPropagation()
                      if (!broke) onUpgradePath('strong', true)
                    }}
                  >
                    {`+${bonus}`}
                  </button>
                )
              }
              return (
                <span key={index} className={className} data-step={index + 1} data-incense-step={bonus}>
                  {`+${bonus}`}
                </span>
              )
            })}
          </div>
          {buy.ok ? (
            <button
              type="button"
              className="btn primary defend-path-buy"
              disabled={broke}
              data-path-buy="tap"
              data-cost={buy.cost}
              onPointerDown={(event) => {
                event.stopPropagation()
                if (!broke) onArmPathBuy?.('strong')
              }}
              onClick={(event) => {
                event.stopPropagation()
                if (!broke) onUpgradePath('strong', true)
              }}
            >
              {broke ? `Need ${buy.cost}` : `${buy.cost}✦`}
            </button>
          ) : (
            <p className="defend-path-lock" data-path-lock="tap">
              {buy.reason}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (easy && isCandle(ability) && paths && onUpgradePath) {
    const cardH = 196
    const placed = placeTowerCard(point, board, clearOf, cameraScale, reserveBottom, cardH)
    const pipCosts = [TREE_STEP_COST[0], TREE_STEP_COST[1]]
    return (
      <div
        ref={cardRef}
        className={`defend-tower-card is-tree is-candle is-${placed.side}`}
        data-upgrade-card
        data-upgrade-tree="candle"
        data-candle-card="yes"
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
        <p className="defend-candle-line" data-candle-card-line="yes">
          {CANDLE_CARD}
        </p>
        <p className="defend-candle-verse">
          {CANDLE_VERSE}
          <span className="defend-candle-cite">{` ${CANDLE_VERSE_CITE}`}</span>
        </p>
        <p className="defend-candle-help">{CANDLE_HELP}</p>
        {TREE_PATHS.map((path) => {
          const rank = paths[path]
          const buy = canTakeCandle(paths, path)
          const broke = buy.ok && sparks < buy.cost
          return (
            <div key={path} className="defend-path" data-path={path} data-rank={rank}>
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
                  const locked = candleStepLocked(paths, path, step)
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
                    <span key={step} className={className} data-step={step} data-cost={stepCost}>
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
              ) : (
                <p className="defend-path-lock" data-path-lock={path}>
                  {buy.reason || CANDLE_LOCK}
                </p>
              )}
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

  if (easy && paths && onUpgradePath) {
    return (
      <div
        ref={cardRef}
        className={`defend-tower-card is-tree is-${placed.side}`}
        data-upgrade-card
        data-upgrade-tree="yes"
        data-mid-wave={midWave ? 'yes' : undefined}
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
          const late = lateStepOpen(gate)
          const pipCosts = [...TREE_STEP_COST, TREE_BONUS_COST]
          if (late && rank >= TREE_BONUS_MAX) pipCosts.push(TREE_LATE_COST)
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
                  if (!wavePipVisible(step, rank, buy.ok, midWave)) return null
                  const filled = rank >= step
                  const next = buy.ok && step === rank + 1
                  const locked = !next && (stepLocked(paths, path, step) || (lessonLocked && step === rank + 1))
                  const shownCost = next ? buy.cost : stepCost
                  const className = `defend-path-pip${filled ? ' is-on' : ''}${locked ? ' is-locked' : ''}${next ? ' is-buy' : ''}`
                  if (next) {
                    return (
                      <button
                        key={step}
                        type="button"
                        className={className}
                        disabled={broke}
                        data-step={step}
                        data-cost={shownCost}
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
                        {shownCost}
                      </button>
                    )
                  }
                  return (
                    <span
                      key={step}
                      className={className}
                      data-step={step}
                      data-cost={shownCost}
                      data-locked={locked ? 'yes' : undefined}
                    >
                      {shownCost}
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
              ) : lessonLocked && !midWave ? (
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
              ) : lessonLocked ? null : (
                <p className="defend-path-lock" data-path-lock={path}>
                  {buy.reason}
                </p>
              )}
              {buy.ok && stepLocked(paths, path, 2) && !(late && rank === 1) ? (
                <p className="defend-path-lock" data-path-lock={path}>
                  {TREE_LOCK}
                </p>
              ) : null}
            </div>
          )
        })}
        {showBright && paths && (paths.bright ?? 0) >= 1 ? (
          <p className="defend-bright-on" data-bright="on">
            Bright
          </p>
        ) : null}
        {showBright && paths && canBuyBright(paths).ok ? (
          <button
            type="button"
            className="btn defend-bright-buy"
            data-bright-buy="yes"
            data-cost={BRIGHT_COST}
            disabled={sparks < BRIGHT_COST}
            onClick={(event) => {
              event.stopPropagation()
              if (sparks >= BRIGHT_COST) onBuyBright?.()
            }}
          >
            {sparks < BRIGHT_COST ? `Bright · Need ${BRIGHT_COST}` : `Bright · ${BRIGHT_COST}✦`}
            <span className="defend-bright-line">{BRIGHT_LINE}</span>
          </button>
        ) : null}
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
