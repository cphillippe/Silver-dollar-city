import { PAGES_APP_URL } from '../config/shell.ts'

const PITCH =
  'Silver City is a short walk through the case for God. After each puzzle you fold the teaching and rebuild one claim + one reason from memory — that’s the game. Try it, then see what you can still say.'

/** Canonical Pages URL. Never the current location. */
export function shareInviteUrl(): string {
  return PAGES_APP_URL
}

export function sharePitch(url = shareInviteUrl()) {
  return `${PITCH}\n\n${url}`
}
