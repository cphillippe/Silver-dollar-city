export interface TowerCardPoint {
  left: number
  top: number
}

export const TOWER_CARD_W = 176
export const TOWER_CARD_H = 168
/** Easy tree card is taller than the single Upgrade card. */
export const TOWER_TREE_H = 236
/** Same card when the Lock In cue and its button are open. */
export const TOWER_TREE_LESSON_H = 320
/** The mid-wave buy strip: two stacked 44px buttons. */
export const STRIP_W = 112
export const STRIP_H = 96
/** Slim Easy clear bar. The lamp card stays above it when the board has room. */
export const CLEAR_BAR_RESERVE = 92
const RAIL = 72
const MARGIN = 8
/** The least the card keeps from the plate edge when the lamp mark has no other place to be clear. */
const EDGE = 2
const GAP = 28

/** SVG hit rect on a planted lamp, in viewBox units. Matches lampIconBox('tower'). */
const LAMP_HIT = { x: 38, up: 64, down: 12 }
/** Pad footprint the mid-wave strip must clear (matches `.defend-pad` in checkNwStripWords). */
const STRIP_PAD_CLEAR = { x: 72, up: 108, down: 36 }
/** Bottom band of the card: the Upgrade button. */
const SPEND_H = 64
/** Top-right trash control. */
const PULL = 40

function clampCardTop(
  top: number,
  boardH: number,
  cardHeight = TOWER_CARD_H,
  reserveBottom = 0,
): number {
  const floor = boardH - reserveBottom
  return Math.max(MARGIN, Math.min(top, floor - cardHeight - MARGIN))
}

/** The card keeps this many pixels off the lamp mark. The drawn mark can land half a pixel off its predicted box, so this sits above the 4px the spec needs. */
export const GLYPH_CLEAR = 6

/** Screen box of the lamp mark, in the same pixels as the card. */
export interface TowerGlyphBox {
  left: number
  top: number
  right: number
  bottom: number
}

function overlaps(
  a: { l: number; r: number; t: number; b: number },
  b: { l: number; r: number; t: number; b: number },
): boolean {
  return a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t
}

/**
 * True when Upgrade or Pull would sit on another lamp's hit.
 * The card body does not take taps, so only those controls can steal a lamp.
 */
export function upgradeControlsHitLamp(
  card: { left: number; top: number },
  lamp: TowerCardPoint,
  scale: number,
  cardHeight = TOWER_CARD_H,
  strip = false,
): boolean {
  const s = scale > 0 ? scale : 1
  const hit = {
    l: lamp.left - LAMP_HIT.x * s,
    r: lamp.left + LAMP_HIT.x * s,
    t: lamp.top - LAMP_HIT.up * s,
    b: lamp.top + LAMP_HIT.down * s,
  }
  if (strip) {
    const pad = {
      l: lamp.left - STRIP_PAD_CLEAR.x * s,
      r: lamp.left + STRIP_PAD_CLEAR.x * s,
      t: lamp.top - STRIP_PAD_CLEAR.up * s,
      b: lamp.top + STRIP_PAD_CLEAR.down * s,
    }
    const box = { l: card.left, r: card.left + STRIP_W, t: card.top, b: card.top + cardHeight }
    if (box.b <= pad.t + TAP_EPS || box.t >= pad.b - TAP_EPS) return false
    return overlaps(box, pad) || overlaps(box, hit)
  }
  const spend = {
    l: card.left,
    r: card.left + TOWER_CARD_W,
    t: card.top + cardHeight - SPEND_H,
    b: card.top + cardHeight,
  }
  const pull = {
    l: card.left + TOWER_CARD_W - PULL,
    r: card.left + TOWER_CARD_W,
    t: card.top,
    b: card.top + PULL,
  }
  return overlaps(spend, hit) || overlaps(pull, hit)
}

/**
 * Keep the upgrade card on the phone plate, beside the lamp, clear of the right rail.
 * When another planted lamp would sit under that card, slide to a side that leaves it tappable.
 */
