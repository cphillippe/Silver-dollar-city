import { useRef, useState } from 'react'
import { APP_ID, APP_VERSION, SAVE_SCHEMA_VERSION } from '../config/app'
import { CHANGELOG, latestChange, playerVisibleChangeItems } from '../content/changelog'
import {
  adsEnabledDefault,
  softAdsVisible,
  writeAdsPref,
  type AdsPref,
} from '../config/ads'
import { TRAIL_SUBTITLE } from '../config/commerce'
import { STORES_COMING } from '../config/support'
import { SHOP_OPENS_SOON, isPlayBuild, playShopClosed } from '../config/playBuild'
import { PRIVACY_POLICY_URL } from '../config/privacy'
import {
  cloudSyncStatus,
  encodeShareCode,
  SAVE_MAX_BYTES,
  wrapSave,
} from '../lib/save'
import { localDateKey } from '../lib/dates'
import {
  debugJumpView,
  debugNightWatchJump,
  debugPlayGroups,
  debugPlayLabel,
  debugQuickReviewJump,
  debugQuickReviewLabel,
  debugQuickReviewLines,
  debugStoryStripJump,
  debugStoryStripLabel,
  storyStripLines,
} from '../lib/debugPlays'
import { readNightWatchDebug, writeNightWatchDebug } from '../lib/nightWatchDebug'
import { EASY, isEasy } from '../lib/easy'
import { activeLampStyle, foundersLamp } from '../lib/foundersLamp'
import { EASY_HOME } from '../lib/easyNav'
import { EasyBack } from './EasyBack'
import { useAdsPref } from './AdSlot'
import { useProgress } from '../store/progress'
import type { AppTheme, View } from '../types'

interface SettingsProps {
  onNavigate: (view: View) => void
}

