import { useEffect, useMemo, useState } from 'react'
import { shuffle } from '../../lib/shuffle'
import { isEasy } from '../../lib/easy'
import { useProgress } from '../../store/progress'
import type { MatchChallenge, MatchSceneId } from '../../types'
import { MatchScene } from '../MatchScene'
import { burstStyle } from '../../lib/juice'
import { PuzzleHint } from './PuzzleHint'
import { PuzzleLead } from './PuzzleLead'
import { WinBurst } from './WinBurst'

interface MatchPlayProps {
  challenge: MatchChallenge
  onMiss: () => void
  onSolved: () => void
  onPeek?: () => void
}

type Side = 'left' | 'right'

function pictureOf(pair: { scene?: MatchSceneId; gem?: MatchSceneId }): MatchSceneId | undefined {
  return pair.scene ?? pair.gem
}

function decoyFor(ids: string[], focus: string, locked: string[]) {
  const open = ids.filter((id) => id !== focus && !locked.includes(id))
  const pool = open.length > 0 ? open : ids.filter((id) => id !== focus)
  return shuffle(pool)[0] ?? ids.find((id) => id !== focus) ?? focus
}

export function MatchPlay({ challenge, onMiss, onSolved, onPeek }: MatchPlayProps) {
  const { progress } = useProgress()
  const guided = isEasy(progress) || challenge.id.startsWith('ob-')
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
  const focusId = left.find((pair) => !locked.includes(pair.id))?.id
  const [decoyId, setDecoyId] = useState(() =>
    focusId ? decoyFor(left.map((pair) => pair.id), focusId, []) : '',
  )

  useEffect(() => {
    if (!guided || !focusId) return
    setDecoyId((current) =>
      current && current !== focusId && !locked.includes(current)
        ? current
        : decoyFor(
            left.map((pair) => pair.id),
            focusId,
            locked,
          ),
    )
    setPicked({ side: 'left', id: focusId })
  }, [guided, focusId, locked, left])

  function recover() {
    setFlash(null)
    setShake(false)
    setStatus('idle')
    if (guided && focusId) setPicked({ side: 'left', id: focusId })
  }

  function choose(side: Side, id: string) {
    if (status === 'ok' || (shake || locked.includes(id)) && !guided) return
    if (locked.includes(id) && !(side === 'right' && picked?.side === 'left')) return
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
    const keep = picked
    window.setTimeout(() => {
      setFlash(null)
      setShake(false)
      setStatus('idle')
      setPicked(guided && focusId ? { side: 'left', id: focusId } : keep)
    }, 880)
  }

  const picture = (pair: (typeof left)[number]) => pictureOf(pair)
  const shownLeft = guided ? left.filter((pair) => pair.id === focusId) : left
  const shownRight = guided
    ? right.filter((item) => item.id === focusId || item.id === decoyId)
    : right

  return (
    <div
      className={`play is-match ${guided ? 'is-deal' : ''} ${shake ? 'is-shake' : ''} ${status === 'ok' ? 'is-win' : ''}`}
      style={{ ['--match-rows' as string]: guided ? 2 : left.length }}
    >
      <WinBurst play={status === 'ok'} />
      <PuzzleLead challenge={challenge} />
      <PuzzleHint text={challenge.context} id={challenge.id} onPeek={onPeek} />
      <p className="sort-how">
        {isEasy(progress) ? (
          <>
            <strong>Tap a picture</strong>, then the main idea that belongs
            {guided ? ' · two choices' : ''}
          </>
        ) : (
          <>
            <strong>Tap a picture</strong>, then the claim that belongs
            {guided ? ' · two choices' : ''}
          </>
        )}
      </p>

      {status === 'wrong' || misses > 0 ? (
        <p className="match-toast" role="status">
          <strong>
            {status === 'wrong'
              ? misses >= 2
                ? 'One more look.'
                : 'Those don’t snap.'
              : isEasy(progress)
                ? 'Try the other main idea.'
                : 'Try the other claim.'}
          </strong>{' '}
          {misses >= 2
            ? isEasy(progress)
              ? 'Look again. Two choices.'
              : challenge.teachOnWrong
            : 'Pick a new pair.'}
        </p>
      ) : null}

      {misses > 0 && status !== 'ok' ? (
        <button type="button" className="btn tiny match-recover" onClick={recover}>
          Try again
        </button>
      ) : null}

      <div className="match-grid">
        <div className="match-col is-pictures">
          <p className="match-col-label">Picture</p>
          {shownLeft.map((pair, index) => {
            const scene = picture(pair)
            return (
              <button
                key={pair.id}
                type="button"
                className={`match-card is-picture ${scene ? 'is-gem' : ''} ${picked?.side === 'left' && picked.id === pair.id ? 'is-selected' : ''} ${locked.includes(pair.id) ? 'is-locked' : ''} ${flash === pair.id && !locked.includes(pair.id) ? 'is-flash' : ''} ${picked && picked.side === 'right' && !locked.includes(pair.id) ? 'awaiting' : ''}`}
                style={status === 'ok' ? burstStyle(index, 'keep') : undefined}
                aria-label={pair.left}
                onClick={(event) => {
                  event.stopPropagation()
                  choose('left', pair.id)
                }}
              >
                {scene ? (
                  <>
                    <MatchScene scene={scene} />
                    <span className="match-caption">{pair.left}</span>
                  </>
                ) : (
                  pair.left
                )}
              </button>
            )
          })}
        </div>
        <div className="match-col is-claims">
          <p className="match-col-label">{isEasy(progress) ? 'Main idea' : 'Claim'}</p>
          {shownRight.map((item, index) => (
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
    </div>
  )
}
