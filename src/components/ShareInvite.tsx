import { useState } from 'react'
import { shareInviteUrl, sharePitch } from '../lib/shareInvite'

export function ShareInvite({ compact }: { compact?: boolean }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = shareInviteUrl()
    const text = sharePitch(url)
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Silver City: Unending Evidence', text, url })
        return
      }
    } catch {
      // fall through to clipboard — cancel should not feel like failure
    }
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className={`share-invite ${compact ? 'is-compact' : ''}`}>
      {!compact ? (
        <p>
          Hand a friend the walk — not a score. Ask what they can still say after
          the page folds.
        </p>
      ) : null}
      <button type="button" className="btn gold" onClick={() => void share()}>
        {copied ? 'Copied — ask what they remember' : 'Share a morning'}
      </button>
    </div>
  )
}
