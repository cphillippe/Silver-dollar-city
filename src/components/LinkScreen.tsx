import { useRef, useState } from 'react'
import { STREET_BEATS, STREET_PLACE_WHYS, STREET_TRIPLES, appendStreetLinks, easyStreetChallenge, hardStreetChallenge, nextStreetWalk, streetFactsLeft, streetWalkTakeaway } from '../content/links'
import { STORY } from '../content/story'
import { EASY, easyHoldView, easyMatchLine, isEasy } from '../lib/easy'
import { EASY_HOME } from '../lib/easyNav'
import { EasyBack } from './EasyBack'
import { useJuiceHandoff } from '../lib/juice'
import { PuzzlePlay } from './PuzzlePlay'
import { TownReturn } from './TownReturn'
import { DigDeeper } from './DigDeeper'
import { PlainTalk } from './PlainTalk'
import { useProgress } from '../store/progress'
import type { View } from '../types'

interface LinkScreenProps {
  onNavigate: (view: View) => void
  /** Settings Debug — one-tap this Easy line’s play, not the open loop. */
  debugLine?: string
}

function LinkDemo({ easy }: { easy: boolean }) {
  return (
    <div className="link-demo" aria-label="How to match">
      <div className="link-demo-row">
        <span className="link-demo-step is-idea">{easy ? 'Sentence' : 'Idea'}</span>
        <span className="link-demo-arrow" aria-hidden>
          →
        </span>
        <span className="link-demo-step is-place">Place</span>
        <span className="link-demo-arrow" aria-hidden>
          →
        </span>
        <span className="link-demo-step is-person">Person</span>
      </div>
      <p className="next-tap">{easy ? EASY.connectLink : 'Tap idea → place → person'}</p>
    </div>
  )
}

