import { useLayoutEffect, useRef, useState, type ReactElement } from 'react'
import { createPortal } from 'react-dom'
import type { CityPlotId } from '../lib/city'
import { clampGhostHintLeft, clientToMap, lampRoadNote, ROAD_COVER_WORD } from '../lib/lampPlace'
import { CLEAR_BAR_RESERVE } from '../lib/towerCardPlace'
import { EASY_CROWN_HIT_R, EASY_FACE_HIT_R, PATH_WALKER_FACE_DY, WATCH_ABILITY_LABEL, easyFaceGlows } from '../lib/defend'
import { boardFill, boardFillPoint, boardPoint as mapBoardPoint, boardView, lampIconBox, nightTowers } from '../nightWatch'
import type { DefendNightSkyProps } from './DefendNightSky'
import { DefendNightSky } from './DefendNightSky'
import { DefendTowerCard, holdTypeLabelBoxes, lampPlotTitle, type TowerCardPoint } from './DefendTowerCard'
import { camPoint } from './nwCamera'
import { samePillarLessons } from '../nightWatch/lampPillar'
import { easyShotReach, pathsOf, type BonusGate, type LampPaths, type TreePath } from '../nightWatch/upgradeTree'
import { bellPathKey, isBell } from '../nightWatch/bell'
import { crossPathKey, CROSS_LABEL, isCross } from '../nightWatch/cross'
import { incensePathKey, INCENSE_LABEL, isIncense } from '../nightWatch/incense'
import { candleFarBonus, candlePathKey, candleRoadNote, isCandle } from '../nightWatch/candle'
import {
  DefendNightActorsSvg,
  DefendNightWalkerCue,
  type DefendNightActorsProps,
} from './DefendNightActors'

export type DefendNightBoardProps = Omit<DefendNightSkyProps, 'children'> &
  DefendNightActorsProps & {
    upgradePoint?: TowerCardPoint | null
    boardBox?: { w: number; h: number }
    runSparks?: number
    /** Set while Upgrade just raised this lamp. */
    levelBurst?: { from: number; to: number } | null
    onPullLamp?: () => void
    /** Sparks a pull would return. Free lamps are 0. */
    pullSparks?: number
    onCloseUpgrade?: () => void
    onUpgradePath?: (plotId: CityPlotId, path: TreePath, fromPip?: boolean) => void
    onArmPathBuy?: (path: TreePath) => void
    onBuyBright?: (plotId: CityPlotId) => void
    /** Round 7 and later. Bright stays off the card before that. */
    showBright?: boolean
    runPaths?: Record<string, LampPaths>
    /** Held Lock In lines. The bonus step counts the ones on this lamp's pillar. */
    heldLessons?: readonly string[]
    /** playtest=1 or the debug freeze. Opens the bonus step with no lessons. */
    playtestSteps?: boolean
    /** Leave the night for this lamp's lessons, and come back. */
    onOpenLessons?: () => void
    /** Easy phone: overlays share the fill camera with the board. */
    plateFill?: boolean
    /** Easy phone camera (#818). Plate px are `s0`, the world is zoomed by `z` and panned by `tx, ty`. */
    cam?: { s0: number; z: number; tx: number; ty: number }
  }

function chromeBoxShown(el: Element): boolean {
  const style = getComputedStyle(el)
  if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false
  const box = el.getBoundingClientRect()
  return box.width > 1 && box.height > 1
}

function boxesHit(a: { left: number; right: number; top: number; bottom: number }, b: { left: number; right: number; top: number; bottom: number }): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
}

function domRectLike(left: number, top: number, right: number, bottom: number): DOMRect {
  const width = right - left
  const height = bottom - top
  return { left, top, right, bottom, width, height, x: left, y: top, toJSON: () => ({}) } as DOMRect
}

/** Easy chip: slide off obstacles before hiding on chrome. Card-open parks use data-label-park. */
function slideTypeChip(chip: HTMLElement, obstacles: DOMRect[], above: boolean) {
  const win = chip.ownerDocument?.defaultView
  if (above && win && win.innerWidth > 0 && win.innerWidth <= 390 && win.innerHeight > 0 && win.innerHeight <= 700) {
    above = false
  }
  let dx = 0
  let dy = 0
  const apply = () => {
    if (above) chip.style.transform = `translate(calc(-50% + ${dx}px), calc(-100% - 18px + ${dy}px))`
    else if (dx === 0 && dy === 0) chip.style.transform = ''
    else chip.style.transform = `translate(calc(-50% + ${dx}px), calc(10px + ${dy}px))`
  }
  for (let pass = 0; pass < 16; pass++) {
    apply()
    const box = chip.getBoundingClientRect()
    if (box.width < 1 || box.height < 1) return box
    const other = obstacles.find((bit) => boxesHit(box, bit))
    if (!other) return box
    const overlapY = Math.min(box.bottom, other.bottom) - Math.max(box.top, other.top)
    const overlapX = Math.min(box.right, other.right) - Math.max(box.left, other.left)
    if (overlapY <= overlapX + 0.5) {
      const dir = (box.top + box.bottom) / 2 <= (other.top + other.bottom) / 2 ? -1 : 1
      dy += dir * (overlapY + 4)
    } else {
      const dir = (box.left + box.right) / 2 <= (other.left + other.right) / 2 ? -1 : 1
      dx += dir * (overlapX + 4)
    }
  }
  apply()
  return chip.getBoundingClientRect()
}

