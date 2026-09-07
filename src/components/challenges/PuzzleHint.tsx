import { useState } from 'react'

export function PuzzleHint({
  text,
  onPeek,
}: {
  text?: string
  onPeek?: () => void
}) {
  const [open, setOpen] = useState(false)
  if (!text) return null

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
        {open ? 'Hide clue' : 'Peek at a clue (won’t count as clean)'}
      </button>
      {open ? <p className="context">{text}</p> : null}
    </div>
  )
}
