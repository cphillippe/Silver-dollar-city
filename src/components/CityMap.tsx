import { useEffect, useRef, useState, type ReactNode } from 'react'
import { areas } from '../content'
import { townAck, townVoice } from '../content/story'
import {
  CITY_PLOTS,
  citySnapshot,
  cityStanding,
  cityUpgrades,
  fillGrows,
  fillSnapshot,
  nextKicker,
  nextPlotId,
  plotView,
  readCitySeen,
  readFillsSeen,
  writeCitySeen,
  writeFillsSeen,
  type CityFills,
  type CityPlotId,
  type CityStage,
  type CityUpgrade,
} from '../lib/city'
import {
  dailyDoneToday,
  isAreaComplete,
  isAreaUnlocked,
  nextWalkView,
  rehearseGo,
  useProgress,
} from '../store/progress'
import { localDateKey } from '../lib/dates'
import type { View } from '../types'
import { Avatar } from './Avatar'

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

const FOLK: Record<CityPlotId, { x: number; y: number }> = {
  lookout: { x: 548, y: 118 },
  observatory: { x: 508, y: 152 },
  hollow: { x: 152, y: 322 },
  journal: { x: 322, y: 298 },
  bench: { x: 392, y: 324 },
  lamps: { x: 230, y: 340 },
  gate: { x: 542, y: 322 },
  porch: { x: 520, y: 340 },
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
  const liveFills = fillSnapshot(progress)

  const [shown, setShown] = useState(liveSnap)
  const [shownFill, setShownFill] = useState(liveFills)
  const [rising, setRising] = useState<CityPlotId | null>(null)
  const [beat, setBeat] = useState<CityUpgrade | null>(null)
  const [cam, setCam] = useState(FULL_CAM)
  const playing = useRef(false)
  const timers = useRef<number[]>([])
  const camNow = useRef(FULL_CAM)
  const camFrame = useRef(0)

  function stageOf(id: CityPlotId): CityStage {
    if (mode === 'poster') return id === 'porch' ? 'scaffold' : 'empty'
    return shown[id]
  }

  function open(id: CityPlotId) {
    if (mode === 'poster' || playing.current) return
    const st = stageOf(id)
    if (st === 'empty' && id !== nextId) return
    const spec = CITY_PLOTS.find((plot) => plot.id === id)
    const areaId = spec?.areaId
    const unlocked = areaId ? isAreaUnlocked(areaId, progress.completed) : true
    if (id === 'porch' && doneToday) {
      onNavigate(rehearseGo(progress, 'porch'))
      return
    }
    if (areaId) {
      const area = areas.find((item) => item.id === areaId)
      if (area && isAreaComplete(area, progress.completed)) {
        onNavigate(rehearseGo(progress, areaId))
        return
      }
      if (area && unlocked) {
        onNavigate(nextWalkView(area.id, progress.completed))
        return
      }
    }
    onNavigate(plotView(id, unlocked))
  }

  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id))
      if (camFrame.current) cancelAnimationFrame(camFrame.current)
    }
  }, [])

  useEffect(() => {
    if (mode !== 'live') return
    const now = citySnapshot(progress)
    const fills = fillSnapshot(progress)
    const prev = readCitySeen()
    const prevFill = readFillsSeen()
    if (!prev) {
      writeCitySeen(now)
      writeFillsSeen(fills)
      setShown(now)
      setShownFill(fills)
      return
    }
    if (!prevFill) writeFillsSeen(fills)
    const stageQ = cityUpgrades(prev, now)
    const fillQ = prevFill ? fillGrows(prevFill, fills, now, stageQ) : []
    const beatRank: Record<CityUpgrade['beat'], number> = {
      'Lit!': 4,
      'Built!': 3,
      'Grew!': 2,
      Unlocked: 1,
    }
    const queue = [...stageQ, ...fillQ].sort(
      (a, b) => beatRank[b.beat] - beatRank[a.beat],
    )
    if (!queue.length) {
      setShown(now)
      setShownFill(fills)
      writeCitySeen(now)
      writeFillsSeen(fills)
      return
    }
    if (playing.current) return
    playing.current = true
    setShown(prev)
    setShownFill(prevFill ?? fills)
    playQueue(queue, now, fills)
  }, [mode, progress])

  function later(ms: number, fn: () => void) {
    const id = window.setTimeout(fn, ms)
    timers.current.push(id)
  }

  function tweenCam(target: { x: number; y: number; w: number; h: number }, ms: number) {
    if (camFrame.current) cancelAnimationFrame(camFrame.current)
    const from = { ...camNow.current }
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = ms <= 0 ? 1 : Math.min(1, (now - t0) / ms)
      const e = t * t * (3 - 2 * t)
      const next = {
        x: from.x + (target.x - from.x) * e,
        y: from.y + (target.y - from.y) * e,
        w: from.w + (target.w - from.w) * e,
        h: from.h + (target.h - from.h) * e,
      }
      camNow.current = next
      setCam(next)
      if (t < 1) camFrame.current = requestAnimationFrame(tick)
    }
    camFrame.current = requestAnimationFrame(tick)
  }

  function playQueue(
    queue: CityUpgrade[],
    finalSnap: ReturnType<typeof citySnapshot>,
    finalFills: CityFills,
  ) {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function finish() {
      setRising(null)
      setBeat(null)
      tweenCam(FULL_CAM, reduced ? 0 : 240)
      setShown(finalSnap)
      setShownFill(finalFills)
      writeCitySeen(finalSnap)
      writeFillsSeen(finalFills)
      playing.current = false
    }

    function step(index: number) {
      if (index >= queue.length) {
        finish()
        return
      }
      const item = queue[index]
      setBeat(item)
      if (!reduced) tweenCam(camAround(item.id), 200)
      later(reduced ? 40 : 180, () => {
        if (item.beat !== 'Grew!') {
          setShown((current) => ({ ...current, [item.id]: item.to }))
        }
        setShownFill((current) => ({
          ...current,
          [item.id]: finalFills[item.id],
        }))
        setRising(item.id)
      })
      later(reduced ? 700 : 1100, () => {
        setRising(null)
        setBeat(null)
        if (!reduced) tweenCam(FULL_CAM, 220)
        later(reduced ? 40 : 200, () => step(index + 1))
      })
    }

    step(0)
  }

  const nextSpec = CITY_PLOTS.find((plot) => plot.id === nextId)
  const nextStage = stageOf(nextId)
  const nextAt = ANCHOR[nextId]
  const kicker = nextKicker(nextStage, nextId, doneToday)
  const celebrating = Boolean(beat)
  const beatVoice = beat ? townVoice(beat.id) : townVoice(nextId)
  const hollowFill = shownFill.hollow
  const benchFill = shownFill.bench
  const alive = mode === 'live'

  return (
    <section
      className={`city-overworld ${mode === 'poster' ? 'is-poster' : 'is-alive'} ${celebrating ? 'is-revealing' : ''}`}
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

        {alive && !celebrating ? (
          <g className="city-walkers" aria-hidden>
            <circle className="city-walker city-walker-a" r="3.2" cx="90" cy="308" />
            <circle className="city-walker city-walker-b" r="2.6" cx="420" cy="286" />
          </g>
        ) : null}

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
          {hollowFill >= 2 ? (
            <ellipse
              cx="70"
              cy="300"
              rx="16"
              ry="12"
              className={`city-canopy ${rising === 'hollow' && hollowFill === 2 ? 'is-sprout' : ''}`}
            />
          ) : null}
          {hollowFill >= 3 ? (
            <ellipse
              cx="148"
              cy="268"
              rx="14"
              ry="11"
              className={`city-canopy ${rising === 'hollow' && hollowFill === 3 ? 'is-sprout' : ''}`}
            />
          ) : null}
          {hollowFill >= 4 ? (
            <ellipse
              cx="54"
              cy="278"
              rx="12"
              ry="9"
              className={`city-canopy ${rising === 'hollow' && hollowFill === 4 ? 'is-sprout' : ''}`}
            />
          ) : null}
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
          {benchFill >= 2 ? (
            <rect
              x="322"
              y="278"
              width="8"
              height="10"
              rx="1"
              className={`city-window ${rising === 'bench' && benchFill === 2 ? 'is-sprout' : ''}`}
            />
          ) : null}
          {benchFill >= 3 ? (
            <rect
              x="370"
              y="278"
              width="8"
              height="10"
              rx="1"
              className={`city-window ${rising === 'bench' && benchFill === 3 ? 'is-sprout' : ''}`}
            />
          ) : null}
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
          {stageOf('porch') === 'lit' || stageOf('porch') === 'built' ? (
            <g className="city-smoke" transform="translate(574 236)">
              <circle className="city-puff city-puff-a" r="3" cx="0" cy="0" />
              <circle className="city-puff city-puff-b" r="2.4" cx="3" cy="-8" />
            </g>
          ) : null}
        </PlotGroup>

        <path d="M-10 368 Q 180 340 320 358 T 660 372 V430 H-10 Z" fill="#0a101c" />

        {mode === 'live'
          ? CITY_PLOTS.map((plot) => (
              <TownFolk
                key={`folk-${plot.id}`}
                id={plot.id}
                stage={stageOf(plot.id)}
                next={nextId === plot.id}
                rising={rising === plot.id}
                speaking={beat?.id === plot.id || (nextId === plot.id && !celebrating)}
                ack={beat?.id === plot.id ? beat.beat : undefined}
              />
            ))
          : null}
      </svg>

      {beat ? (
        <div className="city-beat" role="status">
          <Avatar who={beatVoice.who} size="sm" />
          <div>
            <strong>{beat.beat}</strong>
            <span>{beat.title}</span>
          </div>
        </div>
      ) : null}

      {mode === 'live' ? (
        <div className="city-legend">
          {celebrating ? (
            <p className="eyebrow">{beat?.beat}</p>
          ) : (
            <>
              <p className="eyebrow">{kicker}</p>
              <h2>{nextSpec?.title}</h2>
              <button type="button" className="btn primary" onClick={() => open(nextId)}>
                {nextId === 'porch' && !doneToday
                  ? 'Walk the east porch'
                  : nextStage === 'scaffold' || nextStage === 'empty'
                    ? `Build ${nextSpec?.title ?? 'next'}`
                    : `Enter ${nextSpec?.title ?? 'the town'}`}
              </button>
            </>
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
        next ? (
          <g className="city-lot is-staked" transform={`translate(${at.x} ${at.y})`}>
            <ellipse rx="20" ry="9" className="city-earth" />
            <path
              className="city-timber"
              d="M-10 8 V-12 M10 8 V-12 M-12 -2 H12 M-5 8 V-7 M5 8 V-7"
            />
          </g>
        ) : null
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

function TownFolk({
  id,
  stage,
  next,
  rising,
  speaking,
  ack,
}: {
  id: CityPlotId
  stage: CityStage
  next: boolean
  rising: boolean
  speaking: boolean
  ack?: CityUpgrade['beat']
}) {
  if (stage === 'empty' && !next) return null
  const at = FOLK[id]
  const voice = townVoice(id)
  const line = ack ? townAck(id, ack) : voice.here
  const short = line.length > 22 ? `${line.slice(0, 20)}…` : line
  return (
    <g transform={`translate(${at.x} ${at.y})`} pointerEvents="none">
      <g
        className={`city-folk is-${stage} ${next ? 'is-next' : ''} ${rising ? 'is-waving' : ''}`}
      >
        <circle className="city-folk-head" r="5.4" cy="-15" />
        <path className="city-folk-body" d="M0 -9 l-4.5 13 h9 z" />
        <foreignObject x="-16" y="-36" width="32" height="32">
          <div className="city-portrait">
            <Avatar who={voice.who} size="sm" />
          </div>
        </foreignObject>
        {speaking ? (
          <g className="city-bubble">
            <rect x="-36" y="-40" width="72" height="16" rx="8" />
            <text y="-29" textAnchor="middle">
              {short}
            </text>
          </g>
        ) : null}
      </g>
    </g>
  )
}