function cardSide(top: number, pointTop: number, cardHeight = TOWER_CARD_H): 'above' | 'below' {
  return top + cardHeight <= pointTop ? 'above' : 'below'
}

/** The gold pointer under or over the card: 16 wide, 8 tall. */
export const STEM_W = 16
export const STEM_H = 8

/** The pointer shows only while the lamp sits over the card. Beside the lamp it is hidden. */
export function stemShows(cardLeftEdge: number, pointLeft: number): boolean {
  return pointLeft >= cardLeftEdge + STEM_W / 2 && pointLeft <= cardLeftEdge + TOWER_CARD_W - STEM_W / 2
}

/**
 * True when the card body, or its pointer, comes within `gap` px of the mark.
 * `height` is what the card paints. The pointer sits just outside the edge facing the lamp.
 */
export function cardHitsGlyph(
  card: { left: number; top: number },
  point: TowerCardPoint,
  cardHeight: number,
  height: number,
  glyph: TowerGlyphBox,
  gap = GLYPH_CLEAR,
): boolean {
  const zone = { l: glyph.left - gap, r: glyph.right + gap, t: glyph.top - gap, b: glyph.bottom + gap }
  const h = height > 0 ? height : cardHeight
  if (overlaps({ l: card.left, r: card.left + TOWER_CARD_W, t: card.top, b: card.top + h }, zone)) return true
  if (!stemShows(card.left, point.left)) return false
  const above = cardSide(card.top, point.top, cardHeight) === 'above'
  const stem = {
    l: point.left - STEM_W / 2,
    r: point.left + STEM_W / 2,
    t: above ? card.top + h : card.top - STEM_H,
    b: above ? card.top + h + STEM_H : card.top,
  }
  return overlaps(stem, zone)
}

/** A screen box in the same pixels as the card. */
export interface TowerRect {
  left: number
  top: number
  right: number
  bottom: number
}

/**
 * What the card must never cover, measured from the page: Begin the watch, the whole right rail, the rail
 * lamp buttons and the clear row buttons. Without it the placer leans on the fixed rail and bottom reserve.
 */
export interface TowerTaps {
  begin: TowerRect | null
  rail: TowerRect | null
  /** Rail lamp buttons, clear row buttons, the skill kit and the New lamp buttons. All hard. */
  buttons: readonly TowerRect[]
  /** Top edge of the bottom row (Begin, the skill kit, the clear row). The card bottom stays BEGIN_GAP above it. */
  row?: number | null
  /** The open lamp's own name, chip and label. Hard: the card never covers it. */
  own?: readonly TowerRect[]
  /** Other planted lamps: art and type mark. Soft: the card slides off them when a spot exists. */
  lamps?: readonly TowerRect[]
  /** Other planted lamps' names. Soft. */
  labels?: readonly TowerRect[]
  /** Mid-wave buy strip only: short boxes along the night road so the strip stays beside it. */
  road?: readonly TowerRect[]
}

/** The card bottom stays this far above Begin the watch. */
export const BEGIN_GAP = 8
/** Placement keeps half a pixel past every measured edge so a rounded box cannot touch it. */
export const TAP_EPS = 0.5
/** Begin bobs up 2px on a wide screen (the defend-go keyframes), wherever it was measured. The gap carries that bob. */
const BEGIN_BOB = 2
export const BEGIN_REACH = BEGIN_GAP + TAP_EPS + BEGIN_BOB

/** Half-width for mid-wave strip road clearance; matches checkNwStripWords roadHalf. */
export const STRIP_ROAD_HALF = 11

const STRIP_ROAD_SAMPLES = 394

type StripRoadPathPt = { x: number; y: number }

let stripRoadPathKey = ''
let stripRoadPathPts: StripRoadPathPt[] = []

type StripRoadFramePt = { x: number; y: number }

let stripRoadLiveKey = ''
let stripRoadFramePts: StripRoadFramePt[] = []

