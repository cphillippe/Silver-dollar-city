import { useMemo, useRef, useState } from 'react'
// Story Strip replaces the deal bank. Older phone peels stay in sortHold.css:
// 1.4.171: ≤720 peels how/lead/hint chrome in sortHold.css
// 1.4.186: ≤720 fills top-cluster purple void
// 1.4.205: ≤720 closes stones→result purple gap
// 1.4.222: phone portrait extends fill + stones→result so order bank·result close purple void
// 1.4.243: phone portrait extends board-first HUD peel 171
import type { SequenceChallenge, SequenceItem } from '../../types'
import { shuffle } from '../../lib/shuffle'
import { playGemPop, prefersReducedMotion } from '../../lib/juice'
import { isEasy } from '../../lib/easy'
import { resolveSequenceVisual, SEQUENCE_CROP, SEQUENCE_FIGURE } from '../../lib/sequenceArt'
import { SEQUENCE_DECOY, sequenceVerse } from '../../lib/sequenceVerse'
import { useProgress } from '../../store/progress'
import { WinBurst } from './WinBurst'
import { GhostSlot, StoryPiece, type StripCard } from './StoryPiece'

interface SequencePlayProps {
  challenge: SequenceChallenge
  onMiss: () => void
  onSolved: () => void
  onPeek?: () => void
}

type Mark = 'yes' | 'no' | null

function toCard(
  item: SequenceItem,
  index: number,
  challengeId: string,
  decoy = false,
  easy = false,
): StripCard {
  const figure = !decoy && easy && item.art ? SEQUENCE_FIGURE[item.art] : undefined
  const crop = !decoy && easy && item.art ? SEQUENCE_CROP[item.art] : undefined
  return {
    id: item.id,
    text: !decoy && easy && item.easyText ? item.easyText : item.text,
    shortText: decoy
      ? undefined
      : easy && item.easyShortCaption
        ? item.easyShortCaption
        : item.shortCaption,
    winText: !decoy && easy ? item.winCaption : undefined,
    role: decoy ? undefined : easy && item.easyRole ? item.easyRole : item.role,
    orderIndex: decoy ? -1 : index,
    decoy,
    figure,
    crop,
    visual: decoy
      ? resolveSequenceVisual(challengeId, { id: item.id, text: item.text, gem: 'coin' }, -1)
      : resolveSequenceVisual(challengeId, item, index),
  }
}

