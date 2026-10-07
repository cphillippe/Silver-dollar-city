export interface TowerCardPoint {
  left: number
  top: number
}

export const TOWER_CARD_W = 176
export const TOWER_CARD_H = 168
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

function clampCardTop(top: number, boardH: number): number {
  return Math.max(MARGIN, Math.min(top, boardH - TOWER_CARD_H - MARGIN))
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
    t: card.top + TOWER_CARD_H - SPEND_H,
    b: card.top + TOWER_CARD_H,
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
function cardSide(top: number, pointTop: number): 'above' | 'below' {
  return top + TOWER_CARD_H <= pointTop ? 'above' : 'below'
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
): { left: number; top: number; side: 'above' | 'below' } {
  const centered = cardLeft(point.left, board.w)
  const above = point.top - TOWER_CARD_H - GAP
  const below = point.top + GAP
  const legacyTop = above < MARGIN ? below : above
  const legacy = {
    left: centered,
    top: clampCardTop(legacyTop, board.h),
    side: cardSide(clampCardTop(legacyTop, board.h), point.top),
  }
  const hits = (card: { left: number; top: number }) =>
    others.reduce((n, lamp) => n + (upgradeControlsHitLamp(card, lamp, scale) ? 1 : 0), 0)
  if (hits(legacy) === 0) return legacy
  const maxLeft = Math.max(MARGIN, board.w - TOWER_CARD_W - RAIL)
  const maxTop = Math.max(MARGIN, board.h - TOWER_CARD_H - MARGIN)
  let best = legacy
  let bestKey = hits(legacy) * 10000 + 1e6
  for (let left = MARGIN; left <= maxLeft + 0.1; left += 8) {
    for (let top = MARGIN; top <= maxTop + 0.1; top += 8) {
      const card = { left, top }
      const covered = hits(card)
      const dist = Math.hypot(left + TOWER_CARD_W / 2 - point.left, top + TOWER_CARD_H / 2 - point.top)
      const key = covered * 10000 + dist
      if (key < bestKey) {
        bestKey = key
        best = { left, top, side: cardSide(top, point.top) }
      }
    }
  }
  return best
}
