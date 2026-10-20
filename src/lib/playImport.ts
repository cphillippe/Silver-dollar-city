/** One-time Play prompt for a share code brought over from the GitHub app. */
export const PLAY_IMPORT_SEEN_KEY = 'silver-city-play-import-seen'

export function playImportPromptVisible(input: {
  play: boolean
  started: boolean
  seen: boolean
}): boolean {
  return input.play && !input.started && !input.seen
}
