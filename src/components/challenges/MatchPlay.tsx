import { useMemo, useState } from 'react'
import { shuffle } from '../../lib/shuffle'
import type { MatchChallenge } from '../../types'
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
  const [links, setLinks] = useState<Record<string, string>>({})
  const [pickedLeft, setPickedLeft] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'wrong' | 'ok'>('idle')

  function chooseLeft(id: string) {
    if (status === 'ok') return
    setPickedLeft((current) => (current === id ? null : id))
    setStatus('idle')
  }

  function chooseRight(id: string) {
    if (status === 'ok' || !pickedLeft) return
    setLinks((current) => {
      const next = { ...current }
      for (const key of Object.keys(next)) {
        if (next[key] === id) delete next[key]
      }
      next[pickedLeft] = id
      return next
    })
    setPickedLeft(null)
  }

  function check() {
    const ok =
      challenge.pairs.every((pair) => links[pair.id] === pair.id) &&
      Object.keys(links).length === challenge.pairs.length
    if (ok) {
      setStatus('ok')
      onSolved()
    } else {
      setStatus('wrong')
      onMiss()
    }
  }

  return (
    <div className="play">
      {challenge.context ? <p className="context">{challenge.context}</p> : null}
      <p className="prompt">{challenge.prompt}</p>
      <p className="hint">Tap a claim on the left, then the matching account on the right.</p>

      <div className="match-grid">
        <div className="match-col">
          {left.map((pair) => (
            <button
              key={pair.id}
              type="button"
              className={`match-card ${pickedLeft === pair.id ? 'is-selected' : ''} ${links[pair.id] ? 'is-linked' : ''}`}
              onClick={() => chooseLeft(pair.id)}
            >
              {pair.left}
            </button>
          ))}
        </div>
        <div className="match-col">
          {right.map((item) => {
            const used = Object.values(links).includes(item.id)
            return (
              <button
                key={item.id}
                type="button"
                className={`match-card right ${used ? 'is-linked' : ''} ${pickedLeft ? 'awaiting' : ''}`}
                onClick={() => chooseRight(item.id)}
              >
                {item.text}
              </button>
            )
          })}
        </div>
      </div>

      {status !== 'ok' ? (
        <button
          type="button"
          className="btn primary"
          disabled={Object.keys(links).length !== challenge.pairs.length}
          onClick={check}
        >
          Check the pairs
        </button>
      ) : null}

      <ResultPanel
        tone={status === 'idle' ? 'idle' : status === 'ok' ? 'ok' : 'teach'}
        title={status === 'ok' ? 'Those belong together.' : 'One or more pairs still slip.'}
        body={status === 'wrong' ? challenge.teachOnWrong : undefined}
        deeper={challenge.deeper}
      />
    </div>
  )
}
