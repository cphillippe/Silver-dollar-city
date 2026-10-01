import { useEffect, useRef, useState } from 'react'
import { evidenceFor } from '../content/evidence'
import {
  ANGEL_STICKER,
  HARD_PLANT_TIP,
  HARD_WAVE_TIP,
  WATCH_KICKER,
  WATCH_LEAD,
  WATCH_TITLE,
} from '../content/defend'
import { EASY, isEasy, loveHowTo } from '../lib/easy'
import { localDateKey } from '../lib/dates'
import {
  DEFEND_BRIEF_ID,
  DEFEND_HEARTS,
  DEFEND_NIGHT_WAVES,
  WATCH_ABILITY_LABEL,
  dist,
  unlockedWatchAbilities,
  easyTapMode,
  waveCombat,
  wavePackSize,
  type WatchAbility,
} from '../lib/defend'
import { learningForTool } from '../lib/learning'
import { applyBoost, combatTier, freshRunTier } from '../lib/watchTools'
import { useJuiceHandoff } from '../lib/juice'
import type { CityPlotId } from '../lib/city'
import {
  CoinRead,
  MoneyBalloon,
  UiShell,
  boardPoint as mapBoardPoint,
  boardViewBox,
  nightEnemies,
  nightTowers,
  type NightBlast as Blast,
  type NightPhase,
  type NightRaider as Raider,
  type NightShot as Shot,
} from '../nightWatch'
import { insightScore, useProgress } from '../store/progress'
import type { View } from '../types'
import { TownReturn } from './TownReturn'
import { WinBurst } from './challenges/WinBurst'
import { DefendAbilityBar } from './DefendAbilityBar'
import { DefendNightBoard } from './DefendNightBoard'
import type { EasyTapJuice, EasyWalkerCall } from './DefendNightActors'

interface DefendScreenProps {
  onNavigate: (view: View) => void
}

