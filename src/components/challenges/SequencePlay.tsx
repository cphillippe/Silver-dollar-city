import { useMemo, useState } from 'react'
import { shuffle } from '../../lib/shuffle'
import type { SequenceChallenge } from '../../types'
import { PuzzleHint } from './PuzzleHint'
import { ResultPanel } from './ResultPanel'

interface SequencePlayProps {
  challenge: SequenceChallenge
  onMiss: () => void
  onSolved: () => void
  onPeek?: () => void
}

export function SequencePlay({ challenge, onMiss, onSolved, onPeek }: SequencePlayProps) {
  const bankSeed = useMemo(() => shuffle(challenge.items), [challenge.items])
  const [bank, setBank] = useState(bankSeed)
  const [chain, setChain] = useState<typeof challenge.items>([])
  const [status, setStatus] = useState<'idle' | 'wrong' | 'ok'>('idle')
  const [shake, setShake] = useState(false)
  const [misses, setMisses] = useState(0)
  const [breakHint, setBreakHint] = useState('')

  function add(id: string) {
    if (status === 'ok') return
    const item = bank.find((entry) => entry.id === id)
    if (!item) return
    const nextChain = [...chain, item]
    const nextBank = bank.filter((entry) => entry.id !== id)
    setBank(nextBank)
    setChain(nextChain)
    setStatus('idle')
    if (nextBank.length === 0) {
      window.setTimeout(() => evaluate(nextChain), 80)
    }
  }

  function remove(id: string) {
    if (status === 'ok') return
    const item = chain.find((entry) => entry.id === id)
    if (!item) return
    setChain((current) => current.filter((entry) => entry.id !== id))
    setBank((current) => [...current, item])
    setStatus('idle')
  }

  function evaluate(nextChain = chain) {
    const correct =
      nextChain.length === challenge.items.length &&
      nextChain.every((item, index) => item.id === challenge.items[index]?.id)
    if (correct) {
      setStatus('ok')
      onSolved()
      return
    }
    const breakAt = nextChain.findIndex(
      (item, index) => item.id !== challenge.items[index]?.id,
    )
    const step = (breakAt === -1 ? nextChain.length : breakAt) + 1
    const nudge =
      step <= 1
        ? 'The first stone is already off. The claim starts somewhere else.'
        : `The first ${step - 1} sat right. The chain broke at step ${step} — try that stone again.`
    setStatus('wrong')
    setShake(true)
    setMisses((count) => count + 1)
    setBreakHint(nudge)
    onMiss()
    window.setTimeout(() => {
      setShake(false)
      setBank(shuffle(challenge.items))
      setChain([])
    }, 620)
  }

  return (
    <div className={`play ${shake ? 'is-shake' : ''} ${status === 'ok' ? 'is-win' : ''}`}>
      <p className="prompt">{challenge.prompt}</p>
      <PuzzleHint text={challenge.context} onPeek={onPeek} />
      <p className="hint">Tap tiles in order. The chain checks itself when full.</p>

      <ol className="chain">
        {challenge.items.map((item, index) => {
          const placed = chain[index]
          return (
            <li key={item.id} className={placed ? 'filled pop-in' : 'empty'}>
              <span className="chain-index">{index + 1}</span>
              {placed ? (
                <button type="button" className="chip in-chain" onClick={() => remove(placed.id)}>
                  {placed.text}
                </button>
              ) : (
                <span className="placeholder">Next step</span>
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

      <ResultPanel
        tone={status === 'idle' ? 'idle' : status === 'ok' ? 'ok' : 'teach'}
        kicker={
          status === 'ok'
            ? 'Well reasoned'
            : misses >= 2
              ? 'One more look'
              : 'The chain bounced'
        }
        title={
          status === 'ok'
            ? 'The path locks in.'
            : misses >= 2
              ? 'Not that order — tiles bounce back.'
              : breakHint || 'Shake and try the chain again.'
        }
        body={
          status === 'wrong'
            ? misses >= 2
              ? challenge.teachOnWrong
              : 'No lecture — just find the stone that jumped the line.'
            : undefined
        }
        deeper={challenge.deeper}
      />
    </div>
  )
}