function defendFrameOrigin(): [number, number] {
  const frame = document.querySelector('.defend-frame')
  if (!(frame instanceof HTMLElement)) return [0, 0]
  const origin = frame.getBoundingClientRect()
  return [origin.left + frame.clientLeft, origin.top + frame.clientTop]
}

function defendFrameWidth(): number {
  if (typeof document === 'undefined') return 0
  const frame = document.querySelector('.defend-frame')
  return frame instanceof HTMLElement ? frame.clientWidth : 0
}

/** Keep frame-space road sample centres in sync with pan/zoom (no per-frame DOM path walks). */
export function syncStripRoadFrame(ox?: number, oy?: number): void {
  if (typeof document === 'undefined') return
  const key = stripRoadCamKey()
  if (key === stripRoadLiveKey && stripRoadFramePts.length) return
  const [fx, fy] = ox != null && oy != null ? [ox, oy] : defendFrameOrigin()
  const road = document.querySelector('.defend-road')
  if (!(road instanceof SVGGeometryElement)) {
    stripRoadLiveKey = key
    stripRoadFramePts = []
    return
  }
  const svg = road.ownerSVGElement
  const ctm = svg?.getScreenCTM()
  if (!svg || !ctm) {
    stripRoadLiveKey = key
    stripRoadFramePts = []
    return
  }
  const pts = stripRoadPathCache(road)
  const point = svg.createSVGPoint()
  const centres: StripRoadFramePt[] = []
  for (const pt of pts) {
    point.x = pt.x
    point.y = pt.y
    const s = point.matrixTransform(ctm)
    centres.push({ x: s.x - fx, y: s.y - fy })
  }
  stripRoadLiveKey = key
  stripRoadFramePts = centres
}

export function stripRoadFramePoints(): readonly StripRoadFramePt[] {
  syncStripRoadFrame()
  return stripRoadFramePts
}

function stripRoadPathCache(road: SVGGeometryElement): StripRoadPathPt[] {
  const key = `${road.getAttribute('d') ?? ''}|${road.getTotalLength().toFixed(3)}`
  if (key === stripRoadPathKey && stripRoadPathPts.length === STRIP_ROAD_SAMPLES) return stripRoadPathPts
  const length = road.getTotalLength()
  const step = length / 393
  const pts: StripRoadPathPt[] = []
  for (let i = 0; i < STRIP_ROAD_SAMPLES; i += 1) {
    const at = road.getPointAtLength(Math.min(length, i * step))
    pts.push({ x: at.x, y: at.y })
  }
  stripRoadPathKey = key
  stripRoadPathPts = pts
  return pts
}

/** Pan/zoom key for the night map; used to skip strip road reprojection when the camera is still. */
export function stripRoadCamKey(): string {
  if (typeof document === 'undefined') return ''
  const pan = document.querySelector('.nw-pan')
  const zoom = document.querySelector('.nw-zoom')
  const panT = pan instanceof HTMLElement ? pan.style.transform : ''
  const zoomT = zoom instanceof HTMLElement ? zoom.style.transform : ''
  const on = document.querySelector('.nw-cam')?.getAttribute('data-nw-cam') ?? 'off'
  return `${on}|${panT}|${zoomT}`
}

/** Project cached road path points through the current screen matrix into defend-frame coords. */
export function stripRoadTapBoxes(ox: number, oy: number): TowerRect[] {
  if (typeof document === 'undefined') return []
  syncStripRoadFrame(ox, oy)
  if (!stripRoadFramePts.length) return []
  const half = STRIP_ROAD_HALF
  const out: TowerRect[] = []
  for (const centre of stripRoadFramePts) {
    out.push({
      left: centre.x - half,
      top: centre.y - half,
      right: centre.x + half,
      bottom: centre.y + half,
    })
  }
  return out
}

