import { EASY } from './easyUi.ts'
import type { View } from '../types.ts'

/** Internal route for Easy Home — visible copy is always {@link EASY.home}. */
export const EASY_HOME: View = { name: 'hub' }

export const EASY_SETTINGS: View = { name: 'settings' }

/** Shared topbar labels after Welcome. */
export const EASY_TOP = {
  home: EASY.home,
  lockIn: EASY.saved,
  settings: 'Settings',
} as const

export function easyBackLabel(): string {
  return EASY.home
}
