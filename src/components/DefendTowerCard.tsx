import { useEffect, useRef } from 'react'
import { CITY_PLOTS, type CityPlotId } from '../lib/city'
import { isFreeSpot } from '../lib/lampPlace'
import { WATCH_ABILITY_LABEL } from '../lib/defend'
import {
  placeTowerCard,
  TOWER_CARD_W,
  type TowerCardPoint,
} from '../lib/towerCardPlace'
import { boostCost, combatTier, TIER_MARK, TOOL_TIER_MAX } from '../lib/watchTools'
import {
  canTake,
  PATH_LABEL,
  PATH_LINE,
  stepLocked,
  TREE_LOCK,
  TREE_PATHS,
  TREE_STEP_COST,
  type LampPaths,
  type TreePath,
} from '../nightWatch/upgradeTree'

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
  paths,
  onPull,
  onClose,
  levelBurst = null,
  clearOf = [],
  cameraScale = 0.55,
  roadNote = '',
  /** Easy uses the scaled tier prices. Hard stays at one spark. */
  easy = false,
}: {
  plotId: CityPlotId
  ability: string
  runTier: Record<string, number>
  sparks: number
  point: TowerCardPoint
  board: { w: number; h: number }
  onUpgrade: () => void
  /** Easy tree. Hard keeps the single Upgrade button. */
  onUpgradePath?: (path: TreePath) => void
  paths?: LampPaths
  /** Plant and between waves. Hidden while walkers are on the road. */
  onPull?: () => void
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
}) {
  const cardRef = useRef<HTMLDivElement>(null)
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
  const placed = placeTowerCard(point, board, clearOf, cameraScale)
  const levelLine = maxed ? TIER_MARK[tier] : `${TIER_MARK[next]} · ${cost}✦`
  const bursting = Boolean(levelBurst && levelBurst.to > levelBurst.from)
  const fromMark = bursting ? TIER_MARK[levelBurst!.from] : ''
  const toMark = bursting ? TIER_MARK[levelBurst!.to] : ''

  useEffect(() => {
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
            onClick={onPull}
          >
            <svg className="defend-tower-trash" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M9 3h6l1 2h5v2H3V5h5l1-2zm-2 6h2v10H7V9zm4 0h2v10h-2V9zm4 0h2v10h-2V9z"
              />
            </svg>
          </button>
        ) : null}
        <p className="defend-tower-tool">{label}</p>
        {TREE_PATHS.map((path) => {
          const rank = paths[path]
          const buy = canTake(paths, path)
          const broke = buy.ok && sparks < buy.cost
          return (
            <div key={path} className="defend-path" data-path={path} data-rank={rank}>
              <p className="defend-path-name">
                {PATH_LABEL[path]}
                <span className="defend-path-line">{PATH_LINE[path]}</span>
              </p>
              <div className="defend-path-pips" aria-hidden="true">
                {TREE_STEP_COST.map((stepCost, index) => {
                  const step = index + 1
                  const filled = rank >= step
                  const locked = stepLocked(paths, path, step)
                  return (
                    <span
                      key={stepCost}
                      className={`defend-path-pip${filled ? ' is-on' : ''}${locked ? ' is-locked' : ''}`}
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
                  onClick={(event) => {
                    event.stopPropagation()
                    onUpgradePath(path)
                  }}
                >
                  {broke ? `Need ${buy.cost}` : `${buy.cost}✦`}
                </button>
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
          onClick={onPull}
        >
          <svg className="defend-tower-trash" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M9 3h6l1 2h5v2H3V5h5l1-2zm-2 6h2v10H7V9zm4 0h2v10h-2V9zm4 0h2v10h-2V9z"
            />
          </svg>
        </button>
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
