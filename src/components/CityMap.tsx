import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  CITY_PLOTS,
  citySnapshot,
  cityStanding,
  cityUpgrades,
  nextKicker,
  nextPlotId,
  plotView,
  readCitySeen,
  writeCitySeen,
  type CityPlotId,
  type CityStage,
  type CityUpgrade,
} from '../lib/city'
import { dailyDoneToday, isAreaUnlocked, useProgress } from '../store/progress'
import { localDateKey } from '../lib/dates'
import type { View } from '../types'

interface CityMapProps {
  onNavigate: (view: View) => void
  mode?: 'live' | 'poster'
}

const ANCHOR: Record<CityPlotId, { x: number; y: number }> = {
  lookout: { x: 520, y: 72 },
  observatory: { x: 464, y: 118 },
  hollow: { x: 108, y: 286 },
  journal: { x: 288, y: 248 },
  bench: { x: 350, y: 278 },
  lamps: { x: 258, y: 300 },
  gate: { x: 498, y: 268 },
  porch: { x: 564, y: 292 },
}

const FULL_CAM = { x: 0, y: 0, w: 640, h: 420 }

function camAround(id: CityPlotId) {
  const at = ANCHOR[id]
  return { x: at.x - 150, y: at.y - 120, w: 300, h: 230 }
}

function viewBoxOf(cam: { x: number; y: number; w: number; h: number }) {
  return `${cam.x} ${cam.y} ${cam.w} ${cam.h}`
}

