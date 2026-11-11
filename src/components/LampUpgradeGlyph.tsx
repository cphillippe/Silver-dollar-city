import { useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import type { LampPaths } from '../nightWatch/upgradeTree'
import {
  LAMP_GLYPH_VIEW,
  clampGlyphStage,
  lampGlyphMarks,
  lampGlyphStage,
  lampGlyphTone,
  type LampGlyphMark,
} from '../nightWatch/lampGlyph'
import { MAP_GLYPH_PX, mapGlyphRect } from '../nightWatch/lampGlyphPlace'

const DRAW_MS = 200

export interface LampUpgradeGlyphProps {
  paths: LampPaths
  /** Map sits in the board SVG. Rail sits in the ability card. */
  variant: 'map' | 'rail'
  /** Playtest preview only. A normal lamp leaves this unset and uses the buys. */
  stage?: number
  /** Map variant only: lets the board paint a second copy of this mark above the lamp names. */
  domId?: string
}

/**
 * Inline stroke mark for one Easy lamp.
 * Only the piece just bought draws on. Reduced motion shows that piece at once.
 */
export function LampUpgradeGlyph({ paths, variant, stage: stageOverride, domId }: LampUpgradeGlyphProps) {
  const stage = stageOverride == null ? lampGlyphStage(paths) : clampGlyphStage(stageOverride)
  const tone = stageOverride == null ? lampGlyphTone(paths) : stage > 0 ? 'strong' : 'rest'
  const pieces = lampGlyphMarks(stage)
  const svgRef = useRef<SVGSVGElement | SVGGElement>(null)
  const prevStage = useRef<number | null>(null)
  const [drawFrom, setDrawFrom] = useState<number | null>(null)
  const [box, setBox] = useState<{ units: number; x: number; y: number } | null>(null)

  useLayoutEffect(() => {
    if (prevStage.current == null) {
      prevStage.current = stage
      return
    }
    const from = prevStage.current
    prevStage.current = stage
    if (stage <= from) {
      setDrawFrom(null)
      return
    }
    setDrawFrom(from)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(() => setDrawFrom(null), reduce ? 0 : DRAW_MS + 40)
    return () => window.clearTimeout(timer)
  }, [stage])

  useLayoutEffect(() => {
    if (variant !== 'map') return
    const hide = (sync: boolean) => {
      const apply = (prev: { units: number; x: number; y: number } | null) => (prev == null ? prev : null)
      if (sync) flushSync(() => setBox(apply))
      else setBox(apply)
    }
    const place = (sync: boolean) => {
      const node = svgRef.current
      const board = node?.ownerSVGElement
      const lamp = node?.parentNode as SVGGraphicsElement | null | undefined
      const ctm = board?.getScreenCTM()
      const feet = lamp?.getScreenCTM?.()
      if (!board || !ctm || !feet) {
        hide(sync)
        return
      }
      const px = Math.hypot(ctm.a, ctm.b)
      if (!(px > 0.05)) {
        hide(sync)
        return
      }
      const frame = board.closest('.defend-frame')?.getBoundingClientRect()
      const edge = board.getBoundingClientRect()
      const clip = edge
        ? {
            left: Math.max(edge.left, frame?.left ?? edge.left),
            top: Math.max(edge.top, frame?.top ?? edge.top),
            right: Math.min(edge.right, frame?.right ?? edge.right),
            bottom: Math.min(edge.bottom, frame?.bottom ?? edge.bottom),
          }
        : null
      const rect = mapGlyphRect(feet.e, feet.f, px, clip)
      if (!rect) {
        hide(sync)
        return
      }
      const units = MAP_GLYPH_PX / px
      const x = (rect.left - feet.e) / px
      const y = (rect.top - feet.f) / px
      const apply = (prev: { units: number; x: number; y: number } | null) =>
        prev != null && Math.abs(prev.units - units) < 0.15 && Math.abs(prev.x - x) < 0.15 && Math.abs(prev.y - y) < 0.15
          ? prev
          : { units, x, y }
      if (sync) flushSync(() => setBox(apply))
      else setBox(apply)
    }
    place(false)
    // A drag writes the pan transform without rendering. Hide the mark in that same turn, before the next paint.
    const pan = svgRef.current?.ownerSVGElement?.closest('.nw-pan')
    if (!pan) return
    const obs = new MutationObserver(() => place(true))
    obs.observe(pan, { attributes: true, attributeFilter: ['style'] })
    return () => obs.disconnect()
  })

  const drawing = (piece: LampGlyphMark) => drawFrom != null && piece.stage > drawFrom && piece.stage <= stage

  const body = pieces.map((piece) => {
    const fresh = drawing(piece)
    if (piece.draw === 'dot' || piece.draw === 'gap') {
      return (
        <circle
          key={piece.key}
          className={piece.draw === 'dot' ? 'is-dot' : `is-gap${fresh ? ' is-draw' : ''}`}
          cx={piece.cx}
          cy={piece.cy}
          r={piece.r}
          pathLength={1}
          data-glyph-piece={piece.stage}
          data-glyph-draw={fresh ? 'yes' : 'no'}
        />
      )
    }
    return (
      <path
        key={piece.key}
        className={`is-stroke${fresh ? ' is-draw' : ''}`}
        d={piece.d}
        pathLength={1}
        data-glyph-piece={piece.stage}
        data-glyph-draw={fresh ? 'yes' : 'no'}
      />
    )
  })

  const marks = {
    className: `lamp-upgrade-glyph is-${tone}${variant === 'map' ? ' defend-level-pip' : ''}`,
    'data-glyph-stage': stage,
    'data-glyph-tone': tone,
    'data-glyph-variant': variant,
    'aria-hidden': true as const,
  }

  if (variant === 'map') {
    if (!box) return <g ref={svgRef} data-glyph-anchor="map" pointerEvents="none" />
    const scale = box.units / LAMP_GLYPH_VIEW
    return (
      <g
        ref={svgRef}
        id={domId}
        {...marks}
        transform={`translate(${box.x} ${box.y}) scale(${scale})`}
      >
        <rect className="is-pad" x={0} y={0} width={LAMP_GLYPH_VIEW} height={LAMP_GLYPH_VIEW} />
        {body}
      </g>
    )
  }
  return (
    <svg
      ref={(node) => {
        svgRef.current = node
      }}
      {...marks}
      viewBox={`0 0 ${LAMP_GLYPH_VIEW} ${LAMP_GLYPH_VIEW}`}
      width={28}
      height={28}
    >
      <rect className="is-pad" x={0} y={0} width={LAMP_GLYPH_VIEW} height={LAMP_GLYPH_VIEW} />
      {body}
    </svg>
  )
}
