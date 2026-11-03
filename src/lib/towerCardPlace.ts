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
/** Slim Easy clear bar. The lamp card stays above it when the board has room. */
export const CLEAR_BAR_RESERVE = 92
const RAIL = 72
const MARGIN = 8
/** The least the card keeps from the plate edge when the lamp mark has no other place to be clear. */
const EDGE = 2
const GAP = 28

/** SVG hit rect on a planted lamp, in viewBox units. Matches lampIconBox('tower'). */
const LAMP_HIT = { x: 38, up: 64, down: 12 }
/** Bottom band of the card: the Upgrade button. */
const SPEND_H = 64
/** Top-right trash control. */
const PULL = 40

function cardLeft(pointLeft: number, boardW: number): number {
  return Math.max(MARGIN, Math.min(pointLeft - TOWER_CARD_W / 2, boardW - TOWER_CARD_W - RAIL))
}

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
): boolean {
  const s = scale > 0 ? scale : 1
  const hit = {
    l: lamp.left - LAMP_HIT.x * s,
    r: lamp.left + LAMP_HIT.x * s,
    t: lamp.top - LAMP_HIT.up * s,
    b: lamp.top + LAMP_HIT.down * s,
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
  const h = Math.max(cardHeight, height)
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

/**
 * Keep the upgrade card on the phone plate, beside the lamp, clear of the right rail.
 * Upgrade and Pull slide off any other planted lamp so that lamp can still be opened.
 * The lamp mark wins over everything else: when no slot on the plate clears it, the card may run into
 * the rail, the clear bar or other lamps' art. Only when nothing on the whole frame clears it does the
 * card keep the mark covered and say so (`markClear` false), so it can show its own copy.
 */
export function placeTowerCard(
  point: TowerCardPoint,
  board: { w: number; h: number },
  others: readonly TowerCardPoint[] = [],
  scale = 0.55,
  reserveBottom = 0,
  cardHeight = TOWER_CARD_H,
  glyph: TowerGlyphBox | null = null,
  /** Height the card really paints, when it is taller than `cardHeight`. Only the mark test reads it. */
  paintHeight = cardHeight,
): { left: number; top: number; side: 'above' | 'below'; markClear: boolean } {
  const centered = cardLeft(point.left, board.w)
  const glyphHits = (card: { left: number; top: number }) =>
    glyph && cardHitsGlyph(card, point, cardHeight, paintHeight, glyph) ? 1 : 0
  const markH = Math.max(cardHeight, paintHeight)
  let above = point.top - cardHeight - GAP
  if (glyph && glyphHits({ left: centered, top: above })) above = Math.min(above, glyph.top - GLYPH_CLEAR - STEM_H - markH)
  const below = point.top + GAP
  const legacyTop = above < MARGIN ? below : above
  const top = clampCardTop(legacyTop, board.h, cardHeight, reserveBottom)
  const legacy = {
    left: centered,
    top,
    side: cardSide(top, point.top, cardHeight),
  }
  const lampHits = (card: { left: number; top: number }) =>
    others.reduce((n, lamp) => n + (upgradeControlsHitLamp(card, lamp, scale, cardHeight) ? 1 : 0), 0)
  if (lampHits(legacy) + glyphHits(legacy) === 0) return { ...legacy, markClear: true }
  const maxLeft = Math.max(MARGIN, board.w - TOWER_CARD_W - RAIL)
  const maxTop = Math.max(MARGIN, board.h - cardHeight - MARGIN - reserveBottom)
  // Walls the card may lean on only when the mark needs it: the rail, the clear bar, the plate edge.
  const wideLeft = Math.max(maxLeft, board.w - TOWER_CARD_W - EDGE)
  const wideTop = Math.max(maxTop, board.h - Math.max(cardHeight, paintHeight) - EDGE)
  const search = (markWeight: number, farLeft: number, farTop: number, near = MARGIN) => {
    let best = legacy
    let bestKey = Infinity
    const lefts: number[] = []
    const tops: number[] = []
    for (let left = near; left <= farLeft + 0.1; left += 8) lefts.push(left)
    for (let top = near; top <= farTop + 0.1; top += 8) tops.push(top)
    lefts.push(farLeft)
    tops.push(farTop)
    if (glyph) {
      for (const left of [glyph.right + GLYPH_CLEAR + 1, glyph.left - GLYPH_CLEAR - 1 - TOWER_CARD_W]) {
        if (left >= near && left <= farLeft + 0.1) lefts.push(left)
      }
      for (const top of [
        glyph.bottom + GLYPH_CLEAR + STEM_H + 1,
        glyph.top - GLYPH_CLEAR - STEM_H - 1 - markH,
        glyph.bottom + GLYPH_CLEAR + 1,
        glyph.top - GLYPH_CLEAR - 1 - markH,
      ]) {
        if (top >= near && top <= farTop + 0.1) tops.push(top)
      }
    }
    for (const left of lefts) {
      for (const top of tops) {
        const card = { left, top }
        const railIn = Math.max(0, left - maxLeft)
        const barIn = Math.max(0, top - maxTop)
        const dist = Math.hypot(left + TOWER_CARD_W / 2 - point.left, top + cardHeight / 2 - point.top)
        const key = markWeight * glyphHits(card) * 1e7 + lampHits(card) * 2000 + (railIn + barIn) * 50 + dist
        if (key < bestKey) {
          bestKey = key
          best = { left, top, side: cardSide(top, point.top, cardHeight) }
        }
      }
    }
    return best
  }
  const snug = search(1, maxLeft, maxTop)
  if (glyphHits(snug) === 0) return { ...snug, markClear: true }
  const wide = search(1, wideLeft, wideTop, EDGE)
  if (glyphHits(wide) === 0) return { ...wide, markClear: true }
  return { ...search(0, maxLeft, maxTop), markClear: false }
}
