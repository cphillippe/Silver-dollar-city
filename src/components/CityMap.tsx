import type { ReactNode } from 'react'
import {
  CITY_PLOTS,
  cityStanding,
  nextKicker,
  nextPlotId,
  plotStage,
  plotView,
  type CityPlotId,
  type CityStage,
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

export function CityMap({ onNavigate, mode = 'live' }: CityMapProps) {
  const { progress } = useProgress()
  const today = localDateKey()
  const doneToday = dailyDoneToday(progress, today)
  const nextId = mode === 'poster' ? 'porch' : nextPlotId(progress, doneToday)
  const { standing, possible } = cityStanding(progress)

  function stageOf(id: CityPlotId): CityStage {
    if (mode === 'poster') return id === 'porch' ? 'scaffold' : 'empty'
    return plotStage(id, progress)
  }

  function open(id: CityPlotId) {
    if (mode === 'poster') return
    const st = stageOf(id)
    if (st === 'empty' && id !== nextId) return
    const areaId = CITY_PLOTS.find((plot) => plot.id === id)?.areaId
    const unlocked = areaId ? isAreaUnlocked(areaId, progress.completed) : true
    onNavigate(plotView(id, unlocked))
  }

  const nextSpec = CITY_PLOTS.find((plot) => plot.id === nextId)
  const nextStage = stageOf(nextId)
  const nextAt = ANCHOR[nextId]
  const kicker = nextKicker(nextStage, nextId, doneToday)

  return (
    <section className={`city-overworld ${mode === 'poster' ? 'is-poster' : ''}`}>
      <svg
        className="city-svg"
        viewBox="0 0 640 420"
        role={mode === 'poster' ? 'img' : 'group'}
        aria-label={
          mode === 'poster'
            ? 'A dim valley town waiting to be built'
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

        {mode === 'live' ? (
          <g className="city-next-mark" transform={`translate(${nextAt.x} ${nextAt.y})`}>
            <circle r="34" className="city-next-halo" />
            <text y="-40" textAnchor="middle">
              {kicker}
            </text>
          </g>
        ) : null}

        <PlotGroup id="lookout" stage={stageOf('lookout')} next={nextId === 'lookout'} onOpen={open}>
          <path d="M502 86 l18-38 18 38 v52 h-36 z" />
          <rect x="514" y="78" width="12" height="18" rx="1" />
          <path d="M520 48 l14 8 v10 h-8 z" className="city-flag" />
        </PlotGroup>

        <PlotGroup
          id="observatory"
          stage={stageOf('observatory')}
          next={nextId === 'observatory'}
          onOpen={open}
        >
          <path d="M428 118 a36 28 0 0 1 72 0 v22 h-72 z" />
          <rect x="454" y="86" width="8" height="16" rx="1" />
        </PlotGroup>

        <PlotGroup id="hollow" stage={stageOf('hollow')} next={nextId === 'hollow'} onOpen={open}>
          <ellipse cx="92" cy="286" rx="28" ry="18" className="city-canopy" />
          <ellipse cx="128" cy="278" rx="22" ry="16" className="city-canopy" />
          <rect x="98" y="292" width="36" height="28" rx="3" />
          <path d="M94 292 l22-16 22 16" />
        </PlotGroup>

        <PlotGroup id="journal" stage={stageOf('journal')} next={nextId === 'journal'} onOpen={open}>
          <rect x="262" y="248" width="52" height="40" rx="3" />
          <path d="M256 248 l32-20 32 20" />
          <rect x="280" y="262" width="16" height="14" rx="1" className="city-window" />
        </PlotGroup>

        <PlotGroup id="bench" stage={stageOf('bench')} next={nextId === 'bench'} onOpen={open}>
          <rect x="318" y="268" width="64" height="36" rx="3" />
          <path d="M332 304 h36 M338 304 v-12 h24 v12" />
        </PlotGroup>

        <PlotGroup id="lamps" stage={stageOf('lamps')} next={nextId === 'lamps'} onOpen={open}>
          <path d="M214 318 v-28 M258 322 v-28 M392 326 v-28" />
          <circle cx="214" cy="286" r="5" className="city-lamp" />
          <circle cx="258" cy="290" r="5" className="city-lamp" />
          <circle cx="392" cy="294" r="5" className="city-lamp" />
        </PlotGroup>

        <PlotGroup id="gate" stage={stageOf('gate')} next={nextId === 'gate'} onOpen={open}>
          <path d="M470 250 v62 h56 v-62" />
          <path d="M478 250 a20 28 0 0 1 40 0" />
        </PlotGroup>

        <PlotGroup id="porch" stage={stageOf('porch')} next={nextId === 'porch'} onOpen={open}>
          <rect x="536" y="292" width="58" height="42" rx="3" />
          <path d="M530 292 l35-22 35 22" />
          <path d="M574 292 v-36" />
          <circle cx="574" cy="252" r="7" className="city-lamp" />
        </PlotGroup>

        <path d="M-10 368 Q 180 340 320 358 T 660 372 V430 H-10 Z" fill="#0a101c" />
      </svg>

      {mode === 'live' ? (
        <div className="city-legend">
          <p className="eyebrow">{kicker}</p>
          <h2>{nextSpec?.title}</h2>
          <p>{nextSpec?.blurb}</p>
          <p className="quiet">
            {standing}/{possible} landmarks standing. Tap a glow — the town
            grows when a line holds.
          </p>
          <button type="button" className="btn primary" onClick={() => open(nextId)}>
            {nextId === 'porch' && !doneToday
              ? 'Walk the east porch'
              : nextStage === 'scaffold' || nextStage === 'empty'
                ? `Build ${nextSpec?.title ?? 'next'}`
                : `Enter ${nextSpec?.title ?? 'the town'}`}
          </button>
        </div>
      ) : null}
    </section>
  )
}

function PlotGroup({
  id,
  stage,
  next,
  onOpen,
  children,
}: {
  id: CityPlotId
  stage: CityStage
  next: boolean
  onOpen: (id: CityPlotId) => void
  children: ReactNode
}) {
  const clickable = stage !== 'empty' || next
  return (
    <g
      className={`city-plot is-${stage} ${next ? 'is-next' : ''}`}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={`${id} ${stage}${next ? ', next to build' : ''}`}
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
      {children}
    </g>
  )
}
