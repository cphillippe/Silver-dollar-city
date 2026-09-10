import { CAST, guideForArea } from '../content/story'
import { Avatar } from './Avatar'

const MARKS: Record<string, { label: string; path: string }> = {
  'parable-hollow': {
    label: 'Parable Hollow',
    path: 'M16 70c8-18 14-28 20-28 4 0 6 8 8 16 4-14 10-22 16-22 8 0 14 18 20 34',
  },
  'witness-bench': {
    label: 'Witness Bench',
    path: 'M18 58h60M24 58v16h48V58M20 74h56',
  },
  observatory: {
    label: 'The Observatory',
    path: 'M18 70c0-22 14-38 30-38s30 16 30 38M48 32v10',
  },
  'first-gate': {
    label: 'The First Gate',
    path: 'M22 78V38l26-16 26 16v40M48 78V50',
  },
  'high-lookout': {
    label: 'High Lookout',
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
