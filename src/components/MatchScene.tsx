import { useId, type ReactNode } from 'react'
import type { MatchSceneId } from '../types'

export function MatchScene({ scene }: { scene: MatchSceneId }) {
  const uid = useId().replace(/:/g, '')
  switch (scene) {
    case 'cosmos':
      return (
        <SceneFrame uid={uid} from="#1a0840" to="#3a1480">
          <circle cx="32" cy="32" r="18" fill="none" stroke="#ffcc33" strokeWidth="2.2" opacity=".85" />
          <circle cx="32" cy="32" r="10" fill="none" stroke="#ffe08a" strokeWidth="1.6" opacity=".7" />
          <circle cx="32" cy="32" r="4" fill="#fff6b8" />
          <circle cx="14" cy="18" r="2.2" fill="#c86bff" />
          <circle cx="50" cy="16" r="1.8" fill="#ffcc33" />
          <circle cx="52" cy="40" r="2.4" fill="#7dffb0" />
          <circle cx="12" cy="44" r="1.6" fill="#fff" />
          <path d="M32 8v6M32 50v6M8 32h6M50 32h6" stroke="#ffcc33" strokeWidth="2" strokeLinecap="round" />
        </SceneFrame>
      )
    case 'atom':
      return (
        <SceneFrame uid={uid} from="#12305a" to="#2a0d58">
          <ellipse cx="32" cy="32" rx="22" ry="9" fill="none" stroke="#7dffb0" strokeWidth="2.2" />
          <ellipse cx="32" cy="32" rx="22" ry="9" fill="none" stroke="#c86bff" strokeWidth="2.2" transform="rotate(60 32 32)" />
          <ellipse cx="32" cy="32" rx="22" ry="9" fill="none" stroke="#ffcc33" strokeWidth="2.2" transform="rotate(-60 32 32)" />
          <circle cx="32" cy="32" r="6" fill="#fff6b8" stroke="#ff9f1a" strokeWidth="2" />
        </SceneFrame>
      )
    case 'origin':
      return (
        <SceneFrame uid={uid} from="#3a1480" to="#1a0840">
          <path d="M6 46c10-4 16-14 26-14s16 10 26 14" fill="#ffcc33" opacity=".95" />
          <path d="M10 40c8-3 13-10 22-10s14 7 22 10" fill="#fff6b8" />
          <rect x="24" y="18" width="16" height="10" rx="2" fill="#ffe08a" />
          <rect x="27" y="12" width="10" height="8" rx="2" fill="#fff8dc" />
          <circle cx="32" cy="10" r="3" fill="#ff9f1a" />
        </SceneFrame>
      )
    case 'balance':
      return (
        <SceneFrame uid={uid} from="#2a0d58" to="#4a1a88">
          <path d="M32 12v28" stroke="#ffe08a" strokeWidth="3" strokeLinecap="round" />
          <path d="M14 28h36" stroke="#ffcc33" strokeWidth="3" strokeLinecap="round" />
          <path d="M14 28l-6 12h12Z" fill="#c86bff" />
          <path d="M50 28l-6 12h12Z" fill="#ffcc33" />
          <rect x="24" y="40" width="16" height="4" rx="2" fill="#fff6b8" />
          <circle cx="32" cy="12" r="4" fill="#fff6b8" />
        </SceneFrame>
      )
    case 'scrolls':
      return (
        <SceneFrame uid={uid} from="#4a1a88" to="#2a0d58">
          <rect x="10" y="16" width="22" height="32" rx="4" fill="#fff6e8" transform="rotate(-8 21 32)" />
          <rect x="28" y="14" width="22" height="34" rx="4" fill="#ffe7b8" />
          <path d="M33 22h12M33 28h12M33 34h9" stroke="#c4922a" strokeWidth="2" strokeLinecap="round" />
          <circle cx="16" cy="20" r="2" fill="#ff5a7a" />
        </SceneFrame>
      )
    case 'cost':
      return (
        <SceneFrame uid={uid} from="#3a1480" to="#1a0840">
          <path d="M20 18h24l4 10-16 20-16-20Z" fill="#ffcc33" stroke="#fff8dc" strokeWidth="2" />
          <path d="M28 22 36 42" stroke="#b01c40" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="32" cy="30" r="4" fill="#fff6b8" />
        </SceneFrame>
      )
    case 'dawn':
      return (
        <SceneFrame uid={uid} from="#2a0d58" to="#ff5a7a">
          <circle cx="32" cy="38" r="14" fill="#ffcc33" />
          <circle cx="32" cy="38" r="8" fill="#fff6b8" />
          <path d="M4 48h56v10H4Z" fill="#3dcc7a" />
          <path d="M4 44c8 6 16 2 24 2s16 6 32-2v6H4Z" fill="#148a48" />
        </SceneFrame>
      )
    case 'world':
      return (
        <SceneFrame uid={uid} from="#1a3058" to="#2a0d58">
          <rect x="14" y="28" width="36" height="20" rx="2" fill="#ffe7b8" />
          <path d="M18 28v-8h8v8M38 28v-10h8v10" fill="#c4922a" />
          <rect x="28" y="36" width="8" height="12" fill="#8a5a22" />
          <circle cx="32" cy="16" r="5" fill="#ffcc33" />
        </SceneFrame>
      )
    case 'felt':
      return (
        <SceneFrame uid={uid} from="#4a1a88" to="#2a0d58">
          <ellipse cx="32" cy="32" rx="20" ry="13" fill="#fff6e8" />
          <circle cx="32" cy="32" r="8" fill="#ff5a7a" />
          <circle cx="32" cy="32" r="3.5" fill="#1a0840" />
          <circle cx="29" cy="29" r="1.4" fill="#fff" />
        </SceneFrame>
      )
    case 'pointing':
      return (
        <SceneFrame uid={uid} from="#2a0d58" to="#3a1480">
          <circle cx="18" cy="32" r="8" fill="#c86bff" />
          <path d="M26 32h18l-6-7M44 32l-6 7" fill="none" stroke="#ffcc33" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="46" y="24" width="10" height="16" rx="2" fill="#fff6b8" />
        </SceneFrame>
      )
    case 'gap':
      return (
        <SceneFrame uid={uid} from="#1a0840" to="#3a1480">
          <rect x="8" y="16" width="18" height="32" rx="4" fill="#c86bff" />
          <rect x="38" y="16" width="18" height="32" rx="4" fill="#ffcc33" />
          <path d="M28 32h8" stroke="#fff6e8" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 3" />
        </SceneFrame>
      )
    case 'norm':
      return (
        <SceneFrame uid={uid} from="#2a0d58" to="#4a1a88">
          <circle cx="32" cy="34" r="16" fill="#fff6e8" stroke="#ffcc33" strokeWidth="3" />
          <path d="M32 22v12l8 5" stroke="#b01c40" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="32" cy="34" r="2.4" fill="#2a0d58" />
          <path d="M32 10v6" stroke="#ffcc33" strokeWidth="3" strokeLinecap="round" />
        </SceneFrame>
      )
    case 'crowd':
      return (
        <SceneFrame uid={uid} from="#3a1480" to="#2a0d58">
          <circle cx="20" cy="24" r="5" fill="#ffcc33" />
          <circle cx="32" cy="20" r="6" fill="#fff6b8" />
          <circle cx="44" cy="24" r="5" fill="#c86bff" />
          <path d="M12 46c2-10 8-12 12-12s8 4 8 12M24 48c2-12 8-16 16-16s10 6 10 16" fill="#ffe7b8" />
        </SceneFrame>
      )
    case 'cells':
      return (
        <SceneFrame uid={uid} from="#12382a" to="#2a0d58">
          <circle cx="24" cy="30" r="12" fill="#7dffb0" stroke="#148a48" strokeWidth="2" />
          <circle cx="42" cy="34" r="11" fill="#3dcc7a" stroke="#0e6a38" strokeWidth="2" />
          <circle cx="24" cy="30" r="4" fill="#fff6b8" />
          <circle cx="42" cy="34" r="3.5" fill="#fff6b8" />
        </SceneFrame>
      )
    case 'band':
      return (
        <SceneFrame uid={uid} from="#1a0840" to="#3a1480">
          <circle cx="32" cy="32" r="20" fill="none" stroke="#ffcc33" strokeWidth="5" />
          <circle cx="32" cy="32" r="8" fill="#3dcc7a" stroke="#fff6b8" strokeWidth="2" />
          <circle cx="50" cy="18" r="4" fill="#ff9f1a" />
        </SceneFrame>
      )
    case 'pasture':
      return (
        <SceneFrame uid={uid} from="#1a4030" to="#2a0d58">
          <path d="M4 40c10-10 18-8 28-8s18-4 28 8v16H4Z" fill="#3dcc7a" />
          <circle cx="24" cy="36" r="6" fill="#fff6e8" />
          <circle cx="40" cy="38" r="5" fill="#ffe7b8" />
          <rect x="22" y="40" width="4" height="6" fill="#8a5a22" />
          <rect x="38" y="41" width="4" height="6" fill="#8a5a22" />
        </SceneFrame>
      )
    case 'lamp':
      return (
        <SceneFrame uid={uid} from="#3a1480" to="#1a0840">
          <path d="M24 28c0-8 4-14 8-14s8 6 8 14c4 2 6 6 6 10H18c0-4 2-8 6-10Z" fill="#ffcc33" />
          <rect x="28" y="38" width="8" height="10" rx="2" fill="#c4922a" />
          <circle cx="32" cy="24" r="4" fill="#fff6b8" />
        </SceneFrame>
      )
    case 'seed':
      return (
        <SceneFrame uid={uid} from="#1a4030" to="#2a0d58">
          <path d="M32 12c10 10 12 22 0 36C20 34 22 22 32 12Z" fill="#3dcc7a" />
          <path d="M32 20c4 6 4 12 0 20" stroke="#fff6b8" strokeWidth="2.4" fill="none" />
          <path d="M4 50h56v6H4Z" fill="#8a5a22" />
        </SceneFrame>
      )
    case 'heart':
      return (
        <SceneFrame uid={uid} from="#4a1a88" to="#2a0d58">
          <path d="M32 50 14 32c-6-6-2-16 8-16 5 0 8 3 10 6 2-3 5-6 10-6 10 0 14 10 8 16Z" fill="#ff5a7a" />
          <circle cx="24" cy="24" r="3" fill="#fff6e8" opacity=".8" />
        </SceneFrame>
      )
    case 'star':
      return (
        <SceneFrame uid={uid} from="#1a0840" to="#3a1480">
          <path d="M32 8 38 24h18l-14 11 5 17-15-10-15 10 5-17L8 24h18Z" fill="#ffcc33" />
          <circle cx="32" cy="28" r="4" fill="#fff6b8" />
        </SceneFrame>
      )
    case 'cup':
      return (
        <SceneFrame uid={uid} from="#3a1480" to="#2a0d58">
          <path d="M20 16h24c2 10 2 18-4 22H24c-6-4-6-12-4-22Z" fill="#ffcc33" />
          <path d="M28 38h8v8h-8Z" fill="#c4922a" />
          <path d="M24 50h16" stroke="#ffe08a" strokeWidth="3" strokeLinecap="round" />
          <path d="M36 14c4-4 10-2 10 4" fill="none" stroke="#7dffb0" strokeWidth="2.4" />
        </SceneFrame>
      )
    case 'tree':
      return (
        <SceneFrame uid={uid} from="#12382a" to="#2a0d58">
          <circle cx="32" cy="26" r="16" fill="#3dcc7a" />
          <circle cx="22" cy="30" r="10" fill="#34c46a" />
          <circle cx="42" cy="30" r="10" fill="#7dffb0" />
          <rect x="29" y="36" width="6" height="16" rx="2" fill="#8a5a22" />
        </SceneFrame>
      )
    case 'door':
      return (
        <SceneFrame uid={uid} from="#3a1480" to="#1a0840">
          <path d="M18 54V22c0-6 6-12 14-12s14 6 14 12v32Z" fill="#ffe7b8" />
          <path d="M22 54V24c0-5 4-9 10-9s10 4 10 9v30Z" fill="#ffcc33" />
          <circle cx="40" cy="36" r="2.2" fill="#8a5a22" />
        </SceneFrame>
      )
    case 'coin':
      return (
        <SceneFrame uid={uid} from="#4a1a88" to="#2a0d58">
          <circle cx="32" cy="32" r="18" fill="#ffcc33" stroke="#fff8dc" strokeWidth="3" />
          <circle cx="32" cy="32" r="12" fill="none" stroke="#c4922a" strokeWidth="2" />
          <path d="M32 22v20M26 28h12M26 36h12" stroke="#8a5a22" strokeWidth="2.2" strokeLinecap="round" />
        </SceneFrame>
      )
  }
}

function SceneFrame({
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
    <svg className="match-scene" viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-bg`} x1="12" y1="6" x2="54" y2="58">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill={`url(#${uid}-bg)`} />
      {children}
    </svg>
  )
}
