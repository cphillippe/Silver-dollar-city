import { useEffect, useRef, useState } from 'react'
import { PH_ROAD_SHOW_IT } from '../content/showIt'

interface ShowItTeachProps {
  onUnlock: () => void
}

/**
 * Easy ph-road teach: ~8s show-it clip, then tap the helper picture.
 * Visible instructional copy is only the prompt (Fixes #439).
 */
export function ShowItTeach({ onUnlock }: ShowItTeachProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const unlocked = useRef(false)
  const [phase, setPhase] = useState<'clip' | 'pick'>('clip')
  const [needsTap, setNeedsTap] = useState(false)
  const [shakeId, setShakeId] = useState<string | null>(null)
  const [shakeN, setShakeN] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    let live = true
    video.muted = true
    const pending = video.play()
    if (pending && typeof pending.then === 'function') {
      pending.catch(() => {
        if (live) setNeedsTap(true)
      })
    }
    return () => {
      live = false
    }
  }, [])

  function playClip() {
    const video = videoRef.current
    if (!video) return
    setNeedsTap(false)
    video.muted = true
    void video.play().catch(() => setNeedsTap(true))
  }

  function choose(id: string) {
    if (unlocked.current) return
    if (id === PH_ROAD_SHOW_IT.correctId) {
      unlocked.current = true
      onUnlock()
      return
    }
    setShakeId(id)
    setShakeN((n) => n + 1)
  }

  if (phase === 'pick') {
    return (
      <section className="show-it-teach is-pick" aria-label={PH_ROAD_SHOW_IT.prompt}>
        <p className="show-it-prompt">{PH_ROAD_SHOW_IT.prompt}</p>
        <div className="show-it-choices">
          {PH_ROAD_SHOW_IT.choices.map((choice) => {
            const shaking = shakeId === choice.id
            return (
              <button
                key={shaking ? `${choice.id}-${shakeN}` : choice.id}
                type="button"
                className={`show-it-choice${shaking ? ' is-shake' : ''}`}
                aria-label={choice.label}
                onClick={() => choose(choice.id)}
              >
                <img src={choice.src} alt="" draggable={false} />
              </button>
            )
          })}
        </div>
      </section>
    )
  }

  return (
    <section className="show-it-teach is-clip" aria-label="Story">
      <div className="show-it-stage">
        <video
          ref={videoRef}
          className="show-it-clip"
          src={PH_ROAD_SHOW_IT.clip}
          poster={PH_ROAD_SHOW_IT.poster}
          playsInline
          autoPlay
          muted
          preload="auto"
          onEnded={() => setPhase('pick')}
          onError={() => setPhase('pick')}
        />
        {needsTap ? (
          <button type="button" className="show-it-play" onClick={playClip} aria-label="Play">
            <span className="show-it-play-icon" aria-hidden />
          </button>
        ) : null}
      </div>
    </section>
  )
}
