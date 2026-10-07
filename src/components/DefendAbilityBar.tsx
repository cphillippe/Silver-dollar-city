import { easyFacingLine, loveHowTo } from '../lib/easy'
import { learningForTool } from '../lib/learning'
import { combatTier, TIER_MARK, WATCH_TOOLS } from '../lib/watchTools'
import { AbilityMark } from './GemMark'
import type { ProgressState } from '../types'
import type { WatchAbility } from '../lib/defend'

export interface DefendAbilityBarProps {
  progress: ProgressState
  easy: boolean
  ability: WatchAbility
  setAbility: (a: WatchAbility) => void
  setToolLock: (s: string | null) => void
  firing: boolean
  /** Type that just shot. The rail flash follows the tower, not the plant pick. */
  firingId?: string | null
  /** Types currently standing on the road. A missing type still has its 1 slot. */
  plantedTypes?: string[]
  unlocked: WatchAbility[]
  runTier: Record<string, number>
  /** Between waves, a tap spends sparks. Mid-wave a tap only selects. */
  boosting: boolean
  onBoost: (id: WatchAbility) => void
}

export function DefendAbilityBar({
  progress,
  easy,
  ability,
  setAbility,
  setToolLock,
  firing,
  firingId = null,
  plantedTypes = [],
  unlocked,
  runTier,
  boosting,
  onBoost,
}: DefendAbilityBarProps) {
  return (
          <div className="defend-abilities" role="group" aria-label="Night abilities">
            {WATCH_TOOLS.map((tool) => {
              // Easy plants every type from Wave 1. Face-tap miss stays on walkers.
              const open = easy || unlocked.includes(tool.id)
              const placed = plantedTypes.includes(tool.id)
              const heldLine = learningForTool(progress, tool.id)
              const tier = combatTier(tool.id, runTier)
              const claim = open
                ? tool.id === 'love'
                  ? loveHowTo(easy)
                  : heldLine
                    ? easy
                      ? easyFacingLine(heldLine.id, heldLine.claim)
                      : heldLine.claim
                    : easy
                      ? 'Keep a main idea to name this tool.'
                      : 'Lock in a line to name this tool.'
                : 'Lock in a matching line'
              return (
                <button
                  key={tool.id}
                  type="button"
                  className={`defend-ability ${ability === tool.id ? 'is-on' : ''} ${open ? '' : 'is-locked'} ${placed ? 'is-placed' : ''} ${firing && firingId === tool.id ? 'is-firing' : ''}`}
                  data-type={tool.id}
                  data-slot={open ? (placed ? 0 : 1) : undefined}
                  aria-pressed={ability === tool.id}
                  title={claim}
                  onClick={() => {
                    if (!open) {
                      setToolLock(
                        `${tool.label} is locked. Lock in a matching line to deploy this tool.`,
                      )
                      return
                    }
                    if (boosting) {
                      onBoost(tool.id)
                      return
                    }
                    setToolLock(null)
                    setAbility(tool.id)
                  }}
                >
                  <AbilityMark ability={tool.id} size="md" />
                  <span className="defend-ability-label">{tool.label}</span>
                  <span className="defend-ability-tier" aria-hidden>
                    {TIER_MARK[tier]}
                  </span>
                  {open && !placed ? (
                    <span className="defend-ability-stock" data-slot-badge="1">
                      1
                    </span>
                  ) : null}
                  {boosting && open ? (
                    <span className="defend-ability-boost" aria-hidden>
                      {tier >= 3 ? 'Max' : easy ? 'Tap' : '↑ spark'}
                    </span>
                  ) : null}
                  <span className="defend-ability-claim">
                    {claim}
                    {open ? (placed ? ' Planted.' : ' 1 to plant.') : ''}
                  </span>
                </button>
              )
            })}
          </div>
  )
}
