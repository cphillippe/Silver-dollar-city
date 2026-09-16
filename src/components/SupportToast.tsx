import { useState } from 'react'
import {
  SUPPORT_HEADING,
  TIP_CTA,
  TIP_TOAST,
  supportUrls,
} from '../config/support.ts'
import { markSupportToastShown, supportToastPending } from '../lib/supportToast.ts'

/** Hub-only. Never render over Match, Hold, arcade, source-dig, or Journal. */
export function SupportToast() {
  const [open, setOpen] = useState(() => supportToastPending())
  if (!open) return null

  function close() {
    markSupportToastShown()
    setOpen(false)
  }

  return (
    <aside className="support-toast" data-support-toast aria-label={SUPPORT_HEADING}>
      <p>{TIP_TOAST}</p>
      <div className="settings-actions">
        <a
          className="btn gold"
          href={supportUrls().tip}
          target="_blank"
          rel="noopener noreferrer"
          onClick={close}
        >
          {TIP_CTA}
        </a>
        <button type="button" className="btn" onClick={close}>
          Not now
        </button>
      </div>
    </aside>
  )
}