export function Settings({ onNavigate }: SettingsProps) {
  const { progress, saveMeta, importSaveText, reset, setTheme, setEasyMode, setLampStyle } =
    useProgress()
  const easy = isEasy(progress)
  const adsPref = useAdsPref()
  const fileRef = useRef<HTMLInputElement>(null)
  const [paste, setPaste] = useState('')
  const [message, setMessage] = useState('')
  const [shareCode, setShareCode] = useState('')
  const [nwDebug, setNwDebug] = useState(() => readNightWatchDebug())

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
    onNavigate(EASY_HOME)
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
      easy
        ? 'Reset this Easy walk? That clears saved sentences and connections on this device and returns to Welcome.'
        : 'Reset progress? This wipes the save on this device — all held lines, journal pages, Night Watch, and mind-map links — and returns to the start. A backup of this save stays until the next import or reset.',
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
      {easy ? (
        <EasyBack onNavigate={onNavigate} />
      ) : (
        <button type="button" className="text-link" onClick={() => onNavigate({ name: 'hub' })}>
          ← The town
        </button>
      )}

      <header className="page-head">
        <p className="eyebrow">{easy ? `Settings · ${APP_VERSION}` : `Settings · V0 · ${APP_VERSION}`}</p>
        <h1>{easy ? 'Settings' : 'Progress & support'}</h1>
        <p>{savedLabel}</p>
      </header>

      <section className="settings-card">
        <p className="eyebrow">Reading</p>
        <p>
          {easy ? (
            <>
              {EASY.claimTeach} Buttons then say main idea. Shorter sentences and bigger taps.
            </>
          ) : (
            <>
              A claim is the main idea we hold to be true. Easy mode teaches that once,
              then buttons say main idea. Shorter sentences and bigger taps. The main
              ideas stay the same — the words around them get plainer.
            </>
          )}
        </p>
        {progress.easyMode ? (
          <p className="teach-chip" role="note">
            {EASY.mainIdeaTeach}
          </p>
        ) : null}
      </section>

      {foundersLamp(progress) ? (
        <section className="settings-card">
          <p className="eyebrow">Lamp style</p>
          <div className="lamp-style" role="radiogroup" aria-label="Lamp style">
            <label className="lamp-style-choice">
              <input
                type="radio"
                name="lamp-style"
                checked={activeLampStyle(progress) !== 'founders'}
                onChange={() => setLampStyle('classic')}
              />
              Classic
            </label>
            <label className="lamp-style-choice">
              <input
                type="radio"
                name="lamp-style"
                checked={activeLampStyle(progress) === 'founders'}
                onChange={() => setLampStyle('founders')}
              />
              Founder's Lamp
            </label>
          </div>
        </section>
      ) : null}

      <section className="settings-card">
        <p className="eyebrow">This device</p>
        {easy ? (
          <p>This walk is saved on this device.</p>
        ) : (
          <p>
            Schema v{saveMeta.schemaVersion || SAVE_SCHEMA_VERSION} · app{' '}
            {APP_VERSION} · {APP_ID}
          </p>
        )}
        <p className="quiet">
          {easy
            ? `${held} ${EASY.savedSub} · ${open} pages · ${progress.completed.length} walks`
            : `${held} held lines · ${open} journal pages · ${progress.completed.length} district walks${
                cloudSyncStatus() === 'local-only' ? ' · local only (no cloud login)' : ''
              }`}
        </p>
        {easy ? null : (
          <p className="quiet">
            Offline-first. The same key keeps working across updates; a schema
            version migrates old saves instead of wiping them.
          </p>
        )}
      </section>

      <details className={easy ? 'settings-advanced' : 'settings-flat'}>
        <summary>More</summary>

      <section className="settings-card" aria-label="Trail notes">
        <p className="eyebrow">Trail</p>
        <p className="quiet">{TRAIL_SUBTITLE}</p>
        <p>
          The Easy trail stays free. Soft pauses sit between home and a lesson —
          never over Match, Lock In, or arcade play, and never on Journal. Never a
          hard paywall.
        </p>
        {playShopClosed() ? null : (
        <div className="settings-actions">
          {isPlayBuild() ? null : (
          <button type="button" className="btn" disabled data-remove-ads-coming>
            {STORES_COMING}
          </button>
          )}
          <button
            type="button"
            className="text-link"
            onClick={() => onNavigate({ name: 'shop' })}
          >
            This-device Street Packs
          </button>
        </div>
        )}
      </section>

      {easy ? (
        <section className="settings-card" aria-label="Town">
          <p className="eyebrow">Town</p>
          <p>
            {EASY.townSoon} — the map waits until the game is right.
          </p>
        </section>
      ) : null}

      <section className="settings-card">
        <p className="eyebrow">You</p>
        <p>
          {easy
            ? `What River has opened — ${EASY.saved}, places, people, ${EASY.uses}, and ${EASY.connections}.`
            : 'River’s unlocks in one place — held ideas, places, people, tools, and mind-map links.'}
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
          {playerVisibleChangeItems(drop.items).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {CHANGELOG.length > 1 && !easy ? (
          <details className="whats-new-more">
            <summary>Earlier drops</summary>
            {CHANGELOG.filter((note) => note.version !== APP_VERSION).map((note) => (
              <div key={note.version} className="whats-new-past">
                <p className="eyebrow">
                  {note.version} · {note.title}
                </p>
                <ul className="whats-new-list">
                  {playerVisibleChangeItems(note.items).map((item) => (
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

      {isPlayBuild() ? null : (
      <section className="settings-card">
        <p className="eyebrow">Between-scene pauses</p>
        <p>
          Unpaid walks may see a dismissible pause between home and a lesson.
          They never cover Match, Lock In, Journal, or arcade play. A tip is the
          supporter path until stores return. Remove ads comes with stores; this
          toggle is a this-device hide for playtest.
        </p>
        {easy ? null : (
          <p className="quiet">
            Live ad-network flag is {adsEnabledDefault ? 'on' : 'off'}. Soft
            pauses default on until Remove ads is granted.
          </p>
        )}
        <div className="settings-actions">
          <button
            type="button"
            className={`btn ${adsPref === 'off' || !adsAreOn(adsPref) ? 'primary' : ''}`}
            onClick={() => setAds('off')}
          >
            Hide pauses
          </button>
          <button
            type="button"
            className={`btn ${adsAreOn(adsPref) ? 'gold' : ''}`}
            onClick={() => setAds('on')}
          >
            Show pauses
          </button>
        </div>
      </section>
      )}

      </details>

      {easy ? (
        <section className="settings-card settings-danger settings-reset-easy" aria-label="Reset">
          <p className="eyebrow">Start over</p>
          <p>
            {EASY.resetWalk} clears saved sentences and connections on this device, then
            returns to Welcome. Export first if you want this walk back.
          </p>
          <button type="button" className="btn" onClick={confirmReset}>
            {EASY.resetWalk}
          </button>
        </section>
      ) : (
        <details className="settings-card settings-danger">
          <summary>Danger zone · wipe this device</summary>
          <p className="eyebrow">Reset progress</p>
          <p>
            Wipe ALL progress on this device — held lines, journal, Night Watch, and mind-map links — and return to the start. Export first if you want the walk back. This is not on the town screen.
          </p>
          <button type="button" className="btn" onClick={confirmReset}>
            Reset progress
          </button>
        </details>
      )}

      {isPlayBuild() ? (
        <section className="settings-card" aria-label="About" data-play-about>
          {playShopClosed() ? <p>{SHOP_OPENS_SOON}</p> : null}
          <p>
            <a className="text-link" href={PRIVACY_POLICY_URL} rel="noopener noreferrer">
              Privacy policy
            </a>
          </p>
        </section>
      ) : (
      <details className="settings-card settings-danger settings-debug">
        <summary>Developer · mini-game jumps</summary>
        <p className="eyebrow">Debug</p>
        <p>
          One-tap every Easy play. Labels are lesson id + short name. This is
          not on Home.
        </p>
        <section className="settings-debug-group" aria-label="Night Watch playtest">
          <p className="eyebrow">Night Watch · debug freeze</p>
          <p>
            Playtest only. Turn it on for this visit and Easy Night Watch pauses each
            wave so you can read the cue and tap the glowing face. A normal night leaves
            the walkers moving. A playtest link can show the same panel.
          </p>
          <div className="settings-actions">
            <button
              type="button"
              className={`btn${nwDebug ? ' primary' : ''}`}
              onClick={() => {
                const next = !nwDebug
                writeNightWatchDebug(next)
                setNwDebug(next)
              }}
            >
              {nwDebug ? 'Debug freeze · ON' : 'Debug freeze · OFF'}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setEasyMode(true)
                onNavigate(debugNightWatchJump())
              }}
            >
              Jump · Night Watch
            </button>
          </div>
        </section>
        <section className="settings-debug-group" aria-label="Quick review">
          <p className="eyebrow">Quick review</p>
          <div className="settings-actions">
            {debugQuickReviewLines().map((item) => (
              <button
                key={item.lineId}
                type="button"
                className="btn"
                onClick={() => {
                  setEasyMode(true)
                  onNavigate(debugQuickReviewJump(item))
                }}
              >
                {debugQuickReviewLabel(item)}
              </button>
            ))}
          </div>
        </section>
        <section className="settings-debug-group" aria-label="Story Strip">
          <p className="eyebrow">Story Strip</p>
          <div className="settings-actions">
            {storyStripLines().map((item) => (
              <button
                key={item.lineId}
                type="button"
                className="btn"
                onClick={() => {
                  setEasyMode(true)
                  onNavigate(debugStoryStripJump(item))
                }}
              >
                {debugStoryStripLabel(item)}
              </button>
            ))}
          </div>
        </section>
        {debugPlayGroups().map((group) => (
          <section key={group.play} className="settings-debug-group" aria-label={group.heading}>
            <p className="eyebrow">{group.heading}</p>
            <div className="settings-actions">
              {group.items.map((item) => (
                <button
                  key={`${item.play}-${item.lineId}`}
                  type="button"
                  className="btn"
                  onClick={() => {
                    setEasyMode(true)
                    onNavigate(debugJumpView(item))
                  }}
                >
                  {debugPlayLabel(item)}
                </button>
              ))}
            </div>
          </section>
        ))}
      </details>
      )}
    </main>
  )
}

function adsAreOn(pref: AdsPref) {
  return softAdsVisible(pref)
}

function themeLabel(theme: AppTheme) {
  if (theme === 'dusk') return 'Dusk town'
  if (theme === 'parchment') return 'Clean parchment'
  return 'Candy'
}
