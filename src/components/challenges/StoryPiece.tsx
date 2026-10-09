import { useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { GemMark } from '../GemMark'
import { StoryPanelArt } from '../StoryPanelArt'
import { pieceEdges, piecePath } from '../../lib/jigsawPath'
import type { SequenceVisual } from '../../lib/sequenceArt'

export interface StripCard {
  id: string
  text: string
  shortText?: string
  role?: string
  orderIndex: number
  decoy?: boolean
  visual: SequenceVisual
}

interface StoryPieceProps {
  card: StripCard
  count: number
  hard: boolean
  showCaption: boolean
  /** `slot` uses the short line while the strip is still in play. */
  caption?: 'full' | 'slot'
  /** Win strip: shorter caption band so the verse and Home button stay on screen. */
  compact?: boolean
  wiggle?: boolean
  glow?: boolean
  snap?: boolean
  locked?: boolean
  onPress?: () => void
}

export function StoryPiece({
  card,
  count,
  hard,
  showCaption,
  caption = 'full',
  compact = false,
  wiggle,
  glow,
  snap,
  locked,
  onPress,
}: StoryPieceProps) {
  const ref = useRef<HTMLButtonElement | HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 104, h: 156 })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const apply = () => {
      const rect = el.getBoundingClientRect()
      const w = Math.max(48, Math.round(rect.width))
      const h = Math.max(48, Math.round(rect.height))
      setBox((prev) => (prev.w === w && prev.h === h ? prev : { w, h }))
    }
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const edges = pieceEdges(card.orderIndex, count, hard)
  const slotText = caption === 'slot' && card.shortText ? card.shortText : null
  const captionHeight = showCaption ? (slotText ? 40 : compact ? (count >= 5 ? 50 : 46) : 52) : 0
  const path = piecePath(box.w, box.h, edges.left, edges.right, captionHeight)
  const { backdrop } = card.visual
  const face = (
    <>
      <span
        className={`strip-art ${card.visual.kind === 'story' ? 'is-story' : ''}`}
        style={showCaption ? { bottom: captionHeight } : { bottom: 0 }}
      >
        <PieceArt visual={card.visual} />
      </span>
      {showCaption ? (
        <span className={`strip-cap ${slotText ? 'is-slot' : ''}`} style={{ height: captionHeight }}>
          <span className="strip-cap-text">
            {slotText ? <SlotLine text={slotText} /> : <RoleLine text={card.text} role={card.role} />}
          </span>
        </span>
      ) : null}
    </>
  )
  const className = [
    'strip-face',
    wiggle ? 'is-wiggle' : '',
    glow ? 'is-glow' : '',
    snap ? 'is-snap' : '',
    locked ? 'is-locked' : '',
  ]
    .filter(Boolean)
    .join(' ')
  const style = {
    background: `linear-gradient(${backdrop.sky}, ${backdrop.horizon} 62%, ${backdrop.ground} 63%, ${backdrop.ground})`,
    clipPath: `path('${path}')`,
    touchAction: 'manipulation' as const,
  }

  if (onPress) {
    return (
      <button
        ref={ref as RefObject<HTMLButtonElement>}
        type="button"
        className={className}
        style={style}
        aria-label={card.text}
        onClick={onPress}
      >
        {face}
      </button>
    )
  }

  return (
    <div ref={ref as RefObject<HTMLDivElement>} className={className} style={style}>
      {face}
    </div>
  )
}

function SlotLine({ text }: { text: string }) {
  const breakAt = text.indexOf('\n')
  const firstLine = breakAt >= 0 ? text.slice(0, breakAt) : text
  const rest = breakAt >= 0 ? text.slice(breakAt + 1) : ''
  const space = firstLine.indexOf(' ')
  const head = space < 0 ? firstLine : firstLine.slice(0, space)
  const tail = space < 0 ? '' : firstLine.slice(space)
  return (
    <>
      <strong>{head}</strong>
      {tail}
      {rest ? (
        <>
          <br />
          {rest}
        </>
      ) : null}
    </>
  )
}

function RoleLine({ text, role }: { text: string; role?: string }) {
  if (!role) return text
  const at = text.toLowerCase().indexOf(role.toLowerCase())
  if (at < 0) return text
  return (
    <>
      {text.slice(0, at)}
      <strong>{text.slice(at, at + role.length)}</strong>
      {text.slice(at + role.length)}
    </>
  )
}

function PieceArt({ visual }: { visual: SequenceVisual }) {
  if (visual.kind === 'cutout') {
    return <img src={visual.src} alt="" draggable={false} />
  }
  if (visual.kind === 'story') {
    return <StoryPanelArt scene={visual.scene} size="thumb" />
  }
  if (visual.kind === 'foundation') {
    return <StoryPanelArt scene="keep" beatId={visual.beatId} size="thumb" />
  }
  return (
    <span className="strip-gem">
      <GemMark gem={visual.gem} size="md" />
    </span>
  )
}

export function GhostSlot({
  index,
  count,
  hard,
  awaiting,
}: {
  index: number
  count: number
  hard: boolean
  awaiting: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 90, h: 110 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const apply = () => {
      const rect = el.getBoundingClientRect()
      const w = Math.max(36, Math.round(rect.width))
      const h = Math.max(36, Math.round(rect.height))
      setBox((prev) => (prev.w === w && prev.h === h ? prev : { w, h }))
    }
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const edges = pieceEdges(index, count, hard)
  const path = piecePath(box.w, box.h, edges.left, edges.right, 0)
  return (
    <div ref={ref} className={`strip-ghost ${awaiting ? 'is-next' : ''}`} aria-hidden>
      <svg viewBox={`0 0 ${box.w} ${box.h}`} width="100%" height="100%" preserveAspectRatio="none">
        <path
          d={path}
          fill="rgba(255,215,112,0.06)"
          stroke="rgba(255,215,112,0.7)"
          strokeWidth="2.5"
          strokeDasharray="7 6"
        />
      </svg>
      <span className="strip-ghost-mark">{awaiting ? '?' : index + 1}</span>
    </div>
  )
}

