import { useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { paidPacks } from '../../config/commerce'
import { playShopClosed } from '../../config/playBuild'

/** One line on a locked paid street. Not a price and not a purchase. */
export const COMING_SOON = 'Coming soon'

interface PlotMetrics {
  font: number
  width: number
  height: number
  inset: number
  originX: number
  originY: number
}

const FALLBACK: PlotMetrics = {
  font: 22,
  width: 200,
  height: 96,
  inset: 28,
  originX: 0,
  originY: 0,
}

/**
 * Paid streets on the Play map while the shop is off.
 * A tap shows one Coming soon line and a gold Back. It does not open checkout.
 * On a phone the pill stays at least 48px and the label at least 12px, clear of the edge.
 */
export function ComingSoonPlots({ svgSelector = '.city-svg' }: { svgSelector?: string } = {}) {
  const [open, setOpen] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<PlotMetrics>(FALLBACK)
  const closed = playShopClosed()

  useLayoutEffect(() => {
    if (!closed) return
    const measure = () => {
      const svg = document.querySelector(svgSelector)
      if (!(svg instanceof SVGSVGElement)) return
      const box = svg.getBoundingClientRect()
      const view = svg.viewBox.baseVal
      if (box.width < 1 || view.width < 1) return
      const scale = box.width / view.width
      setMetrics({
        font: 13 / scale,
        width: 132 / scale,
        height: 56 / scale,
        inset: 16 / scale,
        originX: view.x,
        originY: view.y,
      })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [closed, svgSelector])

  if (!closed) return null
  const streets = paidPacks()
  if (!streets.length) return null

  const { font, width, height, inset, originX, originY } = metrics
  const gap = inset
  const spots = streets.map((_, index) => {
    const col = index % 2
    const row = Math.floor(index / 2)
    return {
      x: originX + inset + width / 2 + col * (width + gap),
      y: originY + inset + height / 2 + 8 + row * (height + gap),
    }
  })

  return (
    <g className="city-coming-streets" data-coming-streets data-coming-ready="yes">
      {streets.map((pack, index) => {
        const spot = spots[index] ?? spots[0]!
        const choose = () => setOpen(pack.id)
        return (
          <g
            key={pack.id}
            transform={`translate(${spot.x} ${spot.y})`}
            role="button"
            tabIndex={0}
            data-coming-plot={pack.id}
            aria-label={`${pack.street}, ${COMING_SOON}`}
            onClick={(event) => {
              event.stopPropagation()
              choose()
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                choose()
              }
            }}
          >
            <rect
              x={-width / 2}
              y={-height / 2}
              width={width}
              height={height}
              rx={height / 4}
              fill="#2a0d58"
              stroke="#ffcc33"
              strokeWidth={3}
              style={{ cursor: 'pointer' }}
            />
            <text
              className="city-coming-label"
              data-coming-label={pack.id}
              y={-font * 0.35}
              textAnchor="middle"
              fill="#fff6e8"
              fontSize={font}
              fontWeight={700}
              pointerEvents="none"
            >
              {pack.street}
            </text>
            <text
              y={font * 0.85}
              textAnchor="middle"
              fill="#ffcc33"
              fontSize={font}
              fontWeight={700}
              pointerEvents="none"
            >
              {COMING_SOON}
            </text>
          </g>
        )
      })}
      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="coming-soon-sheet"
              data-coming-sheet={open}
              role="dialog"
              aria-label={COMING_SOON}
              style={{
                position: 'fixed',
                left: '50%',
                top: '42%',
                transform: 'translate(-50%, -50%)',
                zIndex: 80,
                width: 'min(280px, calc(100% - 32px))',
                padding: '16px',
                borderRadius: '18px',
                background: '#2a0d58',
                color: '#fff6e8',
                border: '3px solid #ffcc33',
                textAlign: 'center',
              }}
            >
              <p style={{ margin: '0 0 12px' }}>{COMING_SOON}</p>
              <button type="button" className="btn primary xl" onClick={() => setOpen(null)}>
                Back
              </button>
            </div>,
            document.body,
          )
        : null}
    </g>
  )
}
