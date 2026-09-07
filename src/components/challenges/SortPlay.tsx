import { useMemo, useState } from 'react'
import { shuffle } from '../../lib/shuffle'
import type { SortChallenge, SortTile } from '../../types'
import { PuzzleHint } from './PuzzleHint'
import { ResultPanel } from './ResultPanel'

interface SortPlayProps {
  challenge: SortChallenge
  onMiss: () => void
  onSolved: () => void
  onPeek?: () => void
}

type Bin = 'keep' | 'discard'

export function SortPlay({ challenge, onMiss, onSolved, onPeek }: SortPlayProps) {
  const seed = useMemo(() => shuffle(challenge.tiles), [challenge.tiles])
  const [bank, setBank] = useState(seed)
  const [keep, setKeep] = useState<SortTile[]>([])
  const [discard, setDiscard] = useState<SortTile[]>([])
  const [picked, setPicked] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'wrong' | 'ok'>('idle')
  const [shake, setShake] = useState(false)

  function takeTile(id: string): SortTile | undefined {
    return (
      bank.find((tile) => tile.id === id) ??
      keep.find((tile) => tile.id === id) ??
      discard.find((tile) => tile.id === id)
    )
  }

  function removeFromAll(id: string) {
    setBank((current) => current.filter((tile) => tile.id !== id))
    setKeep((current) => current.filter((tile) => tile.id !== id))
    setDiscard((current) => current.filter((tile) => tile.id !== id))
  }

  function drop(bin: Bin) {
    if (status === 'ok' || !picked) return
    const tile = takeTile(picked)
    if (!tile) return
    removeFromAll(tile.id)
    if (bin === 'keep') setKeep((current) => [...current, tile])
    else setDiscard((current) => [...current, tile])
    setPicked(null)
    setStatus('idle')
  }

  function returnToBank(id: string) {
    if (status === 'ok') return
    const tile = takeTile(id)
    if (!tile) return
    removeFromAll(id)
    setBank((current) => [...current, tile])
    setStatus('idle')
  }

  function check() {
    const placed = [...keep, ...discard]
    if (placed.length !== challenge.tiles.length) return
    const ok =
      keep.every((tile) => tile.bin === 'keep') &&
      discard.every((tile) => tile.bin === 'discard') &&
      keep.length === challenge.tiles.filter((tile) => tile.bin === 'keep').length
    if (ok) {
      setStatus('ok')
      onSolved()
      return
    }
    setStatus('wrong')
    setShake(true)
    onMiss()
    window.setTimeout(() => {
      setShake(false)
      setBank(shuffle(challenge.tiles))
      setKeep([])
      setDiscard([])
    }, 520)
  }

  return (
    <div className={`play ${shake ? 'is-shake' : ''} ${status === 'ok' ? 'is-win' : ''}`}>
      <PuzzleHint text={challenge.context} onPeek={onPeek} />
      <p className="prompt">{challenge.prompt}</p>
      <p className="hint">Tap a tile, then drop it in Keep or Toss.</p>

      <div className="sort-bins">
        <div className={`bin keep ${picked ? 'awaiting' : ''}`}>
          <button type="button" className="bin-head" onClick={() => drop('keep')}>
            {challenge.keepLabel}
          </button>
          <div className="bin-body">
            {keep.map((tile) => (
              <button
                key={tile.id}
                type="button"
                className="chip in-bin"
                onClick={() => returnToBank(tile.id)}
              >
                {tile.text}
              </button>
            ))}
          </div>
        </div>
        <div className={`bin toss ${picked ? 'awaiting' : ''}`}>
          <button type="button" className="bin-head toss" onClick={() => drop('discard')}>
            {challenge.discardLabel}
          </button>
          <div className="bin-body">
            {discard.map((tile) => (
              <button
                key={tile.id}
                type="button"
                className="chip in-bin"
                onClick={() => returnToBank(tile.id)}
              >
                {tile.text}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bank">
        {bank.map((tile) => (
          <button
            key={tile.id}
            type="button"
            className={`chip ${picked === tile.id ? 'is-selected' : ''}`}
            onClick={() => setPicked(tile.id === picked ? null : tile.id)}
          >
            {tile.text}
          </button>
        ))}
      </div>

      {status !== 'ok' ? (
        <button
          type="button"
          className="btn primary"
          disabled={bank.length > 0}
          onClick={check}
        >
          Snap the bins
        </button>
      ) : null}

      <ResultPanel
        tone={status === 'idle' ? 'idle' : status === 'ok' ? 'ok' : 'teach'}
        title={status === 'ok' ? 'Clean sort!' : 'Those bins still mix.'}
        body={status === 'wrong' ? challenge.teachOnWrong : undefined}
        deeper={challenge.deeper}
      />
    </div>
  )
}
