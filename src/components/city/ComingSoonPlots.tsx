import { useState } from 'react'
import { createPortal } from 'react-dom'
import { paidPacks } from '../../config/commerce'
import { playShopClosed } from '../../config/playBuild'

/** One line on a locked paid street. Not a price and not a purchase. */
export const COMING_SOON = 'Coming soon'

const SPOTS = [
  { x: 48, y: 78 },
  { x: 168, y: 78 },
  { x: 48, y: 168 },
  { x: 168, y: 168 },
]

/**
 * Paid streets on the Play map while the shop is off.
 * A tap shows one Coming soon line and a gold Back. It does not open checkout.
 */
export function ComingSoonPlots() {
  const [open, setOpen] = useState<string | null>(null)
  if (!playShopClosed()) return null
  const streets = paidPacks()
  if (!streets.length) return null

  return (
    <g className="city-coming-streets" data-coming-streets>
      {streets.map((pack, index) => {
        const spot = SPOTS[index] ?? { x: 48 + (index % 2) * 120, y: 78 + Math.floor(index / 2) * 90 }
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
            <circle r="36" fill="#2a0d58" stroke="#ffcc33" strokeWidth="3" style={{ cursor: 'pointer' }} />
            <text y="-6" textAnchor="middle" fill="#fff6e8" fontSize="11" pointerEvents="none">
              {pack.street}
            </text>
            <text y="12" textAnchor="middle" fill="#ffcc33" fontSize="11" pointerEvents="none">
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
