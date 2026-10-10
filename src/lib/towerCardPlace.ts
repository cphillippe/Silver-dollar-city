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
const GAP = 28

/** SVG hit rect on a planted lamp, in viewBox units. Matches DefendNightActors. */
const LAMP_HIT = { x: 42, up: 96, down: 32 }
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

/**
 * Keep the upgrade card on the phone plate, beside the lamp, clear of the right rail.
 * Upgrade and Pull slide off any other planted lamp so that lamp can still be opened.
 */
export function placeTowerCard(
  point: TowerCardPoint,
  board: { w: number; h: number },
  others: readonly TowerCardPoint[] = [],
  scale = 0.55,
  reserveBottom = 0,
  cardHeight = TOWER_CARD_H,
): { left: number; top: number; side: 'above' | 'below' } {
  const centered = cardLeft(point.left, board.w)
  const above = point.top - cardHeight - GAP
  const below = point.top + GAP
  const legacyTop = above < MARGIN ? below : above
  const top = clampCardTop(legacyTop, board.h, cardHeight, reserveBottom)
  const legacy = {
    left: centered,
    top,
    side: cardSide(top, point.top, cardHeight),
  }
  const hits = (card: { left: number; top: number }) =>
    others.reduce((n, lamp) => n + (upgradeControlsHitLamp(card, lamp, scale, cardHeight) ? 1 : 0), 0)
  if (hits(legacy) === 0) return legacy
  const maxLeft = Math.max(MARGIN, board.w - TOWER_CARD_W - RAIL)
  const maxTop = Math.max(MARGIN, board.h - cardHeight - MARGIN - reserveBottom)
  let best = legacy
  let bestKey = hits(legacy) * 10000 + 1e6
  for (let left = MARGIN; left <= maxLeft + 0.1; left += 8) {
    for (let top = MARGIN; top <= maxTop + 0.1; top += 8) {
      const card = { left, top }
      const covered = hits(card)
      const dist = Math.hypot(left + TOWER_CARD_W / 2 - point.left, top + cardHeight / 2 - point.top)
      const key = covered * 10000 + dist
      if (key < bestKey) {
        bestKey = key
        best = { left, top, side: cardSide(top, point.top, cardHeight) }
      }
    }
  }
  return best
}
