import { useMemo, useState } from 'react'
import { shuffle } from '../../lib/shuffle'
import type { SequenceChallenge } from '../../types'
import { ResultPanel } from './ResultPanel'

interface SequencePlayProps {
  challenge: SequenceChallenge
  onMiss: () => void
  onSolved: () => void
}

export function SequencePlay({ challenge, onMiss, onSolved }: SequencePlayProps) {
  const bankSeed = useMemo(() => shuffle(challenge.items), [challenge.items])
  const [bank, setBank] = useState(bankSeed)
  const [chain, setChain] = useState<typeof challenge.items>([])
  const [status, setStatus] = useState<'idle' | 'wrong' | 'ok'>('idle')

  function add(id: string) {
    if (status === 'ok') return
    const item = bank.find((entry) => entry.id === id)
    if (!item) return
    setBank((current) => current.filter((entry) => entry.id !== id))
    setChain((current) => [...current, item])
    setStatus('idle')
  }

  function remove(id: string) {
    if (status === 'ok') return
    const item = chain.find((entry) => entry.id === id)
    if (!item) return
    setChain((current) => current.filter((entry) => entry.id !== id))
    setBank((current) => [...current, item])
    setStatus('idle')
  }

  function check() {
    const correct =
      chain.length === challenge.items.length &&
      chain.every((item, index) => item.id === challenge.items[index]?.id)
    if (correct) {
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

      <ol className="chain">
        {challenge.items.map((item, index) => {
          const placed = chain[index]
          return (
            <li key={item.id} className={placed ? 'filled' : 'empty'}>
              <span className="chain-index">{index + 1}</span>
              {placed ? (
                <button type="button" className="chip in-chain" onClick={() => remove(placed.id)}>
                  {placed.text}
                </button>
              ) : (
                <span className="placeholder">Tap a step below</span>
              )}
            </li>
          )
        })}
      </ol>

      <div className="bank">
        {bank.map((item) => (
          <button key={item.id} type="button" className="chip" onClick={() => add(item.id)}>
            {item.text}
          </button>
        ))}
      </div>

      {status !== 'ok' ? (
        <button
          type="button"
          className="btn primary"
          disabled={chain.length !== challenge.items.length}
          onClick={check}
        >
          Check the order
        </button>
      ) : null}

      <ResultPanel
        tone={status === 'idle' ? 'idle' : status === 'ok' ? 'ok' : 'teach'}
        title={status === 'ok' ? 'The sequence holds.' : 'The order is the argument.'}
        body={status === 'wrong' ? challenge.teachOnWrong : undefined}
        deeper={challenge.deeper}
      />
    </div>
  )
}
