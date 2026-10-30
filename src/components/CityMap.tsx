import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { areas } from '../content'
import { townVoice } from '../content/story'
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
  clampPan,
  easyPanFrame,
  fillGrows,
  fillSnapshot,
  nextGift,
  nextKicker,
  MAP_PLATE,
  nextPlotId,
  panToward,
  plotView,
  newestStanding,
  stageCam,
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
  type PanFrame,
} from '../lib/city'
import {
  dailyDoneToday,
  isAreaComplete,
  isAreaUnlocked,
  nextWalkView,
  rehearseGo,
  useProgress,
} from '../store/progress'
import { activeLampStyle } from '../lib/foundersLamp'
import { localDateKey } from '../lib/dates'
import { easyTrailView, isEasy } from '../lib/easy'
import type { View } from '../types'
import riverWalk from '../assets/cast/portrait-river.png'
import juniperWalk from '../assets/cast/portrait-juniper.png'
import { RESIDENT_WALKER } from './city/residents'
import {
  anyUpgradeReady,
  canUpgrade,
  EASY_ANCHOR_PAN,
  EASY_NAMED_PLOTS,
  lampsBuildGift,
  readyUpgradeId,
  visualFills,
  visualSnapshot,
} from '../lib/cityBuild'
import { TOWN_PATH_HARD } from '../content/lots'
import { ComingSoonPlots } from './city/ComingSoonPlots'
import { Avatar, portraitSrc } from './Avatar'
import { GemMark } from './GemMark'
import { MindMap } from './MindMap'
import cityMapBg from '../assets/city/city-map-bg.webp'
import {
  ANCHOR,
  cityAgeReached,
  EasyPlotChip,
  EdenGrove,
  HeavenCity,
  PlotGroup,
  SpinePath,
  TownFolk,
} from './city/CityPlotArt'

interface CityMapProps {
  onNavigate: (view: View) => void
  mode?: 'live' | 'poster'
  /** Hub can open the same place mind map from the street list. */
  mindPlot?: CityPlotId | null
  onMindPlot?: (id: CityPlotId | null) => void
  /** Easy Home: grow the camera to the phone so the valley fills the stage. */
  fillStage?: boolean
  /** Easy Home: the house the player chose before Build or a second tap. */
  selectedPlot?: CityPlotId | null
  onSelectPlot?: (id: CityPlotId | null) => void
  /** Easy Manage sheet may hide Build when the route opened it. */
  allowBuild?: boolean
}

const FULL_CAM = MAP_PLATE

/** Top and bottom edge colors of city-map-bg.webp — sky, then meadow. */
const STAGE_SKY = '#c6a98b'
const STAGE_MEADOW = '#a8d070'

const PACK_A_CANDY: CityPlotId[] = ['porch', 'gate', 'journal', 'hollow']

/** Easy phone pan: ground-ring center, viewBox units below the lot anchor.
 *  ry 16 at +50 sits on the footprint, under the porch chin, and above the name chip.
 *  ry 20 at +40 crosses that face and the chip. */
const EASY_PAN_HALO_DY = 50

/** A touch or mouse that moves this many CSS px is a drag, never a tap. */
const TAP_SLOP = 8
/** A chosen or focused house this close (plate units) to a view edge slides into the middle. */
const EDGE_MARGIN = 76
/** The center button shows once the view is this many CSS px off the target. */
const HOME_SLOP_PX = 24
const KEY_STEP = 48
const GLIDE_MS = 260
/** The dock may grow this many CSS px before the map re-fits above it. */
const DOCK_TOLERANCE = 24

interface StageBox {
  w: number
  h: number
  visibleH: number
}

function camAround(id: CityPlotId) {
  const at = ANCHOR[id]
  return { x: at.x - 150, y: at.y - 120, w: 300, h: 230 }
}

/** Easy phone pan anchor. Hard and wide frames keep ANCHOR. */
function panAnchor(id: CityPlotId) {
  return EASY_ANCHOR_PAN[id] ?? ANCHOR[id]
}

function viewBoxOf(cam: { x: number; y: number; w: number; h: number }) {
  return `${cam.x} ${cam.y} ${cam.w} ${cam.h}`
}