export function CityMap({ onNavigate, mode = 'live' }: CityMapProps) {
  const { progress } = useProgress()
  const today = localDateKey()
  const doneToday = dailyDoneToday(progress, today)
  const nextId = mode === 'poster' ? 'porch' : nextPlotId(progress, doneToday)
  const { standing, possible } = cityStanding(progress)
  const liveSnap = citySnapshot(progress)

  const [shown, setShown] = useState(liveSnap)
  const [rising, setRising] = useState<CityPlotId | null>(null)
  const [beat, setBeat] = useState<CityUpgrade | null>(null)
  const [cam, setCam] = useState(FULL_CAM)
  const playing = useRef(false)
  const timers = useRef<number[]>([])

  function stageOf(id: CityPlotId): CityStage {
    if (mode === 'poster') return id === 'porch' ? 'scaffold' : 'empty'
    return shown[id]
  }

  function open(id: CityPlotId) {
    if (mode === 'poster' || playing.current) return
    const st = stageOf(id)
    if (st === 'empty' && id !== nextId) return
    const areaId = CITY_PLOTS.find((plot) => plot.id === id)?.areaId
    const unlocked = areaId ? isAreaUnlocked(areaId, progress.completed) : true
    onNavigate(plotView(id, unlocked))
  }

  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id))
    }
  }, [])

  useEffect(() => {
    if (mode !== 'live') return
    const now = citySnapshot(progress)
    const prev = readCitySeen()
    if (!prev) {
      writeCitySeen(now)
      setShown(now)
      return
    }
    const queue = cityUpgrades(prev, now)
    if (!queue.length) {
      setShown(now)
      writeCitySeen(now)
      return
    }
    if (playing.current) return
    playing.current = true
    setShown(prev)
    playQueue(queue, now)
  }, [mode, progress])

  function later(ms: number, fn: () => void) {
    const id = window.setTimeout(fn, ms)
    timers.current.push(id)
  }

  function playQueue(queue: CityUpgrade[], finalSnap: ReturnType<typeof citySnapshot>) {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function step(index: number) {
      if (index >= queue.length) {
        setRising(null)
        setBeat(null)
        setCam(FULL_CAM)
        setShown(finalSnap)
        writeCitySeen(finalSnap)
        playing.current = false
        return
      }
      const item = queue[index]
      setBeat(item)
      if (!reduced) setCam(camAround(item.id))
      later(reduced ? 80 : 160, () => {
        setShown((current) => ({ ...current, [item.id]: item.to }))
        setRising(item.id)
      })
      later(reduced ? 900 : 2400, () => {
        setRising(null)
        step(index + 1)
      })
    }

    step(0)
  }

  const nextSpec = CITY_PLOTS.find((plot) => plot.id === nextId)
  const nextStage = stageOf(nextId)
  const nextAt = ANCHOR[nextId]
  const kicker = nextKicker(nextStage, nextId, doneToday)
  const celebrating = Boolean(beat)

  return (
    <section
      className={`city-overworld ${mode === 'poster' ? 'is-poster' : ''} ${celebrating ? 'is-revealing' : ''}`}
    >
      <svg
        className="city-svg"
        viewBox={viewBoxOf(cam)}
        role={mode === 'poster' ? 'img' : 'group'}
        aria-label={
          mode === 'poster'
            ? 'A dim valley town waiting to be built'
            : celebrating
              ? `${beat?.beat} ${beat?.title}`
              : `Silver City overworld, ${standing} of ${possible} landmarks standing`
        }
      >
        <defs>
          <linearGradient id="city-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1c2748" />
            <stop offset="55%" stopColor="#12192c" />
            <stop offset="100%" stopColor="#0c121f" />
          </linearGradient>
          <linearGradient id="city-ridge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#24324a" />
            <stop offset="100%" stopColor="#141c2c" />
          </linearGradient>
          <filter id="city-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="640" height="420" fill="url(#city-sky)" />
        <g className={`city-sky-stars is-${stageOf('lamps')}`}>
          <circle cx="72" cy="42" r="1.6" />
          <circle cx="118" cy="28" r="1.2" />
          <circle cx="510" cy="36" r="1.5" />
          <circle cx="568" cy="52" r="1.1" />
          <circle cx="430" cy="22" r="1.3" />
          <circle cx="300" cy="34" r="1.1" />
        </g>

        <path
          d="M-20 210 L80 120 160 168 250 96 340 150 430 78 520 130 660 70 V230 H-20 Z"
          fill="url(#city-ridge)"
          opacity="0.9"
        />
        <path
          d="M-20 248 L40 200 120 228 210 176 300 214 410 168 500 206 660 150 V430 H-20 Z"
          fill="#10182a"
        />

        <path
          className={`city-street is-${stageOf('hollow')} is-${stageOf('bench')}`}
          d="M70 310 C 140 300, 200 280, 280 292 C 360 304, 430 286, 560 300"
          fill="none"
        />
        <path
          className={`city-street is-${stageOf('bench')} is-${stageOf('gate')}`}
          d="M300 292 C 360 250, 400 210, 448 168"
          fill="none"
        />
        <path
          className={`city-creek is-${stageOf('hollow')}`}
          d="M18 250 C 70 270, 90 300, 60 360 C 40 400, 80 410, 120 400"
          fill="none"
        />

        {mode === 'live' && !celebrating ? (
          <g className="city-next-mark" transform={`translate(${nextAt.x} ${nextAt.y})`}>
            <circle r="34" className="city-next-halo" />
            <text y="-40" textAnchor="middle">
              {kicker}
            </text>
          </g>
        ) : null}

        <PlotGroup
          id="lookout"
          stage={stageOf('lookout')}
          next={nextId === 'lookout'}
          rising={rising === 'lookout'}
          onOpen={open}
        >
          <path className="city-roof" d="M502 86 l18-38 18 38" />
          <path d="M502 86 l18-38 18 38 v52 h-36 z" />
          <rect x="514" y="78" width="12" height="18" rx="1" className="city-window" />
          <path d="M520 48 l14 8 v10 h-8 z" className="city-flag" />
        </PlotGroup>

        <PlotGroup
          id="observatory"
          stage={stageOf('observatory')}
          next={nextId === 'observatory'}
          rising={rising === 'observatory'}
          onOpen={open}
        >
          <path d="M428 118 a36 28 0 0 1 72 0 v22 h-72 z" />
          <rect x="454" y="86" width="8" height="16" rx="1" />
          <circle cx="464" cy="108" r="6" className="city-window" />
        </PlotGroup>

        <PlotGroup
          id="hollow"
          stage={stageOf('hollow')}
          next={nextId === 'hollow'}
          rising={rising === 'hollow'}
          onOpen={open}
        >
          <ellipse cx="92" cy="286" rx="28" ry="18" className="city-canopy" />
          <ellipse cx="128" cy="278" rx="22" ry="16" className="city-canopy" />
          <rect x="98" y="292" width="36" height="28" rx="3" />
          <path className="city-roof" d="M94 292 l22-16 22 16" />
        </PlotGroup>

        <PlotGroup
          id="journal"
          stage={stageOf('journal')}
          next={nextId === 'journal'}
          rising={rising === 'journal'}
          onOpen={open}
        >
          <path className="city-roof" d="M256 248 l32-20 32 20" />
          <rect x="262" y="248" width="52" height="40" rx="3" />
          <rect x="280" y="262" width="16" height="14" rx="1" className="city-window" />
        </PlotGroup>

        <PlotGroup
          id="bench"
          stage={stageOf('bench')}
          next={nextId === 'bench'}
          rising={rising === 'bench'}
          onOpen={open}
        >
          <rect x="318" y="268" width="64" height="36" rx="3" />
          <rect x="338" y="278" width="10" height="12" rx="1" className="city-window" />
          <rect x="354" y="278" width="10" height="12" rx="1" className="city-window" />
          <path d="M332 304 h36 M338 304 v-12 h24 v12" />
        </PlotGroup>

        <PlotGroup
          id="lamps"
          stage={stageOf('lamps')}
          next={nextId === 'lamps'}
          rising={rising === 'lamps'}
          onOpen={open}
        >
          <path d="M214 318 v-28 M258 322 v-28 M392 326 v-28" />
          <circle cx="214" cy="286" r="6" className="city-lamp" />
          <circle cx="258" cy="290" r="6" className="city-lamp" />
          <circle cx="392" cy="294" r="6" className="city-lamp" />
        </PlotGroup>

        <PlotGroup
          id="gate"
          stage={stageOf('gate')}
          next={nextId === 'gate'}
          rising={rising === 'gate'}
          onOpen={open}
        >
          <path d="M470 250 v62 h56 v-62" />
          <path className="city-roof" d="M478 250 a20 28 0 0 1 40 0" />
        </PlotGroup>

        <PlotGroup
          id="porch"
          stage={stageOf('porch')}
          next={nextId === 'porch'}
          rising={rising === 'porch'}
          onOpen={open}
        >
          <path className="city-roof" d="M530 292 l35-22 35 22" />
          <rect x="536" y="292" width="58" height="42" rx="3" />
          <rect x="552" y="306" width="12" height="14" rx="1" className="city-window" />
          <path d="M574 292 v-36" />
          <circle cx="574" cy="252" r="8" className="city-lamp" />
        </PlotGroup>

        <path d="M-10 368 Q 180 340 320 358 T 660 372 V430 H-10 Z" fill="#0a101c" />
      </svg>

      {beat ? (
        <div className="city-beat" role="status">
          <strong>{beat.beat}</strong>
          <span>{beat.title}</span>
        </div>
      ) : null}

      {mode === 'live' ? (
        <div className="city-legend">
          <p className="eyebrow">{celebrating ? beat?.beat : kicker}</p>
          <h2>{celebrating ? beat?.title : nextSpec?.title}</h2>
          <p>
            {celebrating
              ? beat?.to === 'lit'
                ? 'Lanterns caught. The line held.'
                : beat?.to === 'built'
                  ? 'The structure is up. You earned that roof.'
                  : 'Scaffold’s on the lot. Walk it into a building.'
              : nextSpec?.blurb}
          </p>
          {celebrating ? null : (
            <button type="button" className="btn primary" onClick={() => open(nextId)}>
              {nextId === 'porch' && !doneToday
                ? 'Walk the east porch'
                : nextStage === 'scaffold' || nextStage === 'empty'
                  ? `Build ${nextSpec?.title ?? 'next'}`
                  : `Enter ${nextSpec?.title ?? 'the town'}`}
            </button>
          )}
        </div>
      ) : null}
    </section>
  )
}