/** Easy phone: park the chip in the gap under the hearts HUD instead of flipping above the lamp. */
function parkTypeChipBelowHud(chip: HTMLElement, hud: DOMRect, headerBottom: number) {
  const gap = 4
  let dx = 0
  let dy = 0
  const apply = () => {
    chip.style.transform = `translate(calc(-50% + ${dx}px), calc(10px + ${dy}px))`
  }
  apply()
  let box = chip.getBoundingClientRect()
  dy += Math.max(0, hud.bottom + gap - box.top)
  apply()
  box = chip.getBoundingClientRect()
  for (let pass = 0; pass < 12 && boxesHit(box, hud); pass += 1) {
    dy += 2
    apply()
    box = chip.getBoundingClientRect()
  }
  const minTop = Math.max(headerBottom, 0) + gap
  if (box.top < minTop - 0.5) {
    dy += minTop - box.top
    apply()
    box = chip.getBoundingClientRect()
  }
  return box
}

/** After parking under the HUD, nudge sideways or down without sliding back into the hearts bar. */
function slideTypeChipBelowFloor(chip: HTMLElement, obstacles: DOMRect[], floorTop: number) {
  let dx = 0
  let dy = 0
  const apply = () => {
    chip.style.transform = `translate(calc(-50% + ${dx}px), calc(10px + ${dy}px))`
  }
  for (let pass = 0; pass < 16; pass++) {
    apply()
    const box = chip.getBoundingClientRect()
    if (box.width < 1 || box.height < 1) return box
    const other = obstacles.find((bit) => boxesHit(box, bit))
    if (!other) return box
    const overlapY = Math.min(box.bottom, other.bottom) - Math.max(box.top, other.top)
    const overlapX = Math.min(box.right, other.right) - Math.max(box.left, other.left)
    if (overlapY <= overlapX + 0.5) {
      const dir = (box.top + box.bottom) / 2 <= (other.top + other.bottom) / 2 ? -1 : 1
      if (dir < 0) {
        const xdir = (box.left + box.right) / 2 <= (other.left + other.right) / 2 ? -1 : 1
        dx += xdir * (overlapX + 4)
      } else dy += (overlapY + 4)
    } else {
      const dir = (box.left + box.right) / 2 <= (other.left + other.right) / 2 ? -1 : 1
      dx += dir * (overlapX + 4)
    }
    apply()
    const after = chip.getBoundingClientRect()
    if (after.top < floorTop - 0.5) {
      dy += floorTop - after.top
    }
  }
  apply()
  const frameW = chip.ownerDocument?.defaultView?.innerWidth ?? 0
  if (frameW > 0) {
    let box = chip.getBoundingClientRect()
    const margin = 2
    if (box.left < margin) {
      dx += margin - box.left
      apply()
      box = chip.getBoundingClientRect()
    }
    if (box.right > frameW - margin) {
      dx -= box.right - (frameW - margin)
      apply()
      box = chip.getBoundingClientRect()
    }
    const page = chip.closest('.defend-page')
    if (page instanceof HTMLElement) {
      for (const dock of page.querySelectorAll('.nw-docks button, button.defend-new-lamp')) {
        if (!(dock instanceof HTMLElement) || !chromeBoxShown(dock)) continue
        const bit = dock.getBoundingClientRect()
        box = chip.getBoundingClientRect()
        if (!boxesHit(box, bit) || box.left >= frameW / 2) continue
        dx += bit.right + margin - box.left
        apply()
      }
    }
  }
  return chip.getBoundingClientRect()
}

/** Ink of the name, including the part that sticks out of a short client box. */
function labelPaintBox(el: SVGTextElement) {
  const rect = el.getBoundingClientRect()
  let left = rect.left
  let right = rect.right
  let top = rect.top
  let bottom = rect.bottom
  const range = document.createRange()
  for (const child of el.childNodes) {
    if (child.nodeType !== Node.TEXT_NODE || !(child.textContent || '').trim()) continue
    range.selectNodeContents(child)
    for (const bit of range.getClientRects()) {
      if (bit.width <= 0 || bit.height <= 0) continue
      left = Math.min(left, bit.left)
      right = Math.max(right, bit.right)
      top = Math.min(top, bit.top)
      bottom = Math.max(bottom, bit.bottom)
    }
  }
  const extraW = Math.max(0, el.scrollWidth - Math.max(el.clientWidth, right - left))
  const extraH = Math.max(0, el.scrollHeight - Math.max(el.clientHeight, bottom - top))
  left -= extraW / 2
  right += extraW / 2
  top -= extraH / 2
  bottom += extraH / 2
  return { left, right, top, bottom, width: right - left, height: bottom - top }
}

