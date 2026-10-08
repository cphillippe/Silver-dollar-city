export type EdgeKind = 'flat' | 'tab' | 'socket'

/** Piece 1 is flat on the left and the last piece is flat on the right, so the edge hints at order. Hard gives every piece a tab and a socket. */
export function pieceEdges(
  index: number,
  count: number,
  hard: boolean,
): { left: EdgeKind; right: EdgeKind } {
  if (hard || index < 0) return { left: 'socket', right: 'tab' }
  return {
    left: index <= 0 ? 'flat' : 'socket',
    right: index >= count - 1 ? 'flat' : 'tab',
  }
}

function scaleFor(width: number): number {
  return Math.min(1, Math.max(0.42, width / 112))
}

/** Tab reach in px, about 26px on a 112px slot. */
export function pieceReach(width: number): number {
  const scale = scaleFor(width)
  const radius = 13 * scale
  const neck = 8 * scale
  const stem = 3 * scale
  return stem + Math.sqrt(Math.max(0, radius * radius - neck * neck)) + radius
}

export function piecePath(
  width: number,
  height: number,
  left: EdgeKind,
  right: EdgeKind,
  captionHeight: number,
): string {
  const w = Math.max(24, width)
  const h = Math.max(24, height)
  const scale = scaleFor(w)
  const radius = 13 * scale
  const neck = 8 * scale
  const stem = 3 * scale
  const artHeight = Math.max(neck * 2 + 4, h - captionHeight)
  const cy = artHeight * 0.5

  const edgeRight = (kind: EdgeKind) => {
    if (kind === 'flat') return ''
    const sign = kind === 'tab' ? 1 : -1
    const sweep = sign === 1 ? 1 : 0
    const x2 = w + sign * stem
    return `L${w},${cy - neck} L${x2},${cy - neck} A${radius},${radius} 0 1 ${sweep} ${x2},${cy + neck} L${w},${cy + neck} `
  }
  const edgeLeft = (kind: EdgeKind) => {
    if (kind === 'flat') return ''
    const sign = kind === 'tab' ? -1 : 1
    const sweep = sign === 1 ? 0 : 1
    const x2 = sign * stem
    return `L0,${cy + neck} L${x2},${cy + neck} A${radius},${radius} 0 1 ${sweep} ${x2},${cy - neck} L0,${cy - neck} `
  }

  return `M0,0 L${w},0 ${edgeRight(right)}L${w},${h} L0,${h} ${edgeLeft(left)}Z`
}
