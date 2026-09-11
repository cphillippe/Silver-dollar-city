import { useState } from 'react'
import { plainFor } from '../../content/plain'
import { easyChromeLine, isEasy } from '../../lib/easy'
import { useProgress } from '../../store/progress'

export function PuzzleHint({
  text,
  id,
  onPeek,
}: {
  text?: string
  id?: string
  onPeek?: () => void
}) {
  const { progress } = useProgress()
  const easy = isEasy(progress)
  const hint = easy && id ? easyChromeLine(plainFor(id)?.hint ?? text ?? '') : text
  const [open, setOpen] = useState(false)
  if (!hint) return null

  if (easy) {
    return <p className="easy-hint">{hint}</p>
  }

  return (
    <div className="hint-peek">
      <button
        type="button"
        className="hint-toggle"
        onClick={() => {
          if (!open) onPeek?.()
          setOpen((value) => !value)
        }}
      >
        {open ? 'Hide' : 'Clue'}
      </button>
      {open ? (
        <>
          <p className="hint-cost">Won’t count as clean</p>
          <p className="context">{text}</p>
        </>
      ) : null}
    </div>
  )
}