const SPARKS = [0, 45, 90, 135, 180, 225, 270, 315]

function PlotGroup({
  id,
  stage,
  next,
  rising,
  onOpen,
  children,
}: {
  id: CityPlotId
  stage: CityStage
  next: boolean
  rising: boolean
  onOpen: (id: CityPlotId) => void
  children: ReactNode
}) {
  const clickable = stage !== 'empty' || next
  const at = ANCHOR[id]
  const vacant = stage === 'empty' && !next
  return (
    <g
      className={`city-plot is-${stage} ${next ? 'is-next' : ''} ${rising ? 'is-rising' : ''}`}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={`${id} ${stage}${next ? ', next to build' : ''}${rising ? ', just rose' : ''}`}
      onClick={() => {
        if (clickable) onOpen(id)
      }}
      onKeyDown={(event) => {
        if (!clickable) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen(id)
        }
      }}
    >
      {vacant ? (
        <g className="city-lot" transform={`translate(${at.x} ${at.y})`}>
          <rect x="-16" y="-10" width="32" height="18" rx="2" />
        </g>
      ) : (
        children
      )}
      {rising ? (
        <g className="city-sparks" transform={`translate(${at.x} ${at.y})`}>
          <circle r="22" className="city-flash" />
          {SPARKS.map((deg) => (
            <circle
              key={deg}
              className="city-spark"
              r="3.5"
              style={{ ['--deg' as string]: `${deg}deg` }}
            />
          ))}
        </g>
      ) : null}
    </g>
  )
}
