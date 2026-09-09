import type { GemId } from '../types'
import coin from '../assets/gems/coin.svg'
import door from '../assets/gems/door.svg'
import logic from '../assets/gems/logic.png'
import love from '../assets/gems/love.png'
import reason from '../assets/gems/reason.png'
import science from '../assets/gems/science.png'
import seed from '../assets/gems/seed.png'
import tree from '../assets/gems/tree.svg'

export type WatchAbilityId = 'love' | 'logic' | 'reason' | 'science'

const GEM_SRC: Record<GemId, string> = {
  lamp: science,
  seed,
  heart: love,
  star: logic,
  cup: reason,
  tree,
  door,
  coin,
}

const ABILITY_SRC: Record<WatchAbilityId, string> = {
  love,
  logic,
  reason,
  science,
}

export function GemMark({
  gem,
  size = 'md',
}: {
  gem: GemId
  size?: 'sm' | 'md'
}) {
  return (
    <img
      className={`gem gem-art gem-${gem} gem-${size}`}
      src={GEM_SRC[gem]}
      alt=""
      draggable={false}
      aria-hidden
    />
  )
}

export function AbilityMark({
  ability,
  size = 'sm',
}: {
  ability: WatchAbilityId
  size?: 'sm' | 'md'
}) {
  return (
    <img
      className={`gem gem-art gem-ability gem-${ability} gem-${size}`}
      src={ABILITY_SRC[ability]}
      alt=""
      draggable={false}
      aria-hidden
    />
  )
}
