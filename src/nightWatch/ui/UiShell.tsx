import type { ReactNode } from 'react'

export interface UiShellProps {
  shake: boolean
  won: boolean
  /** Top chrome bar, left: hearts / TAP count. */
  hud?: ReactNode
  /** Top chrome bar, right: coin read of an existing counter. */
  coin?: ReactNode
  /** Left chrome orb over the playfield corner: money balloon read. */
  balloon?: ReactNode
  /** Playfield (the board). */
  children: ReactNode
  /** Right-edge cutaway floating over the full-width frame: the C&C ability dock. */
  rail?: ReactNode
  /** Overlaid on the playfield's bottom-left corner: lost card, toast, plant CTA, tip, helper sticker. */
  docks?: ReactNode
}

/**
 * Purple night chrome (A2 plate): top HUD bar, full-width map playfield, right C&C
 * cutaway over the map, left money balloon. Docks float on the stage so no footer
 * steals map height and no rail column steals map width.
 * Hosts slots only; owns no combat state.
 */
export function UiShell({ shake, won, hud, coin, balloon, children, rail, docks }: UiShellProps) {
  return (
    <div className="nw-shell">
      {hud || coin ? (
        <div className="nw-hud">
          {hud}
          {coin}
        </div>
      ) : null}
      <div className="nw-stage">
        <div className={`defend-frame ${shake ? 'is-shake' : ''} ${won ? 'is-clear' : ''}`}>
          {children}
          {balloon ? <div className="nw-balloon-slot">{balloon}</div> : null}
          {docks ? <div className="nw-docks">{docks}</div> : null}
        </div>
        {rail ? <div className="nw-rail">{rail}</div> : null}
      </div>
    </div>
  )
}
