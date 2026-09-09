import type { GemId } from '../types'

export function GemMark({
  gem,
  size = 'md',
}: {
  gem: GemId
  size?: 'sm' | 'md'
}) {
  return (
    <span className={`gem gem-${gem} gem-${size}`} aria-hidden />
  )
}
