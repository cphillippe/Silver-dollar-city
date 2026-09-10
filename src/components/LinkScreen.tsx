import { useRef, useState } from 'react'
import { STREET_BEATS, STREET_CHALLENGE } from '../content/links'
import { STORY } from '../content/story'
import { useJuiceHandoff } from '../lib/juice'
import { PuzzlePlay } from './PuzzlePlay'
import { TownReturn } from './TownReturn'
import { useProgress } from '../store/progress'
import type { View } from '../types'

interface LinkScreenProps {
  onNavigate: (view: View) => void
}

export function LinkScreen({ onNavigate }: LinkScreenProps) {
  const { completeChallenge, markMiss } = useProgress()
  const { juiceDone: showNext, afterJuice } = useJuiceHandoff()
  const savedWin = useRef(false)
  const [taught, setTaught] = useState(false)
  const [arming, setArming] = useState(false)
  const challenge = STREET_CHALLENGE

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
            <p className="eyebrow">Acquire · where · who · what</p>
            <p className="recall-line rehearse-stem">
              Link the idea to its place and person.
            </p>
            <p className="quiet">
              You’ll reopen them from the town map — not a flat list only.
            </p>
            <ol className="teach-beats">
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
          <p className="quiet">{challenge.deeper}</p>
          <TownReturn
            who="juniper"
            line="Tap a place on the map — the mind map holds what you linked."
            action="See the town"
            onGo={() => onNavigate({ name: 'hub' })}
          />
        </section>
      )}
    </main>
  )
}