export function LinkScreen({ onNavigate, debugLine }: LinkScreenProps) {
  const { completeChallenge, markMiss, progress, recordStreetLinks, recordTaught } = useProgress()
  const { juiceDone: showNext, afterJuice } = useJuiceHandoff()
  const savedWin = useRef(false)
  const finishedWalk = useRef<ReturnType<typeof nextStreetWalk>>(undefined)
  const [taught, setTaught] = useState(() => isEasy(progress) || Boolean(debugLine))
  const [arming, setArming] = useState(false)
  const easy = isEasy(progress) || Boolean(debugLine)
  const lineId = debugLine ?? easyMatchLine(progress)
  const linked = progress.streetLinked ?? []
  const walk = easy ? undefined : nextStreetWalk(linked)
  const challenge = easy ? easyStreetChallenge(lineId) : hardStreetChallenge(linked)
  const linkedAfter = walk ? appendStreetLinks(linked, walk.triples.map((item) => item.id)).length : linked.length
  const leftAfter = streetFactsLeft(appendStreetLinks(linked, walk?.triples.map((item) => item.id) ?? []))
  const streetBeat = easy
    ? undefined
    : walk
      ? {
          place: walk.placeTitle,
          linkedAfter,
          total: STREET_TRIPLES.length,
          left: leftAfter,
        }
      : undefined

  function markStreet() {
    if (savedWin.current) return
    savedWin.current = true
    completeChallenge('street', challenge.id)
  }

  function solved() {
    if (easy) {
      if (!debugLine) {
        recordTaught(lineId)
        markStreet()
      }
      return
    }
    afterJuice()
    if (savedWin.current) return
    savedWin.current = true
    finishedWalk.current = walk
    const ids = challenge.triples.map((item) => item.id)
    recordStreetLinks(ids)
  }

  function easyStop(dest: 'hold' | 'home') {
    if (debugLine) {
      onNavigate(
        dest === 'hold'
          ? { name: 'journal', focusId: lineId, autoQuiz: true }
          : { name: 'settings' },
      )
      return
    }
    markStreet()
    onNavigate(dest === 'hold' ? easyHoldView(progress) : EASY_HOME)
  }

  return (
    <main
      className={`challenge-page ${showNext ? 'is-after' : taught ? 'is-puzzle' : 'is-teach'} ${arming ? 'is-arming' : ''}`}
      aria-label={STORY.playGoal}
    >
      {easy ? (
        <EasyBack onNavigate={onNavigate} debugToSettings={Boolean(debugLine)} />
      ) : (
        <button type="button" className="text-link" onClick={() => onNavigate({ name: 'hub' })}>
          ← The town
        </button>
      )}

      {!showNext ? (
        !taught ? (
          <section
            className="recall-gate is-encode teach-gate"
            aria-label={easy ? EASY.connectLink : 'Unlock the links'}
          >
            {easy ? null : <p className="eyebrow">Match idea · place · person.</p>}
            <p className="recall-line rehearse-stem">
              {easy
                ? EASY.connectLink
                : 'Link the idea to its place and person.'}
            </p>
            <LinkDemo easy={easy} />
            {easy ? null : <PlainTalk id={challenge.id} />}
            <p className="quiet">
              {easy
                ? `You’ll keep them in ${EASY.saved}.`
                : walk
                  ? `Tonight’s street is ${walk.placeTitle} — ${walk.triples.length} fact${walk.triples.length === 1 ? '' : 's'}, not the whole catalog. ${linked.length} of ${STREET_TRIPLES.length} facts already linked.`
                  : 'Each match lights a spot on the town map. Tap the place later to open that idea again.'}
            </p>
            {easy ? null : (
              <ul className="word-school street-whys" aria-label="Why each place">
                {STREET_PLACE_WHYS.map((why) => (
                  <li key={why}>{why}</li>
                ))}
              </ul>
            )}
            {easy ? null : (
              <ol className="teach-beats">
                {STREET_BEATS.map((beat) => (
                  <li key={beat}>{beat}</li>
                ))}
              </ol>
            )}
            <button
              type="button"
              className="btn primary xl"
              onClick={() => {
                setTaught(true)
                setArming(true)
                window.setTimeout(() => setArming(false), 360)
              }}
            >
              {easy ? 'Start' : walk && linked.length > 0 ? EASY.continueStreet : 'Unlock the links'}
            </button>
          </section>
        ) : (
          <>
            {easy ? null : <h1 className="puzzle-title">{challenge.title}</h1>}
            <PuzzlePlay
              challenge={challenge}
              lineId={easy ? lineId : undefined}
              onMiss={() => markMiss(challenge.id)}
              onSolved={solved}
              onEasyStop={easyStop}
              streetBeat={streetBeat}
            />
          </>
        )
      ) : (
        <section className="after-win">
          <article className="stored-line is-spoken" aria-label="Street takeaway">
            <p className="eyebrow">Say this out loud</p>
            <p className="stored-claim">An idea lives at a place, with a person.</p>
            <p className="link-takeaway">
              {easy
                ? 'Mercy tells Jesus stories at the creek — that is why the neighbor who stops on the road lives at Story Creek. Silas copies names on the square — that is why the old shared belief lives at Witness Square. Juniper’s lamp is on the porch so today’s line can be seen.'
                : streetWalkTakeaway(
                    finishedWalk.current,
                    streetFactsLeft(progress.streetLinked ?? []),
                  )}
            </p>
            <DigDeeper id={challenge.id} compact />
          </article>
          <TownReturn
            who="juniper"
            line={
              easy
                ? `Your matches wait in ${EASY.saved}.`
                : streetFactsLeft(progress.streetLinked ?? []) > 0
                  ? 'Continue from Town when you want one more round.'
                  : 'Tap a place on the map — the mind map holds what you linked.'
            }
            action={easy ? EASY.saved : 'See the town'}
            onGo={() => onNavigate(easy ? easyHoldView(progress) : { name: 'hub' })}
          />
        </section>
      )}
    </main>
  )
}
