import { useMemo, useState } from 'react'
import { shuffle } from '../../lib/shuffle'
import type { MatchChallenge } from '../../types'
import { PuzzleHint } from './PuzzleHint'
import { ResultPanel } from './ResultPanel'

interface MatchPlayProps {
  challenge: MatchChallenge
  onMiss: () => void
  onSolved: () => void
  onPeek?: () => void
}

export function MatchPlay({ challenge, onMiss, onSolved, onPeek }: MatchPlayProps) {
  const left = challenge.pairs
  const right = useMemo(
    () => shuffle(challenge.pairs.map((pair) => ({ id: pair.id, text: pair.right }))),
    [challenge.pairs],
  )
  const [locked, setLocked] = useState<string[]>([])
  const [pickedLeft, setPickedLeft] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'wrong' | 'ok'>('idle')
  const [shake, setShake] = useState(false)
  const [misses, setMisses] = useState(0)

  function chooseLeft(id: string) {
    if (status === 'ok' || locked.includes(id)) return
    setPickedLeft((current) => (current === id ? null : id))
    setStatus('idle')
  }

  function chooseRight(id: string) {
    if (status === 'ok' || !pickedLeft || locked.includes(id)) return
    if (pickedLeft === id) {
      const next = [...locked, id]
      setLocked(next)
      setPickedLeft(null)
      setFlash(id)
      window.setTimeout(() => setFlash(null), 380)
      if (next.length === challenge.pairs.length) {
        setStatus('ok')
        onSolved()
      }
      return
    }
    setFlash(pickedLeft)
    setStatus('wrong')
    setShake(true)
    setMisses((count) => count + 1)
    onMiss()
    window.setTimeout(() => {
      setFlash(null)
      setPickedLeft(null)
      setShake(false)
    }, 420)
  }

  return (
    <div className={`play ${shake ? 'is-shake' : ''} ${status === 'ok' ? 'is-win' : ''}`}>
      <PuzzleHint text={challenge.context} onPeek={onPeek} />
      <p className="prompt">{challenge.prompt}</p>
      <p className="hint">Snap a pair. Right matches lock; misses flash and bounce.</p>

      <div className="match-grid">
        <div className="match-col">
          {left.map((pair) => (
            <button
              key={pair.id}
              type="button"
              className={`match-card ${pickedLeft === pair.id ? 'is-selected' : ''} ${locked.includes(pair.id) ? 'is-locked' : ''} ${flash === pair.id && !locked.includes(pair.id) ? 'is-flash' : ''}`}
              onClick={() => chooseLeft(pair.id)}
            >
              {pair.left}
            </button>
          ))}
        </div>
        <div className="match-col">
          {right.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`match-card right ${locked.includes(item.id) ? 'is-locked' : ''} ${pickedLeft ? 'awaiting' : ''} ${flash === item.id ? 'is-flash' : ''}`}
              onClick={() => chooseRight(item.id)}
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
        tone={status === 'ok' ? 'ok' : status === 'wrong' && misses >= 2 ? 'teach' : 'idle'}
        title={status === 'ok' ? 'All pairs snap!' : 'Shake and snap again.'}
        body={status === 'wrong' && misses >= 2 ? challenge.teachOnWrong : undefined}
        deeper={status === 'ok' ? (challenge.deeper ?? challenge.teachOnWrong) : undefined}
      />
    </div>
  )
}
