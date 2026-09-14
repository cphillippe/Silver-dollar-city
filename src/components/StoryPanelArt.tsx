import { useId, type ReactNode } from 'react'
import { MATCH_ART } from '../content/matchArt'
import type { StoryScene } from '../lib/storyPanels'

export function StoryPanelArt({ scene }: { scene: StoryScene }) {
  const uid = useId().replace(/:/g, '')
  switch (scene) {
    case 'hurt':
      return (
        <Frame uid={uid} from="#ff9f1a" to="#7a1a40">
          <path d="M0 44c18-8 28-4 40-6 10-2 16-8 24-4v30H0Z" fill="#c4922a" />
          <path d="M0 50h64v14H0Z" fill="#8a5a22" />
          <ellipse cx="28" cy="46" rx="14" ry="6" fill="#6a3a18" opacity=".35" />
          <path d="M16 42c2-10 8-16 14-16 4 0 8 3 10 8 2 6-2 14-8 16-8 2-16-2-16-8Z" fill="#ffe7b8" />
          <circle cx="24" cy="30" r="6" fill="#ffe7b8" />
          <path d="M20 28c3 2 6 2 8 0" stroke="#c01840" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M48 18c6 4 8 12 4 18" stroke="#fff6b8" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="54" cy="14" r="4" fill="#ffcc33" />
        </Frame>
      )
    case 'walk-past':
      return (
        <Frame uid={uid} from="#3a1480" to="#1a0840">
          <path d="M0 48h64v16H0Z" fill="#5a3a18" />
          <circle cx="14" cy="50" r="5" fill="#ffe7b8" />
          <path d="M8 58c0-6 3-10 6-10s6 4 6 10" fill="#ffe7b8" />
          <Person x={34} y={36} fill="#fff6b8" />
          <Person x={50} y={34} fill="#c86bff" />
          <path d="M30 28c8-2 16-2 24 2" stroke="#ffcc33" strokeWidth="2" fill="none" strokeDasharray="3 3" />
        </Frame>
      )
    case 'help':
      return <img className="story-art-tile" src={MATCH_ART['ph-road']} alt="" draggable={false} />
    case 'neighbor':
      return (
        <Frame uid={uid} from="#4a1a88" to="#1a0840">
          <path d="M32 54 10 32c-7-7-2-18 9-18 6 0 9 4 13 8 4-4 7-8 13-8 11 0 16 11 9 18Z" fill="#ff5a7a" />
          <circle cx="22" cy="24" r="3.4" fill="#fff6e8" opacity=".85" />
          <Person x={48} y={46} fill="#ffcc33" scale={0.72} />
        </Frame>
      )
    case 'son-leave':
      return (
        <Frame uid={uid} from="#2a0d58" to="#7a1a40">
          <rect x="6" y="22" width="18" height="28" rx="3" fill="#ffe7b8" />
          <path d="M4 22 15 12l13 10" fill="#ffcc33" />
          <rect x="12" y="32" width="6" height="12" fill="#c4922a" />
          <Person x={44} y={40} fill="#fff6b8" />
          <circle cx="52" cy="28" r="7" fill="#ffcc33" stroke="#fff8dc" strokeWidth="2" />
          <path d="M52 24v8M49 27h6" stroke="#8a5a22" strokeWidth="1.8" strokeLinecap="round" />
        </Frame>
      )
    case 'hungry':
      return (
        <Frame uid={uid} from="#1a2848" to="#2a0d58">
          <path d="M0 40c16-10 28-4 40-8s16-8 24-2v34H0Z" fill="#3d5a38" />
          <Person x={30} y={42} fill="#ffe7b8" />
          <path d="M24 30c4 4 8 4 12 0" stroke="#c01840" strokeWidth="2" fill="none" />
          <circle cx="50" cy="16" r="6" fill="#fff6b8" opacity=".55" />
        </Frame>
      )
    case 'father-run':
      return (
        <Frame uid={uid} from="#ff9f1a" to="#3a1480">
          <path d="M0 48h64v16H0Z" fill="#3dcc7a" />
          <path d="M8 50c10-16 18-18 28-10 6 4 10 4 18 0" stroke="#fff6b8" strokeWidth="3" fill="none" />
          <Person x={22} y={38} fill="#c86bff" />
          <Person x={46} y={34} fill="#ffe7b8" />
          <path d="M28 28c8-8 16-8 24-2" stroke="#ffcc33" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </Frame>
      )
    case 'hug':
      return (
        <Frame uid={uid} from="#ff5a7a" to="#2a0d58">
          <Person x={26} y={40} fill="#ffe7b8" />
          <Person x={38} y={40} fill="#c86bff" />
          <path d="M18 36c6 8 22 8 28 0" stroke="#fff6b8" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <circle cx="32" cy="16" r="6" fill="#ffcc33" />
          <path d="M32 8v4M26 16h4M34 16h4" stroke="#fff6e8" strokeWidth="2" strokeLinecap="round" />
        </Frame>
      )
    case 'feast':
      return (
        <Frame uid={uid} from="#3a1480" to="#1a0840">
          <ellipse cx="32" cy="46" rx="22" ry="8" fill="#8a5a22" />
          <path d="M16 28h32c3 10 3 16-6 20H22c-9-4-9-10-6-20Z" fill="#ffcc33" />
          <path d="M27 48h10v8H27Z" fill="#c4922a" />
          <circle cx="18" cy="18" r="4" fill="#7dffb0" />
          <circle cx="46" cy="16" r="5" fill="#ff5a7a" />
        </Frame>
      )
    case 'forgive':
      return (
        <Frame uid={uid} from="#2a0d58" to="#148a48">
          <circle cx="32" cy="30" r="16" fill="#ffcc33" stroke="#fff8dc" strokeWidth="3" />
          <path d="M24 30h16M32 22v16" stroke="#8a5a22" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M18 48h28" stroke="#7dffb0" strokeWidth="4" strokeLinecap="round" />
          <path d="M22 44 18 50M42 44l4 6" stroke="#7dffb0" strokeWidth="3" strokeLinecap="round" />
        </Frame>
      )
    case 'choke':
      return (
        <Frame uid={uid} from="#7a1a40" to="#1a0840">
          <Person x={22} y={38} fill="#ffe7b8" />
          <Person x={44} y={36} fill="#ff5a7a" />
          <path d="M28 32c6 2 8 2 14-2" stroke="#c01840" strokeWidth="3" fill="none" />
          <circle cx="50" cy="18" r="8" fill="#ffcc33" />
          <path d="M47 18h6" stroke="#8a5a22" strokeWidth="2" />
        </Frame>
      )
    case 'seed':
      return (
        <Frame uid={uid} from="#12382a" to="#1a0840">
          <path d="M32 8c14 12 16 26 0 44C16 34 18 20 32 8Z" fill="#3dcc7a" />
          <path d="M32 18c6 8 6 16 0 26" stroke="#fff6b8" strokeWidth="3" fill="none" />
          <path d="M0 52h64v12H0Z" fill="#8a5a22" />
        </Frame>
      )
    case 'lamp':
      return (
        <Frame uid={uid} from="#3a1480" to="#1a0840">
          <path d="M20 30c0-10 6-16 12-16s12 6 12 16c6 2 8 8 8 12H12c0-4 2-10 8-12Z" fill="#ffcc33" />
          <rect x="27" y="42" width="10" height="12" rx="2" fill="#c4922a" />
          <circle cx="32" cy="26" r="5" fill="#fff6b8" />
        </Frame>
      )
    case 'tomb':
      return (
        <Frame uid={uid} from="#1a2848" to="#2a0d58">
          <path d="M10 54c0-18 10-28 22-28s22 10 22 28" fill="#d8c4a0" />
          <rect x="26" y="32" width="12" height="22" rx="2" fill="#fff6e8" />
          <circle cx="48" cy="16" r="7" fill="#ffcc33" />
          <path d="M44 16h8" stroke="#fff6b8" strokeWidth="2" />
        </Frame>
      )
    case 'creed':
      return (
        <Frame uid={uid} from="#3a1480" to="#1a0840">
          <Person x={16} y={42} fill="#ffcc33" scale={0.8} />
          <Person x={32} y={38} fill="#fff6b8" />
          <Person x={48} y={42} fill="#c86bff" scale={0.8} />
          <rect x="22" y="8" width="20" height="14" rx="4" fill="#fff6e8" />
          <path d="M26 14h12M28 18h8" stroke="#148a48" strokeWidth="2" strokeLinecap="round" />
        </Frame>
      )
    case 'sky':
      return (
        <Frame uid={uid} from="#14062e" to="#2a0d58">
          <path d="M32 8 38 24h18l-14 11 5 17-15-11-15 11 5-17L8 24h18Z" fill="#ffcc33" />
          <circle cx="12" cy="48" r="3" fill="#c86bff" />
          <circle cx="52" cy="50" r="2.4" fill="#fff6b8" />
        </Frame>
      )
    case 'creek':
      return (
        <Frame uid={uid} from="#12382a" to="#1a2848">
          <path d="M0 28c16 10 16-8 32 0s16-10 32 0v36H0Z" fill="#3d7ccc" />
          <path d="M0 36c16 8 16-6 32 2s16-8 32 2" stroke="#7dffb0" strokeWidth="3" fill="none" />
          <circle cx="18" cy="18" r="8" fill="#3dcc7a" />
        </Frame>
      )
    case 'keep':
      return (
        <Frame uid={uid} from="#2a0d58" to="#3a1480">
          <rect x="14" y="16" width="36" height="36" rx="8" fill="#ffcc33" />
          <path d="M22 34l8 8 14-16" stroke="#148a48" strokeWidth="4" fill="none" strokeLinecap="round" />
        </Frame>
      )
    default:
      return (
        <Frame uid={uid} from="#3a1480" to="#1a0840">
          <Person x={24} y={40} fill="#ffe7b8" />
          <rect x="34" y="12" width="18" height="14" rx="4" fill="#fff6e8" />
          <path d="M38 18h10" stroke="#148a48" strokeWidth="2" />
          <path d="M36 26 34 22h6Z" fill="#fff6e8" />
        </Frame>
      )
  }
}

function Person({
  x,
  y,
  fill,
  scale = 1,
}: {
  x: number
  y: number
  fill: string
  scale?: number
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <circle cx="0" cy="-12" r="7" fill={fill} />
      <path d="M-9 0c0-6 4-9 9-9s9 3 9 9v16H-9Z" fill={fill} />
    </g>
  )
}

function Frame({
  uid,
  from,
  to,
  children,
}: {
  uid: string
  from: string
  to: string
  children: ReactNode
}) {
  return (
    <svg className="story-art" viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-bg`} x1="10" y1="4" x2="56" y2="60">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
        <linearGradient id={`${uid}-shine`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="42%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="8" fill={`url(#${uid}-bg)`} />
      {children}
      <rect width="64" height="64" rx="8" fill={`url(#${uid}-shine)`} />
    </svg>
  )
}
