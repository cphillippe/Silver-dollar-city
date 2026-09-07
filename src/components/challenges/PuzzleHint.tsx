import { useState } from 'react'

export function PuzzleHint({ text }: { text?: string }) {
  const [open, setOpen] = useState(false)
  if (!text) return null

  return (
    <div className="hint-peek">
      <button type="button" className="hint-toggle" onClick={() => setOpen((v) => !v)}>
        {open ? 'Hide clue' : 'Peek at a clue'}
      </button>
      {open ? <p className="context">{text}</p> : null}
    </div>
  )
}
