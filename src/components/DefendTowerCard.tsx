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
  onPull,
  onClose,
  levelBurst = null,
  clearOf = [],
  cameraScale = 0.55,
}: {
  plotId: CityPlotId
  ability: string
  runTier: Record<string, number>
  sparks: number
  point: TowerCardPoint
  board: { w: number; h: number }
  onUpgrade: () => void
  /** Plant and between waves. Hidden while walkers are on the road. */
  onPull?: () => void
  onClose: () => void
  /** I→II / II→III while the level-up burst plays. */
  levelBurst?: LevelBurst | null
  /** Other planted lamps. The card moves so a tap can still reach them. */
  clearOf?: readonly TowerCardPoint[]
  /** Board camera scale. Lamp hits are viewBox units times this. */
  cameraScale?: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const tier = combatTier(ability, runTier)
  const maxed = tier >= TOOL_TIER_MAX
  const cost = boostCost(tier)
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
          −1✦
        </span>
      ) : null}
      <p className="defend-tower-gain">{maxed ? 'As strong as it gets' : 'Range ↑  ·  Damage ↑'}</p>
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
          Need a spark
        </p>
      ) : null}
    </div>
  )
}
