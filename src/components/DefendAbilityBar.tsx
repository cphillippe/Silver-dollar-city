import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { easyFacingLine, loveHowTo } from '../lib/easy'
import { learningForTool } from '../lib/learning'
import { LAMP_DRAG_START_PX } from '../lib/lampPlace'
import {
  boostCost,
  combatTier,
  EASY_LAMP_COST,
  easyTierCost,
  TIER_MARK,
  TOOL_TIER_MAX,
  WATCH_TOOLS,
} from '../lib/watchTools'
import { cheapestOpen, pathBadge, pathsOf, type LampPaths } from '../nightWatch/upgradeTree'
import { AbilityMark } from './GemMark'
import type { ProgressState } from '../types'
import type { WatchAbility } from '../lib/defend'

export type LampDragPhase = 'move' | 'drop' | 'cancel'

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
  /** Easy tree ranks. Hard ignores this. */
  runPaths?: Record<string, LampPaths>
  /** Sparks this night. At 0, between-wave column spend is not a live Tap. */
  sparks: number
  /** Between waves, a tap spends sparks. Mid-wave a tap only selects. */
  boosting: boolean
  /** Easy plant: the picked card is the one a map tap will place. */
  placing?: boolean
  /** Easy plant: slide off the card to move a ghost. A short tap still selects. */
  onLampDrag?: (phase: LampDragPhase, ability: WatchAbility, clientX: number, clientY: number) => void
  /** True from press to release so a map tap does not place during the slide. */
  onCardPress?: (down: boolean) => void
  /** After Begin, an unplanted card arms a paid plant instead of an upgrade. */
  paidPlace?: boolean
  /** Type armed for a paid plant. Empty during the free opening plant. */
  lampArmed?: string | null
  onArmPlace?: (id: WatchAbility) => void
  onBoost: (id: WatchAbility) => void
  /** Easy: a planted card opens the path panel instead of spending immediately. */
  onOpenTree?: (id: WatchAbility) => void
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
  runPaths,
  sparks,
  boosting,
  placing = false,
  onLampDrag,
  onCardPress,
  paidPlace = false,
  lampArmed = null,
  onArmPlace,
  onBoost,
  onOpenTree,
}: DefendAbilityBarProps) {
  const swallowClick = useRef(false)
  const stopListen = useRef<(() => void) | null>(null)
  const [dragFrom, setDragFrom] = useState<WatchAbility | null>(null)
  const onLampDragRef = useRef(onLampDrag)
  const onCardPressRef = useRef(onCardPress)
  const onArmPlaceRef = useRef(onArmPlace)
  onLampDragRef.current = onLampDrag
  onCardPressRef.current = onCardPress
  onArmPlaceRef.current = onArmPlace

  useEffect(() => () => stopListen.current?.(), [])

  function trackCard(
    event: ReactPointerEvent<HTMLButtonElement>,
    ability: WatchAbility,
    open: boolean,
    placed: boolean,
  ) {
    if (!placing || !open) return
    // A planted card between waves still upgrades. An unplanted card can be dragged into a paid plant.
    if (paidPlace && placed) return
    if (boosting && !paidPlace) return
    if (paidPlace) onArmPlaceRef.current?.(ability)
    if (event.pointerType === 'mouse' && event.button !== 0) return
    stopListen.current?.()
    const start = {
      pointerId: event.pointerId,
      ability,
      x: event.clientX,
      y: event.clientY,
      moved: false,
    }
    let done = false
    swallowClick.current = false
    onCardPressRef.current?.(true)
    const finish = (ev: PointerEvent, drop: boolean) => {
      if (done || ev.pointerId !== start.pointerId) return
      done = true
      stopListen.current?.()
      stopListen.current = null
      setDragFrom((current) => (current === ability ? null : current))
      onCardPressRef.current?.(false)
      if (!start.moved) {
        // A touch tap may not emit click. Selecting here keeps the short tap.
        setToolLock(null)
        setAbility(start.ability)
        return
      }
      swallowClick.current = true
      if (ev.cancelable) ev.preventDefault()
      ev.stopPropagation()
      onLampDragRef.current?.(drop ? 'drop' : 'cancel', start.ability, ev.clientX, ev.clientY)
    }
    const move = (ev: PointerEvent) => {
      if (done || ev.pointerId !== start.pointerId) return
      const dx = ev.clientX - start.x
      const dy = ev.clientY - start.y
      if (!start.moved && dx * dx + dy * dy < LAMP_DRAG_START_PX * LAMP_DRAG_START_PX) return
      if (!start.moved) {
        start.moved = true
        setDragFrom(ability)
      }
      if (ev.cancelable) ev.preventDefault()
      onLampDragRef.current?.('move', start.ability, ev.clientX, ev.clientY)
    }
    const up = (ev: PointerEvent) => finish(ev, true)
    const cancel = (ev: PointerEvent) => finish(ev, false)
    const opts: AddEventListenerOptions = { capture: true, passive: false }
    window.addEventListener('pointermove', move, opts)
    window.addEventListener('pointerup', up, opts)
    window.addEventListener('pointercancel', cancel, opts)
    stopListen.current = () => {
      window.removeEventListener('pointermove', move, opts)
      window.removeEventListener('pointerup', up, opts)
      window.removeEventListener('pointercancel', cancel, opts)
    }
  }

  return (
          <div className="defend-abilities" role="group" aria-label="Night abilities">
            {WATCH_TOOLS.map((tool) => {
              // Easy plants every type from Wave 1. Face-tap miss stays on walkers.
              const open = easy || unlocked.includes(tool.id)
              const placed = plantedTypes.includes(tool.id)
              const heldLine = learningForTool(progress, tool.id)
              const tier = combatTier(tool.id, runTier)
              const tree = easy ? pathsOf(runPaths, tool.id) : null
              const openStep = tree ? cheapestOpen(tree) : null
              const stepCost = tree ? (openStep?.cost ?? 0) : easy ? easyTierCost(tier) : boostCost(tier)
              const brokeWord = stepCost > 1 ? `Need ${stepCost} sparks` : 'Need a spark'
              const shopNew = paidPlace && !placed
              const treeFull = Boolean(tree && !openStep)
              const spendDry =
                boosting &&
                open &&
                (!easy || placed) &&
                (tree ? Boolean(openStep) && sparks < stepCost : tier < TOOL_TIER_MAX && sparks < stepCost)
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
                  className={`defend-ability ${ability === tool.id ? 'is-on' : ''} ${open ? '' : 'is-locked'} ${placed ? 'is-placed' : ''} ${firing && firingId === tool.id ? 'is-firing' : ''} ${spendDry ? 'is-spark-dry' : ''}`}
                  data-type={tool.id}
                  data-lamp-selected={
                    lampArmed === tool.id || (!paidPlace && placing && ability === tool.id) ? 'yes' : undefined
                  }
                  data-dragging={dragFrom === tool.id ? 'yes' : undefined}
                  data-slot={open ? (placed ? 0 : 1) : undefined}
                  data-spark-dry={spendDry ? 'yes' : undefined}
                  aria-pressed={ability === tool.id}
                  title={spendDry ? `${claim} Need a spark.` : claim}
                  disabled={spendDry}
                  style={placing && open ? { touchAction: 'none' } : undefined}
                  onPointerDown={(event) => trackCard(event, tool.id, open, placed)}
                  onClick={() => {
                    if (swallowClick.current) {
                      swallowClick.current = false
                      return
                    }
                    if (!open) {
                      setToolLock(
                        `${tool.label} is locked. Lock in a matching line to deploy this tool.`,
                      )
                      return
                    }
                      if (boosting) {
                      if (easy && !placed) {
                        setToolLock(null)
                        setAbility(tool.id)
                        onArmPlace?.(tool.id)
                        return
                      }
                      if (easy && placed) {
                        setToolLock(null)
                        onOpenTree?.(tool.id)
                        return
                      }
                      onBoost(tool.id)
                      return
                    }
                    setToolLock(null)
                    setAbility(tool.id)
                    if (paidPlace) onArmPlace?.(tool.id)
                  }}
                >
                  <AbilityMark ability={tool.id} size="md" />
                  <span className="defend-ability-label">{tool.label}</span>
                  <span className="defend-ability-tier" aria-hidden>
                    {tree ? pathBadge(tree) || '·' : TIER_MARK[tier]}
                  </span>
                  {open && !placed ? (
                    <span className={`defend-ability-stock${shopNew ? ' is-price' : ''}`} data-slot-badge="1">
                      {shopNew ? `${EASY_LAMP_COST}✦` : '1'}
                    </span>
                  ) : null}
                  {boosting && open ? (
                    <span className="defend-ability-boost" aria-hidden>
                      {shopNew
                        ? `${EASY_LAMP_COST}✦`
                        : treeFull
                          ? 'Full'
                          : tier >= TOOL_TIER_MAX && !tree
                            ? 'Max'
                          : sparks < stepCost
                            ? brokeWord
                            : easy
                              ? 'Paths'
                              : '↑ spark'}
                    </span>
                  ) : null}
                  <span className="defend-ability-claim">
                    {claim}
                    {open ? (placed ? ' Planted.' : shopNew ? ` ${EASY_LAMP_COST} sparks to plant.` : ' 1 to plant.') : ''}
                    {spendDry ? ' Need a spark.' : ''}
                  </span>
                </button>
              )
            })}
          </div>
  )
}
