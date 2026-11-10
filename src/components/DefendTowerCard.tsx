import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { CITY_PLOTS, type CityPlotId } from '../lib/city'
import { isFreeSpot } from '../lib/lampPlace'
import { WATCH_ABILITY_LABEL } from '../lib/defend'
import {
  placeTowerCard,
  STRIP_H,
  STRIP_W,
  TOWER_CARD_H,
  TOWER_CARD_W,
  TOWER_TREE_H,
  TOWER_TREE_LESSON_H,
  stemShows,
  type TowerCardPoint,
  type TowerRect,
  type TowerTaps,
} from '../lib/towerCardPlace'
import { mapGlyphRect } from '../nightWatch/lampGlyphPlace'
import { lampGlyphStage } from '../nightWatch/lampGlyph'
import { LampUpgradeGlyph } from './LampUpgradeGlyph'
import { boostCost, combatTier, TIER_MARK, TOOL_TIER_MAX } from '../lib/watchTools'
import {
  BRIGHT_COST,
  BRIGHT_LINE,
  canBuyBright,
  canTake,
  LESSON_LOCK,
  PATH_LABEL,
  PATH_LINE,
  stepLocked,
  TREE_BONUS_COST,
  TREE_LOCK,
  TREE_PATHS,
  TREE_BONUS_MAX,
  TREE_LATE_COST,
  TREE_STEP_COST,
  lateStepOpen,
  wavePipVisible,
  type BonusGate,
  type LampPaths,
  type TreePath,
} from '../nightWatch/upgradeTree'
import {
  BELL_CARD,
  BELL_LABEL,
  BELL_VERSE_CITE,
  BELL_SLOW,
  bellRank,
  canUpgradeBell,
  isBell,
} from '../nightWatch/bell'
import {
  INCENSE_CARD,
  INCENSE_LABEL,
  INCENSE_TAP,
  INCENSE_VERSE_CITE,
  canUpgradeIncense,
  incenseLinger,
  incenseRank,
  isIncense,
} from '../nightWatch/incense'
import {
  CROSS_CARD,
  CROSS_LABEL,
  CROSS_SOONER,
  CROSS_VERSE_CITE,
  canUpgradeCross,
  crossRank,
  isCross,
} from '../nightWatch/cross'
import {
  CANDLE_CARD,
  CANDLE_HELP,
  CANDLE_LABEL,
  CANDLE_LOCK,
  CANDLE_VERSE,
  CANDLE_VERSE_CITE,
  canTakeCandle,
  candleStepLocked,
  isCandle,
} from '../nightWatch/candle'

function PathMark({ path }: { path: TreePath }) {
  if (path === 'far') {
    return (
      <svg className="defend-path-mark" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="2" fill="currentColor" />
        <path d="M8 1.6a6.4 6.4 0 0 1 0 12.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 4.2a3.8 3.8 0 0 1 0 7.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    )
  }
  return (
    <svg className="defend-path-mark" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 1.2 9.5 5.8 14.2 6.1 10.6 9.1 11.8 13.8 8 11.2 4.2 13.8 5.4 9.1 1.8 6.1 6.5 5.8Z"
        fill="currentColor"
      />
    </svg>
  )
}

/** Boxes the card must keep off, in the card's own offset parent (the frame). Null when the card is not placed yet. */
function measureTaps(card: HTMLElement, plotId: string): TowerTaps | null {
  const parent = card.offsetParent
  if (!(parent instanceof HTMLElement)) return null
  const origin = parent.getBoundingClientRect()
  const ox = origin.left + parent.clientLeft
  const oy = origin.top + parent.clientTop
  const rect = (el: Element): TowerRect | null => {
    const style = getComputedStyle(el)
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return null
    const box = el.getBoundingClientRect()
    if (box.width < 1 || box.height < 1) return null
    return { left: box.left - ox, top: box.top - oy, right: box.right - ox, bottom: box.bottom - oy }
  }
  const one = (sel: string) => {
    const el = document.querySelector(sel)
    return el ? rect(el) : null
  }
  const many = (sel: string) =>
    [...document.querySelectorAll(sel)].map(rect).filter((box): box is TowerRect => box !== null)
  const kit = many('.defend-kits button')
  const clear = many('.defend-clear-row button')
  const begin = one('.defend-go')
  // The bottom row: Begin, the skill kit, Continue. The New lamp buttons stand in their own column.
  const rows = [begin, ...kit, ...many('.defend-continue')].filter((box): box is TowerRect => box !== null)
  const open = document.querySelector('.defend-pad.is-upgrade-open')
  const pads = [...document.querySelectorAll('.defend-pad.is-planted')].filter((pad) => pad !== open)
  const lamps: TowerRect[] = []
  for (const pad of pads) {
    const parts = [...pad.querySelectorAll('.defend-lamp-sprite, image.defend-type-mark')]
      .map(rect)
      .filter((box): box is TowerRect => box !== null)
    if (parts.length === 0) continue
    lamps.push({
      left: Math.min(...parts.map((box) => box.left)),
      top: Math.min(...parts.map((box) => box.top)),
      right: Math.max(...parts.map((box) => box.right)),
      bottom: Math.max(...parts.map((box) => box.bottom)),
    })
  }
  const chips = [...document.querySelectorAll('.defend-type-chip')]
  return {
    begin,
    rail: one('.nw-rail'),
    buttons: [
      ...many('.nw-rail .defend-ability'),
      ...clear,
      ...kit,
      ...many('.defend-new-lamp'),
      ...many('.nw-cam-recenter'),
    ],
    row: rows.length ? Math.min(...rows.map((box) => box.top)) : null,
    own: [
      ...(open ? [...open.querySelectorAll('text.defend-type-label')].map(rect) : []),
      ...chips.filter((chip) => chip.getAttribute('data-chip-plot') === plotId).map(rect),
    ].filter((box): box is TowerRect => box !== null),
    lamps,
    labels: [
      ...pads.flatMap((pad) => [...pad.querySelectorAll('text.defend-type-label')].map(rect)),
      ...chips.filter((chip) => chip.getAttribute('data-chip-plot') !== plotId).map(rect),
    ].filter((box): box is TowerRect => box !== null),
  }
}

function sameRect(a: TowerRect | null, b: TowerRect | null): boolean {
  if (!a || !b) return a === b
  return (
    Math.abs(a.left - b.left) < 0.25 &&
    Math.abs(a.top - b.top) < 0.25 &&
    Math.abs(a.right - b.right) < 0.25 &&
    Math.abs(a.bottom - b.bottom) < 0.25
  )
}

function sameRects(a: readonly TowerRect[] = [], b: readonly TowerRect[] = []): boolean {
  return a.length === b.length && a.every((box, index) => sameRect(box, b[index]))
}

function sameTaps(a: TowerTaps | null, b: TowerTaps | null): boolean {
  if (!a || !b) return a === b
  return (
    sameRect(a.begin, b.begin) &&
    sameRect(a.rail, b.rail) &&
    sameRects(a.buttons, b.buttons) &&
    (a.row ?? null) === (b.row ?? null) &&
    sameRects(a.own, b.own) &&
    sameRects(a.lamps, b.lamps) &&
    sameRects(a.labels, b.labels)
  )
}

function rectsHit(
  a: { left: number; top: number; right: number; bottom: number },
  b: { left: number; top: number; right: number; bottom: number },
): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
}

