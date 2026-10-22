import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { isPlayBuild } from '../config/playBuild'
import { inAndroidShell } from '../config/shell'
import {
  WEB_UPDATE_EVENT,
  claimAutoReload,
  safeWebScreen,
  webRefreshAction,
  webRefreshSurface,
} from '../lib/webRefresh'
import '../styles/shellUpdate.css'

/**
 * Web/Pages only. A new build reloads on Home, or waits for one tap during a lesson.
 * Play and the Android shell render nothing.
 */
export function WebBuildRefresh({ viewName }: { viewName: string }) {
  const surface = webRefreshSurface({
    play: isPlayBuild(),
    androidShell: inAndroidShell(),
    native: Capacitor.isNativePlatform(),
  })
  if (surface === 'off') return null
  return <WebBuildRefreshLive viewName={viewName} />
}

function WebBuildRefreshLive({ viewName }: { viewName: string }) {
  const [version, setVersion] = useState<string | null>(null)
  const [prompt, setPrompt] = useState(false)
  const [stale, setStale] = useState(false)

  useEffect(() => {
    const onUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ version?: string; fresh?: boolean }>).detail
      const next = detail?.version || 'ready'
      setVersion(next)
      setStale(detail?.fresh === false)
      const action = webRefreshAction({
        surface: 'web',
        safe: safeWebScreen(viewName),
        updateReady: true,
      })
      if (action === 'reload' && detail?.fresh !== false && claimAutoReload(next, sessionStorage)) {
        window.location.reload()
        return
      }
      if (action === 'prompt' || action === 'reload') setPrompt(true)
    }
    window.addEventListener(WEB_UPDATE_EVENT, onUpdate)
    return () => window.removeEventListener(WEB_UPDATE_EVENT, onUpdate)
  }, [viewName])

  useEffect(() => {
    if (!version || !prompt || stale) return
    if (!safeWebScreen(viewName)) return
    if (!claimAutoReload(version, sessionStorage)) return
    window.location.reload()
  }, [prompt, version, viewName, stale])

  if (!prompt || !version) return null

  return (
    <div className="shell-update" data-web-refresh role="status" aria-label="Update available">
      <p className="shell-update-title">Update available</p>
      <div className="shell-update-actions">
        <button
          type="button"
          className="btn"
          onClick={() => {
            sessionStorage.removeItem('silver-city-web-refresh')
            window.location.reload()
          }}
        >
          Get the update
        </button>
        <button type="button" className="btn ghost" onClick={() => setPrompt(false)}>
          Not now
        </button>
      </div>
    </div>
  )
}
