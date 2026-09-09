import type { GemId } from '../types'
import abilityLogic from '../assets/gems/ability-logic.png'
import abilityLove from '../assets/gems/ability-love.png'
import abilityReason from '../assets/gems/ability-reason.png'
import abilityScience from '../assets/gems/ability-science.png'
import coin from '../assets/gems/coin.svg'
import door from '../assets/gems/door.svg'
import heart from '../assets/gems/heart.png'
import seed from '../assets/gems/seed.png'
import tree from '../assets/gems/tree.svg'

export type WatchAbilityId = 'love' | 'logic' | 'reason' | 'science'

const GEM_SRC: Record<GemId, string> = {
  lamp: abilityScience,
  seed,
  heart,
  star: abilityLogic,
  cup: abilityReason,
  tree,
  door,
  coin,
}

const ABILITY_SRC: Record<WatchAbilityId, string> = {
  love: abilityLove,
  logic: abilityLogic,
  reason: abilityReason,
  science: abilityScience,
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
