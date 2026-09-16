import { useMemo, useRef, useState } from 'react'
import { EASY, easyWhoWhere } from '../../lib/easy'
import {
  SOURCE_DIG_HINT,
  SOURCE_DIG_MISS,
  SOURCE_DIG_WIN,
  digClaim,
  seatTablets,
  type DigTablet,
} from '../../lib/sourceDig'
import { playGemPop } from '../../lib/juice'
import { WinBurst } from './WinBurst'

interface SourceDigPlayProps {
  lineId: string
  onMiss: () => void
  onClear?: () => void
  onEasyStop?: (dest: 'hold' | 'home') => void
}

export function SourceDigPlay({
  lineId,
  onMiss,
  onClear,
  onEasyStop,
}: SourceDigPlayProps) {
  const home = easyWhoWhere(lineId)
  const claim = digClaim(lineId)
  const [seed, setSeed] = useState(() => Date.now() % 9999)
  const seats = useMemo(() => seatTablets(lineId, seed), [lineId, seed])
  const [nextId, setNextId] = useState(0)
  const [open, setOpen] = useState<number[]>([])
  const [shake, setShake] = useState(false)
  const [toast, setToast] = useState('')
  const [won, setWon] = useState(false)
  const cleared = useRef(false)

  function replay() {
    cleared.current = false
    setSeed(Date.now() % 9999)
    setNextId(0)
    setOpen([])
    setToast('')
    setWon(false)
  }

  function tap(tablet: DigTablet) {
    if (won) return
    if (open.includes(tablet.id)) return
    if (tablet.id !== nextId) {
      playGemPop('miss')
      setShake(true)
      setToast(SOURCE_DIG_MISS)
      onMiss()
      window.setTimeout(() => setShake(false), 360)
      window.setTimeout(() => setToast(''), 900)
      return
    }
    playGemPop(tablet.id >= 2 ? 'win' : 'find')
    const dug = [...open, tablet.id]
    setOpen(dug)
    setToast('')
    if (dug.length >= seats.length) {
      setWon(true)
      if (!cleared.current) {
        cleared.current = true
        onClear?.()
      }
      return
    }
    setNextId(nextId + 1)
  }

  return (
    <div className={`play is-source-dig ${shake ? 'is-shake' : ''} ${won ? 'is-win' : ''}`}>
      {won ? null : <p className="sort-how">{SOURCE_DIG_HINT}</p>}
      <p className="story-kicker">
        {home.who} · {home.place}
      </p>
      {toast ? (
        <p className="miss-banner" role="status">
          <strong>{toast}</strong>
        </p>
      ) : null}
      <div className="dig-board" role="application" aria-label="Ancient source dig">
        <WinBurst play={won} stamp={SOURCE_DIG_WIN} />
        {seats.map((tablet) => {
          const flipped = open.includes(tablet.id)
          const glow = !won && tablet.id === nextId
          return (
            <button
              key={tablet.id}
              type="button"
              className={`dig-tablet hue-${tablet.era} ${flipped ? 'is-open' : ''} ${glow ? 'is-glow' : ''}`}
              data-dig-tablet={tablet.id}
              onClick={() => tap(tablet)}
              disabled={won}
            >
              {flipped ? (
                <>
                  <span className="dig-era">{tablet.era === 'scripture' ? 'Scripture' : 'Ancient'}</span>
                  <strong>{tablet.title}</strong>
                  <em>{tablet.bite}</em>
                </>
              ) : (
                <>
                  <span className="dig-era">{glow ? 'Dig' : 'Wait'}</span>
                  <strong>{glow ? 'Tap' : '·'}</strong>
                </>
              )}
            </button>
          )
        })}
      </div>
      {won ? (
        <>
          <p className="match-yes" role="status">
            <strong>{claim}</strong>
          </p>
          <div className="cta-dock">
            <button
              type="button"
              className="btn primary xl snap-bins"
              onClick={() => onEasyStop?.('hold')}
            >
              {EASY.holdNext}
            </button>
            <button type="button" className="btn gold xl" onClick={replay}>
              Dig again
            </button>
            <button type="button" className="btn xl" onClick={() => onEasyStop?.('home')}>
              {EASY.home}
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}
