import {
  paceAria,
  paceFace,
  paceNote,
  paceRateLabel,
  paceScale,
  paceUnlocked,
} from '../lib/nightPace'

export interface NightPaceControlProps {
  waveIndex: number
  fastOn: boolean
  onToggle: () => void
}

/** Speed chip: locked until the unlock wave, then 1× available or 3× active. */
export function NightPaceControl({ waveIndex, fastOn, onToggle }: NightPaceControlProps) {
  const unlocked = paceUnlocked(waveIndex)
  const face = paceFace(unlocked, fastOn)
  const note = paceNote(face)
  return (
    <button
      type="button"
      className={`nw-pace is-${face}`}
      data-state={face}
      data-pace={paceScale(unlocked, fastOn)}
      aria-pressed={face === 'fast'}
      aria-disabled={face === 'locked'}
      aria-label={paceAria(face)}
      onClick={onToggle}
    >
      <span className="nw-pace-rate">{paceRateLabel(face)}</span>
      <span className="nw-pace-note">{note}</span>
    </button>
  )
}
