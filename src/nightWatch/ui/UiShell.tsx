import type { ReactNode } from 'react'

export interface UiShellProps {
  shake: boolean
  won: boolean
  /** Top of the frame: hearts / count / helper stickers. */
  hud?: ReactNode
  /** Playfield (the board). */
  children: ReactNode
  /** Below the frame, in order: plant CTA, toast, Love / ability dock. */
  docks?: ReactNode
}

/** Purple night frame. Hosts the playfield and docks; owns no combat state. */
export function UiShell({ shake, won, hud, children, docks }: UiShellProps) {
  return (
    <>
      <div className={`defend-frame ${shake ? 'is-shake' : ''} ${won ? 'is-clear' : ''}`}>
        {hud}
        {children}
      </div>
      {docks}
    </>
  )
}
