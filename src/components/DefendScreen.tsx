import { useEffect, useRef, useState } from 'react'
import { evidenceFor } from '../content/evidence'
import { WATCH_KICKER, WATCH_LEAD, WATCH_TITLE } from '../content/defend'
import { EASY, easyFacingLine, isEasy, loveHowTo } from '../lib/easy'
import { localDateKey } from '../lib/dates'
import {
  DEFEND_ANCHOR,
  DEFEND_BRIEF_ID,
  DEFEND_HEARTS,
  DEFEND_PATH,
  DEFEND_WAVE_SIZE,
  HEAVEN_POINT,
  raidForWave,
  WATCH_ABILITY_LABEL,
  abilityRange,
  defendPads,
  dist,
  heavenPoint,
  heavenSpeed,
  padStage,
  pathPoint,
  towerCooldown,
  unlockedWatchAbilities,
  waveSpawnEvery,
  waveSpeed,
  EASY_WALKER_FACE_PX,
  EASY_WALKER_HIT_PX,
  easyTapFit,
  easyTapMode,
  easyTapTarget,
  waveIsClear,
  type WatchAbility,
} from '../lib/defend'
import { learningForTool } from '../lib/learning'
import { TIER_MARK, toolTier, WALKER_LABEL, watchTool, WATCH_TOOLS } from '../lib/watchTools'
import { useJuiceHandoff } from '../lib/juice'
import { CITY_PLOTS, type CityPlotId } from '../lib/city'
import { useProgress } from '../store/progress'
import type { View, WalkerKind } from '../types'
import { walkerSrc, WalkerFace } from './Avatar'
import { AbilityMark } from './GemMark'
import { TownReturn } from './TownReturn'
import { WinBurst } from './challenges/WinBurst'

interface DefendScreenProps {
  onNavigate: (view: View) => void
}

interface Raider {
  id: number
  t: number
  text: string
  kind: WalkerKind
  turned?: string
  from?: { x: number; y: number }
  heavenT?: number
}

interface Shot {
  key: number
  from: { x: number; y: number }
  to: { x: number; y: number }
}

interface Blast {
  key: number
  x: number
  y: number
  line: string
  combo: number
}

