import { useRef, useState } from 'react'
import { STREET_BEATS, STREET_PLACE_WHYS, STREET_TRIPLES, appendStreetLinks, easyStreetChallenge, hardStreetChallenge, nextStreetWalk, streetFactsLeft, streetWalkTakeaway } from '../content/links'
import { STORY } from '../content/story'
import { EASY, easyHoldView, easyMatchLine, easyMatchReady, isEasy } from '../lib/easy'
import { useJuiceHandoff } from '../lib/juice'
import { PuzzlePlay } from './PuzzlePlay'
import { TownReturn } from './TownReturn'
import { DigDeeper } from './DigDeeper'
import { PlainTalk } from './PlainTalk'
import { useProgress } from '../store/progress'
import type { View } from '../types'

interface LinkScreenProps {
  onNavigate: (view: View) => void
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

export function LinkScreen({ onNavigate }: LinkScreenProps) {
  const { completeChallenge, markMiss, progress, recordStreetLinks } = useProgress()
  const { juiceDone: showNext, afterJuice } = useJuiceHandoff()
  const savedWin = useRef(false)
  const finishedWalk = useRef<ReturnType<typeof nextStreetWalk>>(undefined)
  const [taught, setTaught] = useState(() => isEasy(progress) && easyMatchReady(progress))
  const [arming, setArming] = useState(false)
  const easy = isEasy(progress)
  const linked = progress.streetLinked ?? []
  const walk = easy ? undefined : nextStreetWalk(linked)
  const challenge = easy ? easyStreetChallenge(easyMatchLine(progress)) : hardStreetChallenge(linked)
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
    afterJuice()
    if (easy) {
      markStreet()
      return
    }
    if (savedWin.current) return
    savedWin.current = true
    finishedWalk.current = walk
    const ids = challenge.triples.map((item) => item.id)
    recordStreetLinks(ids)
  }

  function easyStop(dest: 'hold' | 'home') {
    markStreet()
    onNavigate(dest === 'hold' ? easyHoldView(progress) : { name: 'hub' })
  }

  return (
    <main
      className={`challenge-page ${showNext ? 'is-after' : taught ? 'is-puzzle' : 'is-teach'} ${arming ? 'is-arming' : ''}`}
      aria-label={STORY.playGoal}
    >
      <button
        type="button"
        className="text-link"
        onClick={() => onNavigate({ name: 'hub' })}
      >
        ← {easy ? EASY.home : 'The town'}
      </button>

      {!showNext && easy && !easyMatchReady(progress) ? (
        <section className="recall-gate is-encode teach-gate" aria-label={EASY.learnThisFirst}>
          <p className="recall-line rehearse-stem">{EASY.learnThisFirst}</p>
          <p className="quiet">{EASY.readStoryFirst}</p>
          <button
            type="button"
            className="btn primary xl"
            onClick={() => onNavigate({ name: 'learn' })}
          >
            {EASY.learnCta}
          </button>
        </section>
      ) : !showNext ? (
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
            action={easy ? `See ${EASY.saved}` : 'See the town'}
            onGo={() => onNavigate(easy ? { name: 'journal' } : { name: 'hub' })}
          />
        </section>
      )}
    </main>
  )
}
