import { useId, type ReactNode } from 'react'
import { resolveStoryMedia, type StoryMediaSlot, type StoryScene } from '../lib/storyPanels'
import panelFatherRun from '../assets/story/panel-father-run.webp'
import panelHelp from '../assets/story/panel-help.webp'
import panelHug from '../assets/story/panel-hug.webp'
import panelHungry from '../assets/story/panel-hungry.webp'
import panelHurt from '../assets/story/panel-hurt.webp'
import panelNeighbor from '../assets/story/panel-neighbor.webp'
import panelSonLeave from '../assets/story/panel-son-leave.webp'
import panelSpeech from '../assets/story/panel-speech.webp'
import panelWalkPast from '../assets/story/panel-walk-past.webp'

/** Gemini panel-blast stills (CoS set A ph-road / set B ph-father). */
const PANEL_ART: Partial<Record<StoryScene, string>> = {
  hurt: panelHurt,
  'walk-past': panelWalkPast,
  help: panelHelp,
  neighbor: panelNeighbor,
  'son-leave': panelSonLeave,
  hungry: panelHungry,
  speech: panelSpeech,
  'father-run': panelFatherRun,
  hug: panelHug,
  feast: panelHug,
}

/** Lesson-specific still map for Why Gate. These local SVG stills are keyed by beatId,
 * so foundation panels never fall back to Samaritan art or empty generic tiles. */
type FoundationArtKind =
  | 'world' | 'order' | 'christ' | 'gate' | 'mind' | 'light' | 'word' | 'reason'
  | 'nature' | 'law' | 'heart' | 'ought' | 'god' | 'life' | 'breath' | 'ground'
  | 'change' | 'actual' | 'mover' | 'source' | 'possible' | 'necessary' | 'contingent'
  | 'beginning' | 'cause' | 'time' | 'kalam' | 'finite' | 'limits' | 'gospel' | 'whole'

const FOUNDATION_BEATS: Record<string, readonly FoundationArtKind[]> = {
  'fg-order': ['world', 'order', 'christ', 'gate'],
  'fg-reason': ['mind', 'light', 'word', 'reason'],
  'fg-ought': ['nature', 'law', 'heart', 'ought'],
  'fg-ground': ['god', 'life', 'breath', 'ground'],
  'fg-mover': ['change', 'actual', 'mover', 'source'],
  'fg-contingent': ['possible', 'necessary', 'contingent', 'ground'],
  'fg-kalam': ['beginning', 'time', 'cause', 'kalam'],
  'fg-limits': ['finite', 'limits', 'gospel', 'whole'],
}

function foundationBeatFor(beatId?: string): FoundationArtKind | null {
  if (!beatId) return null
  const [lineId, , rawIndex] = beatId.split(':')
  if (!lineId.startsWith('fg-')) return null
  const index = Number(rawIndex)
  if (!Number.isInteger(index)) return null
  return FOUNDATION_BEATS[lineId]?.[index] ?? null
}

export function StoryPanelArt({
  scene,
  media,
  beatId,
  size = 'hero',
}: {
  scene: StoryScene
  media?: StoryMediaSlot
  beatId?: string
  size?: 'hero' | 'thumb'
}) {
  const uid = useId().replace(/:/g, '')
  const foundationBeat = foundationBeatFor(beatId)
  if (foundationBeat) return <FoundationArt kind={foundationBeat} uid={uid} />
  const resolved = resolveStoryMedia(media)
  if (resolved.loop) {
    return (
      <video
        className="story-art-tile"
        src={resolved.loop}
        poster={resolved.still || PANEL_ART[scene]}
        muted
        loop
        playsInline
        autoPlay
        aria-hidden
      />
    )
  }
  const painted =
    (size === 'thumb' ? resolved.thumb : undefined) || resolved.still || PANEL_ART[scene]
  if (painted) {
    return <img className="story-art-tile" src={painted} alt="" draggable={false} />
  }
  switch (scene) {
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

function FoundationArt({ kind, uid }: { kind: FoundationArtKind; uid: string }) {
  const label = kind.toUpperCase()
  const orderArt = ['world', 'order', 'christ', 'gate'].includes(kind)
  const from = orderArt ? '#2a0d58' : '#1a2848'
  const to = orderArt ? '#148a48' : '#3a1480'
  const path =
    kind === 'world' || kind === 'nature' || kind === 'finite'
      ? 'M14 27h36M32 9c-7 5-10 11-10 18s3 13 10 18M32 9c7 5 10 11 10 18s-3 13-10 18'
      : kind === 'mind' || kind === 'reason' || kind === 'light'
        ? 'M20 28c0-8 5-13 12-13s12 5 12 13c0 5-3 8-7 10H27c-4-2-7-5-7-10ZM27 43h10M28 48h8'
        : kind === 'law' || kind === 'heart' || kind === 'ought'
          ? 'M32 13 37 25h13L39 33l4 13-11-8-11 8 4-13-11-8h13Z'
          : 'M32 10v34M21 22h22M16 47h32'
  return (
    <Frame uid={uid} from={from} to={to}>
      <circle cx="32" cy="27" r="18" fill="#ffcc33" opacity="0.95" />
      <path d={path} fill="none" stroke="#2a1408" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="7" y="49" width="50" height="10" rx="5" fill="#fff6e8" opacity="0.92" />
      <text x="32" y="56.5" textAnchor="middle" fontSize="6.2" fontWeight="800" fill="#2a1408">
        {label}
      </text>
    </Frame>
  )
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
