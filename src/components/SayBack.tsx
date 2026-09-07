import { useMemo, useState } from 'react'
import { shuffle } from '../lib/shuffle'
import type { EvidenceBrief } from '../content/evidence'

interface SayBackProps {
  brief: EvidenceBrief
  onDone: (result: { elaborated: boolean; text?: string }) => void
}

/** Optional generation step — skippable once so it doesn’t kill pace. */
export function SayBack({ brief, onDone }: SayBackProps) {
  const choices = useMemo(
    () => shuffle([...brief.reasonChoices]),
    [brief.id, brief.reasonChoices],
  )
  const [picked, setPicked] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [shake, setShake] = useState(false)

  function choose(line: string) {
    if (line === brief.reason) {
      setPicked(line)
      return
    }
    setShake(true)
    window.setTimeout(() => setShake(false), 420)
  }

  const locked = picked === brief.reason

  return (
    <section className={`say-back ${shake ? 'is-shake' : ''}`}>
      <p className="eyebrow">Say it back</p>
      <h2>Which premise is load-bearing?</h2>
      <p className="quiet">
        Not the slogan — the reason the claim stands. Skip once if you need the
        pace; the trail will ask again later.
      </p>
      <div className="recall-choices">
        {choices.map((line) => (
          <button
            key={line}
            type="button"
            className={`match-card recall-card ${picked === line ? 'is-locked' : ''}`}
            onClick={() => choose(line)}
          >
            {line}
          </button>
        ))}
      </div>
      {locked ? (
        <>
          <label className="say-back-label" htmlFor={`say-${brief.id}`}>
            In your own words (stays on this device)
          </label>
          <textarea
            id={`say-${brief.id}`}
            className="say-back-text"
            rows={2}
            maxLength={220}
            value={text}
            placeholder="One sentence you’ll still recognize tomorrow… Your words help it stick."
            onChange={(event) => setText(event.target.value)}
          />
          <button
            type="button"
            className="btn primary xl"
            onClick={() =>
              onDone({ elaborated: true, text: text.trim() || undefined })
            }
          >
            Lock the teach-back
          </button>
        </>
      ) : (
        <button
          type="button"
          className="btn ghost"
          onClick={() => onDone({ elaborated: false })}
        >
          I’ll say it later
        </button>
      )}
    </section>
  )
}