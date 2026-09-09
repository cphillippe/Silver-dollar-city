import { useEffect, useRef, useState } from 'react'
import { evidenceFor } from '../content/evidence'
import { WATCH_KICKER, WATCH_LEAD, WATCH_TITLE } from '../content/defend'
import { STORY } from '../content/story'
import { localDateKey } from '../lib/dates'
import {
  DEFEND_ANCHOR,
  DEFEND_BRIEF_ID,
  DEFEND_HEARTS,
  DEFEND_PATH,
  DEFEND_WAVE_SIZE,
  RAID_LINES,
  defendPads,
  dist,
  padStage,
  pathPoint,
  towerCooldown,
  towerRange,
  waveSpawnEvery,
  waveSpeed,
} from '../lib/defend'
import { useJuiceHandoff } from '../lib/juice'
import { CITY_PLOTS, type CityPlotId } from '../lib/city'
import { useProgress } from '../store/progress'
import type { View } from '../types'
import { RecallGate } from './RecallGate'
import { TeachUnlock } from './TeachUnlock'
import { TownReturn } from './TownReturn'
import { WinBurst } from './challenges/WinBurst'

interface DefendScreenProps {
  onNavigate: (view: View) => void
}

interface Raider {
  id: number
  t: number
  text: string
}

export function DefendScreen({ onNavigate }: DefendScreenProps) {
  const { progress, recordNight, recordReview, markMiss } = useProgress()
  const today = localDateKey()
  const brief = evidenceFor(DEFEND_BRIEF_ID)
  const pads = defendPads(progress)
  const [taught, setTaught] = useState(false)
  const [arming, setArming] = useState(false)
  const [phase, setPhase] = useState<'plant' | 'wave' | 'lost'>('plant')
  const [planted, setPlanted] = useState<CityPlotId[]>(() => [...pads])
  const [hearts, setHearts] = useState(DEFEND_HEARTS)
  const [raiders, setRaiders] = useState<Raider[]>([])
  const [downed, setDowned] = useState(0)
  const [flash, setFlash] = useState<CityPlotId | null>(null)
  const [shot, setShot] = useState<{ key: number; from: { x: number; y: number }; to: { x: number; y: number } } | null>(
    null,
  )
  const [puffs, setPuffs] = useState<{ key: number; x: number; y: number }[]>([])
  const [won, setWon] = useState(false)
  const [recalled, setRecalled] = useState(false)
  const [missedNight, setMissedNight] = useState(false)
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
  })

  useEffect(() => {
    live.current.planted = planted
  }, [planted])

  useEffect(() => {
    if (!juiceDone || saved.current || !brief) return
    saved.current = true
    recordNight(today)
    recordReview({
      id: brief.id,
      pillar: 'parable-hollow',
      kind: 'encode',
      today,
      clean: !missedNight,
      peeked: false,
      elaborated: false,
    })
  }, [juiceDone, brief, missedNight, recordNight, recordReview, today])

  useEffect(() => {
    if (phase !== 'wave') return
    live.current.playing = true
    live.current.raiders = []
    live.current.spawned = 0
    live.current.downed = 0
    live.current.hearts = DEFEND_HEARTS
    live.current.cool = {}
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
      const next = live.current.raiders.map((item) => ({
        ...item,
        t: item.t + waveSpeed() * dt,
      }))
      let leaked = 0
      const walking = next.filter((item) => {
        if (item.t < 1) return true
        leaked += 1
        return false
      })
      if (leaked) {
        live.current.hearts = Math.max(0, live.current.hearts - leaked)
        setHearts(live.current.hearts)
        setMissedNight(true)
        markMissRef.current(DEFEND_BRIEF_ID)
      }
      if (
        live.current.spawned < DEFEND_WAVE_SIZE &&
        spawnAt >= waveSpawnEvery()
      ) {
        spawnAt = 0
        const id = live.current.spawned
        walking.push({
          id,
          t: 0,
          text: RAID_LINES[id % RAID_LINES.length],
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
      if (live.current.spawned >= DEFEND_WAVE_SIZE && walking.length === 0) {
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
  }, [phase])

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

  function fire(id: CityPlotId) {
    if (phase !== 'wave' || won) return
    const now = performance.now()
    const stage = padStage(id, progress)
    const wait = towerCooldown(stage)
    if ((live.current.cool[id] ?? 0) + wait > now) return
    const at = DEFEND_ANCHOR[id]
    const range = towerRange(stage)
    let best: Raider | null = null
    let bestD = range
    for (const raider of live.current.raiders) {
      const d = dist(at, pathPoint(raider.t))
      if (d <= bestD) {
        best = raider
        bestD = d
      }
    }
    live.current.cool[id] = now
    setFlash(id)
    window.setTimeout(() => setFlash(null), 280)
    if (!best) return
    const to = pathPoint(best.t)
    setShot({ key: now, from: { x: at.x, y: at.y - 16 }, to })
    setPuffs((current) => [...current.slice(-2), { key: now, x: to.x, y: to.y }])
    window.setTimeout(() => {
      setShot((current) => (current?.key === now ? null : current))
    }, 280)
    window.setTimeout(() => {
      setPuffs((current) => current.filter((item) => item.key !== now))
    }, 520)
    live.current.raiders = live.current.raiders.filter((item) => item.id !== best.id)
    live.current.downed += 1
    setRaiders(live.current.raiders)
    setDowned(live.current.downed)
    if (
      live.current.spawned >= DEFEND_WAVE_SIZE &&
      live.current.raiders.length === 0
    ) {
      live.current.playing = false
      setWon(true)
      afterJuice()
    }
  }

  function fireBest() {
    if (phase !== 'wave' || won) return
    let pick: CityPlotId | null = null
    let bestD = Infinity
    for (const id of live.current.planted) {
      const at = DEFEND_ANCHOR[id]
      const range = towerRange(padStage(id, progress))
      for (const raider of live.current.raiders) {
        const d = dist(at, pathPoint(raider.t))
        if (d <= range && d < bestD) {
          bestD = d
          pick = id
        }
      }
    }
    if (pick) fire(pick)
  }

  function retry() {
    setPhase('plant')
    setWon(false)
    setRaiders([])
    setDowned(0)
    setHearts(DEFEND_HEARTS)
    saved.current = false
  }

  if (!brief) {
    return (
      <main className="page">
        <p>The night road is still being staked.</p>
      </main>
    )
  }

  const after = juiceDone && won

  return (
    <main
      className={`defend-page ${taught ? 'is-puzzle' : 'is-teach'} ${arming ? 'is-arming' : ''} ${won ? 'is-win' : ''}`}
      aria-label={WATCH_TITLE}
    >
      {!taught ? (
        <TeachUnlock
          brief={brief}
          kind="sort"
          unlock="Unlock the lamps"
          onUnlock={() => {
            setTaught(true)
            setArming(true)
            window.setTimeout(() => setArming(false), 360)
          }}
        />
      ) : after && !recalled ? (
        <RecallGate
          brief={brief}
          kicker={STORY.takeaway}
          mode="encode"
          onHeld={() => setRecalled(true)}
        />
      ) : after && recalled ? (
        <TownReturn
          who="juniper"
          line="The lamps held. See what the street remembered."
          action="See the town"
          onGo={() => onNavigate({ name: 'hub' })}
        />
      ) : (
        <>
          <p className="eyebrow">{WATCH_KICKER}</p>
          <h1 className="defend-title">{WATCH_LEAD}</h1>
          <div className="defend-frame">
            <p className="defend-hud" aria-live="polite">
              <span className="defend-hearts">
                {Array.from({ length: DEFEND_HEARTS }, (_, index) => (
                  <span key={index} className={index < hearts ? 'is-on' : ''}>
                    ♥
                  </span>
                ))}
              </span>
              <span className="defend-count">
                {phase === 'wave'
                  ? `${downed}/${DEFEND_WAVE_SIZE} down`
                  : `${planted.length} lamp${planted.length === 1 ? '' : 's'}`}
              </span>
            </p>
            <svg
              className="defend-board"
              viewBox="0 0 640 420"
              role="img"
              aria-label="Night road through Silver City"
              onClick={() => {
                if (phase === 'wave') fireBest()
              }}
            >
              <defs>
                <linearGradient id="defend-dusk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1a2240" />
                  <stop offset="38%" stopColor="#243044" />
                  <stop offset="72%" stopColor="#5a3a24" />
                  <stop offset="100%" stopColor="#8a5428" />
                </linearGradient>
                <linearGradient id="defend-ridge" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3a4830" />
                  <stop offset="100%" stopColor="#1c2418" />
                </linearGradient>
                <linearGradient id="defend-wood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4a06a" />
                  <stop offset="100%" stopColor="#8a562c" />
                </linearGradient>
                <linearGradient id="defend-gold-roof" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffe9a8" />
                  <stop offset="100%" stopColor="#b8862e" />
                </linearGradient>
                <radialGradient id="defend-moon-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fff6d4" stopOpacity="0.9" />
                  <stop offset="55%" stopColor="#f4e8c4" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#f4e8c4" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="defend-pool" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffe08a" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#ffe08a" stopOpacity="0" />
                </radialGradient>
                <filter id="defend-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <rect width="640" height="420" fill="url(#defend-dusk)" />
              <ellipse cx="320" cy="198" rx="280" ry="28" fill="#c4783a" opacity="0.22" />
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
              <path d="M-20 248 L40 200 120 228 210 176 300 214 410 168 500 206 660 150 V430 H-20 Z" fill="#1a2014" />
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
              <path d="M-10 368 Q 180 340 320 358 T 660 372 V430 H-10 Z" fill="#14180e" />
              <g className="defend-gate" transform={`translate(${DEFEND_PATH[0].x} ${DEFEND_PATH[0].y})`}>
                <path d="M-10 6 V-16 M10 6 V-16" />
                <path d="M-12 -16 H12" />
              </g>
              {pads.map((id) => {
                const at = DEFEND_ANCHOR[id]
                const on = planted.includes(id)
                const stage = padStage(id, progress)
                const plot = CITY_PLOTS.find((item) => item.id === id)
                const hot =
                  phase === 'wave' &&
                  on &&
                  raiders.some(
                    (raider) => dist(at, pathPoint(raider.t)) <= towerRange(stage),
                  )
                return (
                  <g
                    key={id}
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
                    <circle className="defend-hit" r="34" />
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
              {shot ? (
                <g className="defend-shot" key={shot.key}>
                  <line
                    className="defend-beam"
                    x1={shot.from.x}
                    y1={shot.from.y}
                    x2={shot.to.x}
                    y2={shot.to.y}
                  />
                  <circle className="defend-impact" cx={shot.to.x} cy={shot.to.y} r="16" />
                </g>
              ) : null}
              {raiders.map((raider) => {
                const at = pathPoint(raider.t)
                return (
                  <g key={raider.id} className="defend-raider" transform={`translate(${at.x} ${at.y})`}>
                    <ellipse className="defend-raider-shadow" cy="8" rx="9" ry="3.4" />
                    <path className="defend-raider-cloak" d="M-7.5 8 Q0 11 7.5 8 L3.2 -1 Q0 -7 -3.2 -1 Z" />
                    <circle className="defend-raider-head" cy="-7" r="4.3" />
                  </g>
                )
              })}
              {puffs.map((puff) => (
                <g key={puff.key} className="defend-puff" transform={`translate(${puff.x} ${puff.y})`}>
                  <circle r="3" cx="-6" cy="-4" />
                  <circle r="4" cx="2" cy="-10" />
                  <circle r="2.4" cx="8" cy="-2" />
                </g>
              ))}
            </svg>
          </div>
          {phase === 'plant' ? (
            <button
              type="button"
              className="btn primary xl"
              onClick={() => setPhase('wave')}
              disabled={planted.length < 1 || arming}
            >
              The road is coming
            </button>
          ) : null}
          {phase === 'lost' ? (
            <div className="defend-lost">
              <p>The porch flickered. Plant again — the claim still stands.</p>
              <button type="button" className="btn primary" onClick={retry}>
                Try the night again
              </button>
            </div>
          ) : null}
          {phase === 'wave' ? (
            <p className="defend-tip">
              {raiders[0]
                ? `“${raiders[0].text}” · tap the road or a lamp.`
                : 'Tap the road or a lamp when a cheap line is near.'}
            </p>
          ) : (
            <p className="defend-tip">Built lots hold lamps. Empty lots cannot.</p>
          )}
        </>
      )}
      <WinBurst play={won && !juiceDone} />
    </main>
  )
}
