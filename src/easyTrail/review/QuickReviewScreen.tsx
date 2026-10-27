import { useState } from 'react'
import { EasyBack } from '../../components/EasyBack'
import { localDateKey } from '../../lib/dates'
import type { View } from '../../types'
import { QuickReview, type QuickReviewProps } from './QuickReview'

interface QuickReviewScreenProps {
  lineId: string
  skipWrite?: boolean
  onNavigate: (view: View) => void
}

function readDebugFormat(): QuickReviewProps['debugFormat'] {
  if (typeof window === 'undefined') return undefined
  const raw = new URLSearchParams(window.location.search).get('reviewFormat')
  if (raw === 'A' || raw === 'B' || raw === 'C') return raw
  return undefined
}

function readInitialSitting(): { bUsed?: boolean; streak?: number } {
  if (typeof window === 'undefined') return {}
  const raw = new URLSearchParams(window.location.search).get('reviewStreak')
  if (!raw) return {}
  const streak = Number(raw)
  return Number.isFinite(streak) && streak > 0 ? { streak } : {}
}

export function QuickReviewScreen({ lineId, skipWrite = true, onNavigate }: QuickReviewScreenProps) {
  const today = localDateKey()
  const [sitting, setSitting] = useState<{ bUsed?: boolean; streak?: number }>(readInitialSitting)
  const debugFormat = readDebugFormat()
  return (
    <main className="journal is-rehearse is-easy-hold-practice">
      <EasyBack onNavigate={onNavigate} debugToSettings />
      <QuickReview
        lineId={lineId}
        today={today}
        practice={skipWrite}
        sitting={sitting}
        onSittingUpdate={setSitting}
        debugFormat={debugFormat}
        onDone={() => onNavigate({ name: 'settings' })}
      />
    </main>
  )
}
