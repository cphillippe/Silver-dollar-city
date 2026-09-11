import type { CSSProperties } from 'react'
import type { CharacterId } from '../content/story'
import { CAST } from '../content/story'
import ansel from '../assets/cast/portrait-ansel.png'
import hope from '../assets/cast/portrait-hope.png'
import juniper from '../assets/cast/portrait-juniper.png'
import mercy from '../assets/cast/portrait-mercy.png'
import nora from '../assets/cast/portrait-nora.png'
import river from '../assets/cast/portrait-river.png'
import silas from '../assets/cast/portrait-silas.png'
import type { WalkerKind } from '../types'
import imageBearer from '../assets/walkers/walker-image-bearer.png'
import metaphysical from '../assets/walkers/walker-metaphysical.png'
import pagan from '../assets/walkers/walker-pagan.png'
import physical from '../assets/walkers/walker-physical.png'
import skeptic from '../assets/walkers/walker-skeptic.png'
import spiritual from '../assets/walkers/walker-spiritual.png'

const PORTRAITS: Record<CharacterId, string> = {
  river,
  juniper,
  mercy,
  silas,
  nora,
  ansel,
  hope,
}

const WALKERS: Record<WalkerKind, string> = {
  'image-bearer': imageBearer,
  skeptic,
  pagan,
  physical,
  metaphysical,
  spiritual,
}

interface AvatarProps {
  who: CharacterId
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

/** Candy portraits — same toy-box family, distinct faces. */
export function Avatar({ who, size = 'md', className = '' }: AvatarProps) {
  const person = CAST[who]
  return (
    <span
      className={`avatar size-${size} ${className}`}
      role="img"
      aria-label={`${person.name}, ${person.role}`}
    >
      <img src={PORTRAITS[who]} alt="" draggable={false} />
    </span>
  )
}

export function WalkerFace({
  kind,
  className = '',
  style,
}: {
  kind: WalkerKind
  className?: string
  style?: CSSProperties
}) {
  return (
    <img
      className={`walker-face ${className}`}
      src={WALKERS[kind]}
      alt=""
      draggable={false}
      aria-hidden
      style={style}
    />
  )
}

export function walkerSrc(kind: WalkerKind) {
  return WALKERS[kind]
}

export function Say({
  who,
  line,
  kicker,
}: {
  who: CharacterId
  line: string
  kicker?: string
}) {
  const person = CAST[who]
  return (
    <aside className="say pop-in">
      <Avatar who={who} size="md" />
      <div className="say-body">
        <p className="eyebrow">{kicker ?? person.role}</p>
        <p className="say-name">{person.name}</p>
        <p className="say-line">“{line}”</p>
      </div>
    </aside>
  )
}
