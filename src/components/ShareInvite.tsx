import { useState } from 'react'

const PITCH =
  'Silver City is a short walk through the case for God. After each puzzle you fold the teaching and rebuild one claim + one reason from memory — that’s the game. Try it, then see what you can still say.'

export function sharePitch(url = typeof window !== 'undefined' ? window.location.href : '') {
  return `${PITCH}\n\n${url}`
}

export function ShareInvite({ compact }: { compact?: boolean }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = window.location.href
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