/**
 * True when another lamp's name sits on the mark.
 * Neighbour type labels are hard obstacles: a mounted glyph-top copy does not clear them.
 * Glyph-top only clears other lamp art, and only while that layer is mounted.
 */
function labelOverGlyph(glyph: { left: number; top: number; right: number; bottom: number } | null, taps: TowerTaps | null, mountedAbove: boolean): boolean {
  if (!glyph || !taps) return false
  const hit = (box: TowerRect) => rectsHit(box, glyph)
  if ((taps.labels ?? []).some(hit)) return true
  if (mountedAbove) return false
  return (taps.lamps ?? []).some(hit)
}

function restoreParkedLabels() {
  if (typeof document === 'undefined') return
  for (const label of document.querySelectorAll('[data-label-park]')) {
    label.removeAttribute('dx')
    label.removeAttribute('dy')
    if (label instanceof HTMLElement || label instanceof SVGElement) label.style.visibility = ''
    if (label instanceof HTMLElement) label.style.transform = ''
    label.removeAttribute('data-label-park')
  }
}

/**
 * Easy, card open. Slide a neighbour type name off the open mark. Towers, seats and tap targets stay.
 * Glyph-top does not paint these words clear, so the name itself moves. Hide it only if the slide still lands on the mark.
 */
function parkNeighbourLabels() {
  if (typeof document === 'undefined') return
  restoreParkedLabels()
  const glyphEl = document.querySelector('.defend-pad.is-upgrade-open .lamp-upgrade-glyph[data-glyph-variant="map"]')
  if (!glyphEl) return
  const glyph = glyphEl.getBoundingClientRect()
  if (glyph.width < 1 || glyph.height < 1) return
  const open = glyphEl.closest('.defend-pad')
  for (const label of document.querySelectorAll('text.defend-type-label')) {
    if (!(label instanceof SVGTextElement) || open?.contains(label)) continue
    const style = getComputedStyle(label)
    if (style.display === 'none' || style.visibility === 'hidden') continue
    label.removeAttribute('dx')
    label.removeAttribute('dy')
    const box = label.getBoundingClientRect()
    if (box.width < 1 || box.height < 1 || !rectsHit(box, glyph)) continue
    const ctm = label.getScreenCTM()
    const scale = ctm ? Math.hypot(ctm.a, ctm.b) : 1
    const unit = scale > 0.05 ? scale : 1
    const overlapY = Math.min(box.bottom, glyph.bottom) - Math.max(box.top, glyph.top)
    const overlapX = Math.min(box.right, glyph.right) - Math.max(box.left, glyph.left)
    label.setAttribute('data-label-park', 'yes')
    if (overlapY <= overlapX + 0.5) {
      const dir = (box.top + box.bottom) / 2 <= (glyph.top + glyph.bottom) / 2 ? -1 : 1
      label.setAttribute('dy', String((dir * (overlapY + 4)) / unit))
    } else {
      const dir = (box.left + box.right) / 2 <= (glyph.left + glyph.right) / 2 ? -1 : 1
      label.setAttribute('dx', String((dir * (overlapX + 4)) / unit))
    }
    if (rectsHit(label.getBoundingClientRect(), glyph)) label.style.visibility = 'hidden'
  }
  const openId = document.querySelector('.defend-tower-card')?.getAttribute('data-upgrade-plot')
  for (const chip of document.querySelectorAll('.defend-type-chip')) {
    if (!(chip instanceof HTMLElement) || (openId && chip.getAttribute('data-chip-plot') === openId)) continue
    const style = getComputedStyle(chip)
    if (style.display === 'none' || style.visibility === 'hidden') continue
    chip.style.transform = ''
    const box = chip.getBoundingClientRect()
    if (box.width < 1 || box.height < 1 || !rectsHit(box, glyph)) continue
    const overlapY = Math.min(box.bottom, glyph.bottom) - Math.max(box.top, glyph.top)
    const overlapX = Math.min(box.right, glyph.right) - Math.max(box.left, glyph.left)
    chip.setAttribute('data-label-park', 'yes')
    if (overlapY <= overlapX + 0.5) {
      const dir = (box.top + box.bottom) / 2 <= (glyph.top + glyph.bottom) / 2 ? -1 : 1
      chip.style.transform = `translate(-50%, calc(10px + ${dir * (overlapY + 4)}px))`
    } else {
      const dir = (box.left + box.right) / 2 <= (glyph.left + glyph.right) / 2 ? -1 : 1
      chip.style.transform = `translate(calc(-50% + ${dir * (overlapX + 4)}px), 10px)`
    }
    if (rectsHit(chip.getBoundingClientRect(), glyph)) chip.style.visibility = 'hidden'
  }
}

export interface LevelBurst {
  from: number
  to: number
}

export type { TowerCardPoint }

