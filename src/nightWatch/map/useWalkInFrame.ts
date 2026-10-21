import { useEffect, useState } from 'react'

/**
 * Repaints every frame while a walker is still walking in.
 * The wave tick skips paints during holds and seeded steps; the run-in should not stall then.
 */
export function useWalkInFrame(active: boolean): void {
  const [, setFrame] = useState(0)
  useEffect(() => {
    if (!active) return
    let frame = requestAnimationFrame(function step() {
      setFrame((count) => (count + 1) % 1_000_000)
      frame = requestAnimationFrame(step)
    })
    return () => cancelAnimationFrame(frame)
  }, [active])
}