/**
 * Easy only. Hide a type name whose box meets Begin, Continue, the rail, the clear row,
 * a New-lamp dock, or the hearts/round HUD. The lamp art is not moved.
 * Re-reads on pan, resize, card open and the clear.
 */
function hideTypeLabelsOnChrome(board: SVGSVGElement, boosting = false) {
  const page = board.closest('.defend-page')
  if (!(page instanceof HTMLElement) || !page.classList.contains('is-easy-watch')) return
  holdTypeLabelBoxes()
  const doc = page.ownerDocument
  const winRoot = doc?.defaultView ?? (typeof window !== 'undefined' ? window : null)
  const narrowGate =
    (winRoot?.innerWidth ?? 0) > 0 &&
    (winRoot?.innerWidth ?? 0) <= 390 &&
    (winRoot?.innerHeight ?? 0) > 0 &&
    (winRoot?.innerHeight ?? 0) <= 700
  const topbarEl = doc?.querySelector('header.topbar')
  const topbarRect = topbarEl?.getBoundingClientRect()
  const topbarMeasured =
    topbarRect && topbarRect.width > 1 && topbarRect.height > 1 ? topbarRect : null
  const topbarSynthetic = !topbarMeasured && narrowGate ? domRectLike(0, 0, winRoot?.innerWidth ?? 375, 53) : null
  const topbarLive = topbarMeasured ?? topbarSynthetic
  const chromeEls = [
    ...(topbarEl && topbarMeasured ? [topbarEl] : []),
    ...page.querySelectorAll(
      '.defend-go, .defend-continue, .nw-rail, .defend-clear-row button:not(.defend-continue), button.defend-new-lamp, .nw-hud, .nw-wave-overlay .defend-wave',
    ),
  ]
  const chrome = chromeEls.filter(chromeBoxShown).map((el) => el.getBoundingClientRect())
  if (topbarLive && !topbarMeasured) chrome.push(topbarLive)
  for (const label of page.querySelectorAll('text.defend-type-label')) {
    if (!(label instanceof SVGTextElement)) continue
    const style = getComputedStyle(label)
    if (style.display === 'none' || Number(style.opacity) === 0) {
      label.removeAttribute('data-chrome-hide')
      continue
    }
    const box = labelPaintBox(label)
    if (box.width < 1 || box.height < 1 || !chrome.some((other) => boxesHit(box, other))) label.removeAttribute('data-chrome-hide')
    else label.setAttribute('data-chrome-hide', 'yes')
  }
  const chipNodes = [...page.querySelectorAll('.defend-type-chip')]
    .filter((node): node is HTMLElement => node instanceof HTMLElement)
    .sort((a, b) => (parseFloat(b.style.top) || 0) - (parseFloat(a.style.top) || 0))
  const glyphBoxes = [
    ...page.querySelectorAll('.defend-pad .defend-lamp-sprite, .defend-pad image.defend-type-mark'),
  ]
    .filter(chromeBoxShown)
    .map((el) => el.getBoundingClientRect())
  const cardBox = page.querySelector('.defend-tower-card')?.getBoundingClientRect()
  const cardBlocks =
    cardBox && cardBox.width > 1 && cardBox.height > 1 ? [cardBox] : []
  for (const chip of chipNodes) {
    const style = getComputedStyle(chip)
    if (style.display === 'none' || Number(style.opacity) === 0) {
      chip.removeAttribute('data-chrome-hide')
      continue
    }
    chip.removeAttribute('data-label-park')
    chip.style.transform = ''
    chip.removeAttribute('data-chrome-hide')
    const otherChips = chipNodes
      .filter((node) => node !== chip && chromeBoxShown(node))
      .map((node) => node.getBoundingClientRect())
    const navBlocks = [...page.querySelectorAll('button')]
      .filter((btn): btn is HTMLButtonElement => btn instanceof HTMLButtonElement)
      .filter((btn) => /^(Home|Lock In|Settings)$/.test((btn.textContent || '').replace(/\s+/g, ' ').trim()))
      .filter(chromeBoxShown)
      .map((btn) => btn.getBoundingClientRect())
    const topbarBox = topbarLive
    const headerBottom = topbarBox?.bottom ?? 0
    const topbarBlocks = topbarBox ? [topbarBox] : []
    const headerFloorEarly = headerBottom + 4
    const blocks = [...chrome, ...glyphBoxes, ...otherChips, ...cardBlocks, ...navBlocks, ...topbarBlocks]
    const win = page.ownerDocument?.defaultView
    if (win) {
      const pad = 4
      const w = win.innerWidth
      const h = win.innerHeight
      const topPad = Math.max(pad, headerBottom)
      if (w > 0 && h > 0) {
        blocks.push(
          domRectLike(-1e5, -1e5, pad, 1e5),
          domRectLike(w - pad, -1e5, 1e5, 1e5),
          domRectLike(-1e5, -1e5, 1e5, topPad),
          domRectLike(-1e5, h - pad, 1e5, 1e5),
        )
      }
    }
    const hudEl = page.querySelector('.nw-hud')
    const hudRaw = hudEl?.getBoundingClientRect()
    const hudBox =
      hudRaw && hudRaw.width > 1 && hudRaw.height > 1
        ? hudRaw
        : hudEl && chromeBoxShown(hudEl)
          ? hudEl.getBoundingClientRect()
          : null
    const viewH = win?.innerHeight ?? 0
    const chipKind = [...chip.classList].find((part) => part.startsWith('is-') && part.length > 3)
    const lampPad =
      chipKind && chipKind.length > 3
        ? page.querySelector(`.defend-pad.is-planted.is-${chipKind.slice(3)}[data-tower-type="${chipKind.slice(3)}"]`)
        : null
    if (boosting && lampPad instanceof SVGGElement) {
      const lampBox = lampPad.getBoundingClientRect()
      const lampInPlay =
        viewH > 0 &&
        lampBox.width > 1 &&
        lampBox.bottom >= Math.max(headerBottom, 4) - 0.5 &&
        lampBox.top <= viewH - 4 + 0.5 &&
        lampBox.left >= 2 - 0.5 &&
        lampBox.right <= (win?.innerWidth ?? 0) - 2 + 0.5
      if (!lampInPlay) {
        const atLamp = chip.getBoundingClientRect()
        if (viewH > 0 && (atLamp.top < 0 || atLamp.bottom > viewH)) chip.setAttribute('data-chrome-hide', 'yes')
        continue
      }
    }
    const flipAbove = !(narrowGate && topbarLive)
    const plotAttr = chip.getAttribute('data-chip-plot') || ''
    if (narrowGate && !boosting && plotAttr.includes(':600:88') && topbarLive) {
      const minTop = Math.max(headerFloorEarly, 57)
      let dy = 0
      const applyHead = () => {
        chip.style.transform = `translate(calc(-50% + 0px), calc(10px + ${dy}px))`
      }
      applyHead()
      let headBox = chip.getBoundingClientRect()
      if (headBox.top < minTop - 0.5) {
        dy += minTop - headBox.top
        applyHead()
        headBox = chip.getBoundingClientRect()
      }
      headBox = slideTypeChipBelowFloor(chip, blocks, minTop)
      chip.removeAttribute('data-chrome-hide')
      if (!chrome.some((other) => boxesHit(headBox, other))) continue
    }
    let box = slideTypeChip(chip, blocks, false)
    const parkBelowHudFloor = (floorTop: number) => {
      chip.style.transform = ''
      let next = parkTypeChipBelowHud(chip, hudBox!, headerBottom)
      const belowBlocks = [...glyphBoxes, ...otherChips, ...navBlocks, ...cardBlocks, ...topbarBlocks]
      if (win) {
        const pad = 4
        const w = win.innerWidth
        const h = win.innerHeight
        const topPad = Math.max(pad, headerBottom)
        if (w > 0 && h > 0) {
          belowBlocks.push(
            domRectLike(-1e5, -1e5, pad, 1e5),
            domRectLike(w - pad, -1e5, 1e5, 1e5),
            domRectLike(-1e5, -1e5, 1e5, topPad),
            domRectLike(-1e5, h - pad, 1e5, 1e5),
          )
        }
      }
      next = slideTypeChipBelowFloor(chip, belowBlocks, floorTop)
      return next
    }
    if (box.width > 1 && box.height > 1 && chrome.some((other) => boxesHit(box, other))) {
      const hitHud = Boolean(hudBox && boxesHit(box, hudBox))
      if (hudBox && hitHud) {
        box = parkBelowHudFloor(Math.max(hudBox.bottom + 4, headerBottom + 4))
      } else if (hudBox) {
        if (narrowGate) {
          box = parkBelowHudFloor(Math.max(hudBox.bottom + 4, headerBottom + 4))
        } else {
          const aboveBox = slideTypeChip(chip, blocks, flipAbove)
          const headerLine = Math.max(headerBottom, 4)
          const aboveOffPlayfield =
            viewH > 0 && (aboveBox.top < 0.5 || aboveBox.bottom > viewH + 0.5)
          const aboveStillHud = Boolean(hudBox && boxesHit(aboveBox, hudBox))
          if (aboveBox.top < headerLine + 8 || aboveOffPlayfield || aboveStillHud) {
            box = parkBelowHudFloor(Math.max(hudBox.bottom + 4, headerBottom + 4))
          } else {
            box = aboveBox
          }
        }
      } else {
        box = slideTypeChip(chip, blocks, flipAbove)
      }
    }
    box = chip.getBoundingClientRect()
    if (viewH > 0 && box.top < Math.max(headerBottom, 4) + 0.5 && hudBox) {
      box = parkBelowHudFloor(Math.max(hudBox.bottom + 4, headerBottom + 4))
    }
    if (viewH > 0 && box.height > 1 && box.bottom > viewH - 4) {
      const floorTop = Math.max(headerFloorEarly, hudBox ? Math.max(hudBox.bottom + 4, headerBottom + 4) : headerFloorEarly)
      const floorBlocks = [...glyphBoxes, ...otherChips, ...navBlocks, ...cardBlocks, ...topbarBlocks]
      if (win) {
        const pad = 4
        const w = win.innerWidth
        const topPad = Math.max(pad, headerBottom)
        if (w > 0) {
          floorBlocks.push(
            domRectLike(-1e5, -1e5, pad, 1e5),
            domRectLike(w - pad, -1e5, 1e5, 1e5),
            domRectLike(-1e5, -1e5, 1e5, topPad),
            domRectLike(-1e5, viewH - pad, 1e5, 1e5),
          )
        }
      }
      box = slideTypeChipBelowFloor(chip, floorBlocks, floorTop)
    }
    if (lampPad instanceof SVGGElement) {
      const padBox = lampPad.getBoundingClientRect()
      const padInPlay =
        viewH > 0 &&
        padBox.width > 1 &&
        padBox.bottom >= Math.max(headerBottom, 4) - 0.5 &&
        padBox.top <= viewH - 4 + 0.5 &&
        padBox.left >= 2 - 0.5 &&
        padBox.right <= (win?.innerWidth ?? 0) - 2 + 0.5
      if (padInPlay) {
        box = chip.getBoundingClientRect()
        const chipCy = (box.top + box.bottom) / 2
        const padCy = (padBox.top + padBox.bottom) / 2
        if (Math.abs(chipCy - padCy) > 96) {
          chip.style.transform = ''
          box = slideTypeChip(chip, blocks, flipAbove)
          box = chip.getBoundingClientRect()
          if (viewH > 0 && box.bottom > viewH - 4) {
            const floorTop = Math.max(headerFloorEarly, hudBox ? Math.max(hudBox.bottom + 4, headerBottom + 4) : headerFloorEarly)
            const floorBlocks = [...glyphBoxes, ...otherChips, ...navBlocks, ...cardBlocks, ...topbarBlocks]
            if (win) {
              const pad = 4
              const w = win.innerWidth
              const topPad = Math.max(pad, headerBottom)
              if (w > 0) {
                floorBlocks.push(
                  domRectLike(-1e5, -1e5, pad, 1e5),
                  domRectLike(w - pad, -1e5, 1e5, 1e5),
                  domRectLike(-1e5, -1e5, 1e5, topPad),
                  domRectLike(-1e5, viewH - pad, 1e5, 1e5),
                )
              }
            }
            box = slideTypeChipBelowFloor(chip, floorBlocks, floorTop)
          }
        }
      }
    }
    if (hudBox && boxesHit(box, hudBox)) {
      box = parkBelowHudFloor(Math.max(hudBox.bottom + 4, headerBottom + 4))
    }
    if (box.width < 1 || box.height < 1 || !chrome.some((other) => boxesHit(box, other))) chip.removeAttribute('data-chrome-hide')
    else chip.setAttribute('data-chrome-hide', 'yes')
  }
}

