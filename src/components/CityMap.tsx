import { useEffect, useRef, useState } from 'react'
import { areas } from '../content'
import { townAck, townVoice } from '../content/story'
import {
  CITY_AGES,
  CITY_AGE_LINE,
  CITY_AGE_SHORT,
  CITY_AGE_TITLE,
  CITY_PLOTS,
  cityAge,
  citySnapshot,
  cityStanding,
  cityUpgrades,
  fillGrows,
  fillSnapshot,
  nextGift,
  nextKicker,
  nextPlotId,
  plotView,
  newestStanding,
  readCitySeen,
  readFillsSeen,
  readHomecomingDay,
  writeCitySeen,
  writeFillsSeen,
  writeHomecomingDay,
  type CityAge,
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
  lookout: { x: 556, y: 132 },
  observatory: { x: 512, y: 168 },
  hollow: { x: 156, y: 336 },
  journal: { x: 328, y: 308 },
  bench: { x: 396, y: 334 },
  lamps: { x: 232, y: 348 },
  gate: { x: 548, y: 334 },
  porch: { x: 518, y: 348 },
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
  const age = mode === 'poster' ? 'eden' : cityAge(progress)
  const liveSnap = citySnapshot(progress)
  const liveFills = fillSnapshot(progress)

  const [shown, setShown] = useState(liveSnap)
  const [shownFill, setShownFill] = useState(liveFills)
  const [rising, setRising] = useState<CityPlotId | null>(null)
  const [homecoming, setHomecoming] = useState(false)
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
      maybeHomecoming(now)
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
      writeHomecomingDay(today)
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

  function maybeHomecoming(snap: ReturnType<typeof citySnapshot>) {
    if (playing.current) return
    if (readHomecomingDay() === today) return
    const id = newestStanding(snap)
    if (!id) return
    playing.current = true
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setHomecoming(true)
    setRising(id)
    if (!reduced) tweenCam(camAround(id), 200)
    later(reduced ? 700 : 1100, () => {
      setHomecoming(false)
      setRising(null)
      writeHomecomingDay(today)
      if (!reduced) tweenCam(FULL_CAM, 220)
      later(reduced ? 40 : 200, () => {
        playing.current = false
      })
    })
  }

  const nextSpec = CITY_PLOTS.find((plot) => plot.id === nextId)
  const nextStage = stageOf(nextId)
  const nextAt = ANCHOR[nextId]
  const kicker = nextKicker(nextStage, nextId, doneToday)
  const gift = nextGift(nextId, nextStage, shownFill[nextId] ?? 0)
  const celebrating = Boolean(beat) || homecoming
  const beatVoice = beat ? townVoice(beat.id) : townVoice(nextId)
  const alive = mode === 'live'

  return (
    <section
      className={`city-overworld is-age-${age} ${mode === 'poster' ? 'is-poster' : 'is-alive'} ${celebrating ? 'is-revealing' : ''} ${homecoming ? 'is-homecoming' : ''}`}
    >
      <svg
        className="city-svg"
        viewBox={viewBoxOf(cam)}
        role={mode === 'poster' ? 'img' : 'group'}
        aria-label={
          mode === 'poster'
            ? 'A garden valley. The City of Heaven waits on the ridge.'
            : celebrating
              ? `${beat?.beat} ${beat?.title}`
              : `Silver City, ${CITY_AGE_TITLE[age]}. ${standing} of ${possible} landmarks standing. The City of Heaven waits on the ridge.`
        }
      >
        <defs>
          <linearGradient id="city-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--city-sky-0)" />
            <stop offset="22%" stopColor="var(--city-sky-1)" />
            <stop offset="52%" stopColor="var(--city-sky-2)" />
            <stop offset="100%" stopColor="var(--city-sky-3)" />
          </linearGradient>
          <linearGradient id="city-ridge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--city-ridge-0)" />
            <stop offset="100%" stopColor="var(--city-ridge-1)" />
          </linearGradient>
          <linearGradient id="city-wood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffd24a" />
            <stop offset="100%" stopColor="#ff9f1a" />
          </linearGradient>
          <linearGradient id="city-gold-roof" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff6b8" />
            <stop offset="52%" stopColor="#ffcc33" />
            <stop offset="100%" stopColor="#ff9f1a" />
          </linearGradient>
          <linearGradient id="city-wall-built" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7a4ad4" />
            <stop offset="100%" stopColor="#4a1a88" />
          </linearGradient>
          <linearGradient id="city-wall-lit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c86bff" />
            <stop offset="100%" stopColor="#5a2ab8" />
          </linearGradient>
          <linearGradient id="city-heaven-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff6d4" />
            <stop offset="100%" stopColor="#ffcc33" />
          </linearGradient>
          <radialGradient id="city-moon-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff6d4" stopOpacity="1" />
            <stop offset="55%" stopColor="#ffcc33" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ff5a7a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="city-glory" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffce8" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#ffcc33" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ff5a7a" stopOpacity="0" />
          </radialGradient>
          <filter id="city-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="640" height="420" fill="url(#city-sky)" />
        <ellipse cx="320" cy="198" rx="280" ry="28" fill="#ffcc33" opacity="0.28" />
        <circle cx="548" cy="48" r="28" fill="url(#city-moon-glow)" />
        <circle className="city-moon" cx="548" cy="48" r="9" fill="#fff6d8" />
        <g className={`city-sky-stars is-${stageOf('lamps')}`}>
          <circle cx="72" cy="42" r="1.6" />
          <circle cx="118" cy="28" r="1.2" />
          <circle cx="510" cy="36" r="1.5" />
          <circle cx="568" cy="52" r="1.1" />
          <circle cx="430" cy="22" r="1.3" />
          <circle cx="300" cy="34" r="1.1" />
          <circle cx="196" cy="50" r="1.1" />
          <circle cx="248" cy="20" r="0.9" />
          <circle cx="390" cy="54" r="1.2" />
          <circle cx="88" cy="68" r="0.8" />
        </g>

        <path
          d="M-20 210 L80 120 160 168 250 96 340 150 430 78 520 130 660 70 V230 H-20 Z"
          fill="url(#city-ridge)"
          opacity="0.92"
        />
        <path
          d="M-20 248 L40 200 120 228 210 176 300 214 410 168 500 206 660 150 V430 H-20 Z"
          fill="#3dcc7a"
          opacity="0.55"
        />

        <HeavenCity age={age} />
        <EdenGrove age={age} />
        <SpinePath age={age} />

        <path
          className={`city-street city-street-main is-${stageOf('hollow')} is-${stageOf('bench')}`}
          d="M70 310 C 140 300, 200 280, 280 292 C 360 304, 430 286, 560 300"
          fill="none"
        />
        <path
          className={`city-street city-street-ridge is-${stageOf('bench')} is-${stageOf('gate')}`}
          d="M300 292 C 360 250, 400 210, 448 168"
          fill="none"
        />
        <path
          className={`city-creek is-${stageOf('hollow')}`}
          d="M18 250 C 70 270, 90 300, 60 360 C 40 400, 80 410, 120 400"
          fill="none"
        />
        {shownFill.lamps >= 1 ? (
          <g className={`city-street-lamps is-${stageOf('lamps')}`} aria-hidden>
            <circle className="city-lamp" cx="148" cy="298" r="5" />
            {shownFill.lamps >= 4 ? <circle className="city-lamp" cx="330" cy="296" r="5" /> : null}
            {shownFill.lamps >= 8 ? <circle className="city-lamp" cx="470" cy="292" r="5" /> : null}
          </g>
        ) : null}

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
          fill={shownFill.lookout}
          next={nextId === 'lookout'}
          rising={rising === 'lookout'}
          onOpen={open}
        />

        <PlotGroup
          id="observatory"
          stage={stageOf('observatory')}
          fill={shownFill.observatory}
          next={nextId === 'observatory'}
          rising={rising === 'observatory'}
          onOpen={open}
        />

        <PlotGroup
          id="hollow"
          stage={stageOf('hollow')}
          fill={shownFill.hollow}
          next={nextId === 'hollow'}
          rising={rising === 'hollow'}
          onOpen={open}
        />

        <PlotGroup
          id="journal"
          stage={stageOf('journal')}
          fill={shownFill.journal}
          next={nextId === 'journal'}
          rising={rising === 'journal'}
          onOpen={open}
        />

        <PlotGroup
          id="bench"
          stage={stageOf('bench')}
          fill={shownFill.bench}
          next={nextId === 'bench'}
          rising={rising === 'bench'}
          onOpen={open}
        />

        <PlotGroup
          id="lamps"
          stage={stageOf('lamps')}
          fill={shownFill.lamps}
          next={nextId === 'lamps'}
          rising={rising === 'lamps'}
          onOpen={open}
        />

        <PlotGroup
          id="gate"
          stage={stageOf('gate')}
          fill={shownFill.gate}
          next={nextId === 'gate'}
          rising={rising === 'gate'}
          onOpen={open}
        />

        <PlotGroup
          id="porch"
          stage={stageOf('porch')}
          fill={shownFill.porch}
          next={nextId === 'porch'}
          rising={rising === 'porch'}
          onOpen={open}
        />

        <path d="M-10 368 Q 180 340 320 358 T 660 372 V430 H-10 Z" fill="#148a48" />

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

      {homecoming && !beat ? (
        <div className="city-beat is-home" role="status">
          <Avatar who="juniper" size="sm" />
          <div>
            <strong>Still lit</strong>
            <span>The town held</span>
          </div>
        </div>
      ) : null}

      {mode === 'live' ? (
        <div className="city-legend">
          {celebrating ? (
            <p className="eyebrow">{beat?.beat}</p>
          ) : (
            <>
              <p className="eyebrow">Eden → City of Heaven</p>
              <ol className="city-age-track" aria-label="Journey ages">
                {CITY_AGES.map((item) => (
                  <li
                    key={item}
                    className={item === age ? 'is-now' : cityAgeReached(item, age) ? 'is-done' : ''}
                  >
                    {CITY_AGE_SHORT[item]}
                  </li>
                ))}
              </ol>
              <h2>{CITY_AGE_TITLE[age]}</h2>
              <p className="city-age-line">{CITY_AGE_LINE[age]}</p>
              <p className="city-gift">{gift}</p>
              {doneToday ? (
                <p className="city-morrow">Town held. A lamp waits tomorrow.</p>
              ) : null}
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

const SPINE_MARKS: { age: CityAge; x: number; y: number }[] = [
  { age: 'eden', x: 58, y: 338 },
  { age: 'village', x: 118, y: 300 },
  { age: 'town', x: 280, y: 292 },
  { age: 'gold', x: 498, y: 268 },
  { age: 'heaven', x: 572, y: 36 },
]

function cityAgeReached(item: CityAge, current: CityAge) {
  return CITY_AGES.indexOf(item) <= CITY_AGES.indexOf(current)
}

function EdenGrove({ age }: { age: CityAge }) {
  return (
    <g className={`city-eden is-${age}`} aria-hidden>
      <ellipse className="city-eden-canopy" cx="46" cy="268" rx="22" ry="16" />
      <ellipse className="city-eden-canopy" cx="78" cy="258" rx="18" ry="14" />
      <ellipse className="city-eden-canopy" cx="28" cy="292" rx="16" ry="12" />
      <circle className="city-eden-fruit" cx="40" cy="262" r="3.2" />
      <circle className="city-eden-fruit" cx="70" cy="250" r="2.8" />
      <circle className="city-eden-fruit" cx="88" cy="266" r="2.4" />
      <path
        className="city-eden-river"
        d="M8 236 C 40 258, 54 300, 36 348 C 22 382, 70 404, 118 396"
      />
    </g>
  )
}

function SpinePath({ age }: { age: CityAge }) {
  return (
    <g className={`city-spine is-${age}`} aria-hidden>
      <path
        className="city-spine-line"
        d="M58 338 C 100 312, 160 300, 280 292 C 380 286, 460 220, 520 80 C 540 48, 560 32, 572 36"
      />
      {SPINE_MARKS.map((mark) => (
        <g key={mark.age} className={`city-spine-mark ${cityAgeReached(mark.age, age) ? 'is-lit' : ''}`} transform={`translate(${mark.x} ${mark.y})`}>
          <circle r="7" />
          <circle r="3.2" className="city-spine-core" />
        </g>
      ))}
    </g>
  )
}

function HeavenCity({ age }: { age: CityAge }) {
  return (
    <g className={`city-heaven is-${age}`} aria-label="City of Heaven">
      <circle className="city-heaven-glory" cx="575" cy="28" r="46" fill="url(#city-glory)" />
      <path className="city-heaven-wall" d="M530 48 l18-22 16 10 14-18 16 12 18-16 16 20 v22 H530 Z" fill="url(#city-heaven-wall)" />
      <path className="city-heaven-gate" d="M568 58 v-16 a8 10 0 0 1 16 0 v16" />
      <rect className="city-heaven-tower" x="538" y="18" width="10" height="22" rx="1" />
      <rect className="city-heaven-tower" x="602" y="14" width="10" height="26" rx="1" />
      <path className="city-heaven-spire" d="M543 18 l5-10 5 10" />
      <path className="city-heaven-spire" d="M607 14 l5-12 5 12" />
      <text className="city-heaven-label" x="575" y="8" textAnchor="middle">
        City of Heaven
      </text>
    </g>
  )
}

function PlotGroup({
  id,
  stage,
  fill,
  next,
  rising,
  onOpen,
}: {
  id: CityPlotId
  stage: CityStage
  fill: number
  next: boolean
  rising: boolean
  onOpen: (id: CityPlotId) => void
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
        <PlotArt id={id} stage={stage} fill={fill} rising={rising} />
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

function PlotArt({
  id,
  stage,
  fill,
  rising,
}: {
  id: CityPlotId
  stage: CityStage
  fill: number
  rising: boolean
}) {
  if (id === 'hollow') return <HollowArt stage={stage} fill={fill} rising={rising} />
  if (id === 'porch') return <PorchArt stage={stage} />
  if (id === 'bench') return <BenchArt stage={stage} fill={fill} rising={rising} />
  if (id === 'observatory') return <ObservatoryArt stage={stage} fill={fill} rising={rising} />
  if (id === 'gate') return <GateArt stage={stage} fill={fill} rising={rising} />
  if (id === 'lookout') return <LookoutArt stage={stage} fill={fill} rising={rising} />
  if (id === 'journal') return <JournalArt stage={stage} fill={fill} />
  return <LampsArt stage={stage} fill={fill} />
}

function HollowArt({
  stage,
  fill,
  rising,
}: {
  stage: CityStage
  fill: number
  rising: boolean
}) {
  if (stage === 'scaffold') {
    return (
      <>
        <ellipse cx="116" cy="320" rx="24" ry="8" className="city-earth" />
        <path
          className="city-timber"
          d="M98 318 V288 M134 318 V288 M96 288 H136 M108 318 V272 L116 260 L124 272 V318"
        />
      </>
    )
  }
  return (
    <>
      <ellipse cx="92" cy="286" rx="28" ry="18" className="city-canopy" />
      <ellipse cx="128" cy="278" rx="22" ry="16" className="city-canopy" />
      {fill >= 2 ? (
        <ellipse
          cx="70"
          cy="300"
          rx="16"
          ry="12"
          className={`city-canopy ${rising && fill === 2 ? 'is-sprout' : ''}`}
        />
      ) : null}
      {fill >= 3 ? (
        <ellipse
          cx="148"
          cy="268"
          rx="14"
          ry="11"
          className={`city-canopy ${rising && fill === 3 ? 'is-sprout' : ''}`}
        />
      ) : null}
      {fill >= 4 ? (
        <ellipse
          cx="54"
          cy="278"
          rx="12"
          ry="9"
          className={`city-canopy ${rising && fill === 4 ? 'is-sprout' : ''}`}
        />
      ) : null}
      <path className="city-porch" d="M94 320 h44 l5 8 H90 Z" />
      <rect x="98" y="292" width="36" height="28" rx="3" />
      <path className="city-roof" d="M94 292 l22-16 22 16" />
      {stage === 'lit' ? (
        <path className="city-roof city-roof-tile" d="M90 294 l26-20 26 20" />
      ) : null}
      {fill >= 1 ? (
        <rect x="110" y="300" width="10" height="10" rx="1" className="city-window" />
      ) : null}
      {stage === 'lit' ? <circle className="city-lamp" cx="142" cy="302" r="4.5" /> : null}
    </>
  )
}

function PorchArt({ stage }: { stage: CityStage }) {
  if (stage === 'scaffold') {
    return (
      <>
        <ellipse cx="565" cy="334" rx="30" ry="9" className="city-earth" />
        <path
          className="city-timber"
          d="M538 330 V296 M590 330 V296 M536 296 H592 M574 330 V256"
        />
        <circle className="city-lamp" cx="574" cy="252" r="6" />
      </>
    )
  }
  return (
    <>
      <path className="city-porch" d="M532 334 h66 l7 9 H526 Z" />
      <path className="city-roof" d="M530 292 l35-22 35 22" />
      <rect x="536" y="292" width="58" height="42" rx="3" />
      <rect x="552" y="306" width="12" height="14" rx="1" className="city-window" />
      {stage === 'lit' ? (
        <path className="city-roof city-roof-tile" d="M526 294 l39-26 39 26" />
      ) : null}
      <path d="M574 292 v-36" />
      <circle cx="574" cy="252" r="8" className="city-lamp" />
      {stage === 'lit' ? (
        <>
          <path className="city-porch-rail" d="M538 328 h54 M538 328 v-8 M564 328 v-8 M592 328 v-8" />
          <g className="city-smoke" transform="translate(574 236)">
            <circle className="city-puff city-puff-a" r="3" cx="0" cy="0" />
            <circle className="city-puff city-puff-b" r="2.4" cx="3" cy="-8" />
          </g>
        </>
      ) : (
        <g className="city-smoke" transform="translate(574 236)">
          <circle className="city-puff city-puff-a" r="3" cx="0" cy="0" />
          <circle className="city-puff city-puff-b" r="2.4" cx="3" cy="-8" />
        </g>
      )}
    </>
  )
}

function BenchArt({
  stage,
  fill,
  rising,
}: {
  stage: CityStage
  fill: number
  rising: boolean
}) {
  if (stage === 'scaffold') {
    return (
      <>
        <ellipse cx="350" cy="308" rx="28" ry="8" className="city-earth" />
        <path className="city-timber" d="M322 304 V270 M378 304 V270 M320 270 H380 M332 304 h36" />
      </>
    )
  }
  return (
    <>
      <path className="city-porch" d="M318 304 h64 l6 8 H312 Z" />
      <rect x="318" y="268" width="64" height="36" rx="3" />
      <path className="city-roof" d="M314 268 l34-16 34 16" />
      {stage === 'lit' ? (
        <path className="city-roof city-roof-tile" d="M310 270 l38-20 38 20" />
      ) : null}
      <rect x="338" y="278" width="10" height="12" rx="1" className="city-window" />
      <rect x="354" y="278" width="10" height="12" rx="1" className="city-window" />
      {fill >= 2 ? (
        <rect
          x="322"
          y="278"
          width="8"
          height="10"
          rx="1"
          className={`city-window ${rising && fill === 2 ? 'is-sprout' : ''}`}
        />
      ) : null}
      {fill >= 3 ? (
        <rect
          x="370"
          y="278"
          width="8"
          height="10"
          rx="1"
          className={`city-window ${rising && fill === 3 ? 'is-sprout' : ''}`}
        />
      ) : null}
      <path d="M332 304 h36 M338 304 v-12 h24 v12" />
      {stage === 'lit' ? <circle className="city-lamp" cx="350" cy="254" r="5" /> : null}
    </>
  )
}

function ObservatoryArt({
  stage,
  fill,
  rising,
}: {
  stage: CityStage
  fill: number
  rising: boolean
}) {
  if (stage === 'scaffold') {
    return (
      <>
        <ellipse cx="464" cy="142" rx="28" ry="9" className="city-earth" />
        <path className="city-timber" d="M440 140 V112 M488 140 V112 M438 112 H490 M464 140 V88" />
        <circle cx="464" cy="86" r="7" className="city-timber" />
      </>
    )
  }
  return (
    <>
      <path d="M428 118 a36 28 0 0 1 72 0 v22 h-72 z" />
      <rect x="454" y="86" width="8" height="16" rx="1" />
      <circle
        cx="464"
        cy="108"
        r={fill >= 2 ? 7 : 5}
        className={`city-window ${rising && fill === 2 ? 'is-sprout' : ''}`}
      />
      {fill >= 3 ? (
        <circle
          cx="448"
          cy="116"
          r="4"
          className={`city-window ${rising && fill === 3 ? 'is-sprout' : ''}`}
        />
      ) : null}
      {fill >= 4 || stage === 'lit' ? (
        <circle cx="480" cy="116" r="4" className="city-window" />
      ) : null}
      {stage === 'lit' ? (
        <>
          <path className="city-roof city-roof-tile" d="M432 118 a32 24 0 0 1 64 0" />
          <circle className="city-lamp" cx="498" cy="124" r="4.5" />
        </>
      ) : null}
    </>
  )
}

function GateArt({
  stage,
  fill,
  rising,
}: {
  stage: CityStage
  fill: number
  rising: boolean
}) {
  if (stage === 'scaffold') {
    return (
      <>
        <ellipse cx="498" cy="314" rx="26" ry="8" className="city-earth" />
        <path className="city-timber" d="M474 312 V252 M522 312 V252" />
      </>
    )
  }
  return (
    <>
      <path d="M470 250 v62 h56 v-62" />
      <path className="city-roof" d="M478 250 a20 28 0 0 1 40 0" />
      {fill >= 2 ? (
        <path
          className={`city-roof ${rising && fill === 2 ? 'is-sprout' : ''}`}
          d="M474 252 a24 30 0 0 1 48 0"
        />
      ) : null}
      {fill >= 3 || stage === 'lit' ? (
        <circle className="city-lamp" cx="474" cy="248" r="4.5" />
      ) : null}
      {stage === 'lit' ? (
        <>
          <path className="city-roof city-roof-tile" d="M476 248 a22 30 0 0 1 44 0" />
          <circle className="city-lamp" cx="522" cy="248" r="4.5" />
        </>
      ) : null}
    </>
  )
}

function LookoutArt({
  stage,
  fill,
  rising,
}: {
  stage: CityStage
  fill: number
  rising: boolean
}) {
  if (stage === 'scaffold') {
    return (
      <>
        <ellipse cx="520" cy="140" rx="18" ry="7" className="city-earth" />
        <path className="city-timber" d="M520 140 V70 M508 96 H532 M512 118 H528" />
      </>
    )
  }
  return (
    <>
      <path d="M502 86 l18-38 18 38 v52 h-36 z" />
      <path className="city-roof" d="M502 86 l18-38 18 38" />
      <rect x="514" y="78" width="12" height="18" rx="1" className="city-window" />
      {fill >= 2 ? (
        <path
          d="M520 48 l14 8 v10 h-8 z"
          className={`city-flag ${rising && fill === 2 ? 'is-sprout' : ''}`}
        />
      ) : null}
      {fill >= 3 || stage === 'lit' ? (
        <circle className="city-lamp" cx="538" cy="70" r="4.5" />
      ) : null}
      {stage === 'lit' ? (
        <path className="city-roof city-roof-tile" d="M498 88 l22-44 22 44" />
      ) : null}
    </>
  )
}

function JournalArt({ stage, fill }: { stage: CityStage; fill: number }) {
  if (stage === 'scaffold') {
    return (
      <>
        <ellipse cx="288" cy="290" rx="26" ry="8" className="city-earth" />
        <path className="city-timber" d="M266 286 V250 M310 286 V250 M264 250 H312" />
      </>
    )
  }
  return (
    <>
      <path className="city-porch" d="M260 288 h56 l6 8 H254 Z" />
      <path className="city-roof" d="M256 248 l32-20 32 20" />
      <rect x="262" y="248" width="52" height="40" rx="3" />
      <rect x="280" y="262" width="16" height="14" rx="1" className="city-window" />
      {fill >= 4 || stage === 'lit' ? (
        <path className="city-roof city-roof-tile" d="M252 250 l36-24 36 24" />
      ) : null}
      {stage === 'lit' ? <circle className="city-lamp" cx="312" cy="246" r="4" /> : null}
    </>
  )
}

function LampsArt({ stage, fill }: { stage: CityStage; fill: number }) {
  const first = stage !== 'empty'
  const second = fill >= 4 || stage === 'built' || stage === 'lit'
  const third = fill >= 8 || stage === 'lit'
  return (
    <>
      {first ? (
        <>
          <path d="M214 318 v-28" />
          <circle cx="214" cy="286" r="6" className="city-lamp" />
        </>
      ) : null}
      {second ? (
        <>
          <path d="M258 322 v-28" />
          <circle cx="258" cy="290" r="6" className="city-lamp" />
        </>
      ) : null}
      {third ? (
        <>
          <path d="M392 326 v-28" />
          <circle cx="392" cy="294" r="6" className="city-lamp" />
        </>
      ) : null}
    </>
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
  const home = stage === 'built' || stage === 'lit'
  return (
    <g transform={`translate(${at.x} ${at.y})`} pointerEvents="none">
      <g
        className={`city-folk is-${stage} ${next ? 'is-next' : ''} ${rising ? 'is-waving' : ''} ${home ? 'is-home' : ''}`}
      >
        <ellipse className="city-home-pad" rx={home ? 20 : 13} ry={home ? 8 : 5} cy="7" />
        {home ? (
          <path className="city-porch-rail" d="M-16 2 H16 M-16 2 v-8 M0 2 v-8 M16 2 v-8" />
        ) : null}
        {stage === 'lit' ? <circle className="city-lamp" cx="18" cy="-4" r="3.8" /> : null}
        <foreignObject x="-22" y="-50" width="44" height="44">
          <div className="city-portrait">
            <Avatar who={voice.who} size="sm" />
          </div>
        </foreignObject>
        {speaking ? (
          <g className="city-bubble">
            <rect x="-38" y="-62" width="76" height="16" rx="8" />
            <text y="-51" textAnchor="middle">
              {short}
            </text>
          </g>
        ) : null}
      </g>
    </g>
  )
}