export function CityMap({
  onNavigate,
  mode = 'live',
  mindPlot: mindPlotProp,
  onMindPlot,
  fillStage = false,
  selectedPlot = null,
  onSelectPlot,
  allowBuild = true,
}: CityMapProps) {
  const { progress } = useProgress()
  const today = localDateKey()
  const doneToday = dailyDoneToday(progress, today)
  const nextId = mode === 'poster' ? 'porch' : nextPlotId(progress, doneToday)
  const easy = isEasy(progress)
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
  const [stageBox, setStageBox] = useState<StageBox | null>(null)
  const [offHome, setOffHome] = useState(false)
  const playing = useRef(false)
  const timers = useRef<number[]>([])
  const camNow = useRef(FULL_CAM)
  const camFrame = useRef(0)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const layerRef = useRef<HTMLDivElement | null>(null)
  const panRef = useRef(0)
  const panGoal = useRef<number | null>(null)
  const panPaint = useRef(0)
  const panTween = useRef(0)
  const panStarted = useRef(false)
  const panDragged = useRef(false)
  const gesture = useRef<{ id: number; x: number; y: number; pan: number; drag: boolean } | null>(null)
  const suppressClickUntil = useRef(0)
  const readStage = useRef<(() => void) | null>(null)
  const frozen = useRef(false)

  const stageFrame = stageBox
    ? {
        aspect: stageBox.w / stageBox.h,
        focus: stageBox.visibleH > 48 ? stageBox.visibleH / 2 / stageBox.h : 0.5,
      }
    : null
  const panFrame: PanFrame | null =
    fillStage && easy && mode === 'live' && stageBox
      ? easyPanFrame(stageBox.w, stageBox.h, stageBox.visibleH)
      : null
  const panFrameRef = useRef<PanFrame | null>(null)
  panFrameRef.current = panFrame
  // Pan mode shows one gold cue: the building ready to raise, else the next road.
  const cueId: CityPlotId = panFrame ? (readyUpgradeId(progress, nextId) ?? nextId) : nextId
  const cueRef = useRef(cueId)
  cueRef.current = cueId

  function stageOf(id: CityPlotId): CityStage {
    if (mode === 'poster') return id === 'porch' ? 'scaffold' : 'empty'
    return shown[id]
  }

  function enter(id: CityPlotId) {
    if (mode === 'poster' || playing.current) return
    if (isEasy(progress)) {
      setMindPlot(null)
      onNavigate(easyTrailView(progress))
      return
    }
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
    if (isEasy(progress)) {
      if (id !== selectedPlot) {
        onSelectPlot?.(id)
        return
      }
      setMindPlot(id)
      return
    }
    setMindPlot(id)
  }

  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id))
      if (camFrame.current) cancelAnimationFrame(camFrame.current)
    }
  }, [])

  const panMode = panFrame !== null
  frozen.current = Boolean(mindPlot)

  useLayoutEffect(() => {
    if (!fillStage) return
    const el = viewportRef.current ?? svgRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    let frame = 0
    const read = () => {
      // The Manage sheet hides the top bar and dock. Keep the frame it opened on.
      if (frozen.current) return
      const w = el.clientWidth
      const h = el.clientHeight
      if (w < 1 || h < 1) return
      const dock = document.querySelector('.easy-home-dock')
      let visibleH = h
      if (dock) {
        const rect = el.getBoundingClientRect()
        const overlap = Math.min(h, Math.max(0, rect.bottom - dock.getBoundingClientRect().top))
        const visible = h - overlap
        if (visible > 48) visibleH = visible
      }
      const next = { w: Math.round(w), h: Math.round(h), visibleH: Math.round(visibleH) }
      setStageBox((prev) => {
        if (!prev || prev.w !== next.w || prev.h !== next.h) return next
        // The dock grows a little when a house is chosen. Do not re-zoom the map for that.
        const grew = prev.visibleH - next.visibleH
        return grew >= 0 && grew <= DOCK_TOLERANCE ? prev : next
      })
    }
    readStage.current = read
    read()
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(read)
    })
    observer.observe(el)
    const dock = document.querySelector('.easy-home-dock')
    if (dock) observer.observe(dock)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      readStage.current = null
    }
  }, [fillStage, panMode])

  useEffect(() => {
    if (!mindPlot) readStage.current?.()
  }, [mindPlot])

  function paintPan() {
    panPaint.current = 0
    const f = panFrameRef.current
    const layer = layerRef.current
    if (!f || !layer) return
    layer.style.transform = `translate3d(${-panRef.current * f.scale}px, 0, 0)`
  }

  function setPan(x: number, now = false) {
    const f = panFrameRef.current
    if (!f) return
    const next = clampPan(x, f)
    panRef.current = next
    if (now) paintPan()
    else if (!panPaint.current) panPaint.current = requestAnimationFrame(paintPan)
    const away = Math.abs(next - panToward(panAnchor(cueRef.current).x, f)) * f.scale > HOME_SLOP_PX
    setOffHome((prev) => (prev === away ? prev : away))
  }

  function stopGlide() {
    if (panTween.current) cancelAnimationFrame(panTween.current)
    panTween.current = 0
    panGoal.current = null
  }

  function glidePan(target: number) {
    const f = panFrameRef.current
    if (!f) return
    stopGlide()
    const to = clampPan(target, f)
    const from = panRef.current
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || Math.abs(to - from) < 0.5) {
      setPan(to)
      return
    }
    panGoal.current = to
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / GLIDE_MS)
      const e = t * t * (3 - 2 * t)
      setPan(from + (to - from) * e, true)
      if (t < 1) panTween.current = requestAnimationFrame(tick)
      else stopGlide()
    }
    panTween.current = requestAnimationFrame(tick)
  }

  function homePan() {
    const f = panFrameRef.current
    return f ? panToward(panAnchor(cueRef.current).x, f) : 0
  }

  function bringInView(id: CityPlotId) {
    const f = panFrameRef.current
    if (!f) return
    const x = panAnchor(id).x
    const left = panGoal.current ?? panRef.current
    if (x - left < EDGE_MARGIN || left + f.viewW - x < EDGE_MARGIN) glidePan(panToward(x, f))
  }

  const panKey = panFrame ? `${panFrame.scale.toFixed(4)}:${panFrame.maxX.toFixed(2)}` : ''
  useLayoutEffect(() => {
    if (!panFrame) {
      panStarted.current = false
      return
    }
    if (!panStarted.current) {
      panStarted.current = true
      panDragged.current = false
      stopGlide()
      panRef.current = panToward(panAnchor(cueRef.current).x, panFrame)
      paintPan()
      setOffHome(false)
      return
    }
    if (!panDragged.current) {
      stopGlide()
      // A dock reflow must not leave the house that was just raised.
      const focus = easy && selectedPlot ? selectedPlot : cueRef.current
      setPan(panToward(panAnchor(focus).x, panFrame), true)
    } else setPan(panRef.current, true)
  }, [panKey])

  useEffect(() => {
    if (!panFrameRef.current || !panStarted.current) return
    if (panDragged.current) setPan(panRef.current)
    else if (easy && selectedPlot) bringInView(selectedPlot)
    else glidePan(homePan())
  }, [cueId])

  useEffect(() => {
    if (easy && selectedPlot) bringInView(selectedPlot)
  }, [selectedPlot])

  useEffect(() => {
    return () => {
      if (panPaint.current) cancelAnimationFrame(panPaint.current)
      if (panTween.current) cancelAnimationFrame(panTween.current)
    }
  }, [])

  function onPanDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!panFrameRef.current || !event.isPrimary) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    suppressClickUntil.current = 0
    stopGlide()
    gesture.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      pan: panRef.current,
      drag: false,
    }
  }

  function onPanMove(event: ReactPointerEvent<HTMLDivElement>) {
    const g = gesture.current
    const f = panFrameRef.current
    if (!g || !f || g.id !== event.pointerId) return
    if (event.pointerType === 'mouse' && event.buttons === 0) {
      // The button came up somewhere we never heard about.
      gesture.current = null
      event.currentTarget.classList.remove('is-dragging')
      return
    }
    const dx = event.clientX - g.x
    const dy = event.clientY - g.y
    if (!g.drag) {
      if (Math.hypot(dx, dy) < TAP_SLOP) return
      g.drag = true
      panDragged.current = true
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // The pointer is already gone. The drag still pans.
      }
      event.currentTarget.classList.add('is-dragging')
    }
    setPan(g.pan - dx / f.scale)
  }

  function onPanEnd(event: ReactPointerEvent<HTMLDivElement>) {
    const g = gesture.current
    if (!g || g.id !== event.pointerId) return
    gesture.current = null
    event.currentTarget.classList.remove('is-dragging')
    if (g.drag && event.type === 'pointerup') suppressClickUntil.current = performance.now() + 400
  }

  function onPanClickCapture(event: { stopPropagation: () => void; preventDefault: () => void }) {
    if (performance.now() >= suppressClickUntil.current) return
    suppressClickUntil.current = 0
    event.stopPropagation()
    event.preventDefault()
  }

  function onMapKey(event: { key: string; shiftKey: boolean; preventDefault: () => void; stopPropagation: () => void }) {
    if (!easy) return
    if (event.key === 'Escape') {
      // Easy: the first Esc closes Manage, a second Esc clears the chosen house.
      if (mindPlot) {
        event.stopPropagation()
        setMindPlot(null)
        return
      }
      onSelectPlot?.(null)
      return
    }
    if (!panFrameRef.current || mindPlot) return
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      const step = KEY_STEP * (event.shiftKey ? 3 : 1) * (event.key === 'ArrowLeft' ? -1 : 1)
      panDragged.current = true
      glidePan((panGoal.current ?? panRef.current) + step)
    } else if (event.key === 'Home') {
      event.preventDefault()
      panDragged.current = false
      glidePan(homePan())
    }
  }

  useEffect(() => {
    if (mode !== 'live') return
    const now = visualSnapshot(progress)
    const fills = visualFills(progress)
    if (isEasy(progress)) {
      writeCitySeen(now)
      writeFillsSeen(fills)
      setShown(now)
      setShownFill(fills)
      return
    }
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
  // Phone pan moves East porch. The existing circle stays on that same point.
  const nextAt = panFrame ? panAnchor(cueId) : ANCHOR[cueId]
  const kicker = canUpgrade(nextId, progress)
    ? 'Build this'
    : nextKicker(nextStage, nextId, doneToday)
  const gift = anyUpgradeReady(progress)
    ? isEasy(progress)
      ? (lampsBuildGift(progress, doneToday, readyUpgradeId(progress, nextId)) ??
        'A building is ready. Tap it, then Build this.')
      : 'A building is ready. Tap it, then Build this — learning raises the house.'
    : isEasy(progress)
      ? (lampsBuildGift(progress, doneToday, null) ??
        nextGift(nextId, nextStage, shownFill[nextId] ?? 0, true))
      : nextGift(nextId, nextStage, shownFill[nextId] ?? 0, isEasy(progress))
  const celebrating = Boolean(beat) || homecoming
  const beatVoice = beat ? townVoice(beat.id) : townVoice(nextId)
  const founderLamps = activeLampStyle(progress) === 'founders'
  const plateSettled =
    Math.abs(cam.x - FULL_CAM.x) < 0.5 &&
    Math.abs(cam.y - FULL_CAM.y) < 0.5 &&
    Math.abs(cam.w - FULL_CAM.w) < 0.5 &&
    Math.abs(cam.h - FULL_CAM.h) < 0.5
  const view = panFrame
    ? { x: 0, y: 0, w: FULL_CAM.w, h: panFrame.viewH }
    : fillStage && plateSettled && stageFrame != null
      ? stageCam(stageFrame.aspect, FULL_CAM, stageFrame.focus)
      : cam

  const mapSvg = (
    <svg
      ref={svgRef}
      className="city-svg"
      viewBox={viewBoxOf(view)}
      preserveAspectRatio={panFrame ? 'xMinYMin meet' : 'xMidYMid meet'}
      role={mode === 'poster' ? 'img' : 'group'}
      aria-label={
        mode === 'poster'
          ? 'A garden valley. The City of Heaven waits on the ridge.'
          : easy
            ? 'Silver City. Tap a building to choose it, then Build this or tap again to open it.'
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
        {fillStage ? (
          <linearGradient
            id="city-stage-bleed"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="0"
            y2={FULL_CAM.h}
          >
            <stop offset="0%" stopColor={STAGE_SKY} />
            <stop offset="100%" stopColor={STAGE_MEADOW} />
          </linearGradient>
        ) : null}
      </defs>

      {fillStage ? (
        <g
          className="city-stage-bleed"
          aria-hidden
          onClick={() => {
            if (easy) onSelectPlot?.(null)
          }}
        >
          <rect
            x={view.x - 4}
            y={view.y - 4}
            width={view.w + 8}
            height={view.h + 8}
            fill="url(#city-stage-bleed)"
          />
          {view.x < -0.5 ? (
            <svg
              x={view.x}
              y={view.y}
              width={-view.x + 1}
              height={view.h}
              viewBox="0 0 36 420"
              preserveAspectRatio="none"
            >
              <image href={cityMapBg} x="0" y="0" width="640" height="420" />
            </svg>
          ) : null}
          {view.x + view.w > FULL_CAM.w + 0.5 ? (
            <svg
              x={FULL_CAM.w - 1}
              y={view.y}
              width={view.x + view.w - (FULL_CAM.w - 1)}
              height={view.h}
              viewBox="604 0 36 420"
              preserveAspectRatio="none"
            >
              <image href={cityMapBg} x="0" y="0" width="640" height="420" />
            </svg>
          ) : null}
          {view.y < -0.5 ? (
            <svg
              x={view.x}
              y={view.y}
              width={view.w}
              height={-view.y + 1}
              viewBox="0 0 640 72"
              preserveAspectRatio="none"
            >
              <g transform="translate(0 72) scale(1 -1)">
                <image href={cityMapBg} x="0" y="0" width="640" height="420" />
              </g>
            </svg>
          ) : null}
          {view.y + view.h > FULL_CAM.h + 0.5 ? (
            <svg
              x={view.x}
              y={FULL_CAM.h - 1}
              width={view.w}
              height={view.y + view.h - (FULL_CAM.h - 1)}
              viewBox="0 384 640 36"
              preserveAspectRatio="none"
            >
              <g transform="translate(0 804) scale(1 -1)">
                <image href={cityMapBg} x="0" y="0" width="640" height="420" />
              </g>
            </svg>
          ) : null}
        </g>
      ) : null}

      {/* Candy memory-palace plate (#166). Streets/creek/plots/HeavenCity stay SVG overlays. */}
      <image
        href={cityMapBg}
        x={0}
        y={0}
        width={640}
        height={420}
        preserveAspectRatio="xMidYMid slice"
        onClick={() => {
          if (easy) onSelectPlot?.(null)
        }}
      />

      {easy ? null : (
        <HeavenCity
          age={age}
          easy={easy}
          onOpen={() => {
            if (age === 'eden' || age === 'village') {
              setLockNote(
                'Heaven waits on the ridge. Keep the trail — porch, creek, square, then the climb.',
              )
              return
            }
            open('lookout')
          }}
        />
      )}
      {easy ? null : <EdenGrove age={age} />}
      {easy ? null : <SpinePath age={age} />}

      {easy ? null : (
        <>
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
        </>
      )}
      {shownFill.lamps >= 1 && !easy ? (
        <g
          className={`city-street-lamps is-${stageOf('lamps')}${founderLamps ? ' is-style-founders' : ''}`}
          aria-hidden
        >
          <circle className="city-lamp" cx="148" cy="298" r="5" />
          {shownFill.lamps >= 4 ? <circle className="city-lamp" cx="330" cy="296" r="5" /> : null}
          {shownFill.lamps >= 8 ? <circle className="city-lamp" cx="470" cy="292" r="5" /> : null}
        </g>
      ) : null}

      {!celebrating ? (
        <g className="city-walkers" aria-hidden>
          {easy ? (
            <image
              className="city-walker city-walker-a is-resident"
              href={RESIDENT_WALKER.a}
              x="78"
              y="286"
              width="32"
              height="32"
              preserveAspectRatio="xMidYMax meet"
            />
          ) : (
            <image
              className="city-walker city-walker-a"
              href={riverWalk}
              x="78"
              y="286"
              width="32"
              height="32"
              clipPath="url(#city-face-clip)"
            />
          )}
          {age !== 'eden' ? (
            easy ? (
              <image
                className="city-walker city-walker-b is-resident"
                href={RESIDENT_WALKER.b}
                x="408"
                y="266"
                width="30"
                height="30"
                preserveAspectRatio="xMidYMax meet"
              />
            ) : (
              <image
                className="city-walker city-walker-b"
                href={juniperWalk}
                x="408"
                y="266"
                width="30"
                height="30"
                clipPath="url(#city-face-clip)"
              />
            )
          ) : null}
        </g>
      ) : null}

      {mode === 'poster' ? (
        <g className="city-welcome-folk" aria-hidden>
          <image
            className="city-portrait-img"
            href={portraitSrc('river')}
            x="148"
            y="300"
            width="44"
            height="44"
            clipPath="url(#city-face-clip)"
            preserveAspectRatio="xMidYMid slice"
          />
          <image
            className="city-portrait-img"
            href={portraitSrc('juniper')}
            x="348"
            y="274"
            width="44"
            height="44"
            clipPath="url(#city-face-clip)"
            preserveAspectRatio="xMidYMid slice"
          />
          <image
            className="city-portrait-img"
            href={portraitSrc('mercy')}
            x="236"
            y="318"
            width="40"
            height="40"
            clipPath="url(#city-face-clip)"
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
      ) : null}

      {mode === 'live' && !celebrating && !(easy && selectedPlot === cueId) && !(easy && panFrame) ? (
        <g className="city-next-mark" transform={`translate(${nextAt.x} ${nextAt.y})`}>
          <circle
            r={easy ? 22 : 34}
            className={`city-next-halo${easy && PACK_A_CANDY.includes(cueId) ? ' is-easy-soft' : ''}`}
          />
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
        selected={easy && selectedPlot === 'lookout'}
        pan={Boolean(panFrame)}
        onOpen={open}
        onFocusPlot={easy ? bringInView : undefined}
      />

      <PlotGroup
        id="observatory"
        stage={stageOf('observatory')}
        fill={shownFill.observatory}
        next={nextId === 'observatory'}
        rising={rising === 'observatory'}
        tapped={tapped === 'observatory'}
        ready={canUpgrade('observatory', progress)}
        selected={easy && selectedPlot === 'observatory'}
        pan={Boolean(panFrame)}
        onOpen={open}
        onFocusPlot={easy ? bringInView : undefined}
      />

      <PlotGroup
        id="hollow"
        stage={stageOf('hollow')}
        fill={shownFill.hollow}
        next={nextId === 'hollow'}
        rising={rising === 'hollow'}
        tapped={tapped === 'hollow'}
        ready={canUpgrade('hollow', progress)}
        selected={easy && selectedPlot === 'hollow'}
        pan={Boolean(panFrame)}
        onOpen={open}
        onFocusPlot={easy ? bringInView : undefined}
      />

      <PlotGroup
        id="journal"
        stage={stageOf('journal')}
        fill={shownFill.journal}
        next={nextId === 'journal'}
        rising={rising === 'journal'}
        tapped={tapped === 'journal'}
        ready={canUpgrade('journal', progress)}
        selected={easy && selectedPlot === 'journal'}
        pan={Boolean(panFrame)}
        onOpen={open}
        onFocusPlot={easy ? bringInView : undefined}
      />

      <PlotGroup
        id="bench"
        stage={stageOf('bench')}
        fill={shownFill.bench}
        next={nextId === 'bench'}
        rising={rising === 'bench'}
        tapped={tapped === 'bench'}
        ready={canUpgrade('bench', progress)}
        selected={easy && selectedPlot === 'bench'}
        pan={Boolean(panFrame)}
        onOpen={open}
        onFocusPlot={easy ? bringInView : undefined}
      />

      <PlotGroup
        id="lamps"
        stage={stageOf('lamps')}
        fill={shownFill.lamps}
        next={nextId === 'lamps'}
        rising={rising === 'lamps'}
        tapped={tapped === 'lamps'}
        ready={canUpgrade('lamps', progress)}
        selected={easy && selectedPlot === 'lamps'}
        pan={Boolean(panFrame)}
        onOpen={open}
        onFocusPlot={easy ? bringInView : undefined}
      />

      <PlotGroup
        id="gate"
        stage={stageOf('gate')}
        fill={shownFill.gate}
        next={nextId === 'gate'}
        rising={rising === 'gate'}
        tapped={tapped === 'gate'}
        ready={canUpgrade('gate', progress)}
        selected={easy && selectedPlot === 'gate'}
        pan={Boolean(panFrame)}
        onOpen={open}
        onFocusPlot={easy ? bringInView : undefined}
      />

      <PlotGroup
        id="porch"
        stage={stageOf('porch')}
        fill={shownFill.porch}
        next={nextId === 'porch'}
        rising={rising === 'porch'}
        tapped={tapped === 'porch'}
        ready={canUpgrade('porch', progress)}
        selected={easy && selectedPlot === 'porch'}
        pan={Boolean(panFrame)}
        onOpen={open}
        onFocusPlot={easy ? bringInView : undefined}
      />

      {mode === 'live' && !celebrating && easy && panFrame && !selectedPlot ? (
        <g className="city-next-mark" transform={`translate(${nextAt.x} ${nextAt.y})`} pointerEvents="none">
          <ellipse
            className="city-next-halo-hit"
            cy={EASY_PAN_HALO_DY}
            rx={62}
            ry={18}
            fill="transparent"
            stroke="none"
            pointerEvents="fill"
            onClick={() => open(cueId)}
          />
          <ellipse
            className="city-next-halo is-easy-ground"
            cy={EASY_PAN_HALO_DY}
            rx={58}
            ry={16}
            pointerEvents="none"
          />
        </g>
      ) : null}

      {mode === 'live'
        ? CITY_PLOTS.map((plot) => (
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
              pan={Boolean(panFrame)}
            />
          ))
        : null}

      {mode === 'live' && easy ? (
        <g className="city-easy-tags" pointerEvents="none">
          {EASY_NAMED_PLOTS.filter((id) => {
            const stage = stageOf(id)
            return stage !== 'empty' || nextId === id
          }).map((id) => (
            <EasyPlotChip key={`tag-${id}`} id={id} pan={Boolean(panFrame)} />
          ))}
        </g>
      ) : null}

      {mode === 'live' && !panFrame ? <ComingSoonPlots /> : null}
    </svg>
  )

  return (
    <section
      className={`city-overworld is-city-build is-age-${age} is-alive ${mode === 'poster' ? 'is-poster' : ''} ${celebrating ? 'is-revealing' : ''} ${homecoming ? 'is-homecoming' : ''}${founderLamps ? ' is-style-founders' : ''}${panFrame ? ' is-easy-pan' : ''}`}
      onKeyDown={onMapKey}
    >
      {panFrame ? (
        <div
          ref={viewportRef}
          className="city-pan-viewport"
          role="group"
          tabIndex={0}
          aria-label="Map view. Use the arrow keys to look around."
          onPointerDown={onPanDown}
          onPointerMove={onPanMove}
          onPointerUp={onPanEnd}
          onPointerCancel={onPanEnd}
          onClickCapture={onPanClickCapture}
          onScroll={(event) => {
            event.currentTarget.scrollLeft = 0
          }}
        >
          <div
            ref={layerRef}
            className="city-pan-layer"
            style={{ width: FULL_CAM.w * panFrame.scale }}
          >
            {mapSvg}
          </div>
          {stageBox ? (
            <svg
              className="city-coming-layer"
              viewBox={`0 0 ${stageBox.w} ${stageBox.h}`}
              preserveAspectRatio="xMinYMin meet"
            >
              <ComingSoonPlots svgSelector=".city-coming-layer" />
            </svg>
          ) : null}
        </div>
      ) : (
        mapSvg
      )}

      {panFrame && offHome ? (
        <button
          type="button"
          className="easy-map-recenter"
          aria-label="Center the map on your house"
          onClick={() => {
            panDragged.current = false
            glidePan(homePan())
          }}
        />
      ) : null}

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

      {mode === 'live' ? (
        <div className="city-legend">
          {celebrating ? (
            <p className="eyebrow">{beat?.beat}</p>
          ) : (
            isEasy(progress) ? (
              <>
                {lockNote ? (
                  <p className="city-lock-toast" role="status">
                    {lockNote}
                  </p>
                ) : null}
              </>
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
          allowBuild={allowBuild}
        />
      ) : null}
    </section>
  )
}
