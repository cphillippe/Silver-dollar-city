import { useRef, useState } from 'react'
import { APP_ID, APP_VERSION, SAVE_SCHEMA_VERSION } from '../config/app'
import { CHANGELOG, latestChange } from '../content/changelog'
import {
  adsEnabledDefault,
  writeAdsPref,
  type AdsPref,
} from '../config/ads'
import {
  cloudSyncStatus,
  encodeShareCode,
  SAVE_MAX_BYTES,
  wrapSave,
} from '../lib/save'
import { localDateKey } from '../lib/dates'
import { useAdsPref } from './AdSlot'
import { useProgress } from '../store/progress'
import type { AppTheme, View } from '../types'

interface SettingsProps {
  onNavigate: (view: View) => void
}

export function Settings({ onNavigate }: SettingsProps) {
  const { progress, saveMeta, importSaveText, reset, setTheme, setEasyMode } = useProgress()
  const adsPref = useAdsPref()
  const fileRef = useRef<HTMLInputElement>(null)
  const [paste, setPaste] = useState('')
  const [message, setMessage] = useState('')
  const [shareCode, setShareCode] = useState('')

  const held = progress.held.length
  const open = progress.journal.length
  const drop = latestChange(APP_VERSION)
  const savedLabel = saveMeta.savedAt
    ? `Progress saved on this device · ${formatSaved(saveMeta.savedAt)}`
    : 'Progress saved on this device as you walk'

  function formatSaved(iso: string) {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return 'on this device'
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  function downloadJson() {
    const envelope = wrapSave(progress)
    const blob = new Blob([JSON.stringify(envelope, null, 2)], {
      type: 'application/json',
    })
    const name = `silver-city-save-${localDateKey()}.json`
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
    setMessage(`Downloaded ${name}`)
  }

  async function copyCode() {
    const code = encodeShareCode(wrapSave(progress))
    setShareCode(code)
    try {
      await navigator.clipboard.writeText(code)
      setMessage('Share code copied. Paste it under Import on the other device.')
    } catch {
      setMessage('Copy failed — the code is in the box below. Select and copy it.')
    }
  }

  function applyRaw(raw: string) {
    const result = importSaveText(raw)
    if (!result.ok) {
      setMessage(result.error)
      return
    }
    setPaste('')
    setMessage('Imported. Stars, journal, and Daily marks are on this device.')
    onNavigate({ name: 'hub' })
  }

  function onFile(file: File | undefined) {
    if (!file) return
    if (file.size > SAVE_MAX_BYTES) {
      setMessage('That file is too large to be a Silver City save.')
      return
    }
    const ok = window.confirm(
      'Replace the save on this device with the imported one? Anyone with this file can overwrite local progress.',
    )
    if (!ok) return
    const reader = new FileReader()
    reader.onload = () => {
      applyRaw(String(reader.result ?? ''))
    }
    reader.readAsText(file)
  }

  function confirmReset() {
    const ok = window.confirm(
      'Reset progress? This wipes the save on this device — all held lines, journal pages, Night Watch, and mind-map links — and returns to the start. A backup of this save stays until the next import or reset.',
    )
    if (!ok) return
    reset()
    onNavigate({ name: 'welcome' })
  }

  function setAds(next: AdsPref) {
    writeAdsPref(next)
  }

  return (
    <main className="settings page">
      <button
        type="button"
        className="text-link"
        onClick={() => onNavigate({ name: 'hub' })}
      >
        ← The town
      </button>

      <header className="page-head">
        <p className="eyebrow">Settings · V0 · {APP_VERSION}</p>
        <h1>Progress & support</h1>
        <p>{savedLabel}</p>
      </header>

      <section className="settings-card">
        <p className="eyebrow">You</p>
        <p>
          River’s unlocks in one place — held ideas, places, people, tools, and
          mind-map links.
        </p>
        <div className="settings-actions">
          <button
            type="button"
            className="btn primary"
            onClick={() => onNavigate({ name: 'profile' })}
          >
            Open Profile
          </button>
        </div>
      </section>

      <section className="settings-card whats-new" aria-label="What’s new">
        <p className="eyebrow">What’s new · {APP_VERSION}</p>
        <h2>{drop.title}</h2>
        <p className="quiet">{drop.when}</p>
        <ul className="whats-new-list">
          {drop.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {CHANGELOG.length > 1 ? (
          <details className="whats-new-more">
            <summary>Earlier drops</summary>
            {CHANGELOG.filter((note) => note.version !== APP_VERSION).map((note) => (
              <div key={note.version} className="whats-new-past">
                <p className="eyebrow">
                  {note.version} · {note.title}
                </p>
                <ul className="whats-new-list">
                  {note.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </details>
        ) : null}
      </section>

      <section className="settings-card">
        <p className="eyebrow">Look</p>
        <p>Candy is the default. Switch anytime — the walk and the save stay.</p>
        <div className="settings-actions theme-picks">
          {(['candy', 'dusk', 'parchment'] as const).map((theme) => (
            <button
              key={theme}
              type="button"
              className={`btn ${progress.theme === theme ? 'primary' : ''}`}
              aria-pressed={progress.theme === theme}
              onClick={() => setTheme(theme)}
            >
              {themeLabel(theme)}
            </button>
          ))}
        </div>
      </section>

      <section className="settings-card">
        <p className="eyebrow">Reading</p>
        <p>
          A claim is what we hold to be true. Easy mode teaches that first, then
          uses shorter sentences and bigger taps. The claims stay the same — the
          words around them get plainer.
        </p>
        <div className="settings-actions">
          <button
            type="button"
            className={`btn ${progress.easyMode ? 'primary' : ''}`}
            aria-pressed={progress.easyMode}
            onClick={() => setEasyMode(true)}
          >
            Easy mode
          </button>
          <button
            type="button"
            className={`btn ${progress.easyMode ? '' : 'primary'}`}
            aria-pressed={!progress.easyMode}
            onClick={() => setEasyMode(false)}
          >
            Standard
          </button>
        </div>
      </section>

      <section className="settings-card">
        <p className="eyebrow">This device</p>
        <p>
          Schema v{saveMeta.schemaVersion || SAVE_SCHEMA_VERSION} · app{' '}
          {APP_VERSION} · {APP_ID}
        </p>
        <p className="quiet">
          {held} held lines · {open} journal pages · {progress.completed.length}{' '}
          district walks · streak {progress.streak}
          {cloudSyncStatus() === 'local-only'
            ? ' · local only (no cloud login)'
            : ''}
        </p>
        <p className="quiet">
          Offline-first. The same key keeps working across updates; a schema
          version migrates old saves instead of wiping them.
        </p>
      </section>

      <section className="settings-card">
        <p className="eyebrow">Move to another device</p>
        <p>
          Export a JSON file, or copy a share code. Import <strong>replaces</strong> the
          save on this device (a backup of the old one is kept). Treat a share
          code like a secret for that save — anyone who imports it takes over
          this walk.
        </p>
        <div className="settings-actions">
          <button type="button" className="btn primary" onClick={downloadJson}>
            Export JSON
          </button>
          <button type="button" className="btn gold" onClick={() => void copyCode()}>
            Copy share code
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => fileRef.current?.click()}
          >
            Import file
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json,text/plain"
          hidden
          onChange={(event) => {
            onFile(event.target.files?.[0])
            event.currentTarget.value = ''
          }}
        />
        <label className="settings-paste">
          Paste a share code or JSON
          <textarea
            value={paste}
            rows={4}
            spellCheck={false}
            placeholder="SC1.… or a silver-city-save JSON file"
            onChange={(event) => setPaste(event.target.value)}
          />
        </label>
        <button
          type="button"
          className="btn primary"
          disabled={!paste.trim()}
          onClick={() => {
            const ok = window.confirm(
              'Replace the save on this device with the imported one?',
            )
            if (!ok) return
            applyRaw(paste)
          }}
        >
          Import pasted save
        </button>
        {shareCode ? (
          <textarea
            className="share-code-out"
            readOnly
            rows={3}
            value={shareCode}
            onFocus={(event) => event.currentTarget.select()}
          />
        ) : null}
        {message ? <p className="settings-msg">{message}</p> : null}
      </section>

      <section className="settings-card">
        <p className="eyebrow">Ad placeholders</p>
        <p>
          Playtest default is off. Placeholders are labeled slots for a later
          network — they never cover Keep/Toss, the takeaway step, or Journal.
        </p>
        <p className="quiet">
          Product flag <code>adsEnabled</code> is {adsEnabledDefault ? 'on' : 'off'}{' '}
          in config. This toggle is a this-device override.
        </p>
        <div className="settings-actions">
          <button
            type="button"
            className={`btn ${adsPref === 'off' || (adsPref === 'default' && !adsEnabledDefault) ? 'primary' : ''}`}
            onClick={() => setAds('off')}
          >
            Hide slots
          </button>
          <button
            type="button"
            className={`btn ${adsAreOn(adsPref) ? 'gold' : ''}`}
            onClick={() => setAds('on')}
          >
            Show placeholders
          </button>
        </div>
      </section>

      <details className="settings-card settings-danger">
        <summary>Danger zone · wipe this device</summary>
        <p className="eyebrow">Reset progress</p>
        <p>
          Wipe ALL progress on this device — held lines, journal, Night Watch, and
          mind-map links — and return to the start. Export first if you want the
          walk back. This is not on the town screen.
        </p>
        <button type="button" className="btn" onClick={confirmReset}>
          Reset progress
        </button>
      </details>
    </main>
  )
}

function adsAreOn(pref: AdsPref) {
  if (pref === 'on') return true
  if (pref === 'off') return false
  return adsEnabledDefault
}

function themeLabel(theme: AppTheme) {
  if (theme === 'dusk') return 'Dusk town'
  if (theme === 'parchment') return 'Clean parchment'
  return 'Candy'
}
