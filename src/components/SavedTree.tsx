import { useLayoutEffect, useRef, type ReactNode } from 'react'
import type { CharacterId } from '../content/story'
import { Avatar } from './Avatar'

interface SavedTreeProps {
  startOpen?: boolean
  className?: string
  children: ReactNode
}

/** Uncontrolled fold. `startOpen` opens it on mount (and if that flag later turns on). */
export function SavedTree({ startOpen = false, className, children }: SavedTreeProps) {
  const ref = useRef<HTMLDetailsElement>(null)
  useLayoutEffect(() => {
    if (startOpen && ref.current) ref.current.open = true
  }, [startOpen])
  return (
    <details ref={ref} className={['saved-tree', className].filter(Boolean).join(' ')}>
      {children}
    </details>
  )
}

export function SavedTreeSummary({
  who,
  label,
  count,
}: {
  who?: CharacterId
  label: string
  count?: number
}) {
  return (
    <summary className="saved-tree-summary">
      {who ? <Avatar who={who} size="sm" /> : null}
      <strong className="saved-tree-copy">{label}</strong>
      {count !== undefined ? <em className="saved-tree-count">{count}</em> : null}
    </summary>
  )
}
