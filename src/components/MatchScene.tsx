import { useId, type ReactNode } from 'react'
import type { MatchSceneId } from '../types'

export function MatchScene({ scene }: { scene: MatchSceneId }) {
  const uid = useId().replace(/:/g, '')
  switch (scene) {
    case 'expand':
      return (
        <SceneFrame uid={uid} from="#14062e" to="#2a0d58">
          <circle cx="32" cy="32" r="7" fill="#fff6b8" />
          <circle cx="32" cy="32" r="3" fill="#ffcc33" />
          <path d="M32 18v-12M32 46v12M18 32h-12M46 32h12M21 21l-8-8M43 21l8-8M21 43l-8 8M43 43l8 8" stroke="#ffcc33" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="3" fill="#c86bff" />
          <circle cx="52" cy="14" r="2.6" fill="#7dffb0" />
          <circle cx="50" cy="50" r="3" fill="#ff9f1a" />
          <circle cx="14" cy="50" r="2.4" fill="#fff" />
        </SceneFrame>
      )
    case 'bind':
      return (
        <SceneFrame uid={uid} from="#12382a" to="#1a0840">
          <path d="M22 32h20" stroke="#7dffb0" strokeWidth="8" strokeLinecap="round" />
          <circle cx="18" cy="32" r="11" fill="#fff6e8" stroke="#ffe08a" strokeWidth="2" />
          <circle cx="46" cy="32" r="14" fill="#ffcc33" stroke="#fff8dc" strokeWidth="2" />
          <circle cx="18" cy="32" r="4" fill="#c4922a" />
          <circle cx="46" cy="32" r="5" fill="#8a5a22" />
        </SceneFrame>
      )
    case 'tidy':
      return (
        <SceneFrame uid={uid} from="#2a0d58" to="#1a0840">
          <rect x="6" y="50" width="52" height="4" rx="1" fill="#ffe08a" />
          <rect x="18" y="34" width="28" height="16" rx="3" fill="#ffcc33" />
          <rect x="22" y="20" width="20" height="14" rx="3" fill="#fff6b8" />
          <rect x="26" y="8" width="12" height="12" rx="3" fill="#ffe08a" />
          <path d="M32 8v-4" stroke="#ff5a7a" strokeWidth="2.4" />
          <path d="M32 4l8 3-8 2Z" fill="#ff5a7a" />
        </SceneFrame>
      )
    case 'dial':
      return (
        <SceneFrame uid={uid} from="#1a0840" to="#3a1480">
          <circle cx="32" cy="34" r="20" fill="#fff6e8" stroke="#ffcc33" strokeWidth="3" />
          <path d="M32 16v4M32 48v4M14 34h4M46 34h4M19 21l3 3M42 21l-3 3M19 47l3-3M42 47l-3-3" stroke="#c4922a" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M32 34l10-12" stroke="#b01c40" strokeWidth="3.4" strokeLinecap="round" />
          <circle cx="32" cy="34" r="4" fill="#2a0d58" />
          <circle cx="12" cy="12" r="6" fill="#3dcc7a" />
          <path d="M50 8l4 8h-8Z" fill="#ffcc33" />
          <path d="M52 18v8" stroke="#ffcc33" strokeWidth="2" />
        </SceneFrame>
      )
    case 'witnesses':
      return (
        <SceneFrame uid={uid} from="#3a1480" to="#1a0840">
          <Person x={14} y={40} fill="#ffcc33" />
          <Person x={32} y={38} fill="#fff6b8" />
          <Person x={50} y={40} fill="#c86bff" />
          <Speech x={10} y={12} />
          <Speech x={28} y={8} />
          <Speech x={46} y={12} />
        </SceneFrame>
      )
    case 'reluctant':
      return (
        <SceneFrame uid={uid} from="#2a0d58" to="#1a0840">
          <circle cx="24" cy="18" r="8" fill="#ffe7b8" />
          <path d="M16 30c0-6 4-10 8-10s8 4 8 10v16H16Z" fill="#ffe7b8" />
          <path d="M20 16c2 2 6 2 8 0" stroke="#8a5a22" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M30 22c6-8 16-6 18 2" stroke="#ffe08a" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <rect x="38" y="28" width="18" height="22" rx="3" fill="#fff6e8" />
          <path d="M42 36h10M42 42h8" stroke="#c4922a" strokeWidth="2" strokeLinecap="round" />
          <circle cx="47" cy="48" r="2" fill="#ff5a7a" />
        </SceneFrame>
      )
    case 'clock':
      return (
        <SceneFrame uid={uid} from="#2a0d58" to="#ff5a7a">
          <circle cx="32" cy="42" r="12" fill="#ffcc33" />
          <path d="M0 50h64v14H0Z" fill="#148a48" />
          <circle cx="32" cy="28" r="16" fill="#fff6e8" stroke="#2a0d58" strokeWidth="3" />
          <path d="M32 16v4M32 36v4M20 28h4M40 28h4" stroke="#c4922a" strokeWidth="2" strokeLinecap="round" />
          <path d="M32 28v-8" stroke="#2a0d58" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M32 28l7 4" stroke="#b01c40" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="32" cy="28" r="2.2" fill="#2a0d58" />
        </SceneFrame>
      )
    case 'judea':
      return (
        <SceneFrame uid={uid} from="#1a2848" to="#2a0d58">
          <rect x="8" y="30" width="28" height="22" fill="#ffe7b8" />
          <path d="M6 30h32l-16-14Z" fill="#c4922a" />
          <rect x="14" y="36" width="5" height="16" fill="#fff6e8" />
          <rect x="25" y="36" width="5" height="16" fill="#fff6e8" />
          <rect x="42" y="18" width="12" height="34" fill="#d8c4a0" />
          <rect x="40" y="14" width="16" height="6" fill="#c4922a" />
          <path d="M48 8l3 6h-6Z" fill="#ffcc33" />
        </SceneFrame>
      )
    case 'redness':
      return (
        <SceneFrame uid={uid} from="#3a1480" to="#1a0840">
          <ellipse cx="16" cy="28" rx="10" ry="7" fill="#fff6e8" />
          <circle cx="16" cy="28" r="4.2" fill="#ff5a7a" />
          <circle cx="16" cy="28" r="1.8" fill="#1a0840" />
          <circle cx="38" cy="34" r="16" fill="#ff5a7a" />
          <path d="M30 24c4-6 12-6 16 0" fill="#ff8aa0" />
        </SceneFrame>
      )
    case 'aboutness':
      return (
        <SceneFrame uid={uid} from="#2a0d58" to="#3a1480">
          <circle cx="16" cy="28" r="10" fill="#ffe7b8" />
          <path d="M8 40c0-6 4-10 8-10s8 4 8 10v12H8Z" fill="#ffe7b8" />
          <path d="M26 18h14l-4-6 12 8-12 8 4-6H26Z" fill="#ffcc33" />
          <rect x="44" y="28" width="14" height="18" rx="3" fill="#fff6b8" />
          <path d="M47 28c4-6 10-4 11 2" stroke="#7dffb0" strokeWidth="2" fill="none" />
        </SceneFrame>
      )
    case 'mindgap':
      return (
        <SceneFrame uid={uid} from="#1a0840" to="#3a1480">
          <circle cx="16" cy="32" r="12" fill="#c86bff" />
          <circle cx="16" cy="32" r="5" fill="#fff6e8" />
          <circle cx="12" cy="24" r="4" fill="#9a4de0" />
          <circle cx="22" cy="38" r="4" fill="#9a4de0" />
          <path d="M30 32h6" stroke="#fff6e8" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 3" />
          <circle cx="50" cy="22" r="8" fill="#ffe7b8" />
          <path d="M42 32c0-6 4-10 8-10s8 4 8 10v16H42Z" fill="#ffe7b8" />
          <path d="M46 20c2 2 6 2 8 0" stroke="#8a5a22" strokeWidth="1.8" fill="none" />
        </SceneFrame>
      )
    case 'truenorth':
      return (
        <SceneFrame uid={uid} from="#1a0840" to="#2a0d58">
          <circle cx="32" cy="36" r="18" fill="#fff6e8" stroke="#ffcc33" strokeWidth="3" />
          <path d="M32 22l6 14-6-3-6 3Z" fill="#b01c40" />
          <path d="M32 50l6-14-6 3-6-3Z" fill="#2a0d58" />
          <path d="M32 8v8" stroke="#ffcc33" strokeWidth="3" strokeLinecap="round" />
          <text x="32" y="12" textAnchor="middle" fontSize="9" fontWeight="700" fill="#ffcc33">
            N
          </text>
        </SceneFrame>
      )
    case 'crowd':
      return (
        <SceneFrame uid={uid} from="#3a1480" to="#1a0840">
          <Person x={12} y={42} fill="#ffcc33" scale={0.72} />
          <Person x={24} y={36} fill="#fff6b8" scale={0.8} />
          <Person x={36} y={34} fill="#c86bff" scale={0.86} />
          <Person x={48} y={38} fill="#7dffb0" scale={0.76} />
          <Person x={18} y={50} fill="#ff9f1a" scale={0.64} />
          <Person x={42} y={50} fill="#ffe08a" scale={0.64} />
        </SceneFrame>
      )
    case 'cells':
      return (
        <SceneFrame uid={uid} from="#12382a" to="#1a0840">
          <circle cx="22" cy="32" r="14" fill="#7dffb0" stroke="#148a48" strokeWidth="2.4" />
          <circle cx="44" cy="32" r="14" fill="#3dcc7a" stroke="#0e6a38" strokeWidth="2.4" />
          <circle cx="22" cy="32" r="5" fill="#fff6b8" />
          <circle cx="44" cy="32" r="5" fill="#fff6b8" />
          <path d="M32 24v16" stroke="#fff6e8" strokeWidth="2" strokeDasharray="2 2" />
        </SceneFrame>
      )
    case 'band':
      return (
        <SceneFrame uid={uid} from="#14062e" to="#2a0d58">
          <circle cx="32" cy="32" r="22" fill="none" stroke="#ffcc33" strokeWidth="6" />
          <circle cx="32" cy="32" r="9" fill="#3dcc7a" stroke="#fff6e8" strokeWidth="2" />
          <circle cx="52" cy="14" r="5" fill="#ff9f1a" />
        </SceneFrame>
      )
    case 'pasture':
      return (
        <SceneFrame uid={uid} from="#12382a" to="#1a0840">
          <path d="M0 40c12-12 20-8 32-8s20-6 32 8v24H0Z" fill="#3dcc7a" />
          <circle cx="22" cy="36" r="7" fill="#fff6e8" />
          <circle cx="40" cy="38" r="6" fill="#ffe7b8" />
          <rect x="20" y="41" width="4" height="7" fill="#8a5a22" />
          <rect x="38" y="42" width="4" height="7" fill="#8a5a22" />
        </SceneFrame>
      )
    case 'first':
      return (
        <SceneFrame uid={uid} from="#3a1480" to="#1a0840">
          <Person x={24} y={36} fill="#fff6b8" />
          <Person x={46} y={42} fill="#c86bff" scale={0.7} />
          <circle cx="14" cy="14" r="10" fill="#ffcc33" />
          <text x="14" y="18" textAnchor="middle" fontSize="12" fontWeight="800" fill="#2a0d58">
            1
          </text>
        </SceneFrame>
      )
    case 'twelve':
      return (
        <SceneFrame uid={uid} from="#2a0d58" to="#1a0840">
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2
            return <circle key={i} cx={32 + Math.cos(a) * 18} cy={32 + Math.sin(a) * 18} r="4.2" fill={i === 0 ? '#fff6b8' : '#ffcc33'} />
          })}
        </SceneFrame>
      )
    case 'welcome':
      return (
        <SceneFrame uid={uid} from="#3a1480" to="#1a0840">
          <path d="M16 56V22c0-6 7-12 16-12s16 6 16 12v34" fill="#ffcc33" />
          <path d="M22 56V24c0-5 4-9 10-9s10 4 10 9v32" fill="#fff6b8" />
          <Person x={32} y={44} fill="#c86bff" scale={0.7} />
        </SceneFrame>
      )
    case 'mindsky':
      return (
        <SceneFrame uid={uid} from="#14062e" to="#2a0d58">
          <circle cx="32" cy="44" r="12" fill="#ffe7b8" />
          <path d="M20 54c0-8 6-12 12-12s12 4 12 12" fill="#ffe7b8" />
          <circle cx="16" cy="14" r="2.2" fill="#ffcc33" />
          <circle cx="32" cy="10" r="3" fill="#fff6b8" />
          <circle cx="50" cy="16" r="2.4" fill="#c86bff" />
          <path d="M26 34l6-12" stroke="#ffcc33" strokeWidth="2.2" strokeLinecap="round" />
        </SceneFrame>
      )
    case 'lamp':
      return (
        <SceneFrame uid={uid} from="#3a1480" to="#1a0840">
          <path d="M20 30c0-10 6-16 12-16s12 6 12 16c6 2 8 8 8 12H12c0-4 2-10 8-12Z" fill="#ffcc33" />
          <rect x="27" y="42" width="10" height="12" rx="2" fill="#c4922a" />
          <circle cx="32" cy="26" r="5" fill="#fff6b8" />
        </SceneFrame>
      )
    case 'seed':
      return (
        <SceneFrame uid={uid} from="#12382a" to="#1a0840">
          <path d="M32 8c14 12 16 26 0 44C16 34 18 20 32 8Z" fill="#3dcc7a" />
          <path d="M32 18c6 8 6 16 0 26" stroke="#fff6b8" strokeWidth="3" fill="none" />
          <path d="M0 52h64v12H0Z" fill="#8a5a22" />
        </SceneFrame>
      )
    case 'heart':
      return (
        <SceneFrame uid={uid} from="#4a1a88" to="#1a0840">
          <path d="M32 54 10 32c-7-7-2-18 9-18 6 0 9 4 13 8 4-4 7-8 13-8 11 0 16 11 9 18Z" fill="#ff5a7a" />
          <circle cx="22" cy="24" r="3.4" fill="#fff6e8" opacity=".85" />
        </SceneFrame>
      )
    case 'star':
      return (
        <SceneFrame uid={uid} from="#14062e" to="#2a0d58">
          <path d="M32 6 39 24h20l-16 12 6 18-17-12-17 12 6-18L5 24h20Z" fill="#ffcc33" />
        </SceneFrame>
      )
    case 'cup':
      return (
        <SceneFrame uid={uid} from="#3a1480" to="#1a0840">
          <path d="M16 14h32c3 12 3 22-6 28H22c-9-6-9-16-6-28Z" fill="#ffcc33" />
          <path d="M27 42h10v10H27Z" fill="#c4922a" />
          <path d="M22 54h20" stroke="#ffe08a" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M40 12c5-5 12-2 12 5" fill="none" stroke="#7dffb0" strokeWidth="2.6" />
        </SceneFrame>
      )
    case 'tree':
      return (
        <SceneFrame uid={uid} from="#12382a" to="#1a0840">
          <circle cx="32" cy="24" r="18" fill="#3dcc7a" />
          <circle cx="18" cy="30" r="11" fill="#34c46a" />
          <circle cx="46" cy="30" r="11" fill="#7dffb0" />
          <rect x="28" y="36" width="8" height="20" rx="2" fill="#8a5a22" />
        </SceneFrame>
      )
    case 'door':
      return (
        <SceneFrame uid={uid} from="#3a1480" to="#1a0840">
          <path d="M14 58V20c0-7 7-14 18-14s18 7 18 14v38Z" fill="#ffe7b8" />
          <path d="M20 58V22c0-5 5-10 12-10s12 5 12 10v36Z" fill="#ffcc33" />
          <circle cx="40" cy="38" r="2.6" fill="#8a5a22" />
        </SceneFrame>
      )
    case 'coin':
      return (
        <SceneFrame uid={uid} from="#3a1480" to="#1a0840">
          <circle cx="32" cy="32" r="20" fill="#ffcc33" stroke="#fff8dc" strokeWidth="3" />
          <circle cx="32" cy="32" r="13" fill="none" stroke="#c4922a" strokeWidth="2.4" />
          <path d="M32 20v24M25 26h14M25 38h14" stroke="#8a5a22" strokeWidth="2.4" strokeLinecap="round" />
        </SceneFrame>
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

function Speech({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="16" height="12" rx="3" fill="#fff6e8" />
      <path d="M5 14 4 12h4Z" fill="#fff6e8" />
      <path d="M4 6h8" stroke="#148a48" strokeWidth="2" strokeLinecap="round" />
    </g>
  )
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
      <rect width="64" height="64" fill={`url(#${uid}-bg)`} />
      {children}
    </svg>
  )
}
