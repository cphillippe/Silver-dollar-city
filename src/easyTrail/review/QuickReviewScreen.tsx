import { useState } from 'react'
import { EasyBack } from '../../components/EasyBack'
import { localDateKey } from '../../lib/dates'
import type { View } from '../../types'
import { QuickReview, type QuickReviewProps } from './QuickReview'

interface QuickReviewScreenProps {
  lineId: string
  skipWrite?: boolean
  queue?: string[]
  from?: 'home' | 'settings'
  onNavigate: (view: View) => void
}

function readDebugFormat(fromHome: boolean): QuickReviewProps['debugFormat'] {
  if (fromHome || typeof window === 'undefined') return undefined
  const raw = new URLSearchParams(window.location.search).get('reviewFormat')
  if (raw === 'A' || raw === 'B' || raw === 'C') return raw
  return undefined
}

function readInitialSitting(fromHome: boolean): { bUsed?: boolean; streak?: number } {
  if (fromHome || typeof window === 'undefined') return {}
  const raw = new URLSearchParams(window.location.search).get('reviewStreak')
  if (!raw) return {}
  const streak = Number(raw)
  return Number.isFinite(streak) && streak > 0 ? { streak } : {}
}

export function QuickReviewScreen({
  lineId: bootLineId,
  skipWrite = true,
  queue,
  from,
  onNavigate,
}: QuickReviewScreenProps) {
  const fromHome = from === 'home'
  const queueIds = queue?.length ? queue : [bootLineId]
  const [cardIndex, setCardIndex] = useState(0)
  const lineId = queueIds[cardIndex] ?? bootLineId
  const today = localDateKey()
  const [sitting, setSitting] = useState<{ bUsed?: boolean; streak?: number }>(() =>
    readInitialSitting(fromHome),
  )
  const debugFormat = readDebugFormat(fromHome)

  function onDone() {
    if (cardIndex + 1 < queueIds.length) {
      setCardIndex((index) => index + 1)
      return
    }
    if (fromHome) {
      onNavigate({ name: 'hub' })
      return
    }
    onNavigate({ name: 'settings' })
  }

  return (
    <main className="journal is-rehearse is-easy-hold-practice">
      <EasyBack onNavigate={onNavigate} debugToSettings={!fromHome} />
      <QuickReview
        key={lineId}
        lineId={lineId}
        today={today}
        practice={skipWrite}
        sitting={sitting}
        onSittingUpdate={setSitting}
        debugFormat={debugFormat}
        formatsACOnly={fromHome}
        skipHonesty={fromHome}
        onDone={onDone}
      />
    </main>
  )
}
