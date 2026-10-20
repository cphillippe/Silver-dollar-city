import { useEffect, useState } from 'react'
import { FOUNDERS_GIFT_LINE, foundersLamp } from '../lib/foundersLamp'
import { useProgress } from '../store/progress'

/**
 * One plain Home line after the grant. It stays up for this visit, then
 * the save remembers it was seen. Home is the only screen that mounts it.
 */
export function FoundersGiftLine() {
  const { progress, markFoundersGiftSeen } = useProgress()
  const [show] = useState(() => foundersLamp(progress) && progress.foundersGiftSeen !== true)

  useEffect(() => {
    if (!show) return
    const id = window.setTimeout(() => markFoundersGiftSeen(), 0)
    return () => window.clearTimeout(id)
  }, [show, markFoundersGiftSeen])

  if (!show) return null
  return (
    <p className="founders-gift" role="status">
      {FOUNDERS_GIFT_LINE}
    </p>
  )
}
