import { useMemo, useState } from 'react'
import { shuffle } from '../lib/shuffle'
import type { EvidenceBrief } from '../content/evidence'

interface SayBackProps {
  brief: EvidenceBrief
  onDone: (result: { elaborated: boolean; text?: string }) => void
}

/** Optional bonus snap — skippable, one-tap credit when the reason chips. */
export function SayBack({ brief, onDone }: SayBackProps) {
  const choices = useMemo(
    () => shuffle([...brief.reasonChoices]),
    [brief.id, brief.reasonChoices],
  )
  const [picked, setPicked] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [wantLine, setWantLine] = useState(false)
  const [shake, setShake] = useState(false)

  function choose(line: string) {
    if (line === brief.reason) {
      setPicked(line)
      return
    }
    setShake(true)
    window.setTimeout(() => setShake(false), 880)
  }

  const locked = picked === brief.reason

  return (
    <section className={`say-back ${shake ? 'is-shake' : ''}`}>
      <div className="say-back-head">
        <p className="eyebrow">Bonus snap</p>
        <button
          type="button"
          className="text-link say-back-skip"
          onClick={() => onDone({ elaborated: false })}
        >
          Skip
        </button>
      </div>
      <h2>Tap the reason it stands.</h2>
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
          <p className="streak-pill pop-in">That’s the load-bearing line</p>
          {wantLine ? (
            <>
              <label className="say-back-label" htmlFor={`say-${brief.id}`}>
                Optional — one private sentence
              </label>
              <textarea
                id={`say-${brief.id}`}
                className="say-back-text"
                rows={2}
                maxLength={220}
                value={text}
                placeholder="A line you’ll still recognize tomorrow…"
                onChange={(event) => setText(event.target.value)}
              />
            </>
          ) : (
            <button
              type="button"
              className="text-link"
              onClick={() => setWantLine(true)}
            >
              Add a private sentence?
            </button>
          )}
          <button
            type="button"
            className="btn primary xl"
            onClick={() =>
              onDone({ elaborated: true, text: text.trim() || undefined })
            }
          >
            Snap it in
          </button>
        </>
      ) : (
        <p className="quiet">Wrong chips bounce. Skip stays on the table.</p>
      )}
    </section>
  )
}
