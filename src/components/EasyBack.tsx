import { easyBackLabel, EASY_HOME, EASY_SETTINGS } from '../lib/easyNav.ts'
import type { View } from '../types.ts'

interface EasyBackProps {
  onNavigate: (view: View) => void
  /** Debug-only — LinkScreen jumps back to Settings when testing a line. */
  debugToSettings?: boolean
}

/** Consistent `← Home` on Easy lesson and play pages. */
export function EasyBack({ onNavigate, debugToSettings }: EasyBackProps) {
  const target = debugToSettings ? EASY_SETTINGS : EASY_HOME
  const label = debugToSettings ? 'Settings' : easyBackLabel()

  return (
    <button type="button" className="text-link" onClick={() => onNavigate(target)}>
      ← {label}
    </button>
  )
}
