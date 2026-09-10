import { useRef, useState } from 'react'
import { STREET_BEATS, STREET_CHALLENGE } from '../content/links'
import { STORY } from '../content/story'
import { isEasy } from '../lib/easy'
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

function LinkDemo() {
  return (
    <div className="link-demo" aria-label="How to match">
      <div className="link-demo-row">
        <span className="link-demo-step is-idea">Idea</span>
        <span className="link-demo-arrow" aria-hidden>
          →
        </span>
        <span className="link-demo-step is-place">Place</span>
        <span className="link-demo-arrow" aria-hidden>
          →
        </span>
        <span className="link-demo-step is-person">Person</span>
      </div>
      <p className="next-tap">Tap idea → place → person</p>
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
          <section className="recall-gate is-encode teach-gate" aria-label="Unlock the links">
            <p className="eyebrow">Match idea · place · person.</p>
            <p className="recall-line rehearse-stem">
              Link the idea to its place and person.
            </p>
            <LinkDemo />
            <PlainTalk id={challenge.id} />
            <p className="quiet">
              {easy
                ? 'You’ll open them again from your scrapbook of links. One story at a time.'
                : 'You’ll reopen them from the town map — not a flat list only.'}
            </p>
            <ol className={`teach-beats ${easy ? 'is-easy' : ''}`}>
              {STREET_BEATS.map((beat) => (
                <li key={beat}>{beat}</li>
              ))}
            </ol>
            <button
              type="button"
              className="btn primary xl"
              onClick={() => {
                setTaught(true)
                setArming(true)
                window.setTimeout(() => setArming(false), 360)
              }}
            >
              Unlock the links
            </button>
          </section>
        ) : (
          <>
            <h1 className="puzzle-title">{challenge.title}</h1>
            <PuzzlePlay
              challenge={challenge}
              onMiss={() => markMiss(challenge.id)}
              onSolved={solved}
            />
          </>
        )
      ) : (
        <section className="after-win">
          <p className="link-takeaway">
            {easy
              ? 'You matched each idea to a place and a person. Mercy’s Jesus story lives at Parable Hollow. The old shared belief — died, buried, raised — lives at the Witness Bench. The lamp lives on Juniper’s porch.'
              : 'You matched each idea to a place and a person. Mercy’s neighbor-line lives at Parable Hollow. The creed — died, buried, raised — lives at the Witness Bench. The lamp lives on Juniper’s porch.'}
          </p>
          <p className="quiet">
            {easy
              ? 'Tap a place on the map to open your scrapbook of links.'
              : challenge.deeper}
          </p>
          <DigDeeper id={challenge.id} />
          <TownReturn
            who="juniper"
            line={
              easy
                ? 'Tap a place — your scrapbook of links holds what you matched.'
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
