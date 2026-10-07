import stillArt from '../assets/skills/still.svg'
import mendArt from '../assets/skills/mend.svg'
import { KIT_IDS, KIT_LABEL, type KitId } from '../lib/nightKits'
import {
  SKILL_BLURB,
  SKILL_COOLDOWN_MS,
  SKILL_UNLOCK_WAVE,
  cooldownFill,
  secondsLeft,
  skillFace,
  skillStatusLabel,
  skillUnlocked,
} from '../lib/nightSkills'

const SKILL_ART: Record<KitId, string> = {
  still: stillArt,
  mend: mendArt,
}

export interface NightSkillTrayProps {
  waveIndex: number
  now: number
  readyAt: Record<KitId, number>
  pulseId?: KitId | null
  onCast: (id: KitId) => void
}

/** Skill manager: what it is, when it can be tapped, and the recharge ring. */
export function NightSkillTray({ waveIndex, now, readyAt, pulseId = null, onCast }: NightSkillTrayProps) {
  return (
    <>
      <div className="defend-kit-buys">
        {KIT_IDS.map((id) => {
          const unlocked = skillUnlocked(id, waveIndex)
          const face = skillFace(unlocked, readyAt[id], now)
          const status = skillStatusLabel(face, readyAt[id], now, SKILL_UNLOCK_WAVE[id])
          const fill = cooldownFill(readyAt[id], now, SKILL_COOLDOWN_MS[id])
          const secs = secondsLeft(readyAt[id], now)
          const ring = 2 * Math.PI * 16
          return (
            <button
              key={id}
              type="button"
              className={`btn defend-kit defend-kit-choice nw-skill is-${face}${pulseId === id ? ' is-fresh' : ''}`}
              data-skill={id}
              data-state={face}
              aria-label={`${KIT_LABEL[id]}. ${SKILL_BLURB[id]} ${status}.`}
              onClick={() => onCast(id)}
            >
              <span className="nw-skill-orb" aria-hidden="true">
                <img className="nw-skill-art" src={SKILL_ART[id]} alt="" draggable={false} />
                {face === 'cooling' ? <span className="nw-skill-count">{secs}</span> : null}
                {face === 'ready' ? <span className="nw-skill-count is-tap">TAP</span> : null}
                {face === 'locked' ? (
                  <span className="nw-skill-count is-lock">{SKILL_UNLOCK_WAVE[id] + 1}</span>
                ) : null}
                <svg className="nw-skill-ring" viewBox="0 0 36 36">
                  <circle className="nw-skill-ring-track" cx="18" cy="18" r="16" />
                  <circle
                    className="nw-skill-ring-fill"
                    cx="18"
                    cy="18"
                    r="16"
                    strokeDasharray={ring}
                    strokeDashoffset={face === 'ready' ? 0 : face === 'locked' ? ring : ring * fill}
                  />
                </svg>
              </span>
              <span className="defend-kit-name">{KIT_LABEL[id]}</span>
              <span className="defend-kit-cost">{status}</span>
            </button>
          )
        })}
      </div>
      <p className="nw-skill-hint">TAP means ready.</p>
    </>
  )
}