export function DefendScreen({ onNavigate }: DefendScreenProps) {
  const { progress, recordNight, markMiss } = useProgress()
  const easy = isEasy(progress)
  const today = localDateKey()
  const brief = evidenceFor(DEFEND_BRIEF_ID)
  const pads = defendPads(progress)
  const unlocked = unlockedWatchAbilities(progress)
  const [ability, setAbility] = useState<WatchAbility>(() => unlocked[0] ?? 'love')
  const taught = true
  const boardRef = useRef<SVGSVGElement>(null)
  const [boardBox, setBoardBox] = useState({ w: 640, h: 420 })
  const [toolLock, setToolLock] = useState<string | null>(null)
  const [arming, setArming] = useState(false)
  const [phase, setPhase] = useState<'plant' | 'wave' | 'lost'>(easy ? 'wave' : 'plant')
  const [planted, setPlanted] = useState<CityPlotId[]>(() => [...pads])
  const [hearts, setHearts] = useState(DEFEND_HEARTS)
  const [raiders, setRaiders] = useState<Raider[]>([])
  const [downed, setDowned] = useState(0)
  const [flash, setFlash] = useState<CityPlotId | null>(null)
  const [shots, setShots] = useState<Shot[]>([])
  const [blasts, setBlasts] = useState<Blast[]>([])
  const [combo, setCombo] = useState(0)
  const [shake, setShake] = useState(false)
  const [leakFlash, setLeakFlash] = useState(false)
  const [won, setWon] = useState(false)
  const [firing, setFiring] = useState(false)
  const comboRef = useRef(0)
  const { juiceDone, afterJuice } = useJuiceHandoff()
  const saved = useRef(false)
  const afterJuiceRef = useRef(afterJuice)
  const markMissRef = useRef(markMiss)
  afterJuiceRef.current = afterJuice
  markMissRef.current = markMiss

  const live = useRef({
    raiders: [] as Raider[],
    spawned: 0,
    downed: 0,
    hearts: DEFEND_HEARTS,
    planted,
    cool: {} as Record<string, number>,
    playing: false,
    spawnNow: false,
  })

  useEffect(() => {
    live.current.planted = planted
  }, [planted])

  useEffect(() => {
    if (!juiceDone || saved.current || !brief) return
    saved.current = true
    recordNight(today)
  }, [juiceDone, brief, recordNight, today])

  useEffect(() => {
    if (phase !== 'wave') return
    live.current.playing = true
    live.current.raiders = []
    live.current.spawned = 0
    live.current.downed = 0
    live.current.hearts = DEFEND_HEARTS
    live.current.cool = {}
    live.current.spawnNow = false
    setRaiders([])
    setDowned(0)
    setHearts(DEFEND_HEARTS)
    let last = performance.now()
    let spawnAt = 0
    let frame = 0

    const tick = (now: number) => {
      if (!live.current.playing) return
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      spawnAt += dt
      const targetId = live.current.raiders.find((item) => !item.turned)?.id
      const next = live.current.raiders.map((item) => {
        if (item.turned) {
          const tool = item.turned ? watchTool(item.turned) : undefined
          const tier = tool ? toolTier(tool, progress) : 1
          return { ...item, heavenT: (item.heavenT ?? 0) + heavenSpeed(tier, easy) * dt }
        }
        const freezeTarget = easy && item.id === targetId
        if (freezeTarget) return { ...item }
        return { ...item, t: item.t + waveSpeed(easy) * dt }
      })
      let leaked = 0
      const walking = next.filter((item) => {
        if (item.turned) {
          if (easy) return false
          if ((item.heavenT ?? 0) >= 1) return false
          return true
        }
        if (item.t < 1) return true
        leaked += 1
        return false
      })
      if (leaked) {
        live.current.hearts = Math.max(0, live.current.hearts - leaked)
        setHearts(live.current.hearts)
        comboRef.current = 0
        setCombo(0)
        setLeakFlash(true)
        window.setTimeout(() => setLeakFlash(false), 220)
        markMissRef.current(DEFEND_BRIEF_ID)
      }
      const holdSpawn = easy && walking.some((item) => !item.turned)
      if (
        live.current.spawned < DEFEND_WAVE_SIZE &&
        !holdSpawn &&
        (live.current.spawnNow ||
          spawnAt >= waveSpawnEvery(easy) ||
          (easy && live.current.spawned === 0))
      ) {
        live.current.spawnNow = false
        spawnAt = 0
        const id = live.current.spawned
        const cast = raidForWave(progress.defense.cleared, id)
        walking.push({
          id,
          t: easy ? 0.42 : 0,
          text: cast.text,
          kind: cast.kind,
        })
        live.current.spawned += 1
      }
      live.current.raiders = walking
      setRaiders(walking)
      if (live.current.hearts <= 0) {
        live.current.playing = false
        setPhase('lost')
        return
      }
      if (waveIsClear(easy, live.current.downed, live.current.spawned, walking.length)) {
        live.current.playing = false
        setWon(true)
        afterJuiceRef.current()
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      live.current.playing = false
      cancelAnimationFrame(frame)
    }
  }, [phase, easy, progress.defense.cleared])

  useEffect(() => {
    const node = boardRef.current
    if (!node) return
    const sync = () => {
      const rect = node.getBoundingClientRect()
      setBoardBox({ w: rect.width, h: rect.height })
    }
    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(node)
    return () => observer.disconnect()
  }, [phase, taught, easy])

  function togglePad(id: CityPlotId) {
    if (phase !== 'plant') return
    setPlanted((current) => {
      if (current.includes(id)) {
        if (current.length <= 1) return current
        return current.filter((item) => item !== id)
      }
      return [...current, id]
    })
  }

  function raiderAt(raider: Raider) {
    if (raider.turned && raider.from) return heavenPoint(raider.from, raider.heavenT ?? 0)
    return pathPoint(raider.t)
  }

  function fire(id: CityPlotId) {
    if (phase !== 'wave' || won) return
    const now = performance.now()
    const stage = padStage(id, progress)
    const wait = towerCooldown(stage)
    if ((live.current.cool[id] ?? 0) + wait > now) return
    const at = DEFEND_ANCHOR[id]
    const using = unlocked.includes(ability) ? ability : 'love'
    const range = abilityRange(using, stage, progress)
    let best: Raider | null = null
    let bestD = range
    for (const raider of live.current.raiders) {
      if (raider.turned) continue
      const d = dist(at, raiderAt(raider))
      if (d <= bestD) {
        best = raider
        bestD = d
      }
    }
    live.current.cool[id] = now
    setFlash(id)
    setFiring(true)
    window.setTimeout(() => setFlash(null), 280)
    window.setTimeout(() => setFiring(false), 220)
    if (!best) return
    const to = raiderAt(best)
    const fit = easyTapFit(easy, using, best.kind)
    const heldLine = learningForTool(progress, using)
    comboRef.current += 1
    const nextCombo = comboRef.current
    setCombo(nextCombo)
    setShake(true)
    window.setTimeout(() => setShake(false), 160)
    const blast: Blast = {
      key: now,
      x: to.x,
      y: to.y,
      line: easy
        ? fit === 'match'
          ? 'Yes'
          : 'Try Love'
        : fit === 'match'
          ? (heldLine
              ? heldLine.claim
              : `${WATCH_ABILITY_LABEL[using]} matches`)
          : `${WATCH_ABILITY_LABEL[using]} is weak here`,
      combo: nextCombo,
    }
    setShots((current) => [...current.slice(-3), { key: now, from: { x: at.x, y: at.y - 16 }, to }])
    setBlasts((current) => [...current.slice(-3), blast])
    window.setTimeout(() => {
      setShots((current) => current.filter((item) => item.key !== now))
    }, 280)
    window.setTimeout(() => {
      setBlasts((current) => current.filter((item) => item.key !== now))
    }, 620)
    if (fit === 'match') {
      live.current.raiders = live.current.raiders.map((item) =>
        item.id === best.id
          ? { ...item, turned: using, from: to, heavenT: 0, text: 'Toward heaven' }
          : item,
      )
      live.current.downed += 1
      if (easy) live.current.spawnNow = true
    } else {
      live.current.raiders = live.current.raiders.map((item) =>
        item.id === best.id
          ? { ...item, t: Math.max(0, item.t - 0.22), text: `${WATCH_ABILITY_LABEL[using]} is weak` }
          : item,
      )
    }
    setRaiders(live.current.raiders)
    setDowned(live.current.downed)
  }

  function fireBest() {
    if (phase !== 'wave' || won) return
    let pick: CityPlotId | null = null
    let bestD = Infinity
    for (const id of live.current.planted) {
      const at = DEFEND_ANCHOR[id]
      const range = abilityRange(
        unlocked.includes(ability) ? ability : 'love',
        padStage(id, progress),
        progress,
      )
      for (const raider of live.current.raiders) {
        if (raider.turned) continue
        const d = dist(at, raiderAt(raider))
        if (d <= range && d < bestD) {
          bestD = d
          pick = id
        }
      }
    }
    if (pick) fire(pick)
    else if (easy) setToolLock(EASY.nightMiss)
  }

  function retry() {
    setPhase(easy ? 'wave' : 'plant')
    setWon(false)
    setRaiders([])
    setDowned(0)
    setHearts(DEFEND_HEARTS)
    comboRef.current = 0
    setCombo(0)
    setShots([])
    setBlasts([])
    saved.current = false
  }

  if (!brief) {
    return (
      <main className="page">
        <p>The night road is still being staked.</p>
      </main>
    )
  }

  function boardPoint(x: number, y: number) {
    const scale = Math.min(boardBox.w / 640, boardBox.h / 420)
    return {
      left: (boardBox.w - 640 * scale) / 2 + x * scale,
      top: (boardBox.h - 420 * scale) / 2 + y * scale,
    }
  }

  const after = juiceDone && won
  const easyTap = easyTapMode(easy, phase, won)
  const tapTarget = easyTap ? easyTapTarget(raiders) : undefined
  const tapPos = tapTarget ? boardPoint(raiderAt(tapTarget).x, raiderAt(tapTarget).y) : null

  return (
    <main
      className={`defend-page ${taught ? 'is-puzzle' : 'is-teach'} ${arming ? 'is-arming' : ''} ${won ? 'is-win' : ''} ${shake ? 'is-shake' : ''} ${leakFlash ? 'is-leak' : ''} ${firing ? 'is-firing' : ''} ${easy ? 'is-easy-watch' : ''} ${easyTap ? 'is-easy-tap' : ''}`}
      aria-label={WATCH_TITLE}
    >
      {after ? (
        <>
          <article className="stored-line" aria-label={easy ? 'How to use Love' : 'Love tip'}>
            <p className="eyebrow">{easy ? 'How to use Love' : 'Love tip'}</p>
            <p className="stored-claim">{loveHowTo(easy)}</p>
            {easy ? <p className="quiet">{EASY.nightTap}</p> : null}
          </article>
          <TownReturn
            who="juniper"
            line={
              easy
                ? 'Night held. Six taps.'
                : 'Night held. The road turned toward heaven.'
            }
            action={easy ? EASY.home : 'See the town'}
            onGo={() => onNavigate({ name: 'hub' })}
          />
        </>
      ) : (
        <>
          <p className="eyebrow">{easy ? 'Night Watch' : WATCH_KICKER}</p>
          <h1 className="defend-title">
            {easy
              ? EASY.nightLead
              : phase === 'wave'
                ? 'Turn them toward heaven.'
                : WATCH_LEAD}
          </h1>
          <div className={`defend-frame ${shake ? 'is-shake' : ''} ${won ? 'is-clear' : ''}`}>
            <p className="defend-hud" aria-live="polite">
              <span className="defend-hearts">
                {Array.from({ length: DEFEND_HEARTS }, (_, index) => (
                  <span key={index} className={index < hearts ? 'is-on' : ''}>
                    ♥
                  </span>
                ))}
              </span>
              <span className={`defend-count ${!easy && combo > 1 ? 'is-combo' : ''}`}>
                {phase === 'wave'
                  ? easy
                    ? `TAP ${downed}/${DEFEND_WAVE_SIZE}`
                    : combo > 1
                      ? `×${combo}  ${downed}/${DEFEND_WAVE_SIZE}`
                      : `${downed}/${DEFEND_WAVE_SIZE} · TAP`
                  : `${planted.length} lamp${planted.length === 1 ? '' : 's'}`}
              </span>
            </p>
            <svg
              ref={boardRef}
              className={`defend-board ${shake ? 'is-shake' : ''} ${won ? 'is-clear' : ''}`}
              viewBox="0 0 640 420"
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="Night road through Silver City"
              onClick={() => {
                if (phase === 'wave') fireBest()
              }}
            >
              <defs>
                <linearGradient id="defend-dusk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--city-sky-0)" />
                  <stop offset="22%" stopColor="var(--city-sky-1)" />
                  <stop offset="52%" stopColor="var(--city-sky-2)" />
                  <stop offset="100%" stopColor="var(--city-sky-3)" />
                </linearGradient>
                <linearGradient id="defend-ridge" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--city-ridge-0)" />
                  <stop offset="100%" stopColor="var(--city-ridge-1)" />
                </linearGradient>
                <linearGradient id="defend-wood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffd24a" />
                  <stop offset="100%" stopColor="#ff9f1a" />
                </linearGradient>
                <linearGradient id="defend-gold-roof" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fff6b8" />
                  <stop offset="100%" stopColor="#ff9f1a" />
                </linearGradient>
                <radialGradient id="defend-moon-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fff6d4" stopOpacity="1" />
                  <stop offset="55%" stopColor="#ffcc33" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ff5a7a" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="defend-pool" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffcc33" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#ff5a7a" stopOpacity="0" />
                </radialGradient>
                <clipPath id="defend-face-clip" clipPathUnits="objectBoundingBox">
                  <circle cx="0.5" cy="0.5" r="0.36" />
                </clipPath>
                <filter id="defend-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <rect width="640" height="420" fill="url(#defend-dusk)" />
              <ellipse cx="320" cy="198" rx="280" ry="28" fill="#ffcc33" opacity="0.28" />
              <circle cx="548" cy="48" r="32" fill="url(#defend-moon-glow)" />
              <circle cx="548" cy="48" r="9" fill="#fff6d8" />
              <g className="defend-stars">
                <circle cx="72" cy="42" r="1.6" />
                <circle cx="118" cy="28" r="1.2" />
                <circle cx="510" cy="36" r="1.5" />
                <circle cx="430" cy="22" r="1.3" />
                <circle cx="300" cy="34" r="1.1" />
                <circle cx="196" cy="50" r="1.1" />
                <circle cx="248" cy="20" r="0.9" />
                <circle cx="390" cy="54" r="1.2" />
                <circle cx="88" cy="68" r="0.8" />
              </g>
              <path
                className="defend-ridge"
                d="M-20 210 L80 120 160 168 250 96 340 150 430 78 520 130 660 70 V230 H-20 Z"
                fill="url(#defend-ridge)"
                opacity="0.92"
              />
              <path d="M-20 248 L40 200 120 228 210 176 300 214 410 168 500 206 660 150 V430 H-20 Z" fill="#3dcc7a" opacity="0.55" />
              <g className="defend-windows">
                <circle cx="156" cy="214" r="1.8" />
                <circle cx="248" cy="198" r="1.5" />
                <circle cx="364" cy="188" r="1.6" />
                <circle cx="476" cy="196" r="1.4" />
              </g>
              <ellipse className="defend-canopy" cx="96" cy="268" rx="28" ry="16" />
              <ellipse className="defend-canopy" cx="214" cy="252" rx="22" ry="13" />
              <ellipse className="defend-canopy" cx="402" cy="246" rx="24" ry="14" />
              <ellipse className="defend-canopy" cx="528" cy="258" rx="20" ry="12" />
              <path
                className="defend-road-bed"
                d="M70 310 C 140 300, 200 280, 280 292 C 360 304, 430 286, 560 300"
              />
              <path
                className="defend-road"
                d="M70 310 C 140 300, 200 280, 280 292 C 360 304, 430 286, 560 300"
              />
              <path
                className="defend-road-shine"
                d="M70 310 C 140 300, 200 280, 280 292 C 360 304, 430 286, 560 300"
              />
              <path
                className="defend-heaven-path"
                d="M280 292 C 400 210, 500 90, 572 36"
              />
              <g className="defend-heaven" transform={`translate(${HEAVEN_POINT.x} ${HEAVEN_POINT.y})`}>
                <circle className="defend-heaven-glow" r="36" />
                <path className="defend-heaven-wall" d="M-28 14 l12-16 10 8 8-12 10 8 10-10 10 14 v16 H-28 Z" />
                <path className="defend-heaven-gate" d="M-6 22 v-12 a6 8 0 0 1 12 0 v12" />
                <text className="defend-heaven-label" y="-22" textAnchor="middle">
                  City of Heaven
                </text>
              </g>
              <path d="M-10 368 Q 180 340 320 358 T 660 372 V430 H-10 Z" fill="#148a48" />
              <g className="defend-porch" transform="translate(564 292)">
                <path d="M-20 22 h40 l5 7 H-25 Z" />
                <rect x="-16" y="-4" width="32" height="26" rx="2" />
                <rect className="defend-porch-window" x="-5" y="4" width="10" height="9" rx="1" />
              </g>
              {easyTap ? null : (
              <g className="defend-gate" transform={`translate(${DEFEND_PATH[0].x} ${DEFEND_PATH[0].y})`}>
                <path d="M-10 6 V-16 M10 6 V-16" />
                <path d="M-12 -16 H12" />
              </g>
              )}
              {easyTap
                ? null
                : pads.map((id) => {
                const at = DEFEND_ANCHOR[id]
                const on = planted.includes(id)
                const stage = padStage(id, progress)
                const plot = CITY_PLOTS.find((item) => item.id === id)
                const hot =
                  phase === 'wave' &&
                  on &&
                  raiders.some(
                    (raider) =>
                      !raider.turned &&
                      dist(at, raiderAt(raider)) <=
                        abilityRange(unlocked.includes(ability) ? ability : 'love', stage, progress),
                  )
                return (
                  <g
                    key={id}
                    data-person-node="pad"
                    className={`defend-pad is-${stage} ${on ? 'is-planted' : ''} ${hot ? 'is-hot' : ''} ${flash === id ? 'is-flash' : ''}`}
                    transform={`translate(${at.x} ${at.y})`}
                    role="button"
                    tabIndex={0}
                    aria-label={
                      phase === 'plant'
                        ? `${on ? 'Pull' : 'Plant'} lamp at ${plot?.title ?? id}`
                        : `Fire ${plot?.title ?? id}`
                    }
                    onClick={(event) => {
                      event.stopPropagation()
                      if (phase === 'plant') togglePad(id)
                      else fire(id)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        if (phase === 'plant') togglePad(id)
                        else fire(id)
                      }
                    }}
                  >
                    <circle className="defend-hit" r="38" />
                    <ellipse className="defend-earth" cx="0" cy="10" rx="15" ry="6" />
                    {on ? (
                      <>
                        <ellipse className="defend-pool" cx="0" cy="12" rx={hot ? 30 : 20} ry={hot ? 11 : 7} />
                        <path className="defend-post" d="M-2.4 10 V-18 H2.4 V10 Z" fill="url(#defend-wood)" />
                        <path className="defend-lantern-roof" d="M-8 -18 l8 -7 8 7 Z" fill="url(#defend-gold-roof)" />
                        <rect className="defend-lantern" x="-6.5" y="-18" width="13" height="11" rx="2" />
                        <circle className="defend-lamp" cx="0" cy="-13" r="4.6" />
                        {hot ? <circle className="defend-hot-halo" r="27" /> : null}
                      </>
                    ) : (
                      <>
                        <circle className="defend-ring" r="16" />
                        <path className="defend-post is-empty" d="M-1.6 8 V-8 H1.6 V8 Z" />
                      </>
                    )}
                  </g>
                )
              })}
              {shots.map((shot) => (
                <g className="defend-shot" key={shot.key}>
                  <line
                    className="defend-beam"
                    x1={shot.from.x}
                    y1={shot.from.y}
                    x2={shot.to.x}
                    y2={shot.to.y}
                  />
                  <circle className="defend-impact" cx={shot.to.x} cy={shot.to.y} r="22" />
                </g>
              ))}
              {easy
                ? null
                : raiders.map((raider) => {
                const at = raiderAt(raider)
                return (
                  <g
                    key={raider.id}
                    className={`defend-raider ${raider.turned ? 'is-turned' : ''}`}
                    transform={`translate(${at.x} ${at.y})`}
                  >
                    <ellipse className="defend-raider-shadow" cy={12} rx={13} ry={4.6} />
                    <image
                      className="defend-raider-face"
                      href={walkerSrc(raider.kind)}
                      x={-18}
                      y={-24}
                      width={36}
                      height={36}
                      clipPath="url(#defend-face-clip)"
                    />
                    {raider.turned ? (
                      <g className="defend-heaven-cheer" aria-hidden>
                        <circle className="defend-cheer-spark" cx="-10" cy="-18" r="2.2" />
                        <circle className="defend-cheer-spark is-2" cx="12" cy="-20" r="1.8" />
                        <circle className="defend-cheer-spark is-3" cx="2" cy="-26" r="1.4" />
                      </g>
                    ) : null}
                    <g className="defend-raider-call">
                      <rect x={-40} y={-42} width={80} height={28} rx="8" />
                      <text className="defend-raider-kind" y={-32} textAnchor="middle">
                        {WALKER_LABEL[raider.kind]}
                      </text>
                      <text y={-20} textAnchor="middle">
                        {raider.text}
                      </text>
                    </g>
                  </g>
                )
              })}
              {blasts.map((blast) => (
                <g key={blast.key} className="defend-blast" transform={`translate(${blast.x} ${blast.y})`}>
                  <circle className="defend-blast-ring" r="26" />
                  <circle className="defend-blast-core" r="10" />
                  <path className="defend-shard" d="M-2 -4 L4 -28 L8 -6 Z" />
                  <path className="defend-shard is-2" d="M4 2 L28 8 L8 8 Z" />
                  <path className="defend-shard is-3" d="M-4 4 L-26 16 L-8 8 Z" />
                  <path className="defend-shard is-4" d="M2 6 L10 26 L-2 10 Z" />
                  {!easy && blast.combo > 1 ? (
                    <text className="defend-combo-pop" y="-34" textAnchor="middle">
                      ×{blast.combo}
                    </text>
                  ) : null}
                  <text className="defend-blast-line" y="28" textAnchor="middle">
                    {blast.line}
                  </text>
                </g>
              ))}
            </svg>
            {easyTap && tapTarget && tapPos ? (
              <div className="easy-walkers" aria-label="Tap the walking person">
                <button
                  type="button"
                  data-person-node="walker"
                  className="easy-walker is-easy-walker is-cue"
                  style={{
                    left: tapPos.left,
                    top: tapPos.top,
                    width: EASY_WALKER_HIT_PX,
                    height: EASY_WALKER_HIT_PX,
                  }}
                  onClick={(event) => {
                    event.stopPropagation()
                    fireBest()
                  }}
                >
                  <span className="easy-walker-arrow" aria-hidden>
                    ▼
                  </span>
                  <span className="easy-walker-cue-label">{EASY.nightTap}</span>
                  <WalkerFace
                    kind={tapTarget.kind}
                    className="easy-walker-face"
                    style={{
                      width: EASY_WALKER_FACE_PX,
                      height: EASY_WALKER_FACE_PX,
                    }}
                  />
                </button>
              </div>
            ) : null}
          </div>
          {phase === 'plant' ? (
            <button
              type="button"
              className="btn primary xl defend-go"
              onClick={() => setPhase('wave')}
              disabled={planted.length < 1 || arming}
            >
              {easy ? EASY.nightDo : 'The road is coming'}
            </button>
          ) : null}
          {toolLock ? (
            <p className="match-toast" role="status">
              {toolLock}
            </p>
          ) : null}
          <div className="defend-abilities" role="group" aria-label="Night abilities">
            {WATCH_TOOLS.map((tool) => {
              const open = unlocked.includes(tool.id)
              const heldLine = learningForTool(progress, tool.id)
              const tier = toolTier(tool, progress)
              return (
                <button
                  key={tool.id}
                  type="button"
                  className={`defend-ability ${ability === tool.id ? 'is-on' : ''} ${open ? '' : 'is-locked'} ${firing && ability === tool.id ? 'is-firing' : ''}`}
                  aria-pressed={ability === tool.id}
                  onClick={() => {
                    if (open) {
                      setToolLock(null)
                      setAbility(tool.id)
                      return
                    }
                    setToolLock(
                      easy
                        ? EASY.nightMiss
                        : `${tool.label} is locked. Hold a matching line to deploy this tool.`,
                    )
                  }}
                >
                  <AbilityMark ability={tool.id} size="md" />
                  {tool.label}
                  {easyTap ? null : (
                    <span className="defend-ability-tier" aria-hidden>
                      {TIER_MARK[tier]}
                    </span>
                  )}
                  <span className="defend-ability-claim">
                    {open
                      ? tool.id === 'love'
                        ? loveHowTo(easy)
                        : heldLine
                          ? easy
                            ? easyFacingLine(heldLine.id, heldLine.claim)
                            : heldLine.claim
                          : easy
                            ? 'Keep a main idea to name this tool.'
                            : 'Hold a line to name this tool.'
                      : easy
                        ? 'Locked — tap the glowing face'
                        : 'Hold a matching line'}
                  </span>
                </button>
              )
            })}
          </div>
          {phase === 'lost' ? (
            <div className="defend-lost">
              <p>
                {easy
                  ? 'You missed. Tap the face.'
                  : 'Porch flickered. Turn them again.'}
              </p>
              <button type="button" className="btn primary" onClick={retry}>
                Try the night again
              </button>
            </div>
          ) : null}
          {easy ? (
            phase === 'lost' ? null : <p className="defend-tip">{EASY.nightTap}</p>
          ) : phase === 'wave' ? (
            <p className="defend-tip">
              Match the walker. Deploy the held argument — the wrong tool only nudges.
            </p>
          ) : (
            <p className="defend-tip">
              Learn · hold · deploy. Love is ready. Logic, reason, and science unlock as you keep lines.
            </p>
          )}
        </>
      )}
      <WinBurst play={won && !juiceDone} stamp="Night held!" />
    </main>
  )
}
