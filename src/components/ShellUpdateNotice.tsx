import { useEffect, useState } from 'react'
import {
  SHELL_APK_URL,
  SHELL_DISMISS_KEY,
  inAndroidShell,
  isBundledShellHost,
  shellApkOffer,
} from '../config/shell'
import '../styles/shellUpdate.css'

function readDismissed(): number {
  try {
    const raw = localStorage.getItem(SHELL_DISMISS_KEY)
    const value = Number(raw)
    return Number.isInteger(value) ? value : 0
  } catch {
    return 0
  }
}

/**
 * Shell chrome only. Hidden on the website and on iOS.
 * Update: newer native versionCode in shell.json.
 * No signal: bundled fallback (a different save from the live town).
 */
export function ShellUpdateNotice() {
  const [apkUrl, setApkUrl] = useState<string | null>(null)
  const [remoteCode, setRemoteCode] = useState(0)
  const [offlineCopy, setOfflineCopy] = useState(false)

  useEffect(() => {
    if (!inAndroidShell()) return
    const onPhoneCopy = isBundledShellHost(window.location.hostname)
    if (onPhoneCopy) setOfflineCopy(true)

    let cancel = false
    const installed = Number(window.SilverCityShell?.getVersionCode())
    const shellJson = new URL('shell.json', document.baseURI)
    fetch(shellJson, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: unknown) => {
        if (cancel || !data || typeof data !== 'object') return
        const remote = (data as { versionCode?: unknown }).versionCode
        if (typeof remote !== 'number') return
        const offer = shellApkOffer({
          inShell: true,
          installed,
          remote,
          dismissed: readDismissed(),
        })
        if (!offer) return
        setRemoteCode(remote)
        setApkUrl(offer)
      })
      .catch(() => {})

    return () => {
      cancel = true
    }
  }, [])

  if (apkUrl) {
    return (
      <div className="shell-update" role="status" aria-label="Update available">
        <p className="shell-update-title">Update available</p>
        <p>A newer Silver City app is ready for this phone.</p>
        <div className="shell-update-actions">
          <a className="btn primary" href={SHELL_APK_URL}>
            Get the update
          </a>
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              try {
                localStorage.setItem(SHELL_DISMISS_KEY, String(remoteCode))
              } catch {
                /* keep playing if storage is blocked */
              }
              setApkUrl(null)
            }}
          >
            Not now
          </button>
        </div>
      </div>
    )
  }

  if (!offlineCopy) return null

  return (
    <div className="shell-update" role="status" aria-label="No signal">
      <p className="shell-update-title">No signal</p>
      <p>This is the copy saved on the phone. The live town comes back when the signal does.</p>
      <div className="shell-update-actions">
        <button type="button" className="btn ghost" onClick={() => setOfflineCopy(false)}>
          OK
        </button>
      </div>
    </div>
  )
}
