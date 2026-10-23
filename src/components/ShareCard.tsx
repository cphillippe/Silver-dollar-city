import { useEffect, useState } from 'react'
import { noteShareRecap, noteShareTap, shareLine, type ShareLine } from '../lib/shareCard.ts'

/** Easy recap card. The button stays plain so Home remains the one filled gold. */
export function ShareCard({ learning }: { learning: ShareLine }) {
  const [status, setStatus] = useState('')

  useEffect(() => {
    noteShareRecap()
  }, [learning.claim])

  useEffect(() => {
    if (!status) return
    const timer = window.setTimeout(() => setStatus(''), 2200)
    return () => window.clearTimeout(timer)
  }, [status])

  async function onShare() {
    noteShareTap()
    const result = await shareLine(learning)
    if (result === 'shared') setStatus('Shared.')
    else if (result === 'copied') setStatus('Copied. Paste it to a friend.')
  }

  return (
    <>
      <figure className="share-card" aria-labelledby="share-card-title">
        <p className="share-card-kicker">A line to keep</p>
        <h2 id="share-card-title">Say it back tomorrow</h2>
        <p id="share-card-claim" className="share-card-claim">
          {learning.claim}
        </p>
        <p>Why: {learning.reason}</p>
        <p>From: {learning.source}</p>
        <p className="share-card-foot">Silver City</p>
      </figure>
      <div className="share-card-actions">
        <button
          type="button"
          className="btn"
          aria-describedby="share-card-claim"
          onClick={() => void onShare()}
        >
          Share this line
        </button>
        <p role="status" aria-live="polite">
          {status}
        </p>
      </div>
    </>
  )
}
