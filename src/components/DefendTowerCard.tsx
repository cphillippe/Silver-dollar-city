import { useEffect, useRef } from 'react'
import { CITY_PLOTS, type CityPlotId } from '../lib/city'
import { WATCH_ABILITY_LABEL } from '../lib/defend'
import { boostCost, combatTier, TIER_MARK, TOOL_TIER_MAX } from '../lib/watchTools'

export interface TowerCardPoint {
  left: number
  top: number
}

const CARD_W = 176
const CARD_H = 168
const RAIL = 72
const MARGIN = 8
const GAP = 28

/** Keep the upgrade card on the phone plate, beside the lamp, clear of the right rail. */
export function placeTowerCard(
  point: TowerCardPoint,
  board: { w: number; h: number },
): { left: number; top: number; side: 'above' | 'below' } {
  let top = point.top - CARD_H - GAP
  let side: 'above' | 'below' = 'above'
  if (top < MARGIN) {
    top = point.top + GAP
    side = 'below'
  }
  if (top + CARD_H > board.h - MARGIN) {
    top = Math.max(MARGIN, board.h - CARD_H - MARGIN)
    side = top + GAP < point.top ? 'above' : side
  }
  const left = Math.max(MARGIN, Math.min(point.left - CARD_W / 2, board.w - CARD_W - RAIL))
  return { left, top, side }
}

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
}: {
  plotId: CityPlotId
  ability: string
  runTier: Record<string, number>
  sparks: number
  point: TowerCardPoint
  board: { w: number; h: number }
  onUpgrade: () => void
  /** Plant step only. Hidden once the road is moving. */
  onPull?: () => void
  onClose: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const upgradeRef = useRef<HTMLButtonElement>(null)
  const tier = combatTier(ability, runTier)
  const maxed = tier >= TOOL_TIER_MAX
  const cost = boostCost(tier)
  const next = Math.min(TOOL_TIER_MAX, tier + 1)
  const canSpend = !maxed && sparks >= cost
  const label = WATCH_ABILITY_LABEL[ability] ?? 'Love'
  const plotTitle = CITY_PLOTS.find((plot) => plot.id === plotId)?.title ?? plotId
  const placed = placeTowerCard(point, board)
  const levelLine = maxed ? TIER_MARK[tier] : `${TIER_MARK[next]} · ${cost}✦`

  useEffect(() => {
    const node = canSpend ? upgradeRef.current : cardRef.current
    node?.focus({ preventScroll: true })
  }, [plotId, canSpend])

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
      className={`defend-tower-card is-${placed.side}`}
      data-upgrade-card
      data-tier={tier}
      data-next={maxed ? TIER_MARK[tier] : TIER_MARK[next]}
      data-cost={maxed ? 0 : cost}
      data-can-spend={canSpend ? 'yes' : 'no'}
      role="dialog"
      tabIndex={-1}
      aria-label={`Upgrade ${label} at ${plotTitle}`}
      style={{
        left: placed.left,
        top: placed.top,
        width: CARD_W,
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
      <p className="defend-tower-next" key={levelLine}>
        {levelLine}
      </p>
      <p className="defend-tower-gain">{maxed ? 'As strong as it gets' : 'Range ↑  ·  Damage ↑'}</p>
      {maxed ? null : (
        <button
          ref={upgradeRef}
          type="button"
          className="btn primary defend-tower-upgrade"
          disabled={!canSpend}
          onClick={onUpgrade}
        >
          Upgrade
        </button>
      )}
      {!maxed && !canSpend ? <p className="defend-tower-need">Need a spark</p> : null}
    </div>
  )
}
