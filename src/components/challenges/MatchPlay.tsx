import { useMemo, useState } from 'react'
import { shuffle } from '../../lib/shuffle'
import type { MatchChallenge } from '../../types'
import { GemMark } from '../GemMark'
import { burstStyle } from '../../lib/juice'
import { PuzzleHint } from './PuzzleHint'
import { PuzzleLead } from './PuzzleLead'
import { ResultPanel } from './ResultPanel'
import { WinBurst } from './WinBurst'

interface MatchPlayProps {
  challenge: MatchChallenge
  onMiss: () => void
  onSolved: () => void
  onPeek?: () => void
}

type Side = 'left' | 'right'

export function MatchPlay({ challenge, onMiss, onSolved, onPeek }: MatchPlayProps) {
  const left = challenge.pairs
  const right = useMemo(
    () => shuffle(challenge.pairs.map((pair) => ({ id: pair.id, text: pair.right }))),
    [challenge.pairs],
  )
  const [locked, setLocked] = useState<string[]>([])
  const [picked, setPicked] = useState<{ side: Side; id: string } | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'wrong' | 'ok'>('idle')
  const [shake, setShake] = useState(false)
  const [misses, setMisses] = useState(0)

  function choose(side: Side, id: string) {
    if (status === 'ok' || shake || locked.includes(id)) return
    if (!picked || picked.side === side) {
      setPicked((current) =>
        current?.side === side && current.id === id ? null : { side, id },
      )
      setStatus('idle')
      return
    }
    if (picked.id === id) {
      const next = [...locked, id]
      setLocked(next)
      setPicked(null)
      setFlash(id)
      window.setTimeout(() => setFlash(null), 380)
      if (next.length === challenge.pairs.length) {
        setStatus('ok')
        onSolved()
      }
      return
    }
    setFlash(picked.id)
    setStatus('wrong')
    setShake(true)
    setMisses((count) => count + 1)
    onMiss()
    window.setTimeout(() => {
      setFlash(null)
      setPicked(null)
      setShake(false)
    }, 880)
  }

  return (
    <div className={`play is-match ${shake ? 'is-shake' : ''} ${status === 'ok' ? 'is-win' : ''}`}>
      <WinBurst play={status === 'ok'} />
      <PuzzleLead challenge={challenge} />
      <PuzzleHint text={challenge.context} onPeek={onPeek} />
      <p className="sort-how">
        <strong>Tap a picture</strong>, then the claim that belongs
      </p>

      <div className="match-grid">
        <div className="match-col">
          <p className="match-col-label">Picture</p>
          {left.map((pair, index) => (
            <button
              key={pair.id}
              type="button"
              className={`match-card ${pair.gem ? 'is-gem' : ''} ${picked?.side === 'left' && picked.id === pair.id ? 'is-selected' : ''} ${locked.includes(pair.id) ? 'is-locked' : ''} ${flash === pair.id && !locked.includes(pair.id) ? 'is-flash' : ''} ${picked && picked.side === 'right' && !locked.includes(pair.id) ? 'awaiting' : ''}`}
              style={status === 'ok' ? burstStyle(index, 'keep') : undefined}
              onClick={(event) => {
                event.stopPropagation()
                choose('left', pair.id)
              }}
            >
              {pair.gem ? <GemMark gem={pair.gem} /> : null}
              {pair.left}
            </button>
          ))}
        </div>
        <div className="match-col">
          <p className="match-col-label">Claim</p>
          {right.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`match-card right ${picked?.side === 'right' && picked.id === item.id ? 'is-selected' : ''} ${locked.includes(item.id) ? 'is-locked' : ''} ${flash === item.id ? 'is-flash' : ''} ${picked && picked.side === 'left' && !locked.includes(item.id) ? 'awaiting' : ''}`}
              style={status === 'ok' ? burstStyle(index, 'discard') : undefined}
              onClick={(event) => {
                event.stopPropagation()
                choose('right', item.id)
              }}
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>

      <p className="match-score">
        {challenge.pairs.length - locked.length} left · {locked.length} /{' '}
        {challenge.pairs.length} snapped
      </p>

      <ResultPanel
        tone={status === 'ok' ? 'ok' : status === 'wrong' ? 'teach' : 'idle'}
        kicker={
          status === 'ok'
            ? 'Well reasoned'
            : misses >= 2
              ? 'One more look'
              : 'Those two don’t snap'
        }
        title={status === 'ok' ? 'All pairs snap!' : 'Shake and pick a new pair.'}
        body={
          status === 'wrong'
            ? misses >= 2
              ? challenge.teachOnWrong
              : 'Leave that pairing. The match is a neighbor, not a look-alike.'
            : undefined
        }
        deeper={status === 'ok' ? (challenge.deeper ?? challenge.teachOnWrong) : undefined}
      />
    </div>
  )
}
