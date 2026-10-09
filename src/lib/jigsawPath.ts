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

/** Modest side nub. A full-circle knob read as a hole on tall tray cards. */
function nubFor(scale: number): { radius: number; neck: number; stem: number } {
  return { radius: 11 * scale, neck: 8 * scale, stem: 2 * scale }
}

/** How far a nub sticks out, in px. */
export function pieceReach(width: number): number {
  const { radius, neck, stem } = nubFor(scaleFor(width))
  const sagitta = radius - Math.sqrt(Math.max(0, radius * radius - neck * neck))
  return stem + sagitta
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
  const { radius, neck, stem } = nubFor(scaleFor(w))
  const artHeight = Math.max(neck * 2 + 4, h - captionHeight)
  const cy = artHeight * 0.5

  const edgeRight = (kind: EdgeKind) => {
    if (kind === 'flat') return ''
    const sign = kind === 'tab' ? 1 : -1
    const sweep = sign === 1 ? 1 : 0
    const x2 = w + sign * stem
    return `L${w},${cy - neck} L${x2},${cy - neck} A${radius},${radius} 0 0 ${sweep} ${x2},${cy + neck} L${w},${cy + neck} `
  }
  const edgeLeft = (kind: EdgeKind) => {
    if (kind === 'flat') return ''
    const sign = kind === 'tab' ? -1 : 1
    const sweep = sign === 1 ? 0 : 1
    const x2 = sign * stem
    return `L0,${cy + neck} L${x2},${cy + neck} A${radius},${radius} 0 0 ${sweep} ${x2},${cy - neck} L0,${cy - neck} `
  }

  return `M0,0 L${w},0 ${edgeRight(right)}L${w},${h} L0,${h} ${edgeLeft(left)}Z`
}
