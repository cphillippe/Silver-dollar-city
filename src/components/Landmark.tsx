import { CAST, guideForArea } from '../content/story'
import { Avatar } from './Avatar'

const PLOT_ART: Record<
  string,
  { label: string; creek?: boolean; lamp?: boolean; bench?: boolean; sky?: boolean; gate?: boolean; ridge?: boolean }
> = {
  hollow: { label: 'Story Creek', creek: true },
  bench: { label: 'Witness Square', bench: true },
  porch: { label: 'East porch', lamp: true },
  observatory: { label: 'Sky Watch', sky: true },
  gate: { label: 'Why Gate', gate: true },
  lookout: { label: 'Meaning Ridge', ridge: true },
}

/** Big place picture for Link — creek, bench, lamp, sky, gate, or ridge. */
export function PlaceGlyph({
  plotId,
  className = '',
}: {
  plotId: string
  className?: string
}) {
  const art = PLOT_ART[plotId]
  return (
    <svg viewBox="0 0 96 96" className={`place-glyph ${className}`} aria-hidden>
      <rect width="96" height="96" rx="22" fill="#2a0d58" />
      {art?.creek ? (
        <>
          <path d="M8 70c14-10 22-8 36 2 14 10 26 8 44-4" fill="#3d7ccc" />
          <path d="M0 78c18-8 28-6 44 4 16 10 28 6 52-8V96H0Z" fill="#148a48" />
          <path d="M18 58c8-16 16-22 22-18 4 2 6 12 8 18" fill="#3dcc7a" />
          <path d="M58 48c10-18 18-20 24-12 4 6 4 16 2 22" fill="#2a8a48" />
        </>
      ) : art?.bench ? (
        <>
          <rect x="8" y="62" width="80" height="22" rx="4" fill="#5a3a1a" />
          <rect x="16" y="48" width="64" height="10" rx="3" fill="#c4922a" />
          <rect x="20" y="38" width="8" height="14" fill="#8a5a22" />
          <rect x="68" y="38" width="8" height="14" fill="#8a5a22" />
          <circle cx="72" cy="18" r="10" fill="#ffcc33" />
        </>
      ) : art?.sky ? (
        <>
          <path d="M18 78c0-24 12-40 30-40s30 16 30 40" fill="#1a3a78" />
          <circle cx="48" cy="42" r="10" fill="#ffcc33" />
          <circle cx="22" cy="22" r="2.5" fill="#fff6b8" />
          <circle cx="72" cy="18" r="2" fill="#fff6b8" />
          <circle cx="78" cy="32" r="1.8" fill="#ffe680" />
        </>
      ) : art?.gate ? (
        <>
          <path d="M20 78V40l28-18 28 18v38" fill="#8a6a3a" />
          <path d="M36 78V52h24v26" fill="#2a0d58" />
          <rect x="22" y="70" width="52" height="8" fill="#5a3a1a" />
        </>
      ) : art?.ridge ? (
        <>
          <path d="M6 78 28 42l14 14 16-28 32 50Z" fill="#3d7ccc" />
          <path d="M42 28 58 6l20 36" fill="#ffe680" />
        </>
      ) : (
        <>
          <rect x="18" y="44" width="60" height="36" rx="4" fill="#5a2410" />
          <rect x="34" y="58" width="16" height="22" fill="#2a0d58" />
          <path d="M48 16c0 10 8 14 8 22 0 6-4 10-8 10s-8-4-8-10c0-8 8-12 8-22Z" fill="#ffcc33" />
          <circle cx="48" cy="40" r="5" fill="#fff6b8" />
        </>
      )}
    </svg>
  )
}

const MARKS: Record<string, { label: string; path: string }> = {
  'parable-hollow': {
    label: 'Story Creek',
    path: 'M16 70c8-18 14-28 20-28 4 0 6 8 8 16 4-14 10-22 16-22 8 0 14 18 20 34',
  },
  'witness-bench': {
    label: 'Witness Square',
    path: 'M18 58h60M24 58v16h48V58M20 74h56',
  },
  observatory: {
    label: 'Sky Watch',
    path: 'M18 70c0-22 14-38 30-38s30 16 30 38M48 32v10',
  },
  'first-gate': {
    label: 'Why Gate',
    path: 'M22 78V38l26-16 26 16v40M48 78V50',
  },
  'high-lookout': {
    label: 'Meaning Ridge',
    path: 'M8 70 28 42l14 12 18-28 28 44',
  },
  'daily-trail': {
    label: 'East porch',
    path: 'M24 78V44h48v34M36 78V58h24v20M48 44V28',
  },
}

export function Landmark({
  pillar,
  compact,
}: {
  pillar: string
  compact?: boolean
}) {
  const mark = MARKS[pillar] ?? MARKS['daily-trail']
  const guide = pillar === 'daily-trail' ? CAST.juniper : guideForArea(pillar)
  return (
    <div className={`landmark ${compact ? 'is-compact' : ''}`}>
      <svg viewBox="0 0 96 96" aria-hidden className="landmark-mark">
        <rect width="96" height="96" rx="20" fill="currentColor" opacity="0.12" />
        <path
          d={mark.path}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <Avatar who={guide.id} size="sm" />
      <p className="landmark-label">{mark.label}</p>
    </div>
  )
}
