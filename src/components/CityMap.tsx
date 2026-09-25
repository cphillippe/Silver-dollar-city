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
import { isEasy } from '../lib/easy'
import type { View } from '../types'
import riverWalk from '../assets/cast/portrait-river.png'
import juniperWalk from '../assets/cast/portrait-juniper.png'
import {
  anyUpgradeReady,
  canUpgrade,
  EASY_FOLK_LIFT,
  EASY_NAMED_PLOTS,
  plotTag,
  visualFills,
  visualSnapshot,
} from '../lib/cityBuild'
import { TOWN_PATH_HARD } from '../content/lots'
import { Avatar } from './Avatar'
import { GemMark } from './GemMark'
import { MindMap } from './MindMap'
import { cityAgeReached, EdenGrove, SpinePath, EasyPlotChip, HeavenCity, PlotArt } from './CityMapArt'

interface CityMapProps {
  onNavigate: (view: View) => void
  mode?: 'live' | 'poster'
  /** Hub can open the same place mind map from the street list. */
  mindPlot?: CityPlotId | null
  onMindPlot?: (id: CityPlotId | null) => void
}

const ANCHOR: Record<CityPlotId, { x: number; y: number }> = {
  lookout: { x: 532, y: 62 },
  observatory: { x: 422, y: 126 },
  hollow: { x: 92, y: 294 },
  journal: { x: 262, y: 244 },
  bench: { x: 368, y: 288 },
  lamps: { x: 208, y: 318 },
  gate: { x: 486, y: 256 },
  porch: { x: 582, y: 306 },
}

const BUILD_SCALE = 1.58

const FOLK: Record<CityPlotId, { x: number; y: number }> = {
  lookout: { x: 568, y: 118 },
  observatory: { x: 472, y: 178 },
  hollow: { x: 148, y: 352 },
  journal: { x: 312, y: 300 },
  bench: { x: 420, y: 344 },
  lamps: { x: 178, y: 358 },
  gate: { x: 538, y: 322 },
  porch: { x: 534, y: 356 },
}

const FULL_CAM = { x: 0, y: 0, w: 640, h: 420 }

function camAround(id: CityPlotId) {
  const at = ANCHOR[id]
  const w = 300
  const h = 230
  const x = Math.max(0, Math.min(FULL_CAM.w - w, at.x - w / 2))
  const y = Math.max(0, Math.min(FULL_CAM.h - h, at.y - h / 2))
  return { x, y, w, h }
}

function viewBoxOf(cam: { x: number; y: number; w: number; h: number }) {
  return `${cam.x} ${cam.y} ${cam.w} ${cam.h}`
}