export function DefendScreen({ onNavigate }: DefendScreenProps) {
  const { progress, recordNight, markMet, markMiss } = useProgress()
  const easy = isEasy(progress)
  const today = localDateKey()
  const brief = evidenceFor(DEFEND_BRIEF_ID)
  const pads = nightTowers.pads(progress)
  const unlocked = unlockedWatchAbilities(progress)
  const [ability, setAbility] = useState<WatchAbility>(() => unlocked[0] ?? 'love')
  const taught = true
  const boardRef = useRef<SVGSVGElement>(null)
  const [boardBox, setBoardBox] = useState({ w: 640, h: 420 })
  const [toolLock, setToolLock] = useState<string | null>(null)
  const arming = false
  const [phase, setPhase] = useState<NightPhase>(easy ? 'wave' : 'plant')
  const [waveIndex, setWaveIndex] = useState(0)
  const [runTier, setRunTier] = useState<Record<string, number>>(freshRunTier)
  const [runSparks, setRunSparks] = useState(0)
  const [boostNote, setBoostNote] = useState<string | null>(null)
  const [loreMeet, setLoreMeet] = useState<{ id: string; line: string } | null>(null)
  const runTierRef = useRef(runTier)
  runTierRef.current = runTier
  const waveIndexRef = useRef(waveIndex)
  waveIndexRef.current = waveIndex
  const metRef = useRef<string[]>([...(progress.defense.met ?? [])])
  const markMetRef = useRef(markMet)
  markMetRef.current = markMet
  const [planted, setPlanted] = useState<CityPlotId[]>(() => [...pads])
  const [hearts, setHearts] = useState(DEFEND_HEARTS)
  const [raiders, setRaiders] = useState<Raider[]>([])
  const [downed, setDowned] = useState(0)
  const [flash, setFlash] = useState<CityPlotId | null>(null)
  const [shots, setShots] = useState<Shot[]>([])
  const [blasts, setBlasts] = useState<Blast[]>([])
  const [tapJuice, setTapJuice] = useState<EasyTapJuice | null>(null)
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
    const saved = progress.defense.met ?? []
    for (const id of saved) {
      if (!metRef.current.includes(id)) metRef.current = [...metRef.current, id]
    }
  }, [progress.defense.met])

  useEffect(() => {
    if (phase !== 'wave') return
    const wave = waveIndexRef.current
    const tune = waveCombat(wave, easy)
    const cleared = progress.defense.cleared
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
      const next = live.current.raiders.map((item) => {
        if (item.turned) {
          const tier = combatTier(item.turned, runTierRef.current)
          return { ...item, heavenT: (item.heavenT ?? 0) + nightEnemies.heavenSpeed(tier, easy) * dt }
        }
        return { ...item, t: item.t + nightEnemies.speed(easy) * tune.speedScale * dt }
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
      const unturnedLive = walking.filter((item) => !item.turned).length
      const holdSpawn = easy && nightEnemies.holdSpawn(unturnedLive)
      if (
        live.current.spawned < tune.size &&
        !holdSpawn &&
        (live.current.spawnNow ||
          spawnAt >= nightEnemies.spawnEvery(easy) * tune.spawnScale ||
          (easy && live.current.spawned === 0))
      ) {
        live.current.spawnNow = false
        spawnAt = 0
        const id = live.current.spawned
        const cast = nightEnemies.cast(cleared, id, wave)
        const hp = nightEnemies.maxHp(cast.kind, easy) + tune.hpBonus
        if (!metRef.current.includes(cast.id)) {
          metRef.current = [...metRef.current, cast.id]
          markMetRef.current(cast.id)
          const line = `${cast.label}: ${cast.lore}`
          setLoreMeet({ id: cast.id, line })
          window.setTimeout(() => {
            setLoreMeet((current) => (current?.id === cast.id ? null : current))
          }, 2200)
        }
        walking.push({
          id,
          t: easy ? nightEnemies.spawnT(id) : 0,
          text: cast.text,
          kind: cast.kind,
          label: cast.label,
          castId: cast.id,
          hp,
          maxHp: hp,
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
      if (
        nightEnemies.isClear(
          easy,
          live.current.downed,
          live.current.spawned,
          walking.length,
          tune.size,
        )
      ) {
        live.current.playing = false
        setPhase('boost')
        return
      }
      if (
        easy &&
        live.current.spawned >= tune.size &&
        walking.length === 0 &&
        live.current.downed < tune.size
      ) {
        live.current.playing = false
        setPhase('lost')
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
    return nightEnemies.at(raider)
  }

  function fire(id: CityPlotId, forceRaiderId?: number) {
    if (phase !== 'wave' || won) return
    const now = performance.now()
    const wait = nightTowers.cooldown(id, progress)
    if ((live.current.cool[id] ?? 0) + wait > now) return
    const at = nightTowers.anchor(id)
    const using = unlocked.includes(ability) ? ability : 'love'
    const tier = combatTier(using, runTier)
    const range = nightTowers.range(id, using, progress, runTier)
    let best: Raider | null = null
    if (forceRaiderId !== undefined) {
      const forced = live.current.raiders.find((item) => item.id === forceRaiderId && !item.turned)
      if (forced && dist(at, raiderAt(forced)) <= range) best = forced
    } else {
      let bestD = range
      for (const raider of live.current.raiders) {
        if (raider.turned) continue
        const d = dist(at, raiderAt(raider))
        if (d <= bestD) {
          best = raider
          bestD = d
        }
      }
    }
    live.current.cool[id] = now
    setFlash(id)
    setFiring(true)
    window.setTimeout(() => setFlash(null), 280)
    window.setTimeout(() => setFiring(false), 220)
    if (!best) return
    const to = raiderAt(best)
    const fit = nightEnemies.fit(easy, using, best.kind)
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
          ? '+'
          : 'Try Love'
        : fit === 'match'
          ? (heldLine
              ? heldLine.claim
              : `${WATCH_ABILITY_LABEL[using]} matches`)
          : `${WATCH_ABILITY_LABEL[using]} is weak here`,
      combo: nextCombo,
    }
    setShots((current) => [...current.slice(-3), { key: now, from: nightTowers.muzzle(id), to }])
    setBlasts((current) => [...current.slice(-3), blast])
    window.setTimeout(() => {
      setShots((current) => current.filter((item) => item.key !== now))
    }, 280)
    window.setTimeout(() => {
      setBlasts((current) => current.filter((item) => item.key !== now))
    }, 620)
    if (fit === 'match') {
      const struck = nightEnemies.hit(best, tier)
      if (easy) {
        const juiceAt = boardPoint(to.x, to.y)
        setTapJuice({
          key: now,
          combo: nextCombo,
          left: juiceAt.left,
          top: juiceAt.top,
          kind: best.kind,
          down: struck.down,
        })
        window.setTimeout(() => {
          setTapJuice((current) => (current?.key === now ? null : current))
        }, 620)
      }
      live.current.raiders = live.current.raiders.map((item) =>
        item.id !== best.id
          ? item
          : struck.down
            ? { ...struck.raider, turned: using, from: to, heavenT: 0, text: 'Toward heaven' }
            : struck.raider,
      )
      if (struck.down) {
        live.current.downed += 1
        setRunSparks((count) => count + 1)
        if (easy) live.current.spawnNow = true
      }
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

  function fireAtRaider(raiderId: number) {
    if (phase !== 'wave' || won) return
    let pick: CityPlotId | null = null
    let bestD = Infinity
    const raider = live.current.raiders.find((item) => item.id === raiderId && !item.turned)
    if (!raider) return
    for (const id of live.current.planted) {
      const at = nightTowers.anchor(id)
      const range = nightTowers.range(
        id,
        unlocked.includes(ability) ? ability : 'love',
        progress,
        runTier,
      )
      const d = dist(at, raiderAt(raider))
      if (d <= range && d < bestD) {
        bestD = d
        pick = id
      }
    }
    if (pick) fire(pick, raiderId)
    else if (easy) setToolLock(EASY.nightMiss)
  }

  function fireBest() {
    if (phase !== 'wave' || won) return
    let pick: CityPlotId | null = null
    let bestD = Infinity
    for (const id of live.current.planted) {
      const at = nightTowers.anchor(id)
      const range = nightTowers.range(
        id,
        unlocked.includes(ability) ? ability : 'love',
        progress,
        runTier,
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
    setTapJuice(null)
    setRunTier(freshRunTier())
    setRunSparks(0)
    setBoostNote(null)
    setWaveIndex(0)
    setLoreMeet(null)
    saved.current = false
  }

  function boostTool(id: WatchAbility) {
    const next = applyBoost(id, runTier, runSparks)
    setBoostNote(next.note)
    if (!next.ok) return
    setRunTier(next.runTier)
    setRunSparks(next.sparks)
    setToolLock(null)
  }

  function continueFromBoost() {
    if (won || phase !== 'boost') return
    setBoostNote(null)
    setLoreMeet(null)
    if (waveIndex + 1 < DEFEND_NIGHT_WAVES) {
      setWaveIndex((i) => i + 1)
      setPhase('wave')
      return
    }
    setWon(true)
    afterJuice()
  }

  if (!brief) {
    return (
      <main className="page">
        <p>The night road is still being staked.</p>
      </main>
    )
  }

  function boardPoint(x: number, y: number) {
    return mapBoardPoint(boardBox, { x, y })
  }

  const after = juiceDone && won
  const easyTap = easyTapMode(easy, phase, won)
  const tapTarget = easyTap ? nightEnemies.cueTarget(raiders) : undefined
  const tapPos = tapTarget ? boardPoint(raiderAt(tapTarget).x, raiderAt(tapTarget).y) : null
  const midWave = phase === 'wave' && !won
  const walkerCalls: EasyWalkerCall[] = midWave
    ? raiders
        .filter((raider) => !raider.turned)
        .map((raider) => ({
          id: raider.id,
          kind: raider.kind,
          text: raider.text,
          label: raider.label,
          fresh: raider.castId !== undefined && raider.castId === loreMeet?.id,
        }))
    : []

  const waveSize = wavePackSize(waveIndex)
  const remaining = waveSize - downed
  const boosting = phase === 'boost' && !won

  const hud = (
    <p className="defend-hud" aria-live="polite">
      {phase === 'wave' ? (
        <span className="defend-wave">
          Wave {waveIndex + 1}/{DEFEND_NIGHT_WAVES}
        </span>
      ) : null}
      <span className="defend-hearts">
        {Array.from({ length: DEFEND_HEARTS }, (_, index) => (
          <span key={index} className={index < hearts ? 'is-on' : ''}>
            ♥
          </span>
        ))}
      </span>
      <span className={`defend-count ${combo > 1 ? 'is-combo' : ''}`}>
        {phase === 'boost'
          ? 'Level up'
          : phase === 'wave'
            ? easy
              ? combo > 1
                ? `×${combo}  ${remaining} left`
                : `TAP ${remaining} left`
              : combo > 1
                ? `×${combo}  ${remaining} left`
                : `${remaining} left · TAP`
            : `${planted.length} lamp${planted.length === 1 ? '' : 's'}`}
      </span>
    </p>
  )

  const tip = easy ? null : phase === 'wave' ? HARD_WAVE_TIP : phase === 'plant' ? HARD_PLANT_TIP : null

  const docks = (
    <>
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
      {phase === 'boost' && !won ? (
        <div className="defend-boost">
          <p role="status">
            {`Wave ${waveIndex + 1} clear · spend sparks`}
            {boostNote ? ` · ${boostNote}` : ''}
          </p>
          <button type="button" className="btn primary" onClick={continueFromBoost}>
            Continue
          </button>
        </div>
      ) : null}
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
      {tip ? <p className="defend-tip">{tip}</p> : null}
      <p className="defend-angel-help" aria-hidden="true">
        {ANGEL_STICKER}
      </p>
    </>
  )

  const rail = (
    <DefendAbilityBar
      progress={progress}
      easy={easy}
      ability={ability}
      setAbility={setAbility}
      setToolLock={setToolLock}
      firing={firing}
      unlocked={unlocked}
      runTier={runTier}
      boosting={boosting}
      onBoost={boostTool}
    />
  )

  return (
    <main
      className={`defend-page ${taught ? 'is-puzzle' : 'is-teach'} ${arming ? 'is-arming' : ''} ${won ? 'is-win' : ''} ${shake ? 'is-shake' : ''} ${leakFlash ? 'is-leak' : ''} ${firing ? 'is-firing' : ''} ${easy ? 'is-easy-watch' : ''} ${easyTap ? 'is-easy-tap' : ''}`}
      aria-label={WATCH_TITLE}
    >
      {after ? (
        <>
          <article className="stored-line" aria-label={easy ? 'How to pray Love' : 'Love tip'}>
            <p className="eyebrow">{easy ? 'How to pray Love' : 'Love tip'}</p>
            <p className="stored-claim">{loveHowTo(easy)}</p>
            {easy ? <p className="quiet">{EASY.nightTap}</p> : null}
          </article>
          <TownReturn
            who="juniper"
            line={
              easy
                ? 'Night held. Five waves.'
                : 'Night held. The road turned toward heaven.'
            }
            action={easy ? EASY.home : 'See the town'}
            onGo={() => onNavigate({ name: 'hub' })}
          />
        </>
      ) : (
        <>
          {easy ? (
            <h1 className="nw-sr-only">{EASY.nightLead}</h1>
          ) : (
            <>
              <p className="eyebrow">{WATCH_KICKER}</p>
              <h1 className="defend-title">
                {phase === 'wave'
                  ? 'Turn them toward heaven.'
                  : phase === 'boost'
                    ? 'Spend sparks. Tap a tool.'
                    : WATCH_LEAD}
              </h1>
            </>
          )}
          <UiShell
            shake={shake}
            won={won}
            hud={hud}
            coin={<CoinRead count={insightScore(progress)} label="Insight" />}
            balloon={<MoneyBalloon count={runSparks} label="Sparks" />}
            rail={rail}
            docks={docks}
          >
            <DefendNightBoard
              boardRef={boardRef}
              viewBox={boardViewBox(boardBox)}
              shake={shake}
              won={won}
              phase={phase}
              fireBest={fireBest}
              fireAtRaider={fireAtRaider}
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
              tapJuice={tapJuice}
              walkerCalls={walkerCalls}
              loreLine={loreMeet?.line ?? null}
              runTier={runTier}
            />
          </UiShell>
        </>
      )}
      <WinBurst play={won && !juiceDone} stamp="Night held!" />
    </main>
  )
}
