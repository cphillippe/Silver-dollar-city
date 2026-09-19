import { useEffect, useRef, useState } from 'react'
import { evidenceFor } from '../content/evidence'
import { WATCH_KICKER, WATCH_LEAD, WATCH_TITLE } from '../content/defend'
import { EASY, isEasy, loveHowTo } from '../lib/easy'
import { localDateKey } from '../lib/dates'
import {
  DEFEND_ANCHOR,
  DEFEND_BRIEF_ID,
  DEFEND_HEARTS,
  DEFEND_WAVE_SIZE,
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
  easyTapFit,
  easyTapMode,
  easyTapTarget,
  waveIsClear,
  type WatchAbility,
} from '../lib/defend'
import { learningForTool } from '../lib/learning'
import { toolTier, watchTool } from '../lib/watchTools'
import { useJuiceHandoff } from '../lib/juice'
import type { CityPlotId } from '../lib/city'
import { useProgress } from '../store/progress'
import type { View, WalkerKind } from '../types'
import { TownReturn } from './TownReturn'
import { WinBurst } from './challenges/WinBurst'
import { DefendAbilityBar } from './DefendAbilityBar'
import { DefendNightBoard } from './DefendNightBoard'

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
  const arming = false
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
            <DefendNightBoard
              boardRef={boardRef}
              shake={shake}
              won={won}
              phase={phase}
              fireBest={fireBest}
              easyTap={easyTap}
              pads={pads}
              planted={planted}
              progress={progress}
              raiders={raiders}
              raiderAt={raiderAt}
              ability={ability}
              unlocked={unlocked}
              flash={flash}
              togglePad={togglePad}
              fire={fire}
              shots={shots}
              easy={easy}
              blasts={blasts}
              tapTarget={tapTarget}
              tapPos={tapPos}
            />
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
          <DefendAbilityBar
            progress={progress}
            easy={easy}
            easyTap={easyTap}
            ability={ability}
            setAbility={setAbility}
            setToolLock={setToolLock}
            firing={firing}
            unlocked={unlocked}
          />
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
