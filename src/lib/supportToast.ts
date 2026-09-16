/** Once-per-session hub toast after Easy Hold. Never mounts on Match / Hold / arcade. */

export const SUPPORT_TOAST_KEY = 'silver-city-support-toast-v1'

let memory: string | null = null

function store(): Storage | undefined {
  try {
    return typeof sessionStorage === 'undefined' ? undefined : sessionStorage
  } catch {
    return undefined
  }
}

function read(): string | null {
  const session = store()
  if (session) return session.getItem(SUPPORT_TOAST_KEY)
  return memory
}

function write(value: string | null) {
  const session = store()
  if (session) {
    if (value == null) session.removeItem(SUPPORT_TOAST_KEY)
    else session.setItem(SUPPORT_TOAST_KEY, value)
    return
  }
  memory = value
}

export function offerSupportToast(): void {
  if (read() === 'shown') return
  write('pending')
}

export function supportToastPending(): boolean {
  return read() === 'pending'
}

export function markSupportToastShown(): void {
  write('shown')
}

export function resetSupportToastForTest(): void {
  write(null)
}