/** Road path samples in defend-frame coords. Matches DefendTowerCard roadTapBoxes for check-live-prove 1.4.500. */
export function stripRoadBlocks(): TowerRect[] {
  if (typeof document === 'undefined') return []
  const frame = document.querySelector('.defend-frame')
  if (!(frame instanceof HTMLElement)) return []
  const origin = frame.getBoundingClientRect()
  return stripRoadTapBoxes(origin.left + frame.clientLeft, origin.top + frame.clientTop)
}

function tapBlocks(taps: TowerTaps | null): TowerRect[] {
  if (!taps) return []
  const out: TowerRect[] = []
  const grow = (r: TowerRect): TowerRect => ({
    left: r.left - TAP_EPS,
    top: r.top - TAP_EPS,
    right: r.right + TAP_EPS,
    bottom: r.bottom + TAP_EPS,
  })
  if (taps.begin) {
    out.push({ ...taps.begin, top: taps.begin.top - BEGIN_REACH })
  }
  if (taps.rail) out.push(grow(taps.rail))
  for (const button of taps.buttons) out.push(grow(button))
  if (taps.row != null) {
    out.push({ left: -1e6, right: 1e6, top: taps.row - BEGIN_REACH, bottom: 1e6 })
  }
  return out
}

/** The open lamp's own name. Not a tap, so a frame with no room anywhere else may still lean on it, after every tap target. */
function ownBlocks(taps: TowerTaps | null): TowerRect[] {
  return (taps?.own ?? []).map((r) => ({
    left: r.left - TAP_EPS,
    top: r.top - TAP_EPS,
    right: r.right + TAP_EPS,
    bottom: r.bottom + TAP_EPS,
  }))
}

function softBlocks(taps: TowerTaps | null): TowerRect[] {
  if (!taps) return []
  return [...(taps.lamps ?? []), ...(taps.labels ?? [])].map((r) => ({
    left: r.left - TAP_EPS,
    top: r.top - TAP_EPS,
    right: r.right + TAP_EPS,
    bottom: r.bottom + TAP_EPS,
  }))
}

function hitsRect(card: { left: number; top: number }, height: number, r: TowerRect, width = TOWER_CARD_W): boolean {
  return card.left < r.right && card.left + width > r.left && card.top < r.bottom && card.top + height > r.top
}

/**
 * Keep the upgrade card on the phone plate, beside the lamp, clear of the right rail.
 * Upgrade and Pull slide off any other planted lamp so that lamp can still be opened.
 * The lamp mark wins over other lamps' art and the plate walls, never over a tap target: the card widens
 * sideways and above, and only past the measured rail when it sits below it. It never runs into Begin
 * the watch, the rail buttons, the New lamp buttons, the skill kit, the clear row or its own lamp's name.
 * Other lamps and their names are soft: a spot that clears them wins. When no spot on the frame clears the
 * mark, every tap target and every other lamp, the card keeps the spot that covers the fewest lamps and says so
 * (`markClear` false), so it can show its own copy of the mark.
 * `strip` is the mid-wave buy strip: 112 wide, and all of it takes taps.
 */
