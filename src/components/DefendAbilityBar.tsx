import { EASY, easyFacingLine, loveHowTo } from '../lib/easy'
import { learningForTool } from '../lib/learning'
import { TIER_MARK, toolTier, WATCH_TOOLS } from '../lib/watchTools'
import { AbilityMark } from './GemMark'
import type { ProgressState } from '../types'
import type { WatchAbility } from '../lib/defend'

export interface DefendAbilityBarProps {
  progress: ProgressState
  easy: boolean
  easyTap: boolean
  ability: WatchAbility
  setAbility: (a: WatchAbility) => void
  setToolLock: (s: string | null) => void
  firing: boolean
  unlocked: WatchAbility[]
}

export function DefendAbilityBar({
  progress,
  easy,
  easyTap,
  ability,
  setAbility,
  setToolLock,
  firing,
  unlocked,
}: DefendAbilityBarProps) {
  return (
          <div className="defend-abilities" role="group" aria-label="Night abilities">
            {WATCH_TOOLS.map((tool) => {
              const open = unlocked.includes(tool.id)
              const heldLine = learningForTool(progress, tool.id)
              const tier = toolTier(tool, progress)
              return (
                <button
                  key={tool.id}
                  type="button"
                  className={`defend-ability ${ability === tool.id ? 'is-on' : ''} ${open ? '' : 'is-locked'} ${firing && ability === tool.id ? 'is-firing' : ''}`}
                  aria-pressed={ability === tool.id}
                  onClick={() => {
                    if (open) {
                      setToolLock(null)
                      setAbility(tool.id)
                      return
                    }
                    setToolLock(
                      easy
                        ? EASY.nightMiss
                        : `${tool.label} is locked. Lock in a matching line to deploy this tool.`,
                    )
                  }}
                >
                  <AbilityMark ability={tool.id} size="md" />
                  {tool.label}
                  {easyTap ? null : (
                    <span className="defend-ability-tier" aria-hidden>
                      {TIER_MARK[tier]}
                    </span>
                  )}
                  <span className="defend-ability-claim">
                    {open
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
                        : 'Lock in a matching line'}
                  </span>
                </button>
              )
            })}
          </div>
  )
}
