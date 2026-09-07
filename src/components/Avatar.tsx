import { useId, type ReactElement } from 'react'
import type { CharacterId } from '../content/story'
import { CAST } from '../content/story'

const INK = '#2c2118'

interface AvatarProps {
  who: CharacterId
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

/** Consistent circular portraits — same line, same eye language, distinct silhouettes. */
export function Avatar({ who, size = 'md', className = '' }: AvatarProps) {
  const person = CAST[who]
  const clip = `av-${who}-${useId().replace(/:/g, '')}`
  return (
    <span
      className={`avatar size-${size} ${className}`}
      role="img"
      aria-label={`${person.name}, ${person.role}`}
    >
      <svg viewBox="0 0 96 96" aria-hidden>
        <defs>
          <clipPath id={clip}>
            <circle cx="48" cy="48" r="45.5" />
          </clipPath>
        </defs>
        <circle cx="48" cy="48" r="47.2" fill="#1a2238" />
        <g clipPath={`url(#${clip})`}>{PORTRAITS[who]}</g>
        <circle
          cx="48"
          cy="48"
          r="45.5"
          fill="none"
          stroke="#e0b34a"
          strokeWidth="2.8"
        />
        <circle
          cx="48"
          cy="48"
          r="43.4"
          fill="none"
          stroke="rgba(255,243,196,0.35)"
          strokeWidth="0.8"
        />
      </svg>
    </span>
  )
}

function Face({
  skin,
  blush = '#e8a090',
  eye = '#3a2a1c',
}: {
  skin: string
  blush?: string
  eye?: string
}) {
  return (
    <>
      <ellipse cx="48" cy="82" rx="15" ry="9" fill={skin} />
      <ellipse cx="48" cy="54" rx="21.5" ry="24" fill={skin} />
      <ellipse cx="28.8" cy="55" rx="4" ry="5.8" fill={skin} />
      <ellipse cx="67.2" cy="55" rx="4" ry="5.8" fill={skin} />
      <ellipse cx="36.5" cy="62.5" rx="5" ry="3.1" fill={blush} opacity="0.38" />
      <ellipse cx="59.5" cy="62.5" rx="5" ry="3.1" fill={blush} opacity="0.38" />
      <path
        d="M32.5 44.2c4.2-2.8 10-2.6 13.2.4"
        fill="none"
        stroke={INK}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M50.3 44.6c4.2-2.8 10.2-2.6 13.4.2"
        fill="none"
        stroke={INK}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <ellipse cx="38.6" cy="51.2" rx="5.4" ry="5.8" fill="#fbf6ee" />
      <ellipse cx="57.4" cy="51.2" rx="5.4" ry="5.8" fill="#fbf6ee" />
      <ellipse cx="39.3" cy="51.8" rx="2.8" ry="3.1" fill={eye} />
      <ellipse cx="58.1" cy="51.8" rx="2.8" ry="3.1" fill={eye} />
      <circle cx="40.6" cy="50.5" r="0.9" fill="#fff" />
      <circle cx="59.4" cy="50.5" r="0.9" fill="#fff" />
      <path
        d="M46.4 58.6c.5 1.5 3.2 1.5 3.8 0"
        fill="none"
        stroke={INK}
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <path
        d="M41.2 66.8c2.6 3.4 11.2 3.4 13.6 0"
        fill="none"
        stroke={INK}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </>
  )
}

function HairCap({ fill }: { fill: string }) {
  return (
    <path
      d="M26 50c1.2-18 10.5-29 22-29 12 0 21.2 11 22.2 29 0 0-3.2-2-5.4-12.5C62.4 26 55 23.5 48 23.5c-7.2 0-14.4 2.6-16.8 14C28.8 48 26 50 26 50Z"
      fill={fill}
    />
  )
}

const PORTRAITS: Record<CharacterId, ReactElement> = {
  river: (
    <>
      <rect width="96" height="96" fill="#3a463c" />
      <circle cx="74" cy="16" r="14" fill="#f0d789" opacity="0.32" />
      <path d="M16 96h64v-20c-9-11-46-11-64 0Z" fill="#5c3226" />
      <path d="M32 80c5 7 27 7 32 0" fill="#c46b4a" />
      <HairCap fill="#2a1c14" />
      <circle cx="27.5" cy="50" r="6.2" fill="#2a1c14" />
      <circle cx="68.5" cy="50" r="6.2" fill="#2a1c14" />
      <Face skin="#c58b62" eye="#2a1810" />
      <path
        d="M33 38c4-4 10-6 15-6 5.2 0 11 2 15 6"
        fill="none"
        stroke="#2a1c14"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </>
  ),
  juniper: (
    <>
      <rect width="96" height="96" fill="#243044" />
      <circle cx="20" cy="18" r="8" fill="#f4ead2" opacity="0.4" />
      <path d="M16 96h64v-18c-10-12-46-12-64 0Z" fill="#5f7f66" />
      <path d="M48 80c-9 2-16 9-18 16h36c-2-7-9-14-18-16Z" fill="#e0b34a" />
      <HairCap fill="#3d2918" />
      <path
        d="M70 52c2 10 6 18 12 22"
        fill="none"
        stroke="#3d2918"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <Face skin="#e4b48c" blush="#ef9a8a" />
      <path
        d="M34 39c4.5-3.2 9.5-4.4 14-4.4 4.8 0 10 1.4 14.2 4.4"
        fill="none"
        stroke="#3d2918"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <circle cx="76" cy="70" r="6.5" fill="#e0b34a" />
      <path d="M76 70v8" stroke="#8a5a18" strokeWidth="1.5" />
      <path d="M73.4 76h5.2" stroke="#8a5a18" strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),
  mercy: (
    <>
      <rect width="96" height="96" fill="#354338" />
      <path d="M12 96h72v-16c-12-15-50-15-72 0Z" fill="#4e6d55" />
      <path d="M26 84c8 9 36 9 44 0" fill="#d7c4a0" />
      <HairCap fill="#6a4a36" />
      <circle cx="48" cy="24" r="8" fill="#6a4a36" />
      <Face skin="#d2a07c" blush="#d9897a" />
      <path d="M40 24h16" stroke="#c4b8a8" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M34 40c4-3 9-4 14-4s10 1 14 4"
        fill="none"
        stroke="#6a4a36"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </>
  ),
  silas: (
    <>
      <rect width="96" height="96" fill="#3a342c" />
      <path d="M0 72h96v24H0Z" fill="#5c4636" />
      <path d="M22 96v-26c8-6 44-6 52 0v26Z" fill="#e7d6b4" />
      <path d="M30 74h36v22H30Z" fill="#6b5340" />
      <HairCap fill="#3a3028" />
      <Face skin="#c9a07a" />
      <ellipse cx="38.6" cy="51.4" rx="7.6" ry="6.6" fill="none" stroke={INK} strokeWidth="1.55" />
      <ellipse cx="57.4" cy="51.4" rx="7.6" ry="6.6" fill="none" stroke={INK} strokeWidth="1.55" />
      <path d="M46.2 51.4h3.6" stroke={INK} strokeWidth="1.45" />
    </>
  ),
  nora: (
    <>
      <rect width="96" height="96" fill="#1b2438" />
      <circle cx="72" cy="14" r="8" fill="#f4ead2" opacity="0.5" />
      <circle cx="22" cy="22" r="2.4" fill="#f4ead2" opacity="0.85" />
      <path d="M14 96h68v-20c-10-12-50-12-68 0Z" fill="#2c3a62" />
      <path d="M48 82c-11 0-20 7-22 14h44c-2-7-11-14-22-14Z" fill="#e0b34a" />
      <HairCap fill="#1a1210" />
      <circle cx="48" cy="22" r="11" fill="#1a1210" />
      <Face skin="#8d5a3c" blush="#c46b4a" eye="#1a100c" />
      <path
        d="M33 39c5-3.4 10-4.6 15-4.6 5.2 0 10.4 1.4 15.2 4.6"
        fill="none"
        stroke="#1a1210"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path d="M64 26l7-7 2.2 2.2-6 8Z" fill="#e0b34a" />
    </>
  ),
  ansel: (
    <>
      <rect width="96" height="96" fill="#3a3028" />
      <path d="M10 96h76v-14c-13-13-52-13-76 0Z" fill="#8a4e38" />
      <path d="M32 86h32v10H32Z" fill="#e7d6b4" />
      <HairCap fill="#c9c0b2" />
      <Face skin="#d7b896" blush="#d08970" />
      <path
        d="M34 63c2.4 8 8 13.5 14 13.5s11.6-5.5 14-13.5c-4 2.6-9.2 4.2-14 4.2s-10-1.6-14-4.2Z"
        fill="#c9c0b2"
      />
    </>
  ),
  hope: (
    <>
      <rect width="96" height="96" fill="#463848" />
      <path d="M16 96h64v-18c-10-13-46-13-64 0Z" fill="#efe4cc" />
      <path d="M48 80c-10 2-18 9-20 16h40c-2-7-10-14-20-16Z" fill="#c46b4a" />
      <HairCap fill="#c47a4a" />
      <path
        d="M70 50c3 12 8 22 14 28"
        fill="none"
        stroke="#c47a4a"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <Face skin="#f0c9a8" blush="#ef9a90" />
      <path
        d="M33 39c5-3.5 10.2-4.8 15.2-4.8 5 0 10.4 1.4 15 4.8"
        fill="none"
        stroke="#c47a4a"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
    </>
  ),
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
