import type { ReactElement } from 'react'
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
  return (
    <span
      className={`avatar size-${size} ${className}`}
      role="img"
      aria-label={`${person.name}, ${person.role}`}
    >
      <svg viewBox="0 0 96 96" aria-hidden>
        <defs>
          <clipPath id={`av-${who}`}>
            <circle cx="48" cy="48" r="45.5" />
          </clipPath>
        </defs>
        <circle cx="48" cy="48" r="47.2" fill="#1a2238" />
        <g clipPath={`url(#av-${who})`}>{PORTRAITS[who]}</g>
        <circle
          cx="48"
          cy="48"
          r="45.5"
          fill="none"
          stroke="#e0b34a"
          strokeWidth="2.4"
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
      <ellipse cx="48" cy="54" rx="22" ry="24.5" fill={skin} />
      <ellipse cx="28.5" cy="54" rx="4.2" ry="6.2" fill={skin} />
      <ellipse cx="67.5" cy="54" rx="4.2" ry="6.2" fill={skin} />
      <ellipse cx="48" cy="82" rx="16" ry="10" fill={skin} />
      <ellipse cx="36" cy="62" rx="5" ry="3.2" fill={blush} opacity="0.35" />
      <ellipse cx="60" cy="62" rx="5" ry="3.2" fill={blush} opacity="0.35" />
      <ellipse cx="38.5" cy="50" rx="5.2" ry="5.6" fill="#fbf6ee" />
      <ellipse cx="57.5" cy="50" rx="5.2" ry="5.6" fill="#fbf6ee" />
      <ellipse cx="39.2" cy="50.6" rx="2.7" ry="3" fill={eye} />
      <ellipse cx="58.2" cy="50.6" rx="2.7" ry="3" fill={eye} />
      <circle cx="40.4" cy="49.4" r="0.85" fill="#fff" />
      <circle cx="59.4" cy="49.4" r="0.85" fill="#fff" />
      <path
        d="M46.2 58.2c.6 1.6 3.4 1.6 4 0"
        fill="none"
        stroke={INK}
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <path
        d="M41 66.5c2.4 3.2 11.6 3.2 14 0"
        fill="none"
        stroke={INK}
        strokeWidth="1.55"
        strokeLinecap="round"
      />
    </>
  )
}

