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
  /** Right rail beside the frame: the C&C ability dock. */
  rail?: ReactNode
  /** Below the stage, in order: helper sticker, plant CTA, toast. */
  docks?: ReactNode
}

/**
 * Purple night chrome (A2 plate): top HUD bar, map-first playfield, right C&C rail,
 * left money balloon. Hosts slots only; owns no combat state.
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
        </div>
        {rail ? <div className="nw-rail">{rail}</div> : null}
      </div>
      {docks}
    </div>
  )
}
