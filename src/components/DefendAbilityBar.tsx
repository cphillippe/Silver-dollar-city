import { EASY, easyFacingLine, loveHowTo } from '../lib/easy'
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
  unlocked,
  runTier,
  boosting,
  onBoost,
}: DefendAbilityBarProps) {
  return (
          <div className="defend-abilities" role="group" aria-label="Night abilities">
            {WATCH_TOOLS.map((tool) => {
              const open = unlocked.includes(tool.id)
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
                : easy
                  ? 'Locked — tap the glowing face'
                  : 'Lock in a matching line'
              return (
                <button
                  key={tool.id}
                  type="button"
                  className={`defend-ability ${ability === tool.id ? 'is-on' : ''} ${open ? '' : 'is-locked'} ${firing && ability === tool.id ? 'is-firing' : ''}`}
                  aria-pressed={ability === tool.id}
                  title={claim}
                  onClick={() => {
                    if (!open) {
                      setToolLock(
                        easy
                          ? EASY.nightMiss
                          : `${tool.label} is locked. Lock in a matching line to deploy this tool.`,
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
                  {boosting && open ? (
                    <span className="defend-ability-boost" aria-hidden>
                      {tier >= 3 ? 'Max' : easy ? 'Tap' : '↑ spark'}
                    </span>
                  ) : null}
                  <span className="defend-ability-claim">{claim}</span>
                </button>
              )
            })}
          </div>
  )
}
