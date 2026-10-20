import { useState } from 'react'
import { PLAY_IMPORT_SEEN_KEY, playImportPromptVisible } from '../lib/playImport'
import { isPlayBuild } from '../config/playBuild'
import { useProgress } from '../store/progress'

function seenAlready(): boolean {
  try {
    return localStorage.getItem(PLAY_IMPORT_SEEN_KEY) === '1'
  } catch {
    return false
  }
}

function markSeen() {
  try {
    localStorage.setItem(PLAY_IMPORT_SEEN_KEY, '1')
  } catch {
    /* the prompt stays quiet if storage is blocked */
  }
}

/**
 * Once, on a fresh Play install. Uses the same import path as Settings.
 * Purchases are not in a share code.
 */
export function PlayImportPrompt() {
  const { progress, importSaveText } = useProgress()
  const [seen, setSeen] = useState(seenAlready)
  const [paste, setPaste] = useState('')
  const [message, setMessage] = useState('')
  const open = playImportPromptVisible({
    play: isPlayBuild(),
    started: progress.started,
    seen,
  })
  if (!open) return null

  return (
    <section className="settings-card" aria-label="Bring a walk over" data-play-import>
      <p className="eyebrow">Already played</p>
      <p>
        If you played Silver City in the GitHub app, paste the share code from Settings
        there. Your walk can come over. Purchases do not come with it.
      </p>
      <label className="settings-paste">
        Share code
        <textarea
          value={paste}
          rows={3}
          spellCheck={false}
          placeholder="SC1.…"
          onChange={(event) => setPaste(event.target.value)}
        />
      </label>
      <div className="settings-actions">
        <button
          type="button"
          className="btn primary"
          disabled={!paste.trim()}
          onClick={() => {
            const result = importSaveText(paste)
            if (!result.ok) {
              setMessage(result.error)
              return
            }
            markSeen()
            setSeen(true)
          }}
        >
          Import
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            markSeen()
            setSeen(true)
          }}
        >
          Not now
        </button>
      </div>
      {message ? <p className="settings-msg">{message}</p> : null}
    </section>
  )
}
