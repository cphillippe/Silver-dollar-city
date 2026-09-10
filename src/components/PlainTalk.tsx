import { plainFor } from '../content/plain'
import { isEasy } from '../lib/easy'
import { useProgress } from '../store/progress'

export function PlainTalk({
  id,
  teach = false,
}: {
  id: string
  teach?: boolean
}) {
  const { progress } = useProgress()
  if (!isEasy(progress)) return null
  const plain = plainFor(id)
  if (!plain) return null
  return (
    <aside className="plain-talk" aria-label="In plain words">
      <p className="eyebrow">In plain words</p>
      <p className="plain-gloss">{plain.gloss}</p>
      {plain.word ? (
        <p className="plain-word">
          <strong>{plain.word.term}</strong> — {plain.word.sense}
        </p>
      ) : null}
      {teach ? <p className="teach-reason">{plain.teach}</p> : null}
    </aside>
  )
}
