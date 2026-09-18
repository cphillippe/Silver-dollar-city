import { useState } from 'react'
import {
  NOT_NOW,
  SUPPORT_HEADING,
  TIP_CTA,
  TIP_TOAST,
  TIP_TOAST_TITLE,
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
    <aside className="support-toast is-juiced" data-support-toast aria-label={SUPPORT_HEADING}>
      <p className="eyebrow">{TIP_TOAST_TITLE}</p>
      <p className="support-toast-body">{TIP_TOAST}</p>
      <div className="settings-actions">
        <a
          className="btn gold"
          href={supportUrls().tip}
          target="_blank"
          rel="noopener noreferrer"
          onClick={close}
          data-support-tip
        >
          {TIP_CTA}
        </a>
        <button type="button" className="btn" onClick={close} data-support-dismiss>
          {NOT_NOW}
        </button>
      </div>
    </aside>
  )
}