/** The place name a lamp is announced by: a city lot title, or open ground. */
export function lampPlotTitle(plotId: CityPlotId): string {
  return CITY_PLOTS.find((plot) => plot.id === plotId)?.title ?? (isFreeSpot(plotId) ? 'open ground' : plotId)
}

export function DefendTowerCard({
  plotId,
  ability,
  runTier,
  sparks,
  point,
  board,
  onUpgrade,
  onUpgradePath,
  onArmPathBuy,
  onBuyBright,
  showBright = false,
  paths,
  onPull,
  pullSparks = 0,
  onClose,
  levelBurst = null,
  clearOf = [],
  cameraScale = 0.55,
  roadNote = '',
  /** Easy uses the scaled tier prices. Hard stays at one spark. */
  easy = false,
  /** True while walkers are on the road. Plant and the clear keep the full card. */
  midWave = false,
  /** Pixels at the bottom of the board the card should stay above. */
  reserveBottom = 0,
  /** Same-pillar lessons, and the playtest override. Steps I–III ignore this. */
  gate,
  /** Opens this lamp's Lock In lessons and keeps the night. */
  onOpenLessons,
}: {
  plotId: CityPlotId
  ability: string
  runTier: Record<string, number>
  sparks: number
  point: TowerCardPoint
  board: { w: number; h: number }
  onUpgrade: () => void
  /** Easy tree. Hard keeps the single Upgrade button. */
  onUpgradePath?: (path: TreePath, fromPip?: boolean) => void
  /** Pointer went down on a pip. The round must not advance until that buy lands. */
  onArmPathBuy?: (path: TreePath) => void
  onBuyBright?: () => void
  /** Round 7 and later. Earlier rounds keep the card as it was. */
  showBright?: boolean
  paths?: LampPaths
  /** Plant and between waves. Hidden while walkers are on the road. */
  onPull?: () => void
  /** Sparks this pull returns. A free lamp is 0. */
  pullSparks?: number
  onClose: () => void
  /** I→II / II→III while the level-up burst plays. */
  levelBurst?: LevelBurst | null
  /** Other planted lamps. The card moves so a tap can still reach them. */
  clearOf?: readonly TowerCardPoint[]
  /** Board camera scale. Lamp hits are viewBox units times this. */
  cameraScale?: number
  /** Same reach note the plant ghost shows. Empty when this level already reaches. */
  roadNote?: string
  easy?: boolean
  midWave?: boolean
  reserveBottom?: number
  gate?: BonusGate
  onOpenLessons?: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [pullAsk, setPullAsk] = useState(false)
  const tier = combatTier(ability, runTier)
  const maxed = tier >= TOOL_TIER_MAX
  const cost = boostCost(tier)
  const burstCost = 1
  const next = Math.min(TOOL_TIER_MAX, tier + 1)
  const canSpend = !maxed && sparks >= cost
  const label = isIncense(ability)
    ? INCENSE_LABEL
    : isCross(ability)
      ? CROSS_LABEL
      : isBell(ability)
        ? BELL_LABEL
        : isCandle(ability)
          ? CANDLE_LABEL
          : (WATCH_ABILITY_LABEL[ability] ?? 'Love')
  const plotTitle = lampPlotTitle(plotId)
  const lessonCue = Boolean(
    easy &&
      !midWave &&
      paths &&
      TREE_PATHS.some((path) => canTake(paths, path, gate).gate === 'lesson'),
  )
  const markOnMap = Boolean(
    easy && paths && onUpgradePath && !isIncense(ability) && !isCross(ability) && !isBell(ability) && !isCandle(ability),
  )
  // Mid-wave the lamp card is a short buy strip. It places like the full card, above the bottom row.
  const strip = markOnMap && midWave
  const hasBuy = Boolean(paths && TREE_PATHS.some((path) => canTake(paths, path, gate).ok))
  const cardH = strip ? STRIP_H : easy && paths ? (lessonCue ? TOWER_TREE_LESSON_H : TOWER_TREE_H) : TOWER_CARD_H
  // A wave hides the map mark, so only a lamp card outside a wave has a mark to keep clear.
  const glyph =
    markOnMap && !midWave
      ? mapGlyphRect(point.left, point.top, cameraScale, { left: 0, top: 0, right: board.w, bottom: board.h })
      : null
  const [paintH, setPaintH] = useState(0)
  const [taps, setTaps] = useState<TowerTaps | null>(null)
  const placedRaw = placeTowerCard(point, board, clearOf, cameraScale, reserveBottom, cardH, glyph, paintH, markOnMap ? taps : null, strip)
  const covered = labelOverGlyph(
    glyph,
    markOnMap ? taps : null,
    typeof document !== 'undefined' &&
      [...document.querySelectorAll('[data-glyph-top]')].some((node) => node.getAttribute('data-glyph-top') === plotId),
  )
  const placed = covered ? { ...placedRaw, markClear: false } : placedRaw
  const levelLine = maxed ? TIER_MARK[tier] : `${TIER_MARK[next]} · ${cost}✦`
  const bursting = Boolean(levelBurst && levelBurst.to > levelBurst.from)
  const fromMark = bursting ? TIER_MARK[levelBurst!.from] : ''
  const toMark = bursting ? TIER_MARK[levelBurst!.to] : ''

  useLayoutEffect(() => {
    const painted = cardRef.current?.getBoundingClientRect().height ?? 0
    setPaintH((prev) => (Math.abs(prev - painted) < 0.5 ? prev : painted))
    if (markOnMap && !strip && cardRef.current) parkNeighbourLabels()
    else restoreParkedLabels()
    const next = markOnMap && cardRef.current ? measureTaps(cardRef.current, plotId) : null
    setTaps((prev) => (sameTaps(prev, next) ? prev : next))
    return () => restoreParkedLabels()
  })

  useEffect(() => {
    setPullAsk(false)
    // Focus the card, not Upgrade. A focused spend button can take the next lamp tap.
    cardRef.current?.focus({ preventScroll: true })
  }, [plotId])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (easy && isCross(ability) && paths && onUpgradePath) {
    const cardH = 228
    const placed = placeTowerCard(point, board, clearOf, cameraScale, reserveBottom, cardH)
    const rank = crossRank(paths)
    const buy = canUpgradeCross(paths)
    const broke = buy.ok && sparks < buy.cost
    return (
      <div
        ref={cardRef}
        className={`defend-tower-card is-tree is-cross is-${placed.side}`}
        data-upgrade-card
        data-upgrade-tree="cross"
        data-cross-card="yes"
        data-cross-sooner={CROSS_SOONER[rank]}
        data-upgrade-plot={plotId}
        role="dialog"
        tabIndex={-1}
        aria-label={`${label} at ${plotTitle} upgrades`}
        style={{
          left: placed.left,
          top: placed.top,
          width: TOWER_CARD_W,
          ['--stem' as string]: `${Math.round(point.left - placed.left)}px`,
        }}
      >
        {onPull ? (
          <button
            type="button"
            className="defend-tower-pull"
            aria-label={`Pull lamp at ${plotTitle}`}
            onClick={(event) => {
              event.stopPropagation()
              setPullAsk(true)
            }}
          >
            <svg className="defend-tower-trash" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M9 3h6l1 2h5v2H3V5h5l1-2zm-2 6h2v10H7V9zm4 0h2v10h-2V9zm4 0h2v10h-2V9z"
              />
            </svg>
          </button>
        ) : null}
        {pullAsk && onPull ? (
          <div className="defend-pull-confirm" role="alertdialog" aria-label="Pull this lamp?">
            <p className="defend-pull-copy">{`Pull this lamp? You get ${pullSparks} sparks back`}</p>
            <div className="defend-pull-actions">
              <button
                type="button"
                className="defend-pull-keep"
                onClick={(event) => {
                  event.stopPropagation()
                  setPullAsk(false)
                }}
              >
                Keep
              </button>
              <button
                type="button"
                className="defend-pull-do"
                onClick={(event) => {
                  event.stopPropagation()
                  setPullAsk(false)
                  onPull()
                }}
              >
                Pull
              </button>
            </div>
          </div>
        ) : null}
        <p className="defend-tower-tool">{label}</p>
        <p className="defend-cross-line" data-cross-card-line="yes">
          {CROSS_CARD}
          <span className="defend-candle-cite">{` ${CROSS_VERSE_CITE}`}</span>
        </p>
        <div className="defend-path" data-path="sooner" data-rank={rank}>
          <p className="defend-path-name">
            <span className="defend-path-title">Sooner</span>
            <span className="defend-path-line">Lamps beside it</span>
          </p>
          <div className="defend-path-pips">
            {CROSS_SOONER.map((sooner, index) => {
              const pct = Math.round(sooner * 100)
              const filled = rank >= index
              const next = buy.ok && index === rank + 1
              const className = `defend-path-pip${filled ? ' is-on' : ''}${next ? ' is-buy' : ''}`
              if (next) {
                return (
                  <button
                    key={pct}
                    type="button"
                    className={className}
                    disabled={broke}
                    data-step={index + 1}
                    data-cost={buy.cost}
                    data-cross-step={pct}
                    aria-label={`Sooner ${pct} percent, ${buy.cost} sparks`}
                    onPointerDown={(event) => {
                      event.stopPropagation()
                      if (!broke) onArmPathBuy?.('strong')
                    }}
                    onClick={(event) => {
                      event.stopPropagation()
                      if (!broke) onUpgradePath('strong', true)
                    }}
                  >
                    {`${pct}%`}
                  </button>
                )
              }
              return (
                <span key={pct} className={className} data-step={index + 1} data-cross-step={pct}>
                  {`${pct}%`}
                </span>
              )
            })}
          </div>
          {buy.ok ? (
            <button
              type="button"
              className="btn primary defend-path-buy"
              disabled={broke}
              data-path-buy="sooner"
              data-cost={buy.cost}
              onPointerDown={(event) => {
                event.stopPropagation()
                if (!broke) onArmPathBuy?.('strong')
              }}
              onClick={(event) => {
                event.stopPropagation()
                if (!broke) onUpgradePath('strong', true)
              }}
            >
              {broke ? `Need ${buy.cost}` : `${buy.cost}✦`}
            </button>
          ) : (
            <p className="defend-path-lock" data-path-lock="sooner">
              {buy.reason}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (easy && isBell(ability) && paths && onUpgradePath) {
    const cardH = 228
    const placed = placeTowerCard(point, board, clearOf, cameraScale, reserveBottom, cardH)
    const rank = bellRank(paths)
    const buy = canUpgradeBell(paths)
    const broke = buy.ok && sparks < buy.cost
    return (
      <div
        ref={cardRef}
        className={`defend-tower-card is-tree is-bell is-${placed.side}`}
        data-upgrade-card
        data-upgrade-tree="bell"
        data-bell-card="yes"
        data-bell-slow={BELL_SLOW[rank]}
        data-upgrade-plot={plotId}
        role="dialog"
        tabIndex={-1}
        aria-label={`${label} at ${plotTitle} upgrades`}
        style={{
          left: placed.left,
          top: placed.top,
          width: TOWER_CARD_W,
          ['--stem' as string]: `${Math.round(point.left - placed.left)}px`,
        }}
      >
        {onPull ? (
          <button
            type="button"
            className="defend-tower-pull"
            aria-label={`Pull lamp at ${plotTitle}`}
            onClick={(event) => {
              event.stopPropagation()
              setPullAsk(true)
            }}
          >
            <svg className="defend-tower-trash" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M9 3h6l1 2h5v2H3V5h5l1-2zm-2 6h2v10H7V9zm4 0h2v10h-2V9zm4 0h2v10h-2V9z"
              />
            </svg>
          </button>
        ) : null}
        {pullAsk && onPull ? (
          <div className="defend-pull-confirm" role="alertdialog" aria-label="Pull this lamp?">
            <p className="defend-pull-copy">{`Pull this lamp? You get ${pullSparks} sparks back`}</p>
            <div className="defend-pull-actions">
              <button
                type="button"
                className="defend-pull-keep"
                onClick={(event) => {
                  event.stopPropagation()
                  setPullAsk(false)
                }}
              >
                Keep
              </button>
              <button
                type="button"
                className="defend-pull-do"
                onClick={(event) => {
                  event.stopPropagation()
                  setPullAsk(false)
                  onPull()
                }}
              >
                Pull
              </button>
            </div>
          </div>
        ) : null}
        <p className="defend-tower-tool">{label}</p>
        <p className="defend-bell-line" data-bell-card-line="yes">
          {BELL_CARD}
          <span className="defend-candle-cite">{` ${BELL_VERSE_CITE}`}</span>
        </p>
        <div className="defend-path" data-path="slow" data-rank={rank}>
          <p className="defend-path-name">
            <span className="defend-path-title">Slow</span>
            <span className="defend-path-line">Walkers in the ring</span>
          </p>
          <div className="defend-path-pips">
            {BELL_SLOW.map((slow, index) => {
              const pct = Math.round(slow * 100)
              const filled = rank >= index
              const next = buy.ok && index === rank + 1
              const className = `defend-path-pip${filled ? ' is-on' : ''}${next ? ' is-buy' : ''}`
              if (next) {
                return (
                  <button
                    key={pct}
                    type="button"
                    className={className}
                    disabled={broke}
                    data-step={index + 1}
                    data-cost={buy.cost}
                    data-bell-step={pct}
                    aria-label={`Slow ${pct} percent, ${buy.cost} sparks`}
                    onPointerDown={(event) => {
                      event.stopPropagation()
                      if (!broke) onArmPathBuy?.('strong')
                    }}
                    onClick={(event) => {
                      event.stopPropagation()
                      if (!broke) onUpgradePath('strong', true)
                    }}
                  >
                    {`${pct}%`}
                  </button>
                )
              }
              return (
                <span key={pct} className={className} data-step={index + 1} data-bell-step={pct}>
                  {`${pct}%`}
                </span>
              )
            })}
          </div>
          {buy.ok ? (
            <button
              type="button"
              className="btn primary defend-path-buy"
              disabled={broke}
              data-path-buy="slow"
              data-cost={buy.cost}
              onPointerDown={(event) => {
                event.stopPropagation()
                if (!broke) onArmPathBuy?.('strong')
              }}
              onClick={(event) => {
                event.stopPropagation()
                if (!broke) onUpgradePath('strong', true)
              }}
            >
              {broke ? `Need ${buy.cost}` : `${buy.cost}✦`}
            </button>
          ) : (
            <p className="defend-path-lock" data-path-lock="slow">
              {buy.reason}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (easy && isIncense(ability) && paths && onUpgradePath) {
    const cardH = 228
    const placed = placeTowerCard(point, board, clearOf, cameraScale, reserveBottom, cardH)
    const rank = incenseRank(paths)
    const buy = canUpgradeIncense(paths)
    const broke = buy.ok && sparks < buy.cost
    return (
      <div
        ref={cardRef}
        className={`defend-tower-card is-tree is-incense is-${placed.side}`}
        data-upgrade-card
        data-upgrade-tree="incense"
        data-incense-card="yes"
        data-incense-tap={INCENSE_TAP[rank]}
        data-incense-linger={incenseLinger(rank)}
        data-upgrade-plot={plotId}
        role="dialog"
        tabIndex={-1}
        aria-label={`${label} at ${plotTitle} upgrades`}
        style={{
          left: placed.left,
          top: placed.top,
          width: TOWER_CARD_W,
          ['--stem' as string]: `${Math.round(point.left - placed.left)}px`,
        }}
      >
        {onPull ? (
          <button
            type="button"
            className="defend-tower-pull"
            aria-label={`Pull lamp at ${plotTitle}`}
            onClick={(event) => {
              event.stopPropagation()
              setPullAsk(true)
            }}
          >
            <svg className="defend-tower-trash" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M9 3h6l1 2h5v2H3V5h5l1-2zm-2 6h2v10H7V9zm4 0h2v10h-2V9zm4 0h2v10h-2V9z"
              />
            </svg>
          </button>
        ) : null}
        {pullAsk && onPull ? (
          <div className="defend-pull-confirm" role="alertdialog" aria-label="Pull this lamp?">
            <p className="defend-pull-copy">{`Pull this lamp? You get ${pullSparks} sparks back`}</p>
            <div className="defend-pull-actions">
              <button
                type="button"
                className="defend-pull-keep"
                onClick={(event) => {
                  event.stopPropagation()
                  setPullAsk(false)
                }}
              >
                Keep
              </button>
              <button
                type="button"
                className="defend-pull-do"
                onClick={(event) => {
                  event.stopPropagation()
                  setPullAsk(false)
                  onPull()
                }}
              >
                Pull
              </button>
            </div>
          </div>
        ) : null}
        <p className="defend-tower-tool">{label}</p>
        <p className="defend-incense-line" data-incense-card-line="yes">
          {INCENSE_CARD}
          <span className="defend-candle-cite">{` ${INCENSE_VERSE_CITE}`}</span>
        </p>
        <div className="defend-path" data-path="tap" data-rank={rank}>
          <p className="defend-path-name">
            <span className="defend-path-title">Tap</span>
            <span className="defend-path-line">Inside the cloud</span>
          </p>
          <div className="defend-path-pips">
            {INCENSE_TAP.map((bonus, index) => {
              const filled = rank >= index
              const next = buy.ok && index === rank + 1
              const className = `defend-path-pip${filled ? ' is-on' : ''}${next ? ' is-buy' : ''}`
              if (next) {
                return (
                  <button
                    key={index}
                    type="button"
                    className={className}
                    disabled={broke}
                    data-step={index + 1}
                    data-cost={buy.cost}
                    data-incense-step={bonus}
                    aria-label={`Tap plus ${bonus}, ${buy.cost} sparks`}
                    onPointerDown={(event) => {
                      event.stopPropagation()
                      if (!broke) onArmPathBuy?.('strong')
                    }}
                    onClick={(event) => {
                      event.stopPropagation()
                      if (!broke) onUpgradePath('strong', true)
                    }}
                  >
                    {`+${bonus}`}
                  </button>
                )
              }
              return (
                <span key={index} className={className} data-step={index + 1} data-incense-step={bonus}>
                  {`+${bonus}`}
                </span>
              )
            })}
          </div>
          {buy.ok ? (
            <button
              type="button"
              className="btn primary defend-path-buy"
              disabled={broke}
              data-path-buy="tap"
              data-cost={buy.cost}
              onPointerDown={(event) => {
                event.stopPropagation()
                if (!broke) onArmPathBuy?.('strong')
              }}
              onClick={(event) => {
                event.stopPropagation()
                if (!broke) onUpgradePath('strong', true)
              }}
            >
              {broke ? `Need ${buy.cost}` : `${buy.cost}✦`}
            </button>
          ) : (
            <p className="defend-path-lock" data-path-lock="tap">
              {buy.reason}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (easy && isCandle(ability) && paths && onUpgradePath) {
    const cardH = 196
    const placed = placeTowerCard(point, board, clearOf, cameraScale, reserveBottom, cardH)
    const pipCosts = [TREE_STEP_COST[0], TREE_STEP_COST[1]]
    return (
      <div
        ref={cardRef}
        className={`defend-tower-card is-tree is-candle is-${placed.side}`}
        data-upgrade-card
        data-upgrade-tree="candle"
        data-candle-card="yes"
        data-upgrade-plot={plotId}
        role="dialog"
        tabIndex={-1}
        aria-label={`${label} at ${plotTitle} upgrades`}
        style={{
          left: placed.left,
          top: placed.top,
          width: TOWER_CARD_W,
          ['--stem' as string]: `${Math.round(point.left - placed.left)}px`,
        }}
      >
        {onPull ? (
          <button
            type="button"
            className="defend-tower-pull"
            aria-label={`Pull lamp at ${plotTitle}`}
            onClick={(event) => {
              event.stopPropagation()
              setPullAsk(true)
            }}
          >
            <svg className="defend-tower-trash" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M9 3h6l1 2h5v2H3V5h5l1-2zm-2 6h2v10H7V9zm4 0h2v10h-2V9zm4 0h2v10h-2V9z"
              />
            </svg>
          </button>
        ) : null}
        {pullAsk && onPull ? (
          <div className="defend-pull-confirm" role="alertdialog" aria-label="Pull this lamp?">
            <p className="defend-pull-copy">{`Pull this lamp? You get ${pullSparks} sparks back`}</p>
            <div className="defend-pull-actions">
              <button
                type="button"
                className="defend-pull-keep"
                onClick={(event) => {
                  event.stopPropagation()
                  setPullAsk(false)
                }}
              >
                Keep
              </button>
              <button
                type="button"
                className="defend-pull-do"
                onClick={(event) => {
                  event.stopPropagation()
                  setPullAsk(false)
                  onPull()
                }}
              >
                Pull
              </button>
            </div>
          </div>
        ) : null}
        <p className="defend-tower-tool">{label}</p>
        <p className="defend-candle-line" data-candle-card-line="yes">
          {CANDLE_CARD}
        </p>
        <p className="defend-candle-verse">
          {CANDLE_VERSE}
          <span className="defend-candle-cite">{` ${CANDLE_VERSE_CITE}`}</span>
        </p>
        <p className="defend-candle-help">{CANDLE_HELP}</p>
        {TREE_PATHS.map((path) => {
          const rank = paths[path]
          const buy = canTakeCandle(paths, path)
          const broke = buy.ok && sparks < buy.cost
          return (
            <div key={path} className="defend-path" data-path={path} data-rank={rank}>
              <p className="defend-path-name">
                <span className="defend-path-title">
                  <PathMark path={path} />
                  {PATH_LABEL[path]}
                </span>
                <span className="defend-path-line">{PATH_LINE[path]}</span>
              </p>
              <div className="defend-path-pips">
                {pipCosts.map((stepCost, index) => {
                  const step = index + 1
                  const filled = rank >= step
                  const locked = candleStepLocked(paths, path, step)
                  const next = buy.ok && step === rank + 1
                  const className = `defend-path-pip${filled ? ' is-on' : ''}${locked ? ' is-locked' : ''}${next ? ' is-buy' : ''}`
                  if (next) {
                    return (
                      <button
                        key={step}
                        type="button"
                        className={className}
                        disabled={broke}
                        data-step={step}
                        data-cost={stepCost}
                        data-path-pip={path}
                        aria-label={`${PATH_LABEL[path]} step ${step}, ${buy.cost} sparks`}
                        onPointerDown={(event) => {
                          event.stopPropagation()
                          if (!broke) onArmPathBuy?.(path)
                        }}
                        onPointerUp={(event) => {
                          event.stopPropagation()
                          if (!broke) onUpgradePath(path, true)
                        }}
                        onClick={(event) => {
                          event.stopPropagation()
                          if (!broke) onUpgradePath(path, true)
                        }}
                      >
                        {stepCost}
                      </button>
                    )
                  }
                  return (
                    <span key={step} className={className} data-step={step} data-cost={stepCost}>
                      {stepCost}
                    </span>
                  )
                })}
              </div>
              {buy.ok ? (
                <button
                  type="button"
                  className="btn primary defend-path-buy"
                  disabled={broke}
                  data-path-buy={path}
                  data-cost={buy.cost}
                  aria-label={
                    broke ? `${PATH_LABEL[path]}, need ${buy.cost}` : `${PATH_LABEL[path]}, ${buy.cost} sparks`
                  }
                  onPointerDown={(event) => {
                    event.stopPropagation()
                    if (!broke) onArmPathBuy?.(path)
                  }}
                  onPointerUp={(event) => {
                    event.stopPropagation()
                    if (!broke) onUpgradePath(path, true)
                  }}
                  onClick={(event) => {
                    event.stopPropagation()
                    if (!broke) onUpgradePath(path, true)
                  }}
                >
                  {broke ? `Need ${buy.cost}` : `${buy.cost}✦`}
                </button>
              ) : (
                <p className="defend-path-lock" data-path-lock={path}>
                  {buy.reason || CANDLE_LOCK}
                </p>
              )}
            </div>
          )
        })}
        {roadNote ? (
          <p className="defend-tower-road" data-road-note={roadNote}>
            {roadNote}
          </p>
        ) : null}
      </div>
    )
  }

  if (easy && paths && onUpgradePath) {
    // Nothing to buy mid-wave: the strip would be an empty box, so it is not shown at all.
    if (strip && !hasBuy) return null
    return (
      <div
        ref={cardRef}
        className={`defend-tower-card is-tree is-lamp-rows is-${placed.side}${markOnMap && !stemShows(placed.left, point.left) ? ' is-stemless' : ''}`}
        data-upgrade-card
        data-upgrade-tree="yes"
        data-strip={strip ? 'yes' : undefined}
        data-place={`${point.left.toFixed(1)},${point.top.toFixed(1)},${cardH},${reserveBottom}`}
        data-mid-wave={midWave ? 'yes' : undefined}
        data-upgrade-plot={plotId}
        role="dialog"
        tabIndex={-1}
        aria-label={`${label} at ${plotTitle} upgrades`}
        style={{
          left: placed.left,
          top: placed.top,
          width: strip ? STRIP_W : TOWER_CARD_W,
          ['--stem' as string]: `${Math.round(point.left - placed.left)}px`,
        }}
      >
        {onPull ? (
          <button
            type="button"
            className="defend-tower-pull"
            aria-label={`Pull lamp at ${plotTitle}`}
            onClick={(event) => {
              event.stopPropagation()
              setPullAsk(true)
            }}
          >
            <svg className="defend-tower-trash" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M9 3h6l1 2h5v2H3V5h5l1-2zm-2 6h2v10H7V9zm4 0h2v10h-2V9zm4 0h2v10h-2V9z"
              />
            </svg>
          </button>
        ) : null}
        {pullAsk && onPull ? (
          <div className="defend-pull-confirm" role="alertdialog" aria-label="Pull this lamp?">
            <p className="defend-pull-copy">{`Pull this lamp? You get ${pullSparks} sparks back`}</p>
            <div className="defend-pull-actions">
              <button
                type="button"
                className="defend-pull-keep"
                onClick={(event) => {
                  event.stopPropagation()
                  setPullAsk(false)
                }}
              >
                Keep
              </button>
              <button
                type="button"
                className="defend-pull-do"
                onClick={(event) => {
                  event.stopPropagation()
                  setPullAsk(false)
                  onPull()
                }}
              >
                Pull
              </button>
            </div>
          </div>
        ) : null}
        <p className="defend-tower-tool">{label}</p>
        {markOnMap && !strip && !placed.markClear && paths ? (
          <div className="defend-tower-mark" data-glyph-header="yes" data-glyph-stage={lampGlyphStage(paths)}>
            <LampUpgradeGlyph paths={paths} variant="rail" />
          </div>
        ) : null}
        {TREE_PATHS.map((path) => {
          const rank = paths[path]
          const buy = canTake(paths, path, gate)
          const broke = buy.ok && sparks < buy.cost
          const lessonLocked = buy.gate === 'lesson'
          const late = lateStepOpen(gate)
          const pipCosts = [...TREE_STEP_COST, TREE_BONUS_COST]
          if (late && rank >= TREE_BONUS_MAX) pipCosts.push(TREE_LATE_COST)
          return (
            <div
              key={path}
              className="defend-path"
              data-path={path}
              data-rank={rank}
              data-lesson-lock={lessonLocked ? 'yes' : undefined}
            >
              <p className="defend-path-name">
                <span className="defend-path-title">
                  <PathMark path={path} />
                  {PATH_LABEL[path]}
                </span>
                <span className="defend-path-line">{PATH_LINE[path]}</span>
              </p>
              <div className="defend-path-pips">
                {pipCosts.map((stepCost, index) => {
                  const step = index + 1
                  if (!wavePipVisible(step, rank, buy.ok, midWave)) return null
                  const filled = rank >= step
                  const next = buy.ok && step === rank + 1
                  const locked = !next && (stepLocked(paths, path, step) || (lessonLocked && step === rank + 1))
                  const shownCost = next ? buy.cost : stepCost
                  const className = `defend-path-pip${filled ? ' is-on' : ''}${locked ? ' is-locked' : ''}${next ? ' is-buy' : ''}`
                  if (next) {
                    return (
                      <button
                        key={step}
                        type="button"
                        className={className}
                        disabled={broke}
                        data-step={step}
                        data-cost={shownCost}
                        data-path-pip={path}
                        aria-label={`${PATH_LABEL[path]} step ${step}, ${buy.cost} sparks`}
                        onPointerDown={(event) => {
                          event.stopPropagation()
                          if (!broke) onArmPathBuy?.(path)
                        }}
                        onPointerUp={(event) => {
                          event.stopPropagation()
                          if (!broke) onUpgradePath(path, true)
                        }}
                        onClick={(event) => {
                          event.stopPropagation()
                          if (!broke) onUpgradePath(path, true)
                        }}
                      >
                        {shownCost}
                      </button>
                    )
                  }
                  return (
                    <span
                      key={step}
                      className={className}
                      data-step={step}
                      data-cost={shownCost}
                      data-locked={locked ? 'yes' : undefined}
                    >
                      {shownCost}
                    </span>
                  )
                })}
              </div>
              {buy.ok ? (
                <button
                  type="button"
                  className="btn primary defend-path-buy"
                  disabled={broke}
                  data-path-buy={path}
                  data-cost={buy.cost}
                  aria-label={
                    broke ? `${PATH_LABEL[path]}, need ${buy.cost}` : `${PATH_LABEL[path]}, ${buy.cost} sparks`
                  }
                  onPointerDown={(event) => {
                    event.stopPropagation()
                    if (!broke) onArmPathBuy?.(path)
                  }}
                  onPointerUp={(event) => {
                    event.stopPropagation()
                    if (!broke) onUpgradePath(path, true)
                  }}
                  onClick={(event) => {
                    event.stopPropagation()
                    if (!broke) onUpgradePath(path, true)
                  }}
                >
                  {broke ? `Need ${buy.cost}` : `${buy.cost}✦`}
                </button>
              ) : lessonLocked && !midWave ? (
                <div className="defend-lesson-cue" data-lesson-cue={ability} data-pillar={label}>
                  <p className="defend-path-lock" data-path-lock={path}>
                    <svg className="defend-lesson-lock" viewBox="0 0 16 16" aria-hidden="true">
                      <rect x="3.2" y="7" width="9.6" height="6.4" rx="1.4" fill="currentColor" />
                      <path
                        d="M5.2 7V5.1a2.8 2.8 0 0 1 5.6 0V7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                    </svg>
                    {LESSON_LOCK}
                  </p>
                  <p className="defend-lesson-pillar">{label}</p>
                  <button
                    type="button"
                    className="btn defend-lesson-open"
                    data-lesson-open={ability}
                    onClick={(event) => {
                      event.stopPropagation()
                      onOpenLessons?.()
                    }}
                  >
                    {label} lessons
                  </button>
                </div>
              ) : lessonLocked ? null : (
                <p className="defend-path-lock" data-path-lock={path}>
                  {buy.reason}
                </p>
              )}
              {buy.ok && stepLocked(paths, path, 2) && !(late && rank === 1) ? (
                <p className="defend-path-lock" data-path-lock={path}>
                  {TREE_LOCK}
                </p>
              ) : null}
            </div>
          )
        })}
        {showBright && paths && (paths.bright ?? 0) >= 1 ? (
          <p className="defend-bright-on" data-bright="on">
            Bright
          </p>
        ) : null}
        {showBright && paths && canBuyBright(paths).ok ? (
          <button
            type="button"
            className="btn defend-bright-buy"
            data-bright-buy="yes"
            data-cost={BRIGHT_COST}
            disabled={sparks < BRIGHT_COST}
            onClick={(event) => {
              event.stopPropagation()
              if (sparks >= BRIGHT_COST) onBuyBright?.()
            }}
          >
            {sparks < BRIGHT_COST ? `Bright · Need ${BRIGHT_COST}` : `Bright · ${BRIGHT_COST}✦`}
            <span className="defend-bright-line">{BRIGHT_LINE}</span>
          </button>
        ) : null}
        {roadNote ? (
          <p className="defend-tower-road" data-road-note={roadNote}>
            {roadNote}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div
      ref={cardRef}
      className={`defend-tower-card is-${placed.side}${bursting ? ' is-level-up' : ''}`}
      data-upgrade-card
      data-upgrade-plot={plotId}
      data-tier={tier}
      data-level-bump={bursting ? `${fromMark}-${toMark}` : undefined}
      data-next={maxed ? TIER_MARK[tier] : TIER_MARK[next]}
      data-cost={maxed ? 0 : cost}
      data-can-spend={canSpend ? 'yes' : 'no'}
      role="dialog"
      tabIndex={-1}
      aria-label={`${label} at ${plotTitle} upgrades`}
      style={{
        left: placed.left,
        top: placed.top,
        width: TOWER_CARD_W,
        ['--stem' as string]: `${Math.round(point.left - placed.left)}px`,
      }}
    >
      {onPull ? (
        <button
          type="button"
          className="defend-tower-pull"
          aria-label={`Pull lamp at ${plotTitle}`}
          onClick={(event) => {
            event.stopPropagation()
            setPullAsk(true)
          }}
        >
          <svg className="defend-tower-trash" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M9 3h6l1 2h5v2H3V5h5l1-2zm-2 6h2v10H7V9zm4 0h2v10h-2V9zm4 0h2v10h-2V9z"
            />
          </svg>
        </button>
      ) : null}
      {pullAsk && onPull ? (
        <div className="defend-pull-confirm" role="alertdialog" aria-label="Pull this lamp?">
          <p className="defend-pull-copy">{`Pull this lamp? You get ${pullSparks} sparks back`}</p>
          <div className="defend-pull-actions">
            <button
              type="button"
              className="defend-pull-keep"
              onClick={(event) => {
                event.stopPropagation()
                setPullAsk(false)
              }}
            >
              Keep
            </button>
            <button
              type="button"
              className="defend-pull-do"
              onClick={(event) => {
                event.stopPropagation()
                setPullAsk(false)
                onPull()
              }}
            >
              Pull
            </button>
          </div>
        </div>
      ) : null}
      <p className="defend-tower-tool">{label}</p>
      <p
        className={`defend-tower-next${bursting ? ' is-bump' : ''}`}
        key={bursting ? `bump-${fromMark}-${toMark}` : levelLine}
        aria-live="polite"
      >
        {bursting ? (
          <>
            <span className="defend-level-from">{fromMark}</span>
            <span className="defend-level-arrow" aria-hidden="true">
              →
            </span>
            <span className="defend-level-to" data-level={toMark}>
              {toMark}
            </span>
          </>
        ) : (
          levelLine
        )}
      </p>
      {bursting ? (
        <span className="defend-spark-spend" aria-hidden="true">
          {burstCost === 1 ? '−1✦' : `−${burstCost}✦`}
        </span>
      ) : null}
      <p className="defend-tower-gain">{maxed ? 'As strong as it gets' : 'Range ↑  ·  Damage ↑'}</p>
      {roadNote ? (
        <p className="defend-tower-road" data-road-note={roadNote}>
          {roadNote}
        </p>
      ) : null}
      {maxed ? null : (
        <button
          type="button"
          className="btn primary defend-tower-upgrade"
          disabled={!canSpend}
          aria-describedby={canSpend ? undefined : 'defend-tower-need'}
          onClick={(event) => {
            event.stopPropagation()
            onUpgrade()
          }}
        >
          Upgrade
        </button>
      )}
      {!maxed && !canSpend ? (
        <p id="defend-tower-need" className="defend-tower-need">
          {cost > 1 ? `Need ${cost} sparks` : 'Need a spark'}
        </p>
      ) : null}
    </div>
  )
}
