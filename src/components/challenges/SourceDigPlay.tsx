import { useMemo, useRef, useState } from 'react'
import { EASY, easyWhoWhere } from '../../lib/easy'
import {
  SOURCE_DIG_AGAIN,
  SOURCE_DIG_MISS,
  SOURCE_DIG_TAP_SCORE,
  SOURCE_DIG_WIN,
  SOURCE_DIG_WIN_SCORE,
  seatTablets,
  type DigTablet,
} from '../../lib/sourceDig'
import { GEM_BURST, playGemPop, prefersReducedMotion } from '../../lib/juice'
import { MatchTakeaway } from '../HeldTriad'
import { WinBurst } from './WinBurst'

interface SourceDigPlayProps {
  lineId: string
  onMiss: () => void
  onClear?: () => void
  onEasyStop?: (dest: 'hold' | 'home') => void
}

const POP_SHARDS = [0, 1, 2, 3, 4]

export function SourceDigPlay({
  lineId,
  onMiss,
  onClear,
  onEasyStop,
}: SourceDigPlayProps) {
  const home = easyWhoWhere(lineId)
  const reduced = prefersReducedMotion()
  const [seed, setSeed] = useState(() => Date.now() % 9999)
  const seats = useMemo(() => seatTablets(lineId, seed), [lineId, seed])
  const [nextId, setNextId] = useState(0)
  const [open, setOpen] = useState<number[]>([])
  const [shake, setShake] = useState(false)
  const [toast, setToast] = useState('')
  const [won, setWon] = useState(false)
  const [winStamp, setWinStamp] = useState(false)
  const [score, setScore] = useState(0)
  const [plusFlash, setPlusFlash] = useState('')
  const [comboFlash, setComboFlash] = useState(0)
  const [popId, setPopId] = useState<number | null>(null)
  const comboRef = useRef(0)
  const cleared = useRef(false)

  function flashPlus(line: string) {
    setPlusFlash(line)
    window.setTimeout(() => setPlusFlash((current) => (current === line ? '' : current)), 800)
  }

  function replay() {
    cleared.current = false
    comboRef.current = 0
    setSeed(Date.now() % 9999)
    setNextId(0)
    setOpen([])
    setToast('One more dig. Tap the glow.')
    setWon(false)
    setWinStamp(false)
    setScore(0)
    setPlusFlash('')
    setComboFlash(0)
    setPopId(null)
    window.setTimeout(() => setToast((current) => (current === 'One more dig. Tap the glow.' ? '' : current)), 1400)
  }

  function tap(tablet: DigTablet) {
    if (won) return
    if (open.includes(tablet.id)) return
    if (tablet.id !== nextId) {
      playGemPop('miss')
      comboRef.current = 0
      setShake(true)
      setToast(SOURCE_DIG_MISS)
      setScore((pts) => Math.max(0, pts - 25))
      flashPlus(SOURCE_DIG_MISS)
      onMiss()
      window.setTimeout(() => setShake(false), 360)
      window.setTimeout(() => setToast((current) => (current === SOURCE_DIG_MISS ? '' : current)), 900)
      return
    }
    playGemPop(tablet.id >= 2 ? 'win' : 'find')
    const dug = [...open, tablet.id]
    comboRef.current += 1
    setOpen(dug)
    setToast('')
    setPopId(tablet.id)
    window.setTimeout(() => setPopId((current) => (current === tablet.id ? null : current)), 420)
    setScore((pts) => pts + SOURCE_DIG_TAP_SCORE)
    flashPlus(`+${SOURCE_DIG_TAP_SCORE}`)
    if (comboRef.current >= 2) {
      setComboFlash(comboRef.current)
      window.setTimeout(() => setComboFlash(0), 700)
    }
    if (dug.length >= seats.length) {
      setWon(true)
      setScore((pts) => pts + SOURCE_DIG_WIN_SCORE)
      flashPlus(`+${SOURCE_DIG_WIN_SCORE}`)
      if (!cleared.current) {
        cleared.current = true
        onClear?.()
      }
      window.setTimeout(() => setWinStamp(true), reduced ? 40 : 280)
      return
    }
    setNextId(nextId + 1)
  }

  return (
    <div className={`play is-source-dig ${shake ? 'is-shake' : ''} ${won ? 'is-win' : ''}`}>
      <p className="sort-how">{EASY.digHunt}</p>
      <p className="story-kicker">
        {home.who} · {home.place}
      </p>
      {toast ? (
        <p className={`match-toast gem-toast ${toast === SOURCE_DIG_MISS ? 'is-miss' : 'is-yes'}`} role="status">
          <strong>{toast}</strong>
        </p>
      ) : null}
      {plusFlash ? (
        <p className="bonus-plus" aria-hidden>
          {plusFlash}!
        </p>
      ) : null}
      {comboFlash > 1 ? (
        <p className="dig-combo" role="status">
          Combo ×{comboFlash}
        </p>
      ) : null}
      <div className="dig-board" role="application" aria-label="Ancient source dig">
        <WinBurst play={winStamp} stamp={SOURCE_DIG_WIN} />
        {seats.map((tablet) => {
          const flipped = open.includes(tablet.id)
          const glow = !won && tablet.id === nextId
          const popping = popId === tablet.id
          return (
            <button
              key={`${seed}-${tablet.id}`}
              type="button"
              className={`dig-tablet hue-${tablet.era} ${flipped ? 'is-open' : ''} ${glow ? 'is-glow' : ''} ${popping ? 'is-pop' : ''}`}
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
              {popping
                ? POP_SHARDS.map((i) => (
                    <i key={i} className="dig-shard" style={{ ['--i' as string]: i }} />
                  ))
                : null}
              {popping
                ? GEM_BURST.slice(0, 4).map((i) => (
                    <b key={`p-${i}`} className="dig-burst" style={{ ['--i' as string]: i }} />
                  ))
                : null}
            </button>
          )
        })}
      </div>
      <p className={`match-score ${plusFlash ? 'is-juice' : ''}`}>
        {score}
        {' · '}
        {open.length} / {seats.length}
      </p>
      {won ? (
        <>
          <MatchTakeaway lineId={lineId} />
          <div className="cta-dock">
            <button
              type="button"
              className="btn primary xl snap-bins"
              onClick={() => onEasyStop?.('hold')}
            >
              {EASY.holdNext}
            </button>
            <button type="button" className="btn gold xl" data-dig-again onClick={replay}>
              {SOURCE_DIG_AGAIN}
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
