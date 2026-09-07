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
  const [misses, setMisses] = useState(0)

  function allTiles(
    nextBank = bank,
    nextKeep = keep,
    nextDiscard = discard,
  ) {
    return [...nextBank, ...nextKeep, ...nextDiscard]
  }

  function takeTile(
    id: string,
    nextBank = bank,
    nextKeep = keep,
    nextDiscard = discard,
  ): SortTile | undefined {
    return allTiles(nextBank, nextKeep, nextDiscard).find((tile) => tile.id === id)
  }

  function place(id: string, bin: Bin) {
    if (status === 'ok') return
    const tile = takeTile(id)
    if (!tile) return
    const nextBank = bank.filter((item) => item.id !== id)
    const nextKeep = keep.filter((item) => item.id !== id)
    const nextDiscard = discard.filter((item) => item.id !== id)
    if (bin === 'keep') nextKeep.push(tile)
    else nextDiscard.push(tile)
    setBank(nextBank)
    setKeep(nextKeep)
    setDiscard(nextDiscard)
    setPicked(null)
    setStatus('idle')
    if (nextBank.length === 0) {
      window.setTimeout(() => evaluate(nextKeep, nextDiscard), 80)
    }
  }

  function drop(bin: Bin) {
    if (!picked) return
    place(picked, bin)
  }

  function returnToBank(id: string) {
    if (status === 'ok') return
    const tile = takeTile(id)
    if (!tile) return
    setKeep((current) => current.filter((item) => item.id !== id))
    setDiscard((current) => current.filter((item) => item.id !== id))
    setBank((current) =>
      current.some((item) => item.id === id) ? current : [...current, tile],
    )
    setStatus('idle')
  }

  function evaluate(nextKeep = keep, nextDiscard = discard) {
    const ok =
      nextKeep.every((tile) => tile.bin === 'keep') &&
      nextDiscard.every((tile) => tile.bin === 'discard') &&
      nextKeep.length + nextDiscard.length === challenge.tiles.length &&
      nextKeep.length === challenge.tiles.filter((tile) => tile.bin === 'keep').length
    if (ok) {
      setStatus('ok')
      onSolved()
      return
    }
    setStatus('wrong')
    setShake(true)
    setMisses((count) => count + 1)
    onMiss()
    window.setTimeout(() => {
      setShake(false)
      setBank(shuffle(challenge.tiles))
      setKeep([])
      setDiscard([])
      setPicked(null)
    }, 520)
  }

  const selected = picked ? takeTile(picked) : undefined

  return (
    <div className={`play ${shake ? 'is-shake' : ''} ${status === 'ok' ? 'is-win' : ''}`}>
      <PuzzleHint text={challenge.context} onPeek={onPeek} />
      <p className="prompt">{challenge.prompt}</p>
      <p className="sort-how">
        <span>
          <strong>Keep</strong> this belongs
        </span>
        <span>
          <strong>Toss</strong> set it aside
        </span>
      </p>

      <div className="sort-bins">
        <div
          className={`bin keep ${picked ? 'awaiting' : ''}`}
          onClick={() => drop('keep')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              drop('keep')
            }
          }}
          role="button"
          tabIndex={0}
        >
          <span className="bin-head">Keep</span>
          <span className="bin-body">
            {keep.length === 0 ? (
              <span className="placeholder">
                {selected
                  ? `Keep: ${selected.text}`
                  : 'Lines that belong'}
              </span>
            ) : (
              keep.map((tile) => (
                <button
                  key={tile.id}
                  type="button"
                  className="chip in-bin"
                  onClick={(event) => {
                    event.stopPropagation()
                    returnToBank(tile.id)
                  }}
                >
                  {tile.text}
                </button>
              ))
            )}
          </span>
        </div>
        <div
          className={`bin toss ${picked ? 'awaiting' : ''}`}
          onClick={() => drop('discard')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              drop('discard')
            }
          }}
          role="button"
          tabIndex={0}
        >
          <span className="bin-head toss">Toss</span>
          <span className="bin-body">
            {discard.length === 0 ? (
              <span className="placeholder">
                {selected
                  ? `Toss: ${selected.text}`
                  : 'Set aside — not the claim'}
              </span>
            ) : (
              discard.map((tile) => (
                <button
                  key={tile.id}
                  type="button"
                  className="chip in-bin"
                  onClick={(event) => {
                    event.stopPropagation()
                    returnToBank(tile.id)
                  }}
                >
                  {tile.text}
                </button>
              ))
            )}
          </span>
        </div>
      </div>

      <div className="bank">
        {bank.map((tile) => (
          <div
            key={tile.id}
            className={`sort-tile ${picked === tile.id ? 'is-selected' : ''}`}
          >
            <button
              type="button"
              className="chip"
              onClick={() => setPicked(tile.id === picked ? null : tile.id)}
            >
              {tile.text}
            </button>
            <span className="sort-tile-actions">
              <button
                type="button"
                className="btn tiny keep"
                onClick={() => place(tile.id, 'keep')}
              >
                Keep
              </button>
              <button
                type="button"
                className="btn tiny toss"
                onClick={() => place(tile.id, 'discard')}
              >
                Toss
              </button>
            </span>
          </div>
        ))}
      </div>

      {status !== 'ok' && bank.length === 0 ? (
        <button type="button" className="btn primary" onClick={() => evaluate()}>
          Snap the bins
        </button>
      ) : null}

      <ResultPanel
        tone={status === 'idle' ? 'idle' : status === 'ok' ? 'ok' : 'teach'}
        kicker={
          status === 'ok'
            ? 'Well reasoned'
            : misses >= 2
              ? 'One more look'
              : 'A line is in the wrong bin'
        }
        title={
          status === 'ok'
            ? 'Clean sort!'
            : misses >= 2
              ? 'Those bins still mix.'
              : 'Keep vs toss — shake and sort again.'
        }
        body={
          status === 'wrong'
            ? misses >= 2
              ? challenge.teachOnWrong
              : 'Keep the lines that belong. Toss (set aside) the rest.'
            : undefined
        }
        deeper={challenge.deeper}
      />
    </div>
  )
}