export function CityMap({
  onNavigate,
  mode = 'live',
  mindPlot: mindPlotProp,
  onMindPlot,
}: CityMapProps) {
  const { progress } = useProgress()
  const today = localDateKey()
  const doneToday = dailyDoneToday(progress, today)
  const nextId = mode === 'poster' ? 'porch' : nextPlotId(progress, doneToday)
  const { standing, possible } = cityStanding(progress)
  const age = mode === 'poster' ? 'eden' : cityAge(progress)
  const liveSnap = mode === 'poster' ? citySnapshot(progress) : visualSnapshot(progress)
  const liveFills = mode === 'poster' ? fillSnapshot(progress) : visualFills(progress)

  const [shown, setShown] = useState(liveSnap)
  const [shownFill, setShownFill] = useState(liveFills)
  const [rising, setRising] = useState<CityPlotId | null>(null)
  const [homecoming, setHomecoming] = useState(false)
  const [beat, setBeat] = useState<CityUpgrade | null>(null)
  const [tapped, setTapped] = useState<CityPlotId | null>(null)
  const [lockNote, setLockNote] = useState<string | null>(null)
  const [mindPlotLocal, setMindPlotLocal] = useState<CityPlotId | null>(null)
  const mindPlot = mindPlotProp !== undefined ? mindPlotProp : mindPlotLocal
  const setMindPlot = onMindPlot ?? setMindPlotLocal
  const [cam, setCam] = useState(FULL_CAM)
  const playing = useRef(false)
  const timers = useRef<number[]>([])
  const camNow = useRef(FULL_CAM)
  const camFrame = useRef(0)

  function stageOf(id: CityPlotId): CityStage {
    if (mode === 'poster') return id === 'porch' ? 'scaffold' : 'empty'
    return shown[id]
  }

  function enter(id: CityPlotId) {
    if (mode === 'poster' || playing.current) return
    const spec = CITY_PLOTS.find((plot) => plot.id === id)
    const areaId = spec?.areaId
    const unlocked = areaId ? isAreaUnlocked(areaId, progress.completed) : true
    setMindPlot(null)
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

  function open(id: CityPlotId) {
    if (mode === 'poster') return
    if (playing.current && !isEasy(progress)) return
    setTapped(id)
    window.setTimeout(() => {
      setTapped((cur) => (cur === id ? null : cur))
    }, 340)
    setLockNote(null)
    setMindPlot(id)
  }

  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id))
      if (camFrame.current) cancelAnimationFrame(camFrame.current)
    }
  }, [])

  // 1.4.124 — Easy Manage open no longer pulseToward's (Bill: map moved under opaque card).
  // Upgrade playQueue still tweens camAround → FULL_CAM when lots rise.

  useEffect(() => {
    if (mode !== 'live') return
    const now = visualSnapshot(progress)
    const fills = visualFills(progress)
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
      if (!isEasy(progress)) maybeHomecoming(now)
      return
    }
    if (playing.current) return
    playing.current = true
    setShown(prev)
    setShownFill(prevFill ?? fills)
    // Easy + Hard: one-shot zoom to the lot, apply rise, settle back to full map
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
      const easyPulse = isEasy(progress)
      const zoomIn = reduced ? 0 : easyPulse ? 160 : 200
      const applyAt = reduced ? 40 : easyPulse ? 140 : 180
      const hold = reduced ? 700 : easyPulse ? 720 : 1100
      const zoomOut = reduced ? 0 : easyPulse ? 200 : 220
      const gap = reduced ? 40 : easyPulse ? 160 : 200
      if (!reduced) tweenCam(camAround(item.id), zoomIn)
      later(applyAt, () => {
        if (item.beat !== 'Grew!') {
          setShown((current) => ({ ...current, [item.id]: item.to }))
        }
        setShownFill((current) => ({
          ...current,
          [item.id]: finalFills[item.id],
        }))
        setRising(item.id)
      })
      later(hold, () => {
        setRising(null)
        setBeat(null)
        if (!reduced) tweenCam(FULL_CAM, zoomOut)
        later(gap, () => step(index + 1))
      })
    }

    step(0)
  }

  function maybeHomecoming(snap: ReturnType<typeof citySnapshot>) {
    if (isEasy(progress)) return
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

  const nextStage = stageOf(nextId)
  const nextAt = ANCHOR[nextId]
  const kicker = canUpgrade(nextId, progress)
    ? 'Build this'
    : nextKicker(nextStage, nextId, doneToday)
  const gift = anyUpgradeReady(progress)
    ? isEasy(progress)
      ? 'A building is ready. Tap it, then Build this.'
      : 'A building is ready. Tap it, then Build this — learning raises the house.'
    : nextGift(nextId, nextStage, shownFill[nextId] ?? 0, isEasy(progress))
  const celebrating = Boolean(beat) || homecoming
  const beatVoice = beat ? townVoice(beat.id) : townVoice(nextId)
  const easy = isEasy(progress)

  return (
    <section
      className={`city-overworld is-city-build is-age-${age} is-alive ${mode === 'poster' ? 'is-poster' : ''} ${celebrating ? 'is-revealing' : ''} ${homecoming ? 'is-homecoming' : ''}`}
    >
      <svg
        className="city-svg"
        viewBox={viewBoxOf(cam)}
        preserveAspectRatio="xMidYMid meet"
        role={mode === 'poster' ? 'img' : 'group'}
        aria-label={
          mode === 'poster'
            ? 'A garden valley. The City of Heaven waits on the ridge.'
            : easy
              ? 'Silver City. Tap a building to Manage it, walk, or Build this.'
              : celebrating
                ? `${beat?.beat} ${beat?.title}`
                : `Silver City, ${CITY_AGE_TITLE[age]}. ${standing} of ${possible} landmarks standing. The town grows toward the City of Heaven.`
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
          <clipPath id="city-face-clip" clipPathUnits="objectBoundingBox">
            <circle cx="0.5" cy="0.5" r="0.48" />
          </clipPath>
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

        <HeavenCity
          age={age}
          easy={easy}
          onOpen={() => {
            if (easy) {
              setLockNote('Tap a building to walk or Manage it.')
              return
            }
            if (age === 'eden' || age === 'village') {
              setLockNote(
                'Heaven waits on the ridge. Keep the trail — porch, creek, square, then the climb.',
              )
              return
            }
            open('lookout')
          }}
        />
        <EdenGrove age={age} />
        {easy ? null : <SpinePath age={age} />}

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

        {!celebrating ? (
          <g className="city-walkers" aria-hidden>
            <image
              className="city-walker city-walker-a"
              href={riverWalk}
              x="78"
              y="286"
              width="32"
              height="32"
              clipPath="url(#city-face-clip)"
            />
            {age !== 'eden' ? (
              <image
                className="city-walker city-walker-b"
                href={juniperWalk}
                x="408"
                y="266"
                width="30"
                height="30"
                clipPath="url(#city-face-clip)"
              />
            ) : null}
          </g>
        ) : null}

        {mode === 'poster' ? (
          <g className="city-welcome-folk" aria-hidden>
            <foreignObject x="148" y="300" width="44" height="44">
              <div className="city-portrait">
                <Avatar who="river" size="sm" />
              </div>
            </foreignObject>
            <foreignObject x="348" y="274" width="44" height="44">
              <div className="city-portrait">
                <Avatar who="juniper" size="sm" />
              </div>
            </foreignObject>
            <foreignObject x="236" y="318" width="40" height="40">
              <div className="city-portrait">
                <Avatar who="mercy" size="sm" />
              </div>
            </foreignObject>
          </g>
        ) : null}

        <path d="M-10 368 Q 180 340 320 358 T 660 372 V430 H-10 Z" fill="#148a48" />

        {mode === 'live' && !celebrating ? (
          <g className="city-next-mark" transform={`translate(${nextAt.x} ${nextAt.y})`}>
            {easy ? (
              <circle r={12} className="city-next-halo is-easy-soft" />
            ) : (
              <circle r={34} className="city-next-halo" />
            )}
            {easy ? null : (
              <text y="-40" textAnchor="middle">
                {kicker}
              </text>
            )}
          </g>
        ) : null}

        <PlotGroup
          id="lookout"
          stage={stageOf('lookout')}
          fill={shownFill.lookout}
          next={nextId === 'lookout'}
          rising={rising === 'lookout'}
          tapped={tapped === 'lookout'}
          ready={canUpgrade('lookout', progress)}
          onOpen={open}
        />

        <PlotGroup
          id="observatory"
          stage={stageOf('observatory')}
          fill={shownFill.observatory}
          next={nextId === 'observatory'}
          rising={rising === 'observatory'}
          tapped={tapped === 'observatory'}
          ready={canUpgrade('observatory', progress)}
          onOpen={open}
        />

        <PlotGroup
          id="hollow"
          stage={stageOf('hollow')}
          fill={shownFill.hollow}
          next={nextId === 'hollow'}
          rising={rising === 'hollow'}
          tapped={tapped === 'hollow'}
          ready={canUpgrade('hollow', progress)}
          onOpen={open}
        />

        <PlotGroup
          id="journal"
          stage={stageOf('journal')}
          fill={shownFill.journal}
          next={nextId === 'journal'}
          rising={rising === 'journal'}
          tapped={tapped === 'journal'}
          ready={canUpgrade('journal', progress)}
          onOpen={open}
        />

        <PlotGroup
          id="bench"
          stage={stageOf('bench')}
          fill={shownFill.bench}
          next={nextId === 'bench'}
          rising={rising === 'bench'}
          tapped={tapped === 'bench'}
          ready={canUpgrade('bench', progress)}
          onOpen={open}
        />

        <PlotGroup
          id="lamps"
          stage={stageOf('lamps')}
          fill={shownFill.lamps}
          next={nextId === 'lamps'}
          rising={rising === 'lamps'}
          tapped={tapped === 'lamps'}
          ready={canUpgrade('lamps', progress)}
          onOpen={open}
        />

        <PlotGroup
          id="gate"
          stage={stageOf('gate')}
          fill={shownFill.gate}
          next={nextId === 'gate'}
          rising={rising === 'gate'}
          tapped={tapped === 'gate'}
          ready={canUpgrade('gate', progress)}
          onOpen={open}
        />

        <PlotGroup
          id="porch"
          stage={stageOf('porch')}
          fill={shownFill.porch}
          next={nextId === 'porch'}
          rising={rising === 'porch'}
          tapped={tapped === 'porch'}
          ready={canUpgrade('porch', progress)}
          onOpen={open}
        />

        {mode === 'live'
          ? CITY_PLOTS.filter((plot) => (easy ? nextId === plot.id : true)).map((plot) => (
              <TownFolk
                key={`folk-${plot.id}`}
                id={plot.id}
                stage={stageOf(plot.id)}
                next={nextId === plot.id}
                rising={rising === plot.id}
                speaking={
                  easy
                    ? false
                    : beat?.id === plot.id || (nextId === plot.id && !celebrating)
                }
                ack={beat?.id === plot.id ? beat.beat : undefined}
              />
            ))
          : null}

        {mode === 'live' && easy ? (
          <g className="city-easy-tags" pointerEvents="none">
            {EASY_NAMED_PLOTS.filter((id) => id === nextId).map((id) => (
              <EasyPlotChip key={`tag-${id}`} id={id} />
            ))}
          </g>
        ) : null}
      </svg>

      {beat && !easy ? (
        <div className="city-beat" role="status">
          <span className="city-beat-gems" aria-hidden>
            <GemMark gem="lamp" size="sm" />
            <GemMark gem="star" size="sm" />
            <GemMark gem="coin" size="sm" />
          </span>
          <Avatar who={beatVoice.who} size="sm" />
          <div>
            <strong>{beat.beat}</strong>
            <span>
              {isEasy(progress) && beat.id === 'journal' ? 'River’s pages' : beat.title}
            </span>
          </div>
        </div>
      ) : null}

      {homecoming && !beat && !easy ? (
        <div className="city-beat is-home" role="status">
          <Avatar who="juniper" size="sm" />
          <div>
            <strong>Still lit</strong>
            <span>The town held</span>
          </div>
        </div>
      ) : null}

      {mode === 'live' && (!easy || celebrating || lockNote) ? (
        <div className="city-legend">
          {celebrating ? (
            <p className="eyebrow">{beat?.beat}</p>
          ) : (
            isEasy(progress) ? (
              lockNote ? (
                <p className="city-lock-toast" role="status">
                  {lockNote}
                </p>
              ) : null
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
              {lockNote ? (
                <p className="city-lock-toast" role="status">
                  {lockNote}
                </p>
              ) : null}
              <p className="city-map-hint">{TOWN_PATH_HARD}</p>
              {doneToday ? (
                <p className="city-morrow">Town held. A lamp waits tomorrow.</p>
              ) : null}
            </>
            )
          )}
        </div>
      ) : null}

      {mode === 'live' && mindPlot ? (
        <MindMap
          plotId={mindPlot}
          onClose={() => setMindPlot(null)}
          onEnter={enter}
          onNavigate={onNavigate}
        />
      ) : null}
    </section>
  )
}

const SPARKS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]

