import { useMemo, useState } from 'react'
import { shuffle } from '../../lib/shuffle'
import type { SortChallenge, SortTile } from '../../types'
import { STORY } from '../../content/story'
import { GemMark } from '../GemMark'
import { burstStyle } from '../../lib/juice'
import { PuzzleHint } from './PuzzleHint'
import { PuzzleLead } from './PuzzleLead'
import { ResultPanel } from './ResultPanel'
import { WinBurst } from './WinBurst'

interface SortPlayProps {
  challenge: SortChallenge
  onMiss: () => void
  onSolved: () => void
  onPeek?: () => void
}

type Bin = 'keep' | 'discard'

export function SortPlay({ challenge, onMiss, onSolved, onPeek }: SortPlayProps) {
  const seed = useMemo(() => shuffle(challenge.tiles), [challenge.tiles])
  const order = seed
  const [slots, setSlots] = useState<(SortTile | null)[]>(seed)
  const [keep, setKeep] = useState<SortTile[]>([])
  const [discard, setDiscard] = useState<SortTile[]>([])
  const [picked, setPicked] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'wrong' | 'ok'>('idle')
  const [shake, setShake] = useState(false)
  const [misses, setMisses] = useState(0)

  function filledSlots(nextSlots = slots) {
    return nextSlots.filter((tile): tile is SortTile => tile !== null)
  }

  function allTiles(
    nextSlots = slots,
    nextKeep = keep,
    nextDiscard = discard,
  ) {
    return [...filledSlots(nextSlots), ...nextKeep, ...nextDiscard]
  }

  function takeTile(
    id: string,
    nextSlots = slots,
    nextKeep = keep,
    nextDiscard = discard,
  ): SortTile | undefined {
    return allTiles(nextSlots, nextKeep, nextDiscard).find((tile) => tile.id === id)
  }

  function place(id: string, bin: Bin) {
    if (status === 'ok') return
    const tile = takeTile(id)
    if (!tile) return
    if (tile.bin !== bin) {
      setStatus('wrong')
      setShake(true)
      setMisses((count) => count + 1)
      setPicked(null)
      onMiss()
      window.setTimeout(() => {
        setShake(false)
        setStatus('idle')
      }, 880)
      return
    }
    const nextSlots = slots.map((item) => (item?.id === id ? null : item))
    const nextKeep = keep.filter((item) => item.id !== id)
    const nextDiscard = discard.filter((item) => item.id !== id)
    if (bin === 'keep') nextKeep.push(tile)
    else nextDiscard.push(tile)
    setSlots(nextSlots)
    setKeep(nextKeep)
    setDiscard(nextDiscard)
    setPicked(null)
    setStatus('idle')
  }

  function drop(bin: Bin) {
    if (!picked) return
    place(picked, bin)
  }

  function returnToBank(id: string) {
    if (status === 'ok' || shake) return
    const tile = takeTile(id)
    if (!tile) return
    const home = order.findIndex((item) => item.id === id)
    setKeep((current) => current.filter((item) => item.id !== id))
    setDiscard((current) => current.filter((item) => item.id !== id))
    setSlots((current) => {
      if (current.some((item) => item?.id === id)) return current
      const next = [...current]
      if (home >= 0) next[home] = tile
      return next
    })
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
      setStatus('idle')
    }, 880)
  }

  const selected = picked ? takeTile(picked) : undefined
  const ready = status !== 'ok' && filledSlots().length === 0

  return (
    <div
      className={`play ${shake ? 'is-shake' : ''} ${status === 'ok' ? 'is-win' : ''} ${ready ? 'is-ready' : ''}`}
    >
      <WinBurst play={status === 'ok'} />
      <PuzzleLead challenge={challenge} />
      <PuzzleHint text={challenge.context} onPeek={onPeek} />
      <p className="sort-how">
        <strong>Keep</strong> belongs · <strong>Toss</strong> a distractor
      </p>

      <div className="bank is-sort">
        {order.map((home, index) => {
          const live = slots[index]?.id === home.id
          const goneTo = keep.some((item) => item.id === home.id)
            ? 'keep'
            : discard.some((item) => item.id === home.id)
              ? 'toss'
              : null
          return (
            <div
              key={home.id}
              className={`sort-tile sort-seat ${live && picked === home.id ? 'is-selected' : ''} ${live ? '' : 'is-gone'} ${goneTo === 'keep' ? 'was-keep' : ''} ${goneTo === 'toss' ? 'was-toss' : ''}`}
              style={{
                gridColumn: (index % 2) + 1,
                gridRow: Math.floor(index / 2) + 1,
              }}
            >
              <button
                type="button"
                className="chip"
                tabIndex={0}
                aria-label={
                  live
                    ? home.text
                    : `Return ${home.text} to its seat`
                }
                onClick={() => {
                  if (live) setPicked(home.id === picked ? null : home.id)
                  else returnToBank(home.id)
                }}
              >
                {home.gem ? <GemMark gem={home.gem} size="sm" /> : null}
                {home.text}
                {goneTo === 'keep' ? (
                  <span className="sort-mark" aria-hidden>
                    ✓
                  </span>
                ) : null}
                {goneTo === 'toss' ? (
                  <span className="sort-mark" aria-hidden>
                    ×
                  </span>
                ) : null}
              </button>
              <span className="sort-tile-actions">
                <button
                  type="button"
                  className="btn tiny keep"
                  tabIndex={live ? 0 : -1}
                  disabled={!live}
                  onClick={(event) => {
                    event.stopPropagation()
                    if (live) place(home.id, 'keep')
                  }}
                >
                  Keep<span className="sort-mark" aria-hidden>✓</span>
                </button>
                <button
                  type="button"
                  className="btn tiny toss"
                  tabIndex={live ? 0 : -1}
                  disabled={!live}
                  onClick={(event) => {
                    event.stopPropagation()
                    if (live) place(home.id, 'discard')
                  }}
                >
                  Toss<span className="sort-mark" aria-hidden>×</span>
                </button>
              </span>
            </div>
          )
        })}
      </div>

      <div className={`sort-bins ${ready ? 'is-ready' : ''}`}>
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
          <span className="bin-head">Keep · belongs</span>
          <span className="bin-body">
            {keep.length === 0 ? (
              <span className="placeholder">
                {selected
                  ? `Keep: ${selected.text}`
                  : 'Belongs here'}
              </span>
            ) : (
              keep.map((tile, index) => (
                <button
                  key={tile.id}
                  type="button"
                  className="chip in-bin"
                  style={status === 'ok' ? burstStyle(index, 'keep') : undefined}
                  onClick={(event) => {
                    event.stopPropagation()
                    returnToBank(tile.id)
                  }}
                >
                  {tile.gem ? <GemMark gem={tile.gem} size="sm" /> : null}
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
          <span className="bin-head toss">Toss · aside</span>
          <span className="bin-body">
            {discard.length === 0 ? (
              <span className="placeholder">
                {selected
                  ? `Toss: ${selected.text}`
                  : 'Set aside'}
              </span>
            ) : (
              discard.map((tile, index) => (
                <button
                  key={tile.id}
                  type="button"
                  className="chip in-bin"
                  style={status === 'ok' ? burstStyle(index, 'discard') : undefined}
                  onClick={(event) => {
                    event.stopPropagation()
                    returnToBank(tile.id)
                  }}
                >
                  {tile.gem ? <GemMark gem={tile.gem} size="sm" /> : null}
                  {tile.text}
                </button>
              ))
            )}
          </span>
        </div>
      </div>

      {misses > 0 && status !== 'ok' ? (
        <button
          type="button"
          className="btn tiny match-recover"
          onClick={() => {
            setShake(false)
            setStatus('idle')
          }}
        >
          Try again
        </button>
      ) : null}

      {ready ? (
        <div className="sort-lock">
          <button
            type="button"
            className="btn primary xl snap-bins"
            onClick={() => evaluate()}
          >
            {STORY.lockSort}
          </button>
        </div>
      ) : null}

      <ResultPanel
        tone={status === 'idle' ? 'idle' : status === 'ok' ? 'ok' : 'teach'}
        kicker={
          status === 'ok'
            ? 'Snapped'
            : misses >= 2
              ? 'One more look'
              : 'A line is in the wrong bin'
        }
        title={
          status === 'ok'
            ? 'Keep and toss lock in.'
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