export function SequencePlay({ challenge, onMiss, onSolved, onPeek }: SequencePlayProps) {
  const { progress } = useProgress()
  const easy = isEasy(progress)
  const count = challenge.items.length
  const verse = sequenceVerse(challenge.id)
  const solved = useRef(false)
  const deck = useMemo(() => {
    const cards = challenge.items.map((item, index) => toCard(item, index, challenge.id, false, easy))
    const decoyText = SEQUENCE_DECOY[challenge.id]
    const extra =
      !easy && decoyText
        ? [
            toCard(
              { id: `${challenge.id}-decoy`, text: decoyText, gem: 'coin' },
              -1,
              challenge.id,
              true,
            ),
          ]
        : []
    return shuffle([...cards, ...extra])
  }, [challenge, easy])
  const [order, setOrder] = useState(deck)
  const [chain, setChain] = useState<(StripCard | null)[]>(() => challenge.items.map(() => null))
  const [status, setStatus] = useState<'idle' | 'ok'>('idle')
  const [misses, setMisses] = useState(0)
  const [wiggleId, setWiggleId] = useState<string | null>(null)
  const [snapIndex, setSnapIndex] = useState<number | null>(null)
  const [marks, setMarks] = useState<Mark[]>(() => challenge.items.map(() => null))
  const [busy, setBusy] = useState(false)
  const [verseOn, setVerseOn] = useState(false)

  const nextIndex = chain.findIndex((slot) => slot === null)
  const placed = new Set(chain.filter((slot): slot is StripCard => slot !== null).map((slot) => slot.id))
  const tray = order.filter((card) => !placed.has(card.id))
  const full = nextIndex < 0
  const glowId =
    easy && status !== 'ok' && misses >= 2 && nextIndex >= 0
      ? challenge.items[nextIndex]?.id
      : undefined
  const lead = easy
    ? challenge.id.startsWith('fg-')
      ? 'Put the steps in order!'
      : 'Put the story in order!'
    : challenge.prompt
  const showSlotCaption = true
  const slotCaption = status === 'ok' ? 'full' : 'slot'

  function win() {
    if (solved.current) return
    solved.current = true
    setStatus('ok')
    setMarks(challenge.items.map(() => 'yes'))
    playGemPop('win')
    onSolved()
    const wait = prefersReducedMotion() ? 0 : 980
    window.setTimeout(() => setVerseOn(true), wait)
  }

  function place(card: StripCard, dest: number) {
    const next = chain.map((slot, index) => (index === dest ? card : slot))
    setChain(next)
    setMarks(challenge.items.map(() => null))
    setSnapIndex(dest)
    if (easy) setMisses(0)
    window.setTimeout(() => setSnapIndex((current) => (current === dest ? null : current)), 420)
    if (easy && next.every(Boolean)) win()
  }

  function tapCard(card: StripCard) {
    if (status === 'ok' || busy) return
    const dest = chain.findIndex((slot) => slot === null)
    if (dest < 0) return
    if (easy) {
      const need = challenge.items[dest]
      if (!need || card.id !== need.id) {
        const wait = prefersReducedMotion() ? 0 : 600
        setBusy(true)
        setWiggleId(card.id)
        setMisses((value) => value + 1)
        onMiss()
        playGemPop('miss')
        window.setTimeout(() => {
          setWiggleId(null)
          setBusy(false)
        }, wait)
        return
      }
      playGemPop('find')
      place(card, dest)
      return
    }
    place(card, dest)
  }

  function undo(index: number) {
    if (status === 'ok' || busy || easy) return
    if (!chain[index]) return
    setChain((current) => current.map((slot, slotIndex) => (slotIndex === index ? null : slot)))
    setMarks(challenge.items.map(() => null))
  }

  function checkOrder() {
    if (easy || status === 'ok' || busy || !full) return
    const nextMarks: Mark[] = chain.map((slot, index) =>
      slot && slot.id === challenge.items[index]?.id ? 'yes' : 'no',
    )
    setMarks(nextMarks)
    if (nextMarks.every((mark) => mark === 'yes')) {
      win()
      return
    }
    const wait = prefersReducedMotion() ? 0 : 520
    setBusy(true)
    setMisses((value) => value + 1)
    onMiss()
    playGemPop('miss')
    window.setTimeout(() => {
      setChain((current) => current.map((slot, index) => (nextMarks[index] === 'yes' ? slot : null)))
      setMarks(challenge.items.map(() => null))
      setBusy(false)
    }, wait)
  }

  function reshuffle() {
    if (status === 'ok') return
    const loose = shuffle(order.filter((card) => !placed.has(card.id)))
    const kept = order.filter((card) => placed.has(card.id))
    setOrder([...kept, ...loose])
  }

  return (
    <div
      className={`play is-sequence is-story-strip ${status === 'ok' ? 'is-win' : ''}`}
      data-line={challenge.id}
      data-n={count}
      data-testid="story-strip"
    >
      <h2 className="strip-lead">{status === 'ok' ? 'Great job!' : lead}</h2>
      {verse ? (
        <p className="strip-kicker">
          {challenge.title} · {easy && verse.easyHeader ? verse.easyHeader : verse.ref}
        </p>
      ) : null}

      <div
        className={`strip-board ${status === 'ok' ? 'is-win' : ''}`}
        data-n={count}
        role="list"
        aria-label="Story strip"
      >
        <WinBurst play={status === 'ok'} stamp="STORY SET!" />
        {challenge.items.map((item, index) => {
          const filled = chain[index]
          const awaiting = index === nextIndex && status !== 'ok'
          const mark = marks[index]
          return (
            <div
              key={item.id}
              className={`strip-slot ${awaiting ? 'is-next' : ''} ${snapIndex === index ? 'is-snap' : ''}`}
              style={{ zIndex: index + 1 }}
              role="listitem"
            >
              <span className={`strip-num ${awaiting ? 'is-now' : ''}`}>{index + 1}</span>
              {filled ? (
                <StoryPiece
                  card={filled}
                  count={count}
                  hard={!easy}
                  showCaption={showSlotCaption}
                  caption={slotCaption}
                  compact={status === 'ok'}
                  snap={snapIndex === index}
                  locked={easy || status === 'ok'}
                  onPress={easy || status === 'ok' ? undefined : () => undo(index)}
                />
              ) : (
                <GhostSlot index={index} count={count} hard={!easy} awaiting={awaiting} />
              )}
              {filled && (easy || mark === 'yes' || status === 'ok') ? (
                <span className="strip-mark" aria-hidden>
                  ✓
                </span>
              ) : null}
              {mark === 'no' ? (
                <span className="strip-mark is-no" aria-hidden>
                  ✗
                </span>
              ) : null}
              {snapIndex === index && status !== 'ok' ? <span className="strip-snap">SNAP!</span> : null}
            </div>
          )
        })}
      </div>

      {status !== 'ok' ? (
        <p className="strip-how">
          <span aria-hidden>👆 </span>
          Tap what comes next
        </p>
      ) : (
        <>
          <p className="strip-stamp">STORY SET!</p>
          <p className="strip-stars" aria-hidden>
            ★ ★ ★
          </p>
          {verse && verseOn ? (
            <figure className="strip-verse">
              <figcaption>{verse.kicker}</figcaption>
              {easy && verse.easyLead ? <p className="strip-verse-lead">{verse.easyLead}</p> : null}
              <blockquote>“{easy && verse.easyText ? verse.easyText : verse.text}”</blockquote>
              <cite>{easy && verse.easyRef ? verse.easyRef : verse.ref}</cite>
            </figure>
          ) : null}
        </>
      )}

      {status !== 'ok' ? (
        <div className="strip-tray" data-count={tray.length}>
          {tray.map((card) => (
            <StoryPiece
              key={card.id}
              card={card}
              count={count}
              hard={!easy}
              showCaption
              wiggle={wiggleId === card.id}
              glow={glowId === card.id}
              onPress={() => tapCard(card)}
            />
          ))}
        </div>
      ) : null}

      {status !== 'ok' ? (
        <div className="strip-foot">
          <button
            type="button"
            className="strip-foot-btn"
            onClick={() => onPeek?.()}
          >
            Peek
          </button>
          {!easy ? (
            <button type="button" className="strip-check" disabled={!full || busy} onClick={checkOrder}>
              Check order
            </button>
          ) : null}
          <button type="button" className="strip-foot-btn" onClick={reshuffle}>
            Shuffle
          </button>
        </div>
      ) : null}
    </div>
  )
}