export function placeTowerCard(
  point: TowerCardPoint,
  board: { w: number; h: number },
  others: readonly TowerCardPoint[] = [],
  scale = 0.55,
  reserveBottom = 0,
  cardHeight = TOWER_CARD_H,
  glyph: TowerGlyphBox | null = null,
  /** Height the card really paints, when it is taller than `cardHeight`. Only the mark and tap tests read it. */
  paintHeight = cardHeight,
  taps: TowerTaps | null = null,
  strip = false,
): { left: number; top: number; side: 'above' | 'below'; markClear: boolean } {
  const W = strip ? STRIP_W : TOWER_CARD_W
  const stripLeftOfLamp = point.left < board.w * 0.52
  const centered = strip
    ? stripLeftOfLamp
      ? Math.max(MARGIN, point.left - W - 16)
      : Math.max(MARGIN, Math.min(point.left + 24, board.w - W - RAIL))
    : Math.max(MARGIN, Math.min(point.left - W / 2, board.w - W - RAIL))
  const glyphHits = (card: { left: number; top: number }) =>
    glyph && cardHitsGlyph(card, point, cardHeight, paintHeight, glyph) ? 1 : 0
  const markH = paintHeight > 0 ? paintHeight : cardHeight
  const roadCentres = strip ? stripRoadFramePoints() : []
  const roadPad = STRIP_ROAD_HALF + TAP_EPS
  const blocks = tapBlocks(taps)
  const soft = softBlocks(taps)
  const own = ownBlocks(taps)
  const ownHits = (card: { left: number; top: number }) =>
    own.reduce((n, block) => n + (hitsRect(card, markH, block, W) ? 1 : 0), 0)
  const softArea = (card: { left: number; top: number }) =>
    soft.reduce((sum, block) => {
      const w = Math.min(card.left + W, block.right) - Math.max(card.left, block.left)
      const h = Math.min(card.top + markH, block.bottom) - Math.max(card.top, block.top)
      return sum + (w > 0 && h > 0 ? w * h : 0)
    }, 0)
  const tapHits = (card: { left: number; top: number }) =>
    blocks.reduce((n, block) => n + (hitsRect(card, markH, block, W) ? 1 : 0), 0)
  const roadHits = (card: { left: number; top: number }) => {
    if (!roadCentres.length) return 0
    const left = card.left - roadPad
    const right = card.left + W + roadPad
    const top = card.top - roadPad
    const bottom = card.top + markH + roadPad
    for (const spot of roadCentres) {
      if (spot.x >= left && spot.x <= right && spot.y >= top && spot.y <= bottom) return 1
    }
    return 0
  }
  const softHits = (card: { left: number; top: number }) =>
    soft.reduce((n, block) => n + (hitsRect(card, markH, block, W) ? 1 : 0), 0)
  const boundH = glyph || taps ? markH : cardHeight
  let above = point.top - cardHeight - GAP
  if (glyph && glyphHits({ left: centered, top: above })) above = Math.min(above, glyph.top - GLYPH_CLEAR - STEM_H - markH)
  const below = point.top + GAP
  const legacyTop = strip
    ? clampCardTop(point.top - cardHeight - GAP, board.h, boundH, reserveBottom)
    : above < MARGIN
      ? below
      : above
  const top = clampCardTop(legacyTop, board.h, boundH, reserveBottom)
  const legacy = {
    left: centered,
    top,
    side: cardSide(top, point.top, cardHeight),
  }
  const lampHits = (card: { left: number; top: number }) =>
    others.reduce((n, lamp) => n + (upgradeControlsHitLamp(card, lamp, scale, cardHeight, strip) ? 1 : 0), 0)
  /** Mid-wave strip buys sit on their own lamp; clearOf only lists neighbours. */
  const ownLampHit = (card: { left: number; top: number }) =>
    strip && upgradeControlsHitLamp(card, point, scale, cardHeight, true) ? 1 : 0
  const stripLampHits = (card: { left: number; top: number }) => lampHits(card) + ownLampHit(card)
  const sc = scale > 0 ? scale : 1
  const stripPadTop = point.top - STRIP_PAD_CLEAR.up * sc
  const stripAboveLamp = (card: { left: number; top: number }) => card.top + cardHeight <= stripPadTop + TAP_EPS
  const stripClearsRoad = (card: { left: number; top: number }) => tapHits(card) === 0 && roadHits(card) === 0
  if (strip) {
    const topAbove = clampCardTop(stripPadTop - cardHeight - GAP, board.h, boundH, reserveBottom)
  /** #988: 384–392 phones pin the Reason-style strip to the left edge like wider frames. */
    const frameW = defendFrameWidth()
    if (stripLeftOfLamp && frameW >= 384 && frameW <= 392) {
      const pinLeft = frameW <= 384 ? 0 : 2
      const pinTops = [topAbove]
      for (let lift = 16; lift <= 160; lift += 16) {
        pinTops.push(Math.max(MARGIN, topAbove - lift))
      }
      for (const topTry of pinTops) {
        const card = { left: pinLeft, top: topTry }
        if (stripAboveLamp(card) && stripLampHits(card) + ownHits(card) + softHits(card) === 0) {
          return { ...card, side: 'above', markClear: stripClearsRoad(card) }
        }
      }
    }
    const clearX = LAMP_HIT.x * sc + GLYPH_CLEAR
    const offRoadLeft = stripLeftOfLamp
      ? [
          Math.max(MARGIN, point.left - W - clearX - 12),
          Math.max(MARGIN, point.left - W - 8),
          centered,
          Math.max(MARGIN, point.left - W - clearX),
        ]
      : [
          Math.max(MARGIN, Math.min(point.left + clearX + 12, board.w - W - RAIL)),
          Math.max(MARGIN, Math.min(point.left + 24, board.w - W - RAIL)),
          centered,
          Math.max(MARGIN, Math.min(point.left + clearX, board.w - W - RAIL)),
        ]
    const lefts = [...new Set([...offRoadLeft, Math.max(MARGIN, Math.min(point.left - W / 2, board.w - W - RAIL))])]
    for (const left of [...new Set(lefts.map((v) => Math.round(v)))]) {
      const stripTops = [topAbove]
      for (let lift = 16; lift <= 160; lift += 16) {
        stripTops.push(Math.max(MARGIN, topAbove - lift))
      }
      for (const topTry of stripTops) {
        const card = { left, top: topTry }
        if (
          stripAboveLamp(card) &&
          stripClearsRoad(card) &&
          stripLampHits(card) + ownHits(card) + softHits(card) === 0
        ) {
          return { ...card, side: 'above', markClear: true }
        }
      }
    }
  }
  if (
    stripLampHits(legacy) + glyphHits(legacy) + tapHits(legacy) + roadHits(legacy) + ownHits(legacy) + softHits(legacy) === 0 &&
    (!strip || (stripAboveLamp(legacy) && stripClearsRoad(legacy)))
  ) {
    return { ...legacy, markClear: strip ? stripAboveLamp(legacy) : true }
  }
  const maxLeft = Math.max(MARGIN, board.w - W - RAIL)
  const rowFloor = taps?.row != null ? taps.row - BEGIN_REACH : Infinity
  const maxTop = Math.max(MARGIN, Math.min(board.h - boundH - MARGIN - reserveBottom, rowFloor - boundH))
  // The wide search leans on the plate edge sideways, and past the fixed rail column only with the measured rail
  // rect. It never goes down: the card stays out of the bottom reserve (Begin, the clear row, the skill kit).
  const wideLeft = taps?.rail ? Math.max(maxLeft, board.w - W - EDGE) : maxLeft
  const wideTop = maxTop
  const search = (markWeight: number, farLeft: number, farTop: number, near = MARGIN) => {
    let best = legacy
    let bestKey = Infinity
    const lefts: number[] = []
    const tops: number[] = []
    for (let left = near; left <= farLeft + 0.1; left += 8) lefts.push(left)
    for (let top = near; top <= farTop + 0.1; top += 8) tops.push(top)
    lefts.push(farLeft)
    tops.push(farTop)
    const addLeft = (left: number) => {
      if (left >= near && left <= farLeft + 0.1) lefts.push(left)
    }
    const addTop = (top: number) => {
      if (top >= near && top <= farTop + 0.1) tops.push(top)
    }
    if (glyph) {
      addLeft(glyph.right + GLYPH_CLEAR + 1)
      addLeft(Math.max(near, glyph.left - GLYPH_CLEAR - 1 - W))
      for (const top of [
        glyph.bottom + GLYPH_CLEAR + STEM_H + 1,
        glyph.bottom + GLYPH_CLEAR + 1,
        glyph.top - GLYPH_CLEAR - STEM_H - 1 - markH,
        glyph.top - GLYPH_CLEAR - 1 - markH,
      ]) {
        addTop(top)
        addTop(Math.max(near, top))
      }
    }
    for (const block of [...blocks, ...own, ...soft]) {
      addLeft(block.right)
      addLeft(block.left - W)
      addTop(block.bottom)
      addTop(block.top - markH)
    }
    for (const left of lefts) {
      for (const top of tops) {
        const card = { left, top }
        const railIn = Math.max(0, left - maxLeft)
        const barIn = Math.max(0, top - maxTop)
        const dist = Math.hypot(left + W / 2 - point.left, top + cardHeight / 2 - point.top)
        const stripBelow = strip && !stripAboveLamp(card) ? 1e8 : 0
        const stripRoad =
          strip && stripLeftOfLamp && card.left + W > point.left - 8
            ? 5e8
            : strip && !stripLeftOfLamp && card.left < point.left + 8
              ? 5e8
              : 0
        const key =
          markWeight * glyphHits(card) * 1e7 +
          tapHits(card) * 1e6 +
          roadHits(card) * 1e6 +
          ownHits(card) * 5e5 +
          softHits(card) * 1e5 +
          softArea(card) * 0.5 +
          (strip ? stripLampHits(card) * 1e8 : lampHits(card) * 2000) +
          stripBelow +
          stripRoad +
          (railIn + barIn) * 50 +
          dist
        if (key < bestKey) {
          bestKey = key
          best = { left, top, side: cardSide(top, point.top, cardHeight) }
        }
      }
    }
    return best
  }
  const snug = search(1, maxLeft, maxTop)
  if (glyphHits(snug) + tapHits(snug) + roadHits(snug) + ownHits(snug) + softHits(snug) === 0) return { ...snug, markClear: true }
  const wide = search(1, wideLeft, wideTop, EDGE)
  if (glyphHits(wide) + tapHits(wide) + roadHits(wide) + ownHits(wide) + softHits(wide) === 0) return { ...wide, markClear: true }
  if (strip) {
    let fallback: { left: number; top: number } = search(1, wideLeft, wideTop, EDGE)
    const clearX = LAMP_HIT.x * sc + GLYPH_CLEAR
    const forcedLeft = stripLeftOfLamp
      ? Math.max(MARGIN, point.left - W - clearX - 16)
      : Math.max(MARGIN, Math.min(point.left + clearX + 16, board.w - W - RAIL))
    const forcedTop = Math.max(MARGIN, stripPadTop - cardHeight - GAP)
    const forced = { left: forcedLeft, top: clampCardTop(forcedTop, board.h, boundH, reserveBottom) }
    const acceptStrip = (card: { left: number; top: number }) =>
      stripAboveLamp(card) &&
      stripClearsRoad(card) &&
      stripLampHits(card) + ownHits(card) + softHits(card) === 0
    if (!acceptStrip(fallback)) fallback = forced
    if (!acceptStrip(fallback)) {
      const railLeft = Math.max(MARGIN, board.w - W - RAIL)
      for (const left of [forcedLeft, railLeft, MARGIN, forcedLeft - 12]) {
        for (let lift = 0; lift <= 96; lift += 12) {
          const card = {
            left: Math.max(MARGIN, Math.min(left, wideLeft)),
            top: clampCardTop(forcedTop - lift, board.h, boundH, reserveBottom),
          }
          if (acceptStrip(card)) {
            fallback = card
            break
          }
        }
        if (acceptStrip(fallback)) break
      }
    }
    return {
      ...fallback,
      side: 'above',
      markClear: acceptStrip(fallback),
    }
  }
  // No spot clears the mark, the taps and the lamps around it: the header copy carries the mark and the card
  // keeps the spot that covers the fewest of them. Taps first, then neighbour lamps.
  return { ...search(0, wideLeft, wideTop, EDGE), markClear: false }
}