function PlotGroup({
  id,
  stage,
  fill,
  next,
  rising,
  tapped,
  ready,
  onOpen,
}: {
  id: CityPlotId
  stage: CityStage
  fill: number
  next: boolean
  rising: boolean
  tapped: boolean
  ready: boolean
  onOpen: (id: CityPlotId) => void
}) {
  const { progress } = useProgress()
  const easy = isEasy(progress)
  const clickable = stage !== 'empty' || next || ready
  const at = ANCHOR[id]
  const vacant = stage === 'empty' && !next && !ready
  const title =
    easy && id === 'journal'
      ? 'River’s pages'
      : (CITY_PLOTS.find((plot) => plot.id === id)?.title ?? id)
  const scale = BUILD_SCALE
  const hit = easy ? 56 : 42
  const tag = plotTag(id)
  const showTag = !easy && clickable
  const tagW = Math.max(64, tag.length * 8 + 20)
  const tagX = Math.min(632 - tagW / 2, Math.max(tagW / 2 + 8, at.x))
  const tagY = at.y + 32
  const tagH = 18
  return (
    <g
      className={`city-plot is-${stage} ${next ? 'is-next' : ''} ${rising ? 'is-rising' : ''} ${tapped ? 'is-tapped' : ''} ${ready ? 'is-ready' : ''} ${easy ? 'is-easy-lot' : ''}`}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={`${title} ${stage}${ready ? ', upgrade ready' : ''}${next ? ', next to build' : ''}${rising ? ', just rose' : ''}`}
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
      {clickable ? (
        <circle className="city-plot-hit" cx={at.x} cy={at.y} r={hit} />
      ) : null}
      {vacant ? (
        next || ready ? (
          <g className="city-lot is-staked" transform={`translate(${at.x} ${at.y}) scale(${scale})`}>
            <ellipse rx="20" ry="9" className="city-earth" />
            <path
              className="city-timber"
              d="M-10 8 V-12 M10 8 V-12 M-12 -2 H12 M-5 8 V-7 M5 8 V-7"
            />
          </g>
        ) : null
      ) : (
        <g transform={`translate(${at.x} ${at.y}) scale(${scale}) translate(${-at.x} ${-at.y})`}>
          <PlotArt id={id} stage={stage} fill={fill} rising={rising} />
        </g>
      )}
      {showTag ? (
        <>
          <rect
            className="city-plot-tag-bg"
            x={tagX - tagW / 2}
            y={tagY - 14}
            width={tagW}
            height={tagH}
            rx={7}
          />
          <text className="city-plot-tag" x={tagX} y={tagY} textAnchor="middle">
            {tag}
          </text>
        </>
      ) : null}
      {rising ? (
        <g className="city-sparks" transform={`translate(${at.x} ${at.y})`}>
          <circle r="28" className="city-flash" />
          {SPARKS.map((deg) => (
            <circle
              key={deg}
              className="city-spark"
              r="4.2"
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
  const { progress } = useProgress()
  if (stage === 'empty' && !next) return null
  const easy = isEasy(progress)
  const seat = FOLK[id]
  const at = easy ? { x: seat.x, y: seat.y - EASY_FOLK_LIFT } : seat
  const voice = townVoice(id)
  const line = ack ? townAck(id, ack, isEasy(progress)) : voice.here
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
        <foreignObject x="-22" y="-50" width="44" height="44" overflow="hidden">
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
