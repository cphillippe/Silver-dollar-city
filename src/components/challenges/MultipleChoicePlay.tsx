import { useState } from 'react'
import type { MultipleChoiceChallenge, ScenarioChallenge } from '../../types'
import { ResultPanel } from './ResultPanel'

interface MultipleChoicePlayProps {
  challenge: MultipleChoiceChallenge | ScenarioChallenge
  onMiss: () => void
  onSolved: () => void
}

export function MultipleChoicePlay({
  challenge,
  onMiss,
  onSolved,
}: MultipleChoicePlayProps) {
  const [picked, setPicked] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [solved, setSolved] = useState(false)

  const scene = challenge.kind === 'scenario' ? challenge.scene : challenge.context
  const choice = challenge.choices.find((item) => item.id === picked)
  const correct = Boolean(choice?.correct)

  function submit() {
    if (!choice || solved) return
    setRevealed(true)
    if (choice.correct) {
      setSolved(true)
      onSolved()
    } else {
      onMiss()
    }
  }

  return (
    <div className="play">
      {scene ? (
        <p className={challenge.kind === 'scenario' ? 'scene' : 'context'}>{scene}</p>
      ) : null}
      <p className="prompt">{challenge.prompt}</p>
      <div className="choice-list" role="listbox" aria-label="Answers">
        {challenge.choices.map((item) => {
          const selected = picked === item.id
          const showMark = revealed && selected
          return (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={selected}
              className={[
                'choice',
                selected ? 'is-selected' : '',
                showMark && item.correct ? 'is-right' : '',
                showMark && !item.correct ? 'is-wrong' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => {
                if (solved) return
                setPicked(item.id)
                setRevealed(false)
              }}
            >
              <span className="choice-mark" aria-hidden />
              <span>{item.text}</span>
            </button>
          )
        })}
      </div>

      {!solved ? (
        <button
          type="button"
          className="btn primary"
          disabled={!picked}
          onClick={submit}
        >
          Weigh this answer
        </button>
      ) : null}

      <ResultPanel
        tone={revealed ? (correct ? 'ok' : 'teach') : 'idle'}
        title={correct ? 'That holds.' : 'Not the strongest reading.'}
        body={choice?.teach}
        deeper={challenge.deeper}
      />
    </div>
  )
}
