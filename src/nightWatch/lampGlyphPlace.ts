/**
 * Where the Easy lamp mark sits on the map.
 * One pure answer shared by the mark itself and by the upgrade card,
 * so the card can stay off the mark and the mark can stay on the board.
 */

/** Map mark, in CSS pixels, on a phone. */
export const MAP_GLYPH_PX = 20
/** Air between the mark and the lamp art when it rides above. The level-up pulse swells the art a few pixels past its rest box. */
export const MAP_GAP_PX = 8
/** The mark never sits closer than this to the board edge. */
export const MAP_EDGE_PX = 2
/** The right rail covers this much of the board on a phone. */
export const MAP_RAIL_PX = 72
/** Lamp art sprite, in board units: how high it stands. */
export const LAMP_ART_UP_UNITS = 64
/** Half the width of the lamp art at the widest of its level-up pulse. A mark beside the lamp clears this. */
export const LAMP_ART_HALF_UNITS = 56
/** The type mark sits above the lamp art. The mark clears that box. */
export const LAMP_TYPE_MARK_UP_UNITS = 78

export interface GlyphClip {
  left: number
  top: number
  right: number
  bottom: number
}

export interface GlyphRect {
  left: number
  top: number
  right: number
  bottom: number
}

/**
 * The mark's box in the same pixel space as `ox`, `oy` (the lamp feet) and `clip`.
 * It rides above the lamp art. A lamp near the top edge cannot spare that room,
 * so the mark slides down while it still clears the art, then steps beside the art.
 * It is never outside the clip.
 */
export function mapGlyphRect(ox: number, oy: number, scale: number, clip?: GlyphClip | null): GlyphRect {
  const s = scale > 0.01 ? scale : 1
  const size = MAP_GLYPH_PX
  const artTop = oy - Math.max(LAMP_ART_UP_UNITS, LAMP_TYPE_MARK_UP_UNITS) * s
  let left = ox - size / 2
  let top = artTop - MAP_GAP_PX - size
  if (clip) {
    const minTop = clip.top + MAP_EDGE_PX
    const minLeft = clip.left + MAP_EDGE_PX
    const maxLeft = clip.right - size - MAP_EDGE_PX
    const maxTop = clip.bottom - size - MAP_EDGE_PX
    if (top < minTop) {
      if (minTop + size + MAP_GAP_PX <= artTop) {
        top = minTop
      } else {
        const gap = LAMP_ART_HALF_UNITS * s + MAP_GAP_PX
        const right = ox + gap
        const west = ox - gap - size
        const railLeft = clip.right - MAP_RAIL_PX - MAP_EDGE_PX - size
        left = right <= railLeft ? right : west >= minLeft ? west : right
        top = Math.min(Math.max(artTop, minTop), maxTop)
      }
    }
    left = Math.min(Math.max(left, minLeft), Math.max(minLeft, maxLeft))
    top = Math.min(Math.max(top, minTop), Math.max(minTop, maxTop))
  }
  return { left, top, right: left + size, bottom: top + size }
}
