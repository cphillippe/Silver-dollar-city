/** Web/Pages only. Play and the Android shell never refresh from here. */

export const WEB_UPDATE_EVENT = 'silver-city-web-update'
export const WEB_REFRESH_KEY = 'silver-city-web-refresh'

export function webRefreshSurface(input: {
  play: boolean
  androidShell: boolean
  native: boolean
}): 'web' | 'off' {
  if (input.play || input.androidShell || input.native) return 'off'
  return 'web'
}

/** Home, welcome, and settings are safe. A lesson is not. */
export function safeWebScreen(viewName: string): boolean {
  return viewName === 'welcome' || viewName === 'hub' || viewName === 'settings'
}

export function webRefreshAction(input: {
  surface: 'web' | 'off'
  safe: boolean
  updateReady: boolean
}): 'reload' | 'prompt' | 'none' {
  if (input.surface !== 'web' || !input.updateReady) return 'none'
  return input.safe ? 'reload' : 'prompt'
}

/** One automatic reload per noticed version. A second pass waits for a tap. */
export function claimAutoReload(version: string, storage: Pick<Storage, 'getItem' | 'setItem'>): boolean {
  if (storage.getItem(WEB_REFRESH_KEY) === version) return false
  storage.setItem(WEB_REFRESH_KEY, version)
  return true
}

type WorkerContainer = Pick<ServiceWorkerContainer, 'addEventListener' | 'removeEventListener' | 'controller'>
type WorkerReg = Pick<ServiceWorkerRegistration, 'waiting' | 'installing' | 'active'>

/**
 * `reg.update()` resolves once the new script is fetched, not once it controls the page.
 * Reload only after the fresh worker has taken over, so the first reload shows the new build.
 */
export function waitForFreshWorker(
  sw: WorkerContainer | undefined,
  reg: WorkerReg | undefined,
  timeoutMs = 10000,
): Promise<boolean> {
  if (!sw || !reg) return Promise.resolve(true)
  if (!reg.waiting && !reg.installing && reg.active && reg.active !== sw.controller) return Promise.resolve(true)
  return new Promise((resolve) => {
    const finish = (fresh: boolean) => {
      clearTimeout(timer)
      sw.removeEventListener('controllerchange', onChange)
      resolve(fresh)
    }
    const onChange = () => finish(true)
    const timer = setTimeout(() => finish(false), timeoutMs)
    sw.addEventListener('controllerchange', onChange)
  })
}

export async function pullWebBuild(current: string): Promise<void> {
  if (typeof fetch !== 'function' || typeof document === 'undefined') return
  try {
    const url = new URL('app-version.json', document.baseURI)
    url.searchParams.set('t', String(Date.now()))
    const res = await fetch(url.href, { cache: 'no-store' })
    if (!res.ok) return
    const data = (await res.json()) as { version?: unknown }
    if (typeof data.version !== 'string' || data.version === '' || data.version === current) return
    const reg = await navigator.serviceWorker?.getRegistration()
    await reg?.update()
    const fresh = await waitForFreshWorker(navigator.serviceWorker, reg)
    window.dispatchEvent(new CustomEvent(WEB_UPDATE_EVENT, { detail: { version: data.version, fresh } }))
  } catch {
    /* offline players keep the copy they have */
  }
}
