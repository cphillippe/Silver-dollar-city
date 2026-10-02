import { useEffect, useState } from 'react'
import { STORES_COMING } from '../config/support.ts'
import { consumeStoresComingNotice } from '../lib/supportToast.ts'

/** Hub-only one-line after SceneAd Remove ads. Never opens Settings or Shop. */
export function StoresComingNotice() {
  const [open, setOpen] = useState(() => consumeStoresComingNotice())
  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => setOpen(false), 4200)
    return () => window.clearTimeout(id)
  }, [open])

  if (!open) return null

  return (
    <p className="match-toast gem-toast" role="status" data-stores-coming-notice>
      <strong>{STORES_COMING}</strong>
    </p>
  )
}
