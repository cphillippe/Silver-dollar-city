import { useRef, useState } from 'react'
import { STREET_BEATS, STREET_CHALLENGE, STREET_WHYS } from '../content/links'
import { STORY } from '../content/story'
import { EASY, isEasy } from '../lib/easy'
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
  const { completeChallenge, markMiss, progress } = useProgress()
  const { juiceDone: showNext, afterJuice } = useJuiceHandoff()
  const savedWin = useRef(false)
  const [taught, setTaught] = useState(false)
  const [arming, setArming] = useState(false)
  const challenge = STREET_CHALLENGE
  const easy = isEasy(progress)

  function solved() {
    afterJuice()
    if (savedWin.current) return
    savedWin.current = true
    completeChallenge('street', challenge.id)
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
        ← The town
      </button>

      {!showNext ? (
        !taught ? (
          <section
            className="recall-gate is-encode teach-gate"
            aria-label={easy ? EASY.connectLink : 'Unlock the links'}
          >
            <p className="eyebrow">{easy ? 'Match' : 'Match idea · place · person.'}</p>
            <p className="recall-line rehearse-stem">
              {easy
                ? EASY.connectLink
                : 'Link the idea to its place and person.'}
            </p>
            <LinkDemo easy={easy} />
            {easy ? null : <PlainTalk id={challenge.id} />}
            <p className="quiet">
              {easy
                ? 'You’ll reopen them from Town — tap the place you matched.'
                : 'Each match lights a spot on the town map. Tap the place later to open that idea again.'}
            </p>
            {easy ? null : (
              <ul className="word-school street-whys" aria-label="Why each place">
                {challenge.triples.map((triple) => (
                  <li key={triple.id}>{STREET_WHYS[triple.id].hard}</li>
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
              {easy ? 'Start' : 'Unlock the links'}
            </button>
          </section>
        ) : (
          <>
            <h1 className="puzzle-title">{easy ? EASY.linkStreet : challenge.title}</h1>
            <PuzzlePlay
              challenge={challenge}
              onMiss={() => markMiss(challenge.id)}
              onSolved={solved}
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
                ? 'Mercy tells Jesus stories at the creek — that is why the neighbor who stops on the road lives at Parable Hollow. Silas copies names on the square — that is why the old shared belief lives at the Witness Bench. Juniper’s lamp is on the porch so today’s line can be seen.'
                : 'Mercy keeps the creek because Jesus taught in pictures. Silas keeps the square because the creed is a public report. Juniper keeps the porch because a lamp is meant to be seen.'}
            </p>
            <DigDeeper id={challenge.id} compact />
          </article>
          <TownReturn
            who="juniper"
            line={
              easy
                ? 'Tap a place on the map to see what you matched.'
                : 'Tap a place on the map — the mind map holds what you linked.'
            }
            action="See the town"
            onGo={() => onNavigate({ name: 'hub' })}
          />
        </section>
      )}
    </main>
  )
}