export function DefendNightBoard(props: DefendNightBoardProps) {
  const {
    boardRef, viewBox, shake, won, phase, fireBest, easyTap, onBoardTap,
    pads, planted, progress, raiders, raiderAt, ability, towerType, unlocked,
    flash, togglePad, fire, fireAtRaider, shots, easy, blasts, tapTarget, tapPos, tapJuice,
    walkerCalls, loreLine, runTier, boosting, onBoostTower,     upgradeAt, onOpenUpgrade, upFlashId, plantIgniteIds, lampHop = null, clearCheer = false, ghost = null,
    groundHints = [],
    firstSeatAt,
    reachMiss = [],
    upgradePoint, boardBox, runSparks = 0, levelBurst = null, onPullLamp, pullSparks = 0, onCloseUpgrade,
    onUpgradePath, onArmPathBuy, onBuyBright, showBright = false, runPaths, roundIndex = -1, armorFrom = 7,
    heldLessons, playtestSteps = false, onOpenLessons, spawnLog = false,
    plateFill = false, onPlacePointer, cueNudge = false,
    map, roadD, porchCandy, roadLabel, mapFeatures, pops, mapId, walkIn, cam,
  } = props
  const walkerAim = useRef<{ id: number; point: { x: number; y: number } | null; pointerType: string } | null>(null)
  const place = cam ? camPoint(cam.s0) : plateFill ? boardFillPoint : mapBoardPoint
  const cardAbility = upgradeAt ? towerType[upgradeAt] : undefined
  const bellCard = Boolean(cardAbility && isBell(cardAbility) && upgradeAt)
  const incenseCard = Boolean(cardAbility && isIncense(cardAbility) && upgradeAt)
  const candleCard = Boolean(cardAbility && isCandle(cardAbility) && upgradeAt)
  const crossCard = Boolean(cardAbility && isCross(cardAbility) && upgradeAt)
  const cardKey =
    incenseCard && upgradeAt
      ? incensePathKey(upgradeAt)
      : bellCard && upgradeAt
        ? bellPathKey(upgradeAt)
        : crossCard && upgradeAt
          ? crossPathKey(upgradeAt)
          : candleCard && upgradeAt
            ? candlePathKey(upgradeAt)
            : cardAbility
  const cardPaths = easy && cardKey ? pathsOf(runPaths, cardKey) : undefined
  const reachBonus =
    bellCard || incenseCard || crossCard
      ? 0
      : candleCard && upgradeAt
        ? candleFarBonus(pathsOf(runPaths, candlePathKey(upgradeAt)))
        : easy && cardAbility
          ? easyShotReach(pathsOf(runPaths, cardAbility))
          : 0
  const roadNote = bellCard || incenseCard || crossCard
    ? ''
    : candleCard && upgradeAt
      ? candleRoadNote(upgradeAt, reachBonus)
      : upgradeAt && cardAbility
        ? lampRoadNote(upgradeAt, cardAbility, progress, runTier, easy, reachBonus)
        : ''
  const lessonGate: BonusGate | undefined =
    easy && cardAbility
      ? {
          lessons: samePillarLessons(cardAbility, heldLessons),
          playtest: playtestSteps,
          roundIndex,
          cleared: boosting,
        }
      : undefined
  const showCard = Boolean(
    upgradeAt && cardAbility && upgradePoint && boardBox && boardBox.w > 0 && onCloseUpgrade,
  )
  // The card is not scaled with the world, so its anchors move to frame px.
  const toFrame = (at: { left: number; top: number }) =>
    cam ? { left: cam.tx + at.left * cam.z, top: cam.ty + at.top * cam.z } : at
  const clearOf =
    showCard && boardBox
      ? planted
          .filter((id) => id !== upgradeAt)
          .map((id) => toFrame(place(boardBox, nightTowers.anchor(id))))
      : []
  const cameraScale = cam
    ? cam.s0
    : boardBox && boardBox.w > 0
      ? (plateFill ? boardFill(boardBox) : boardView(boardBox)).scale
      : 0.55
  const camOn = Boolean(cam)
  // CSS pixels. Measured from layout (offsetTop), never from a transformed box, so the lift cannot chase itself.
  const [lampLift, setLampLift] = useState<Record<string, number>>({})
  useLayoutEffect(() => {
    if (!easy || !boosting || camOn) {
      setLampLift((prev) => (Object.keys(prev).length > 0 ? {} : prev))
      return
    }
    const frame = boardRef.current?.closest('.defend-frame')
    if (!(frame instanceof HTMLElement)) return
    const gap = 8
    const measure = () => {
      const panel = frame.querySelector('.nw-docks')
      if (!(panel instanceof HTMLElement)) return
      const obstacles = [
        panel,
        ...frame.querySelectorAll<HTMLElement>('.defend-clear-row [data-candle-lamp="yes"], .defend-clear-spend'),
      ]
      const frameBox = frame.getBoundingClientRect()
      const next: Record<string, number> = {}
      frame.querySelectorAll<HTMLElement>('.defend-clear-lamp').forEach((button) => {
        const id = button.getAttribute('data-clear-lamp')
        if (!id) return
        const left = frameBox.left + frame.clientLeft + button.offsetLeft
        const right = left + button.offsetWidth
        const bottom = frameBox.top + frame.clientTop + button.offsetTop + button.offsetHeight
        let limit = Number.POSITIVE_INFINITY
        for (const node of obstacles) {
          const box = node.getBoundingClientRect()
          const overlaps = Math.min(right, box.right) - Math.max(left, box.left) > 1
          if (overlaps) limit = Math.min(limit, box.top - gap)
        }
        if (bottom > limit) next[id] = Math.ceil(bottom - limit)
      })
      setLampLift((prev) => {
        const keys = new Set([...Object.keys(prev), ...Object.keys(next)])
        for (const key of keys) {
          if ((prev[key] ?? 0) !== (next[key] ?? 0)) return next
        }
        return prev
      })
    }
    measure()
    const panel = frame.querySelector('.nw-docks')
    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    if (panel instanceof HTMLElement) observer.observe(panel)
    return () => observer.disconnect()
  }, [easy, boosting, boardBox, planted, cameraScale, boardRef, camOn])
  useLayoutEffect(() => {
    if (!easy) return
    const board = boardRef.current
    if (!board) return
    const hide = () => hideTypeLabelsOnChrome(board, boosting)
    hide()
    const pan = board.closest('.nw-pan')
    const watch = new MutationObserver(hide)
    if (pan) watch.observe(pan, { attributes: true, attributeFilter: ['style'] })
    const frame = board.closest('.defend-frame')
    const resize = new ResizeObserver(hide)
    if (frame instanceof HTMLElement) resize.observe(frame)
    window.addEventListener('resize', hide)
    let dropFont = false
    void document.fonts?.ready.then(() => {
      if (!dropFont) hide()
    })
    return () => {
      dropFont = true
      watch.disconnect()
      resize.disconnect()
      window.removeEventListener('resize', hide)
    }
  }, [easy, phase, boosting, upgradeAt, planted, boardBox, cam, boardRef])
  const lampRise: Record<string, number> = {}
  if (cameraScale > 0) {
    for (const [id, lift] of Object.entries(lampLift)) {
      if (lift > 0) lampRise[id] = -lift / cameraScale
    }
  }
  const typeChips =
    boardBox && boardBox.w > 0
      ? planted.map((id) => {
          const type = towerType[id]
          if (!type) return null
          const at = place(boardBox, nightTowers.anchor(id))
          return (
            <span
              key={id}
              className={`defend-type-chip is-${type}`}
              data-chip-plot={id}
              style={{ left: at.left, top: at.top }}
            >
              {isIncense(type) ? INCENSE_LABEL : isCross(type) ? CROSS_LABEL : isBell(type) ? 'Bell' : isCandle(type) ? 'Candle' : (WATCH_ABILITY_LABEL[type] ?? type)}
            </span>
          )
        })
      : null
  // The mark rides above every lamp name and badge: HTML chips paint over the whole board, so a second copy of each
  // mark is drawn in a layer over them. Same box, same camera. A wave hides the marks, so the layer is off there.
  const glyphTop =
    easy && phase !== 'wave' && boardBox && boardBox.w > 0 && planted.length > 0 ? (
      <svg className="defend-glyph-top" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {planted.map((id) => {
          const type = towerType[id]
          if (!type || isIncense(type) || isCross(type) || isBell(type)) return null
          const at = nightTowers.anchor(id)
          return (
            <use
              key={id}
              href={`#lamp-glyph-${id}`}
              data-glyph-top={id}
              transform={`translate(${at.x} ${at.y + (lampRise[id] ?? 0)})`}
            />
          )
        })}
      </svg>
    ) : null
  const towerCard = showCard ? (
    <DefendTowerCard
      plotId={upgradeAt as CityPlotId}
      ability={cardAbility ?? ''}
      runTier={runTier}
      sparks={runSparks}
      point={toFrame(upgradePoint as TowerCardPoint)}
      board={boardBox as { w: number; h: number }}
      onUpgrade={() => onBoostTower?.(upgradeAt as CityPlotId)}
      onUpgradePath={(path, fromPip) => onUpgradePath?.(upgradeAt as CityPlotId, path, fromPip)}
      onArmPathBuy={onArmPathBuy}
      onBuyBright={onBuyBright ? () => onBuyBright(upgradeAt as CityPlotId) : undefined}
      showBright={showBright}
      paths={cardPaths}
      clearOf={clearOf}
      cameraScale={cam ? cam.s0 * cam.z : cameraScale}
      onPull={onPullLamp}
      pullSparks={pullSparks}
      onClose={onCloseUpgrade as () => void}
      levelBurst={levelBurst}
      roadNote={roadNote}
      easy={easy}
      midWave={phase === 'wave'}
      reserveBottom={easy && (boosting || phase === 'plant' || phase === 'wave') ? CLEAR_BAR_RESERVE : 0}
      gate={lessonGate}
      onOpenLessons={onOpenLessons}
    />
  ) : null
  const cardFrame = cam ? boardRef.current?.closest('.defend-frame') : null
  const cardPortal = (node: ReactElement | null) =>
    cardFrame instanceof HTMLElement && node ? createPortal(node, cardFrame) : null
  return (
    <>
      <DefendNightSky
        boardRef={boardRef}
        viewBox={viewBox}
        shake={shake}
        won={won}
        phase={phase}
        fireBest={fireBest}
        easyTap={easyTap}
        onBoardTap={onBoardTap}
        onPlacePointer={onPlacePointer}
        map={map}
        roadD={roadD}
        porchCandy={porchCandy}
        roadLabel={roadLabel}
        mapFeatures={mapFeatures}
        pops={pops}
        easy={easy}
        mapId={mapId}
      >
        <DefendNightActorsSvg
          easyTap={easyTap}
          pads={pads}
          planted={planted}
          progress={progress}
          raiders={raiders}
          raiderAt={raiderAt}
          walkIn={walkIn}
          ability={ability}
          towerType={towerType}
          unlocked={unlocked}
          flash={flash}
          togglePad={togglePad}
          fire={fire}
          fireAtRaider={fireAtRaider}
          tapTarget={tapTarget}
          shots={shots}
          easy={easy}
          blasts={blasts}
          phase={phase}
          runTier={runTier}
          runPaths={runPaths}
          boosting={boosting}
          upgradeAt={upgradeAt}
          onOpenUpgrade={onOpenUpgrade}
          upFlashId={upFlashId}
          plantIgniteIds={plantIgniteIds}
          lampHop={lampHop}
          clearCheer={clearCheer}
          ghost={ghost}
          groundHints={groundHints}
          firstSeatAt={firstSeatAt}
          reachMiss={reachMiss}
          roundIndex={roundIndex}
          armorFrom={armorFrom}
          lampRise={lampRise}
          spawnLog={spawnLog}
          cueNudge={cueNudge}
        />
      </DefendNightSky>
      {cam ? cardPortal(towerCard) : towerCard}
      {ghost && !ghost.blocked && (ghost.cover || ghost.note) && boardBox && boardBox.w > 0 ? (
        <span
          className={`defend-ghost-hint${ghost.cover ? ` is-${ghost.cover}` : ''}`}
          data-road-note={ghost.cover ? ROAD_COVER_WORD[ghost.cover] : ghost.note}
          data-road-rank={ghost.cover || ''}
          style={{
            left: clampGhostHintLeft(place(boardBox, ghost.at).left, cam ? 798 * cam.s0 : boardBox.w),
            top: place(boardBox, { x: ghost.at.x, y: ghost.at.y - ghost.range }).top,
          }}
        >
          {ghost.cover ? ROAD_COVER_WORD[ghost.cover] : ghost.note}
        </span>
      ) : null}
      {easy && (phase === 'plant' || boosting || phase === 'wave') && boardBox && boardBox.w > 0
        ? planted.map((id) => {
            const at = place(boardBox, nightTowers.anchor(id))
            const type = towerType[id]
            const label = isIncense(type) ? INCENSE_LABEL : isCross(type) ? CROSS_LABEL : isBell(type) ? 'Bell' : isCandle(type) ? 'Candle' : (WATCH_ABILITY_LABEL[type ?? ''] ?? 'lamp')
            const baseName = `Upgrade ${label} at ${lampPlotTitle(id)}`
            const sameName = planted.filter((other) => {
              const t = towerType[other]
              const l = isIncense(t) ? INCENSE_LABEL : isCross(t) ? CROSS_LABEL : isBell(t) ? 'Bell' : isCandle(t) ? 'Candle' : (WATCH_ABILITY_LABEL[t ?? ''] ?? 'lamp')
              return `Upgrade ${l} at ${lampPlotTitle(other)}` === baseName
            })
            const lampName = sameName.length > 1 ? `${baseName}, ${sameName.indexOf(id) + 1} of ${sameName.length}` : baseName
            const icon = lampIconBox(isIncense(type) ? 'incense' : isCross(type) ? 'cross' : isBell(type) ? 'bell' : isCandle(type) ? 'candle' : 'tower')
            const scale = cameraScale > 0 ? cameraScale : 1
            const lift = lampLift[id] ?? 0
            return (
              <button
                key={`clear-lamp-${id}`}
                type="button"
                className="defend-clear-lamp"
                data-clear-lamp={id}
                data-lamp-icon="yes"
                data-incense-icon={isIncense(type) ? 'yes' : undefined}
                data-tower-type={type}
                aria-label={lampName}
                aria-expanded={easy ? upgradeAt === id : undefined}
                style={{
                  left: at.left + icon.x * scale,
                  top: at.top + icon.y * scale,
                  width: icon.w * scale,
                  height: icon.h * scale,
                  transform: lift > 0 ? `translateY(-${lift}px)` : 'none',
                }}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation()
                  if (phase === 'wave' && isIncense(type)) return
                  onOpenUpgrade?.(id)
                }}
              />
            )
          })
        : null}
      {easyTap && boardBox && boardBox.w > 0
        ? raiders
            .filter((raider) => !raider.turned && !walkIn?.held(raider))
            .map((raider) => {
              const at = walkIn ? walkIn.drawAt(raider) : raiderAt(raider)
              const face = place(boardBox, { x: at.x, y: at.y + PATH_WALKER_FACE_DY })
              const radius = (raider.boss ? EASY_CROWN_HIT_R : EASY_FACE_HIT_R) * (cameraScale > 0 ? cameraScale : 1)
              const glowing = easyFaceGlows(raider, raiders, roundIndex, armorFrom)
              return (
                <button
                  key={`walker-tap-${raider.id}`}
                  type="button"
                  className={`defend-walker-tap${glowing ? ' is-cue is-easy-cue' : ''}`}
                  data-walker-tap={raider.id}
                  data-walker-id={raider.id}
                  data-fog={raider.fog ? 'yes' : undefined}
                  data-boss={raider.boss ? 'yes' : undefined}
                  aria-label="Tap walker"
                  style={{
                    left: face.left - radius,
                    top: face.top - radius,
                    width: radius * 2,
                    height: radius * 2,
                    zIndex: glowing ? 11 : 10,
                  }}
                  onPointerDown={(event) => {
                    event.stopPropagation()
                    const svg = boardRef.current
                    const point = svg ? clientToMap(svg, event.clientX, event.clientY) : null
                    walkerAim.current = {
                      id: raider.id,
                      point,
                      pointerType: event.pointerType || 'none',
                    }
                  }}
                  onClick={(event) => {
                    event.stopPropagation()
                    const aim = walkerAim.current
                    const mine = aim && aim.id === raider.id ? aim : null
                    fireAtRaider(raider.id, mine?.point ?? null, mine?.pointerType)
                  }}
                />
              )
            })
        : null}
      {typeChips}
      {glyphTop}
      <DefendNightWalkerCue
        easyTap={easyTap}
        tapTarget={tapTarget}
        tapPos={tapPos}
        tapJuice={tapJuice}
        walkerCalls={walkerCalls}
        loreLine={loreLine}
      />
    </>
  )
}