const PORTRAITS: Record<CharacterId, ReactElement> = {
  river: (
    <>
      <rect width="96" height="96" fill="#3d4a3a" />
      <circle cx="72" cy="18" r="16" fill="#f0d789" opacity="0.35" />
      <path d="M18 96h60v-22c-8-10-44-10-60 0Z" fill="#6a3a2a" />
      <path d="M30 78c6 8 30 8 36 0" fill="#c46b4a" />
      <Face skin="#c58b62" eye="#2a1810" />
      <path
        d="M26 50c1-20 10-30 22-30 13 0 22 11 22 30 0 4-2 6-5 5-3-12-9-22-17-22s-14 10-17 22c-3 1-5-1-5-5Z"
        fill="#2a1c14"
      />
      <circle cx="29" cy="48" r="5.5" fill="#2a1c14" />
      <circle cx="67" cy="48" r="5.5" fill="#2a1c14" />
      <circle cx="48" cy="28" r="6" fill="#2a1c14" />
    </>
  ),
  juniper: (
    <>
      <rect width="96" height="96" fill="#2a3348" />
      <circle cx="22" cy="16" r="10" fill="#f4ead2" opacity="0.45" />
      <path d="M16 96h64v-20c-10-12-46-12-64 0Z" fill="#6b8f71" />
      <path d="M48 78c-10 2-18 10-20 18h40c-2-8-10-16-20-18Z" fill="#e0b34a" />
      <Face skin="#e4b48c" blush="#ef9a8a" />
      <path
        d="M27 46c2-18 12-28 21-28 8 0 16 8 19 22l8 26c-4 2-8-6-10-16-2 12-8 20-17 20-11 0-18-12-21-24Z"
        fill="#3d2918"
      />
      <path d="M68 68c2 8 6 14 10 16" fill="none" stroke="#3d2918" strokeWidth="4" strokeLinecap="round" />
      <circle cx="74" cy="38" r="7" fill="#e0b34a" />
      <path d="M74 38v10" stroke="#c4922a" strokeWidth="1.6" />
      <path d="M71 45h6" stroke="#c4922a" strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),
  mercy: (
    <>
      <rect width="96" height="96" fill="#3a4638" />
      <ellipse cx="48" cy="18" rx="28" ry="10" fill="#6b8f71" opacity="0.4" />
      <path d="M12 96h72v-18c-12-16-52-16-72 0Z" fill="#4e6d55" />
      <path d="M24 82c8 10 40 10 48 0" fill="#d7c4a0" />
      <Face skin="#d2a07c" blush="#d9897a" />
      <path
        d="M26 52c2-18 12-26 22-26s20 8 22 26c0 6-4 4-6 2-2-10-8-18-16-18s-14 8-16 18c-2 2-6 4-6-2Z"
        fill="#6a4a36"
      />
      <circle cx="48" cy="28" r="7" fill="#6a4a36" />
      <path d="M42 26h12" stroke="#c4b8a8" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  silas: (
    <>
      <rect width="96" height="96" fill="#3a342c" />
      <path d="M0 70h96v26H0Z" fill="#5c4636" />
      <path d="M22 96v-28c8-6 44-6 52 0v28Z" fill="#e7d6b4" />
      <path d="M28 72h40v24H28Z" fill="#6b5340" />
      <Face skin="#c9a07a" />
      <path
        d="M27 50c2-16 11-24 21-24s19 8 21 24c0 3-3 4-5 2-2-9-8-16-16-16s-14 7-16 16c-2 2-5 1-5-2Z"
        fill="#3a3028"
      />
      <ellipse cx="38.5" cy="50.5" rx="7.4" ry="6.4" fill="none" stroke={INK} strokeWidth="1.5" />
      <ellipse cx="57.5" cy="50.5" rx="7.4" ry="6.4" fill="none" stroke={INK} strokeWidth="1.5" />
      <path d="M46 50.5h4" stroke={INK} strokeWidth="1.4" />
    </>
  ),
  nora: (
    <>
      <rect width="96" height="96" fill="#1b2438" />
      <circle cx="70" cy="16" r="9" fill="#f4ead2" opacity="0.55" />
      <circle cx="24" cy="22" r="3" fill="#f4ead2" opacity="0.8" />
      <path d="M14 96h68v-22c-10-12-50-12-68 0Z" fill="#2c3a62" />
      <path d="M48 80c-12 0-22 8-24 16h48c-2-8-12-16-24-16Z" fill="#e0b34a" />
      <Face skin="#8d5a3c" blush="#c46b4a" eye="#1a100c" />
      <path
        d="M24 54c2-22 14-32 24-32 12 0 24 12 24 32 0 8-6 10-10 6-2-10-6-18-14-18s-12 8-14 18c-4 4-10 2-10-6Z"
        fill="#1a1210"
      />
      <circle cx="48" cy="24" r="11" fill="#1a1210" />
      <path d="M62 28l6-6 2 2-5 7Z" fill="#e0b34a" />
    </>
  ),
  ansel: (
    <>
      <rect width="96" height="96" fill="#3a3028" />
      <path d="M8 96h80v-16c-14-14-54-14-80 0Z" fill="#8a4e38" />
      <path d="M30 84h36v12H30Z" fill="#e7d6b4" />
      <Face skin="#d7b896" blush="#d08970" />
      <path
        d="M26 50c3-16 12-24 22-24s19 8 22 24c0 4-4 3-6 1-2-8-8-14-16-14s-14 6-16 14c-2 2-6 3-6-1Z"
        fill="#c9c0b2"
      />
      <path
        d="M34 62c2 8 8 14 14 14s12-6 14-14c-4 3-10 5-14 5s-10-2-14-5Z"
        fill="#c9c0b2"
      />
      <path d="M36 44c6-4 18-4 24 0" fill="none" stroke="#c9c0b2" strokeWidth="3.2" strokeLinecap="round" />
    </>
  ),
  hope: (
    <>
      <rect width="96" height="96" fill="#4a3a48" />
      <path d="M0 40c20-28 76-28 96 0v56H0Z" fill="#6b4a58" opacity="0.45" />
      <path d="M16 96h64v-20c-10-14-46-14-64 0Z" fill="#f0e4cc" />
      <path d="M48 78c-11 2-20 10-22 18h44c-2-8-11-16-22-18Z" fill="#c46b4a" />
      <Face skin="#f0c9a8" blush="#ef9a90" />
      <path
        d="M22 52c4-22 16-32 26-32 12 0 24 12 26 30 2 10-2 12-8 8-2-10-8-20-18-20-9 0-14 8-16 18-4 4-12 4-10-4Z"
        fill="#c47a4a"
      />
      <path
        d="M70 58c4 14 8 22 14 28"
        fill="none"
        stroke="#c47a4a"
        strokeWidth="5"
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
