import { useMemo, useState } from 'react'
import { shuffle } from '../../lib/shuffle'
import type { MatchChallenge } from '../../types'
import { PuzzleHint } from './PuzzleHint'
import { ResultPanel } from './ResultPanel'

interface MatchPlayProps {
  challenge: MatchChallenge
  onMiss: () => void
  onSolved: () => void
}

export function MatchPlay({ challenge, onMiss, onSolved }: MatchPlayProps) {
  const left = challenge.pairs
  const right = useMemo(
    () => shuffle(challenge.pairs.map((pair) => ({ id: pair.id, text: pair.right }))),
    [challenge.pairs],
  )
  const [locked, setLocked] = useState<string[]>([])
  const [pickedLeft, setPickedLeft] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'wrong' | 'ok'>('idle')

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
    onMiss()
    window.setTimeout(() => {
      setFlash(null)
      setPickedLeft(null)
    }, 420)
  }

  return (
    <div className={`play ${status === 'ok' ? 'is-win' : ''}`}>
      <PuzzleHint text={challenge.context} />
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
        {locked.length} / {challenge.pairs.length} snapped
      </p>

      <ResultPanel
        tone={status === 'ok' ? 'ok' : 'idle'}
        title="All pairs snap!"
        deeper={challenge.deeper ?? challenge.teachOnWrong}
      />
    </div>
  )
}
