import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
import { roundMark, easyRound } from '../nightWatch/rounds'
import { gaitForSlot, walkerHp, walkerPace, walkerSpark } from '../nightWatch/walkers'
import { localDateKey } from '../lib/dates'
import {
  DEFEND_BRIEF_ID,
  DEFEND_HEARTS,
  nightLength,
  applyEasyPaceLeaks,
  applyGateLeaks,
  cueTapStrike,
  easyClearHeart,
  easyGlowTapDamage,
  easyRoundHeartCap,
  WATCH_ABILITY_LABEL,
  dist,
  unlockedWatchAbilities,
  easyTapMode,
  EASY_MISS_HOLD_MS,
  faceTapStrike,
  PATH_WALKER_FACE_DY,
  waveCombat,
  type WatchAbility,
} from '../lib/defend'
import { learningForTool } from '../lib/learning'
import { KIT_LABEL, STILL_MS, useStill, unturnedStep, type KitId } from '../lib/nightKits'
import {
  MEND_SHIELD_MS,
  SKILL_COOLDOWN_MS,
  SKILL_UNLOCK_WAVE,
  mendPower,
  skillUnlockOnWave,
  skillUnlocked,
} from '../lib/nightSkills'
import {
  PACE_UNLOCK_WAVE,
  paceScale,
  paceUnlocked,
  pacedCooldown,
  pacedDt,
} from '../lib/nightPace'
import {
  nightWatchDebugFrozen,
  readNightWatchDebug,
  readNightWatchRoundJump,
} from '../lib/nightWatchDebug'
import { FarHillsUnlock } from './FarHillsUnlock'
import {
  clientToMap,
  commitLamp,
  dragGhostClient,
  hudCoversPoint,
  overTowerCards,
  previewLamp,
  type LampPreview,
} from '../lib/lampPlace'
import {
  EASY_PLANT_PADS,
  lampUpgradeTool,
  nightPlantTypes,
  plantType,
  lampPullRefund,
  pullPlant,
  selectUpgradeLamp,
  starterPlants,
  UPGRADE_GHOST_MS,
  UPGRADE_TAP_ECHO_MS,
  upgradeSpendAllowed,
} from '../lib/nightPlants'
import { applyBoost, buyExtraLamp, combatTier, EASY_LAMP_COST, freshRunTier } from '../lib/watchTools'
import {
  applyPathStep,
  freshRunPaths,
  lampStrike,
  pathsOf,
  type TreePath,
} from '../nightWatch/upgradeTree'
import { useJuiceHandoff } from '../lib/juice'
import type { CityPlotId } from '../lib/city'
import {
  CoinRead,
  MoneyBalloon,
  UiShell,
  boardFillBox,
  boardFillPoint,
  boardPoint as mapBoardPoint,
  boardViewBox,
  nightEnemies,
  nightTowers,
  lampReadyToFire,
  SHOT_JUICE_MS,
  sparkAwardForHit,
  type NightBlast as Blast,
  type NightPhase,
  type NightRaider as Raider,
  type NightShot as Shot,
} from '../nightWatch'
import { insightScore, useProgress } from '../store/progress'
import type { View } from '../types'
import { TownReturn } from './TownReturn'
import { WinBurst } from './challenges/WinBurst'
import { DefendAbilityBar, type LampDragPhase } from './DefendAbilityBar'
import { DefendNightBoard } from './DefendNightBoard'
import { NightPaceControl } from './NightPaceControl'
import { NightSkillSplash } from './NightSkillSplash'
import { NightSkillTray } from './NightSkillTray'
import type { EasyTapJuice, EasyWalkerCall } from './DefendNightActors'

interface DefendScreenProps {
  onNavigate: (view: View) => void
}

/** 1.4.375: how long the lamp level-up burst, roman bump, and −1✦ stay readable. */
const LEVEL_BURST_MS = 1100

/** Easy SE chrome (1.4.379). Same cutoff as the phone rules in defend.css. */
const PHONE_SE = '(max-width: 480px)'

function usePhoneSe() {
  const [phone, setPhone] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(PHONE_SE).matches,
  )
  useEffect(() => {
    const media = window.matchMedia(PHONE_SE)
    const sync = () => setPhone(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])
  return phone
}

export function DefendScreen({ onNavigate }: DefendScreenProps) {
  const { progress, recordNight, markMet, markMiss } = useProgress()
  const easy = isEasy(progress)
  const phoneSe = usePhoneSe()
  const plateFill = easy && phoneSe
  const today = localDateKey()
  const brief = evidenceFor(DEFEND_BRIEF_ID)
  const trailOpen = unlockedWatchAbilities(progress)
  const unlocked = nightPlantTypes(easy, trailOpen)
  const pads: CityPlotId[] = easy ? [...EASY_PLANT_PADS] : nightTowers.pads(progress)
  const [ability, setAbility] = useState<WatchAbility>(() => unlocked[0] ?? 'love')
  const taught = true
  const boardRef = useRef<SVGSVGElement>(null)
  const [boardBox, setBoardBox] = useState({ w: 0, h: 0 })
  const [toolLock, setToolLock] = useState<string | null>(null)
  const arming = false
  const [phase, setPhase] = useState<NightPhase>('plant')
  const [waveIndex, setWaveIndex] = useState(0)
  const [runTier, setRunTier] = useState<Record<string, number>>(freshRunTier)
  const [runPaths, setRunPaths] = useState(freshRunPaths)
  const [runSparks, setRunSparks] = useState(0)
  const [skillReady, setSkillReady] = useState<Record<KitId, number>>({ still: 0, mend: 0 })
  const [skillNow, setSkillNow] = useState(0)
  const [skillSplash, setSkillSplash] = useState<KitId | null>(null)
  const [fastOn, setFastOn] = useState(false)
  const [pulseId, setPulseId] = useState<KitId | null>(null)
  const [stillOn, setStillOn] = useState(false)
  const [mendOn, setMendOn] = useState(false)
  const [mendShield, setMendShield] = useState(false)
  const [powerBanner, setPowerBanner] = useState<string | null>(null)
  const [nwDebug, setNwDebug] = useState(() => readNightWatchDebug())
  const [debugPaused, setDebugPaused] = useState(false)
  const nwDebugRef = useRef(nwDebug)
  const debugPausedRef = useRef(debugPaused)
  nwDebugRef.current = nwDebug
  debugPausedRef.current = debugPaused
  const [boostNote, setBoostNote] = useState<string | null>(null)
  const [upgradeAt, setUpgradeAt] = useState<CityPlotId | null>(null)
  const upgradeAtRef = useRef<CityPlotId | null>(null)
  const upgradeTapRef = useRef<{ id: CityPlotId; at: number }>({ id: 'porch', at: -1e9 })
  /** Pointer is down on a path pip. Begin and Continue must not take that gesture. */
  const armedPathBuy = useRef<{ plotId: CityPlotId; path: TreePath } | null>(null)
  const pathBuyAt = useRef(0)
  const pathBuyStamp = useRef(0)
  const boostPathRef = useRef<(plotId: CityPlotId, path: TreePath, fromPip: boolean) => void>(() => {})
  const [upFlash, setUpFlash] = useState<CityPlotId | null>(null)
  const [levelBurst, setLevelBurst] = useState<{ plotId: CityPlotId; from: number; to: number } | null>(null)
  const [sparkSpend, setSparkSpend] = useState(false)
  const [sparkSpent, setSparkSpent] = useState(1)
  const [placeArm, setPlaceArm] = useState<WatchAbility | null>(null)
  const placeArmRef = useRef<WatchAbility | null>(null)
  placeArmRef.current = placeArm
  const swallowWaveTap = useRef(false)
  const [loreMeet, setLoreMeet] = useState<{ id: string; line: string } | null>(null)
  const runTierRef = useRef(runTier)
  runTierRef.current = runTier
  const runPathsRef = useRef(runPaths)
  runPathsRef.current = runPaths
  const waveIndexRef = useRef(waveIndex)
  waveIndexRef.current = waveIndex
  const skillReadyRef = useRef(skillReady)
  skillReadyRef.current = skillReady
  const skillHoldRef = useRef(false)
  const fastOnRef = useRef(false)
  fastOnRef.current = fastOn
  const pendingIntroRef = useRef<KitId | null>(null)
  const seenSkill = useRef<Record<KitId, boolean>>({ still: false, mend: false })
  const mendShieldUntilRef = useRef(0)
  const sparksRef = useRef(runSparks)
  sparksRef.current = runSparks
  const paidTypes = useRef<Set<string>>(new Set())
  const prevSparks = useRef(runSparks)
  const [sparkPop, setSparkPop] = useState(false)
  const burstTimer = useRef(0)
  const stillTimer = useRef(0)
  const mendTimer = useRef(0)
  const shieldTimer = useRef(0)
  const bannerTimer = useRef(0)
  const missTimer = useRef(0)
  const pulseTimer = useRef(0)
  const metRef = useRef<string[]>([...(progress.defense.met ?? [])])
  const markMetRef = useRef(markMet)
  markMetRef.current = markMet
  const [plants, setPlants] = useState<Record<string, string>>(() =>
    easy ? {} : starterPlants(pads, unlocked),
  )
  const [ghost, setGhost] = useState<LampPreview | null>(null)
  const lampDragLive = useRef(false)
  const plantsRef = useRef(plants)
  plantsRef.current = plants
  const planted = useMemo(() => Object.keys(plants) as CityPlotId[], [plants])
  const [hearts, setHearts] = useState(DEFEND_HEARTS)
  const [heartDrop, setHeartDrop] = useState<{ at: number; count: number } | null>(null)
  const [heartPop, setHeartPop] = useState(false)
  const [raiders, setRaiders] = useState<Raider[]>([])
  const [downed, setDowned] = useState(0)
  const [flash, setFlash] = useState<CityPlotId[]>([])
  const [shots, setShots] = useState<Shot[]>([])
  const [blasts, setBlasts] = useState<Blast[]>([])
  const [tapJuice, setTapJuice] = useState<EasyTapJuice | null>(null)
  const [combo, setCombo] = useState(0)
  const [shake, setShake] = useState(false)
  const [leakFlash, setLeakFlash] = useState(false)
  const [won, setWon] = useState(false)
  const [firing, setFiring] = useState(false)
  const [firingId, setFiringId] = useState<string | null>(null)
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
    plants,
    cool: {} as Record<string, number>,
    /** Easy lamp clock, in ms. It advances with `pacedDt`, same as the walkers. */
    clock: 0,
    playing: false,
    spawnNow: false,
    leakGraceUntil: 0,
    heartsLostRound: 0,
    freezeUntil: 0,
  })
  const autoFireRef = useRef<(now: number, frozen: boolean) => void>(() => {})
  const flashGen = useRef<Record<string, number>>({})
  const shotSeq = useRef(0)

  useEffect(() => {
    live.current.planted = planted
    live.current.plants = plants
  }, [planted, plants])

  function towerAbility(id: CityPlotId): WatchAbility {
    const plantedType = plants[id]
    if (plantedType && unlocked.includes(plantedType)) return plantedType
    return unlocked.includes(ability) ? ability : 'love'
  }

  useEffect(() => {
    const finish = () => {
      const armed = armedPathBuy.current
      if (!armed) return
      armedPathBuy.current = null
      boostPathRef.current(armed.plotId, armed.path, true)
    }
    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', finish)
    return () => {
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', finish)
    }
  }, [])

  useEffect(() => {
    upgradeAtRef.current = null
    upgradeTapRef.current = { id: 'porch', at: -1e9 }
    setUpgradeAt(null)
    setUpFlash(null)
    setLevelBurst(null)
    setSparkSpend(false)
    setGhost(null)
    window.clearTimeout(burstTimer.current)
  }, [phase])

  useEffect(() => {
    if (runSparks > prevSparks.current) {
      setSparkPop(true)
      const timer = window.setTimeout(() => setSparkPop(false), 700)
      prevSparks.current = runSparks
      return () => window.clearTimeout(timer)
    }
    prevSparks.current = runSparks
  }, [runSparks])

  useEffect(() => {
    const sync = () => setNwDebug(readNightWatchDebug())
    window.addEventListener('silver-city-nw-debug', sync)
    return () => window.removeEventListener('silver-city-nw-debug', sync)
  }, [])

  useEffect(() => {
    if (phase === 'wave' && nwDebug && easy) setDebugPaused(true)
  }, [phase, waveIndex, nwDebug, easy])

  useEffect(() => {
    if (phase !== 'wave' && phase !== 'boost') return
    setSkillNow(performance.now())
    const timer = window.setInterval(() => setSkillNow(performance.now()), 200)
    return () => window.clearInterval(timer)
  }, [phase])

  useEffect(() => {
    if (!juiceDone || saved.current || !brief) return
    saved.current = true
    recordNight(today, easy)
  }, [juiceDone, brief, recordNight, today, easy])

  const roundJumpOnce = useRef(false)
  useEffect(() => {
    if (!easy || roundJumpOnce.current) return
    const jump = readNightWatchRoundJump(nightLength(true))
    if (jump == null) return
    roundJumpOnce.current = true
    setWaveIndex(jump)
    if (jump + 1 >= nightLength(true)) setPhase('boost')
  }, [easy])

  useEffect(() => {
    const saved = progress.defense.met ?? []
    for (const id of saved) {
      if (!metRef.current.includes(id)) metRef.current = [...metRef.current, id]
    }
  }, [progress.defense.met])

  useEffect(() => {
    if (phase !== 'wave') {
      skillHoldRef.current = false
      pendingIntroRef.current = null
      setSkillSplash(null)
      return
    }
    const wave = waveIndexRef.current
    const intro = skillUnlockOnWave(wave)
    if (intro && !seenSkill.current[intro]) {
      seenSkill.current[intro] = true
      pendingIntroRef.current = intro
      skillHoldRef.current = true
      setSkillSplash(intro)
    } else if (intro && pendingIntroRef.current === intro) {
      skillHoldRef.current = true
    }
    const tune = waveCombat(wave, easy)
    const cleared = progress.defense.cleared
    live.current.playing = true
    live.current.raiders = []
    live.current.spawned = 0
    live.current.downed = 0
    // Easy keeps hearts across rounds. A new night (round 1) fills them again.
    if (!easy || waveIndexRef.current === 0) {
      live.current.hearts = DEFEND_HEARTS
      setHearts(DEFEND_HEARTS)
      setHeartDrop(null)
    }
    live.current.cool = {}
    live.current.clock = 0
    live.current.spawnNow = false
    live.current.leakGraceUntil = 0
    live.current.heartsLostRound = 0
    live.current.freezeUntil = 0
    mendShieldUntilRef.current = 0
    window.clearTimeout(shieldTimer.current)
    setMendShield(false)
    setToolLock(null)
    setRaiders([])
    setDowned(0)
    let last = performance.now()
    let spawnAt = 0
    let frame = 0

    const tick = (now: number) => {
      if (!live.current.playing) return
      if (skillHoldRef.current) {
        last = now
        frame = requestAnimationFrame(tick)
        return
      }
      const wallDt = Math.max(0, (now - last) / 1000)
      const pace = easy
        ? paceScale(paceUnlocked(waveIndexRef.current), fastOnRef.current)
        : 1
      const dt = pacedDt(wallDt, pace)
      last = now
      const frozen = nightWatchDebugFrozen(
        easy,
        nwDebugRef.current,
        debugPausedRef.current,
        now,
        live.current.freezeUntil,
      )
      if (!frozen) {
        spawnAt += dt
        if (easy) live.current.clock += dt * 1000
      }
      const next = live.current.raiders.map((item) => {
        if (item.turned) {
          const tier = combatTier(item.turned, runTierRef.current)
          return { ...item, heavenT: (item.heavenT ?? 0) + nightEnemies.heavenSpeed(tier, easy) * dt }
        }
        return {
          ...item,
          t: unturnedStep(
            item.t,
            nightEnemies.speed(easy) * tune.speedScale * walkerPace(easy ? item.gait : undefined) * dt,
            frozen,
          ),
        }
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
      let shielded = false
      if (leaked && now < mendShieldUntilRef.current) {
        shielded = true
        setPowerBanner('Held')
        window.clearTimeout(bannerTimer.current)
        bannerTimer.current = window.setTimeout(() => setPowerBanner(null), 2800)
      }
      let gate
      if (easy) {
        const paced = applyEasyPaceLeaks(
          live.current.hearts,
          leaked,
          now,
          live.current.leakGraceUntil,
          live.current.heartsLostRound,
          shielded,
          easyRoundHeartCap(waveIndexRef.current),
        )
        live.current.leakGraceUntil = paced.graceUntil
        live.current.heartsLostRound = paced.lostThisRound
        gate = paced
      } else {
        gate = applyGateLeaks(live.current.hearts, leaked, shielded)
      }
      if (gate.lostHearts > 0) {
        live.current.hearts = gate.hearts
        setHearts(gate.hearts)
        setHeartDrop({ at: gate.hearts, count: gate.lostHearts })
        comboRef.current = 0
        setCombo(0)
        setLeakFlash(true)
        window.setTimeout(() => setLeakFlash(false), 900)
        const through = gate.lostHearts === 1 ? 'One got through!' : `${gate.lostHearts} got through!`
        setPowerBanner(through)
        window.clearTimeout(bannerTimer.current)
        bannerTimer.current = window.setTimeout(() => setPowerBanner(null), 1600)
        window.setTimeout(() => {
          setHeartDrop((current) => (current && current.at === gate.hearts ? null : current))
        }, 900)
        markMissRef.current(DEFEND_BRIEF_ID)
      }
      const unturnedLive = walking.filter((item) => !item.turned).length
      const holdSpawn = easy && nightEnemies.holdSpawn(unturnedLive)
      if (
        !frozen &&
        live.current.spawned < tune.size &&
        !holdSpawn &&
        (live.current.spawnNow ||
          spawnAt >= nightEnemies.spawnEvery(easy) * tune.spawnScale ||
          (easy && live.current.spawned === 0))
      ) {
        live.current.spawnNow = false
        spawnAt = 0
        const id = live.current.spawned
        const cast = nightEnemies.cast(cleared, id, wave, easy)
        const gait = easy ? gaitForSlot(easyRound(wave), id) : undefined
        const hp = easy
          ? walkerHp(nightEnemies.maxHp(cast.kind, easy), tune.hpBonus, gait)
          : nightEnemies.maxHp(cast.kind, easy) + tune.hpBonus
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
          t: nightEnemies.spawnT(id),
          text: cast.text,
          kind: cast.kind,
          label: cast.label,
          castId: cast.id,
          hp,
          maxHp: hp,
          gait,
          spark: walkerSpark(gait),
        })
        live.current.spawned += 1
      }
      live.current.raiders = walking
      const debugHold = easy && nwDebugRef.current && debugPausedRef.current
      autoFireRef.current(now, debugHold)
      const alive = live.current.raiders
      setRaiders(alive)
      if (gate.failed || live.current.hearts <= 0) {
        live.current.playing = false
        setPhase('lost')
        return
      }
      const grantClearHeart = () => {
        const next = easyClearHeart(live.current.hearts)
        if (next === live.current.hearts) return
        live.current.hearts = next
        setHearts(next)
        setHeartPop(true)
        window.setTimeout(() => setHeartPop(false), 1200)
      }
      if (
        nightEnemies.isClear(
          easy,
          live.current.downed,
          live.current.spawned,
          alive.length,
          tune.size,
        )
      ) {
        if (easy) grantClearHeart()
        live.current.playing = false
        setToolLock(null)
        setPhase('boost')
        return
      }
      if (
        easy &&
        live.current.spawned >= tune.size &&
        alive.filter((item) => !item.turned).length === 0 &&
        live.current.hearts > 0
      ) {
        grantClearHeart()
        live.current.playing = false
        setToolLock(null)
        setPhase('boost')
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
    if (phase === 'wave') return
    window.clearTimeout(stillTimer.current)
    setStillOn(false)
  }, [phase])

  useLayoutEffect(() => {
    const node = boardRef.current
    if (!node) return
    const sync = () => {
      const rect = node.getBoundingClientRect()
      if (rect.width < 1 || rect.height < 1) return
      setBoardBox({ w: rect.width, h: rect.height })
    }
    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(node)
    return () => observer.disconnect()
  }, [phase, taught, easy])

  function noteSpend(cost: number) {
    setSparkSpent(cost)
    setSparkSpend(true)
    window.clearTimeout(burstTimer.current)
    burstTimer.current = window.setTimeout(() => setSparkSpend(false), LEVEL_BURST_MS)
  }

  function clearPlaceArm() {
    placeArmRef.current = null
    setPlaceArm(null)
    setGhost(null)
  }

  function armPlace(id: WatchAbility) {
    if (!easy || won) return
    if (phase !== 'wave' && phase !== 'boost') return
    if (Object.values(plantsRef.current).includes(id)) {
      clearPlaceArm()
      return
    }
    placeArmRef.current = id
    setPlaceArm(id)
    setAbility(id)
  }

  function placeHitsActor(target: EventTarget | null): boolean {
    const node = target as Element | null
    return Boolean(node?.closest?.('.defend-raider, .defend-pad, .defend-tower-card'))
  }

  /** Free before Begin. After Begin, a new type spends EASY_LAMP_COST. */
  function finishPlace(
    plantsNow: Record<string, string>,
    point: { x: number; y: number },
    using: string,
    hud: boolean,
    paid: boolean,
  ): boolean {
    if (paid && Object.values(plantsNow).includes(using)) return false
    const next = commitLamp(plantsNow, point, using, progress, runTier, hud)
    if (!next.ok) {
      setGhost(next.preview)
      return false
    }
    if (paid) {
      const bought = buyExtraLamp(sparksRef.current)
      if (!bought.ok) {
        setGhost(null)
        flashKit(`Need ${bought.cost} sparks`)
        return false
      }
      sparksRef.current = bought.sparks
      setRunSparks(bought.sparks)
      noteSpend(bought.cost)
      placeArmRef.current = null
      setPlaceArm(null)
    }
    setPlants(next.plants)
    if (paid) paidTypes.current.add(using)
    setGhost(null)
    closeUpgrade(true)
    return true
  }

  function togglePad(id: CityPlotId) {
    if (phase !== 'plant') return
    if (plants[id]) return
    const using = unlocked.includes(ability) ? ability : 'love'
    setPlants((current) => plantType(current, id, using))
    closeUpgrade(true)
  }

  function onPlacePointer(event: {
    type: string
    clientX: number
    clientY: number
    pointerId: number
    currentTarget: EventTarget
    target: EventTarget | null
  }) {
    if (lampDragLive.current) return
    if (placeHitsActor(event.target)) {
      if (event.type === 'pointerdown') setGhost(null)
      return
    }
    const opening = easy && phase === 'plant'
    const paidId = !opening && easy && (phase === 'wave' || phase === 'boost') ? placeArmRef.current : null
    const paid = Boolean(paidId && !Object.values(plantsRef.current).includes(paidId))
    if (!opening && !paid) return
    const svg = boardRef.current
    if (!svg) return
    const point = clientToMap(svg, event.clientX, event.clientY)
    if (!point) return
    if (event.type === 'pointerdown') {
      try {
        svg.setPointerCapture(event.pointerId)
      } catch {
        /* A tap that cannot capture still places on pointerup. */
      }
    }
    const using = paid ? (paidId as WatchAbility) : unlocked.includes(ability) ? ability : 'love'
    const hud = hudCoversPoint(event.clientX, event.clientY, svg.ownerDocument)
    const look = previewLamp(point, using, progress, runTier, plantsRef.current, hud, easy)
    if (event.type === 'pointercancel') {
      setGhost(null)
      return
    }
    if (event.type === 'pointerup') {
      if (phase === 'wave') swallowWaveTap.current = true
      finishPlace(plantsRef.current, point, using, hud, paid)
      return
    }
    setGhost(look)
  }

  function onCardPress(down: boolean) {
    lampDragLive.current = down
  }

  function onLampDrag(kind: LampDragPhase, using: WatchAbility, clientX: number, clientY: number) {
    const opening = easy && phase === 'plant'
    const paid = easy && (phase === 'wave' || phase === 'boost') && !Object.values(plantsRef.current).includes(using)
    if (kind === 'cancel' || (!opening && !paid)) {
      setGhost(null)
      return
    }
    const svg = boardRef.current
    const doc = svg?.ownerDocument
    if (!svg || !doc) {
      setGhost(null)
      return
    }
    if (kind === 'drop' && overTowerCards(clientX, clientY, doc)) {
      setGhost(null)
      return
    }
    const lifted = dragGhostClient(clientX, clientY)
    const point = clientToMap(svg, lifted.x, lifted.y)
    if (!point) {
      setGhost(null)
      return
    }
    const hud = overTowerCards(clientX, clientY, doc) || hudCoversPoint(lifted.x, lifted.y, doc)
    if (kind === 'move') {
      setGhost(previewLamp(point, using, progress, runTier, plantsRef.current, hud, easy))
      return
    }
    finishPlace(plantsRef.current, point, using, hud, paid)
  }

  function openUpgrade(id: CityPlotId) {
    if (placeArmRef.current) clearPlaceArm()
    const now = performance.now()
    const prev = upgradeTapRef.current
    const echoed = prev.id === id && now - prev.at < UPGRADE_TAP_ECHO_MS
    upgradeTapRef.current = { id, at: echoed ? prev.at : now }
    const next = selectUpgradeLamp(upgradeAtRef.current, id, echoed) as CityPlotId | null
    upgradeAtRef.current = next
    setUpgradeAt(next)
  }

  function closeUpgrade(force = false) {
    if (!force && armedPathBuy.current) return
    if (!force && performance.now() - upgradeTapRef.current.at < UPGRADE_GHOST_MS) return
    upgradeAtRef.current = null
    upgradeTapRef.current = { id: 'porch', at: -1e9 }
    setUpgradeAt(null)
  }

  function pullSparksFor(id: string): number {
    const type = plants[id]
    return lampPullRefund(Boolean(type && paidTypes.current.has(type)), EASY_LAMP_COST)
  }

  function pullUpgradeLamp() {
    if (!upgradeAt) return
    if (phase !== 'plant' && phase !== 'boost') return
    const id = upgradeAt
    const type = plants[id]
    const refund = pullSparksFor(id)
    const next = pullPlant(plants, id, pads)
    if (!next) {
      if (planted.length <= 1) {
        flashKit(easy ? EASY.nightKeepLamp : 'Keep at least one lamp.')
      }
      return
    }
    if (type) paidTypes.current.delete(type)
    if (refund > 0) {
      sparksRef.current += refund
      setRunSparks(sparksRef.current)
    }
    setPlants(next)
    closeUpgrade(true)
  }

  function raiderAt(raider: Raider) {
    return nightEnemies.at(raider)
  }

  function lampCombat(toolId: string) {
    if (!easy) {
      return {
        damage: combatTier(toolId, runTierRef.current),
        rangeBonus: 0,
        strike: null as ReturnType<typeof lampStrike> | null,
      }
    }
    const strike = lampStrike(pathsOf(runPathsRef.current, toolId))
    return {
      damage: strike.damage,
      rangeBonus: strike.rangeBonus,
      strike,
    }
  }

  function hitRange(id: CityPlotId, toolId: string) {
    const combat = lampCombat(toolId)
    return nightTowers.range(id, toolId, progress, runTierRef.current, combat.rangeBonus)
  }

  function fire(id: CityPlotId, forceRaiderId?: number, manual = false) {
    if (phase !== 'wave' || won) return false
    const now = performance.now()
    const at = nightTowers.anchor(id)
    const using = towerAbility(id)
    const combat = lampCombat(using)
    const rawCd = combat.strike ? combat.strike.cooldownMs : nightTowers.cooldown(id, progress)
    // Easy: the clock already runs at 1× or 3×, so the cooldown stays in game ms.
    // Hard keeps the wall clock. A face tap is its own hit and does not wait.
    const wait = easy ? rawCd : pacedCooldown(nightTowers.cooldown(id, progress), combatPace())
    const shotAt = easy ? live.current.clock : now
    if (!manual) {
      const last = easy ? live.current.cool[id] : (live.current.cool[id] ?? 0)
      if (last != null && last + wait > shotAt) return false
    }
    const tier = combat.damage
    const range = hitRange(id, using)
    let best: Raider | null = null
    if (forceRaiderId !== undefined) {
      const forced = live.current.raiders.find((item) => item.id === forceRaiderId && !item.turned)
      // Easy face taps land even when the lamp cannot reach the road.
      if (forced && (manual || dist(at, raiderAt(forced)) <= range)) best = forced
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
    if (!manual) live.current.cool[id] = shotAt
    lightPad(id)
    setFiring(true)
    setFiringId(using)
    window.setTimeout(() => {
      setFiring(false)
      setFiringId(null)
    }, SHOT_JUICE_MS)
    if (!best) return false
    const to = raiderAt(best)
    const aim = { x: to.x, y: to.y + PATH_WALKER_FACE_DY }
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
    if (fit === 'match') {
      const struck = nightEnemies.hit(best, easy && manual ? easyGlowTapDamage(tier, best.hp) : tier)
      const sparks = sparkAwardForHit(struck.down, best.spark ?? 1)
      blast.pop = struck.down
      blast.spark = sparks
      if (easy) {
        const juiceAt = boardPoint(aim.x, aim.y)
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
            ? { ...struck.raider, turned: using, from: to, heavenT: 0, struckAt: now, text: 'Toward heaven' }
            : { ...struck.raider, struckAt: now },
      )
      if (struck.down) {
        live.current.downed += 1
        setRunSparks((count) => count + sparks)
        // Lamp kills keep the spawn cadence. A face tap must not pull the next walker in early.
        if (easy && !manual) live.current.spawnNow = true
      }
      // Easy autofire only. A face tap stays one walker. Strong nicks inside the ring.
      // Far step 1 nicks just past it. Neither changes the main shot, so round 6 still
      // needs a second step.
      if (easy && !manual && combat.strike) {
        const nickOne = (minDist: number, maxDist: number, amount: number) => {
          if (amount <= 0) return
          let pick: Raider | null = null
          let pickD = maxDist
          for (const raider of live.current.raiders) {
            if (raider.turned || raider.id === best.id || raider.hp <= 0) continue
            const distance = dist(at, raiderAt(raider))
            if (distance > minDist && distance <= pickD) {
              pick = raider
              pickD = distance
            }
          }
          if (!pick) return
          const nick = nightEnemies.hit(pick, amount)
          const spot = raiderAt(pick)
          live.current.raiders = live.current.raiders.map((item) =>
            item.id !== pick.id
              ? item
              : nick.down
                ? { ...nick.raider, turned: using, from: spot, heavenT: 0, struckAt: now, text: 'Toward heaven' }
                : { ...nick.raider, struckAt: now },
          )
          if (nick.down) {
            live.current.downed += 1
            setRunSparks((count) => count + walkerSpark(pick.gait))
            live.current.spawnNow = true
          }
        }
        nickOne(-1, range * combat.strike.splashFrac, combat.strike.splash)
        nickOne(range, range * (1 + combat.strike.outerFrac), combat.strike.outer)
      }
    } else {
      live.current.raiders = live.current.raiders.map((item) =>
        item.id === best.id
          ? { ...item, struckAt: now, t: Math.max(0, item.t - 0.22), text: `${WATCH_ABILITY_LABEL[using]} is weak` }
          : item,
      )
    }
    shotSeq.current += 1
    const shotKey = shotSeq.current
    setShots((current) => [...current.slice(-3), { key: shotKey, from: nightTowers.muzzle(id), to: aim }])
    setBlasts((current) => [...current.slice(-3), blast])
    window.setTimeout(() => {
      setShots((current) => current.filter((item) => item.key !== shotKey))
    }, SHOT_JUICE_MS)
    window.setTimeout(() => {
      setBlasts((current) => current.filter((item) => item.key !== now))
    }, 620)
    setRaiders(live.current.raiders)
    setDowned(live.current.downed)
    return true
  }

  function lightPad(id: CityPlotId) {
    const gen = (flashGen.current[id] ?? 0) + 1
    flashGen.current[id] = gen
    setFlash((current) => (current.includes(id) ? current : [...current, id]))
    window.setTimeout(() => {
      if (flashGen.current[id] !== gen) return
      setFlash((current) => current.filter((item) => item !== id))
    }, SHOT_JUICE_MS)
  }

  autoFireRef.current = (now: number, frozen: boolean) => {
    for (const id of live.current.planted) {
      const using = towerAbility(id)
      const rawCd = easy
        ? lampCombat(using).strike!.cooldownMs
        : nightTowers.cooldown(id, progress)
      const wait = easy ? rawCd : pacedCooldown(nightTowers.cooldown(id, progress), combatPace())
      const shotAt = easy ? live.current.clock : now
      const last = easy ? (live.current.cool[id] ?? shotAt - wait) : (live.current.cool[id] ?? 0)
      if (!lampReadyToFire(last, shotAt, wait, frozen)) continue
      const at = nightTowers.anchor(id)
      const range = hitRange(id, using)
      const aimed = live.current.raiders.some(
        (raider) => !raider.turned && dist(at, raiderAt(raider)) <= range,
      )
      if (aimed) fire(id)
    }
  }

  function showMiss() {
    const note = EASY.nightMiss
    setToolLock(note)
    window.clearTimeout(missTimer.current)
    missTimer.current = window.setTimeout(() => {
      setToolLock((current) => (current === note ? null : current))
    }, EASY_MISS_HOLD_MS)
  }

  function dismissMiss() {
    window.clearTimeout(missTimer.current)
    setToolLock((current) => (current === EASY.nightMiss ? null : current))
  }

  function fireAtRaider(raiderId: number) {
    if (phase !== 'wave' || won) return
    const raider = live.current.raiders.find((item) => item.id === raiderId && !item.turned)
    if (!raider) return
    const glowing = nightEnemies.cueTarget(live.current.raiders)?.id === raider.id
    if (cueTapStrike(easy, glowing) === 'miss') {
      showMiss()
      return
    }
    const point = raiderAt(raider)
    let nearest: CityPlotId | null = null
    let nearestD = Infinity
    let inRange: CityPlotId | null = null
    let inRangeD = Infinity
    for (const id of live.current.planted) {
      const at = nightTowers.anchor(id)
      const range = hitRange(id, towerAbility(id))
      const d = dist(at, point)
      if (d < nearestD) {
        nearestD = d
        nearest = id
      }
      if (d <= range && d < inRangeD) {
        inRangeD = d
        inRange = id
      }
    }
    if (faceTapStrike(easy, true, inRange !== null) === 'hit') {
      const lamp = easy ? nearest : inRange
      if (lamp && fire(lamp, raiderId, easy)) {
        if (easy) dismissMiss()
      }
      return
    }
    if (easy) showMiss()
  }

  function fireBest() {
    if (swallowWaveTap.current) {
      swallowWaveTap.current = false
      return
    }
    if (phase !== 'wave' || won) return
    if (faceTapStrike(easy, false, false) === 'miss' && easy) {
      showMiss()
      return
    }
    let pick: CityPlotId | null = null
    let bestD = Infinity
    for (const id of live.current.planted) {
      const at = nightTowers.anchor(id)
      const range = hitRange(id, towerAbility(id))
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
  }

  function retry() {
    setPhase('plant')
    setWon(false)
    setRaiders([])
    setDowned(0)
    setHearts(DEFEND_HEARTS)
    setHeartDrop(null)
    comboRef.current = 0
    setCombo(0)
    setShots([])
    setBlasts([])
    setFlash([])
    setTapJuice(null)
    setRunTier(freshRunTier())
    setRunPaths(freshRunPaths())
    runPathsRef.current = freshRunPaths()
    paidTypes.current = new Set()
    setPlants(easy ? {} : starterPlants(pads, unlocked))
    clearPlaceArm()
    setRunSparks(0)
    sparksRef.current = 0
    const ready = { still: 0, mend: 0 }
    skillReadyRef.current = ready
    setSkillReady(ready)
    seenSkill.current = { still: false, mend: false }
    pendingIntroRef.current = null
    skillHoldRef.current = false
    setSkillSplash(null)
    setPulseId(null)
    mendShieldUntilRef.current = 0
    setMendShield(false)
    setMendOn(false)
    setPowerBanner(null)
    setStillOn(false)
    setDebugPaused(false)
    fastOnRef.current = false
    setFastOn(false)
    live.current.freezeUntil = 0
    live.current.hearts = DEFEND_HEARTS
    setBoostNote(null)
    setWaveIndex(0)
    setLoreMeet(null)
    saved.current = false
  }

  function boostTool(id: WatchAbility, lampId?: CityPlotId | null) {
    if (easy) return
    if (placeArmRef.current) {
      placeArmRef.current = null
      setPlaceArm(null)
      setGhost(null)
    }
    const before = combatTier(id, runTierRef.current)
    const beforeSparks = sparksRef.current
    const next = applyBoost(id, runTierRef.current, sparksRef.current, false)
    setBoostNote(next.note)
    if (!next.ok) return
    const after = combatTier(id, next.runTier)
    runTierRef.current = next.runTier
    sparksRef.current = next.sparks
    setRunTier(next.runTier)
    setRunSparks(next.sparks)
    setSparkSpent(Math.max(1, beforeSparks - next.sparks))
    setToolLock(null)
    const lamp = lampId !== undefined ? lampId : upgradeAtRef.current
    const plantedType = lamp ? plantsRef.current[lamp] : undefined
    window.clearTimeout(burstTimer.current)
    setSparkSpend(true)
    if (lamp && plantedType === id) {
      setLevelBurst({ plotId: lamp, from: before, to: after })
      setUpFlash(lamp)
    }
    burstTimer.current = window.setTimeout(() => {
      setSparkSpend(false)
      setUpFlash((current) => (current === lamp ? null : current))
      setLevelBurst((current) => (current?.plotId === lamp ? null : current))
    }, LEVEL_BURST_MS)
  }

  function boostPath(id: WatchAbility, path: TreePath, lampId?: CityPlotId | null) {
    if (!easy) return
    if (placeArmRef.current) {
      placeArmRef.current = null
      setPlaceArm(null)
      setGhost(null)
    }
    const beforeSparks = sparksRef.current
    const next = applyPathStep(id, runPathsRef.current, sparksRef.current, path)
    setBoostNote(next.note)
    if (!next.ok) return
    runPathsRef.current = next.paths
    sparksRef.current = next.sparks
    setRunPaths(next.paths)
    setRunSparks(next.sparks)
    setSparkSpent(Math.max(1, beforeSparks - next.sparks))
    setToolLock(null)
    const lamp = lampId !== undefined ? lampId : upgradeAtRef.current
    const plantedType = lamp ? plantsRef.current[lamp] : undefined
    window.clearTimeout(burstTimer.current)
    setSparkSpend(true)
    if (lamp && plantedType === id) setUpFlash(lamp)
    burstTimer.current = window.setTimeout(() => {
      setSparkSpend(false)
      setUpFlash((current) => (current === lamp ? null : current))
    }, LEVEL_BURST_MS)
  }

  function openPlantedTree(id: WatchAbility) {
    const plot = Object.entries(plantsRef.current).find(([, type]) => type === id)?.[0]
    if (plot) openUpgrade(plot as CityPlotId)
  }

  function boostSelectedTool(plotId: CityPlotId) {
    const now = performance.now()
    if (
      !upgradeSpendAllowed(
        upgradeAtRef.current,
        plotId,
        upgradeTapRef.current.at,
        now,
      )
    ) {
      return
    }
    const tool = lampUpgradeTool(plotId, plantsRef.current)
    if (!tool || !unlocked.includes(tool as WatchAbility)) return
    boostTool(tool as WatchAbility, plotId)
  }

  function armPathBuy(path: TreePath) {
    const plotId = upgradeAtRef.current
    if (!plotId) return
    armedPathBuy.current = { plotId, path }
    pathBuyAt.current = performance.now()
  }

  function roundChangeBlocked() {
    if (armedPathBuy.current) return true
    return performance.now() - pathBuyAt.current < 450
  }

  function boostSelectedPath(plotId: CityPlotId, path: TreePath, fromPip = false) {
    const now = performance.now()
    if (fromPip) {
      if (now - pathBuyStamp.current < 350) return
      pathBuyStamp.current = now
      pathBuyAt.current = now
      armedPathBuy.current = null
    } else if (
      !upgradeSpendAllowed(
        upgradeAtRef.current,
        plotId,
        upgradeTapRef.current.at,
        now,
      )
    ) {
      return
    }
    const tool = lampUpgradeTool(plotId, plantsRef.current)
    if (!tool || !unlocked.includes(tool as WatchAbility)) return
    boostPath(tool as WatchAbility, path, plotId)
  }
  boostPathRef.current = boostSelectedPath

  function flashKit(note: string) {
    setToolLock(note)
    window.setTimeout(() => {
      setToolLock((current) => (current === note ? null : current))
    }, 900)
  }

  function showPower(note: string) {
    setPowerBanner(note)
    window.clearTimeout(bannerTimer.current)
    bannerTimer.current = window.setTimeout(() => setPowerBanner(null), 2800)
  }

  function armSkill(id: KitId, now: number) {
    const next = { ...skillReadyRef.current, [id]: now + SKILL_COOLDOWN_MS[id] }
    skillReadyRef.current = next
    setSkillReady(next)
    setSkillNow(now)
  }

  function spendStill() {
    live.current.freezeUntil = useStill(performance.now())
    window.clearTimeout(stillTimer.current)
    setStillOn(true)
    stillTimer.current = window.setTimeout(() => setStillOn(false), Math.max(STILL_MS, 2800))
    showPower('Still')
  }

  function spendMend() {
    const now = performance.now()
    const powered = mendPower(live.current.hearts)
    live.current.hearts = powered.hearts
    setHearts(powered.hearts)
    mendShieldUntilRef.current = now + MEND_SHIELD_MS
    setMendShield(true)
    setMendOn(true)
    window.clearTimeout(shieldTimer.current)
    shieldTimer.current = window.setTimeout(() => {
      mendShieldUntilRef.current = 0
      setMendShield(false)
    }, MEND_SHIELD_MS)
    window.clearTimeout(mendTimer.current)
    mendTimer.current = window.setTimeout(() => setMendOn(false), 980)
    showPower(powered.note)
  }

  function dismissSkillSplash() {
    const opened = pendingIntroRef.current
    pendingIntroRef.current = null
    skillHoldRef.current = false
    setSkillSplash(null)
    if (!opened) return
    setPulseId(opened)
    window.clearTimeout(pulseTimer.current)
    pulseTimer.current = window.setTimeout(() => {
      setPulseId((current) => (current === opened ? null : current))
    }, 2600)
  }

  function combatPace(): number {
    if (!easy) return 1
    return paceScale(paceUnlocked(waveIndexRef.current), fastOnRef.current)
  }

  function togglePace() {
    if (!easy || won) return
    if (!paceUnlocked(waveIndexRef.current)) {
      flashKit(`3× unlocks on wave ${PACE_UNLOCK_WAVE + 1}`)
      return
    }
    const next = !fastOnRef.current
    fastOnRef.current = next
    setFastOn(next)
  }

  function castSkill(id: KitId) {
    const label = KIT_LABEL[id]
    if (won || skillSplash) return
    if (!skillUnlocked(id, waveIndex)) {
      flashKit(`${label} unlocks on wave ${SKILL_UNLOCK_WAVE[id] + 1}`)
      return
    }
    if (phase !== 'wave') {
      flashKit(`Tap ${label} during the wave`)
      return
    }
    const now = performance.now()
    if (now < skillReadyRef.current[id]) {
      flashKit(`${label} is recharging`)
      return
    }
    if (id === 'still') spendStill()
    else spendMend()
    armSkill(id, performance.now())
  }

  function continueFromBoost() {
    if (won || phase !== 'boost') return
    if (roundChangeBlocked()) return
    clearPlaceArm()
    setBoostNote(null)
    setLoreMeet(null)
    if (waveIndex + 1 < nightLength(easy)) {
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
    if (!plateFill) return mapBoardPoint(boardBox, { x, y })
    return boardFillPoint(boardBox, { x, y })
  }

  const after = juiceDone && won
  const easyTap = easyTapMode(easy, phase, won)
  const tapTarget = easyTap ? nightEnemies.cueTarget(raiders) : undefined
  const tapPos =
    tapTarget && boardBox.w > 0
      ? boardPoint(raiderAt(tapTarget).x, raiderAt(tapTarget).y)
      : null
  const upgradePoint =
    upgradeAt && boardBox.w > 0
      ? boardPoint(nightTowers.anchor(upgradeAt).x, nightTowers.anchor(upgradeAt).y)
      : null
  const midWave = phase === 'wave' && !won
  const debugHarness = easy && nwDebug && midWave
  const debugFrozen = debugHarness && debugPaused
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

  const rounds = nightLength(easy)
  const waveSize = waveCombat(waveIndex, easy).size
  const roundLabel = roundMark(waveIndex, rounds, easy)
  const remaining = waveSize - downed
  const boosting = phase === 'boost' && !won

  const showPace = easy && (phase === 'wave' || phase === 'boost') && !won

  const hud = (
    <p className="defend-hud" aria-live="polite">
      {phase === 'wave' ? (
        <span className="defend-wave">{roundLabel}</span>
      ) : null}
      <span
        className={`defend-hearts${mendShield ? ' is-mend-shield' : ''}${mendOn ? ' is-mend-pop' : ''}`}
        data-hearts={hearts}
      >
        {Array.from({ length: DEFEND_HEARTS }, (_, index) => {
          const dropped = heartDrop && index >= heartDrop.at && index < heartDrop.at + heartDrop.count
          return (
            <span key={index} className={`${index < hearts ? 'is-on' : ''}${dropped ? ' is-drop' : ''}`}>
              ♥
            </span>
          )
        })}
        {mendShield ? <span className="nw-mend-hold">Gate</span> : null}
        {heartPop ? (
          <span className="defend-heart-gain" data-heart-gain="+1">
            +1 ♥
          </span>
        ) : null}
        {powerBanner ? <span className="nw-power-chip">{powerBanner}</span> : null}
      </span>
      <span className={`defend-count ${combo > 1 ? 'is-combo' : ''}`}>
        {phase === 'boost'
          ? runSparks > 0
            ? `Level up · ${runSparks} spark${runSparks === 1 ? '' : 's'}`
            : 'Level up'
          : phase === 'wave'
            ? easy
              ? combo > 1
                ? `×${combo}  ${remaining} left`
                : `TAP ${remaining} left`
              : combo > 1
                ? `×${combo}  ${remaining} left`
                : `${remaining} left · TAP`
            : `${planted.length} planted`}
      </span>
    </p>
  )

  // Pale Begin and the plant line follow how many lamps are standing, not ring slots.
  const awaitingLamp = planted.length < 1

  const tip =
    phase === 'wave'
      ? easy
        ? null
        : HARD_WAVE_TIP
      : phase === 'plant'
        ? easy
          ? EASY.nightPlant
          : HARD_PLANT_TIP
        : phase === 'boost' && !won
          ? easy
            ? EASY.nightBoost
            : 'Tap a planted lamp or a tool on the right to spend sparks.'
          : null

  const skillTray = (
    <NightSkillTray
      waveIndex={waveIndex}
      now={skillNow}
      readyAt={skillReady}
      pulseId={pulseId}
      onCast={castSkill}
    />
  )

  const docks = (
    <>
      {debugHarness ? (
        <div className="defend-nw-debug" role="group" aria-label="Night Watch debug playtest">
          <p className="defend-nw-debug-label">Debug · test only</p>
          <button
            type="button"
            className={`btn defend-nw-debug-toggle${debugPaused ? ' is-paused' : ''}`}
            onClick={() => setDebugPaused((on) => !on)}
          >
            {debugPaused ? 'Resume walkers' : 'Pause walkers'}
          </button>
          {debugPaused ? (
            <p className="defend-nw-debug-hint">Walkers frozen — read the cue, tap the glowing face.</p>
          ) : null}
        </div>
      ) : null}
      {phase === 'wave' && !won && !skillSplash ? (
        <div className="defend-kits nw-skill-tray" role="group" aria-label="Skills">
          {skillTray}
        </div>
      ) : null}
      {phase === 'lost' ? (
        <div className="defend-lost">
          <p>
            {easy
              ? `Reached round ${waveIndex + 1}. You missed. Tap the face.`
              : 'Porch flickered. Turn them again.'}
          </p>
          {easy ? (
            <p className="defend-hearts-left" data-hearts-left={hearts}>
              {`Hearts left: ${hearts}`}
            </p>
          ) : null}
          <button type="button" className="btn primary" onClick={retry}>
            Try the night again
          </button>
        </div>
      ) : null}
      {phase === 'boost' && !won ? (
        <div className="defend-boost">
          <p className="defend-boost-status" role="status">
            {easy
              ? `Round ${waveIndex + 1} clear · spend sparks`
              : `Wave ${waveIndex + 1} clear · spend sparks`}
            {boostNote ? ` · ${boostNote}` : ''}
          </p>
          {easy ? (
            <p className="defend-lamp-price" data-lamp-cost={EASY_LAMP_COST}>
              {`New lamp ${EASY_LAMP_COST}✦`}
            </p>
          ) : null}
          <div className="defend-spark-choices" role="group" aria-labelledby="defend-spark-pick">
            <p id="defend-spark-pick" className="defend-spark-choices-label">
              {easy ? EASY.nightBoostPick : 'Skills'}
            </p>
            {skillTray}
          </div>
          <button type="button" className="btn primary" onClick={continueFromBoost}>
            Continue
          </button>
        </div>
      ) : null}
      {(phase === 'plant' || planted.length < 1) &&
      phase !== 'lost' &&
      phase !== 'boost' &&
      !won ? (
        <>
          <button
            type="button"
            className={`btn primary xl defend-go${awaitingLamp ? ' is-awaiting-plant' : ' is-after-plant'}`}
            onClick={() => {
              if (awaitingLamp || phase !== 'plant') return
              if (roundChangeBlocked()) return
              setGhost(null)
              setPhase('wave')
            }}
            disabled={awaitingLamp || arming || phase !== 'plant'}
            aria-describedby={easy && awaitingLamp ? 'defend-plant-first' : undefined}
          >
            {easy ? EASY.nightDo : 'The road is coming'}
          </button>
          {easy && awaitingLamp ? (
            <p className="defend-plant-first" id="defend-plant-first">
              {EASY.nightPlantFirst}
            </p>
          ) : null}
        </>
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
      firingId={firingId}
      plantedTypes={Object.values(plants)}
      unlocked={unlocked}
      runTier={runTier}
      runPaths={runPaths}
      sparks={runSparks}
      boosting={boosting}
      placing={easy && !won && phase !== 'lost'}
      paidPlace={easy && !won && (phase === 'wave' || phase === 'boost')}
      lampArmed={placeArm}
      onArmPlace={armPlace}
      onLampDrag={onLampDrag}
      onCardPress={onCardPress}
      onBoost={boostTool}
      onOpenTree={openPlantedTree}
    />
  )

  return (
    <main
      className={`defend-page ${taught ? 'is-puzzle' : 'is-teach'} ${arming ? 'is-arming' : ''} ${won ? 'is-win' : ''} ${shake ? 'is-shake' : ''} ${leakFlash ? 'is-leak' : ''} ${firing ? 'is-firing' : ''} ${stillOn ? 'is-still' : ''} ${mendOn ? 'is-mend' : ''} ${mendShield ? 'is-mend-shield' : ''} ${debugFrozen ? 'is-nw-debug-freeze' : ''} ${easy ? 'is-easy-watch' : ''} ${easyTap ? 'is-easy-tap' : ''} ${boosting ? 'is-boost' : ''} ${boosting && runSparks < 1 ? 'is-spark-broke' : ''} ${easy && phase === 'plant' && awaitingLamp ? 'is-need-lamp' : ''} ${easy && (phase === 'plant' || placeArm) ? 'is-placing' : ''} ${easy && !won && (phase === 'wave' || phase === 'boost') ? 'is-shop' : ''}`}
      aria-label={WATCH_TITLE}
    >
      {after ? (
        easy ? (
          <FarHillsUnlock
            held={`The night held after round ${rounds}.`}
            home={EASY.home}
            onHome={() => onNavigate({ name: 'hub' })}
          />
        ) : (
          <>
            <article className="stored-line" aria-label="Love tip">
              <p className="eyebrow">Love tip</p>
              <p className="stored-claim">{loveHowTo(easy)}</p>
            </article>
            <TownReturn
              who="juniper"
              line="Night held. The road turned toward heaven."
              action="See the town"
              onGo={() => onNavigate({ name: 'hub' })}
            />
          </>
        )
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
            coin={
              // 1.4.387: Easy hides Insight. Plant, Pull, and waves never change that journal tally, so a fresh diamond stays 0. Rail 1s are the plant slots. Sparks stay on the star.
              easy ? null : <CoinRead count={insightScore(progress)} label="Insight" />
            }
            balloon={<MoneyBalloon count={runSparks} label="Sparks" gain={sparkPop} spend={sparkSpend} spent={sparkSpent} />}
            rail={rail}
            docks={docks}
          >
            <DefendNightBoard
              boardRef={boardRef}
              viewBox={plateFill ? boardFillBox(boardBox) : boardViewBox(boardBox)}
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
              towerType={plants}
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
              runPaths={runPaths}
              boosting={boosting}
              onBoostTower={boostSelectedTool}
              onUpgradePath={boostSelectedPath}
              onArmPathBuy={armPathBuy}
              upgradeAt={upgradeAt}
              onOpenUpgrade={openUpgrade}
              upFlashId={upFlash}
              levelBurst={
                levelBurst && upgradeAt === levelBurst.plotId
                  ? { from: levelBurst.from, to: levelBurst.to }
                  : null
              }
              upgradePoint={upgradePoint}
              boardBox={boardBox}
              runSparks={runSparks}
              onPullLamp={
                phase === 'plant' || phase === 'boost' ? pullUpgradeLamp : undefined
              }
              pullSparks={upgradeAt ? pullSparksFor(upgradeAt) : 0}
              onCloseUpgrade={closeUpgrade}
              onBoardTap={closeUpgrade}
              onPlacePointer={onPlacePointer}
              ghost={ghost}
              plateFill={plateFill}
            />
            {phase === 'wave' ? (
              <div className="nw-wave-overlay">
                <span className="defend-wave">{roundLabel}</span>
              </div>
            ) : null}
            {showPace ? (
              <NightPaceControl waveIndex={waveIndex} fastOn={fastOn} onToggle={togglePace} />
            ) : null}
            {skillSplash ? <NightSkillSplash id={skillSplash} onDismiss={dismissSkillSplash} /> : null}
            {createPortal(
              <>
                {stillOn ? <div className="nw-still-veil" aria-hidden="true" /> : null}
                {mendShield ? <div className="nw-mend-shield" aria-hidden="true" /> : null}
                {powerBanner ? (
                  <p
                    className={`nw-power-banner${powerBanner.startsWith('Mend') || powerBanner === 'Held' ? ' is-mend' : ' is-still'}`}
                    role="status"
                  >
                    {powerBanner}
                  </p>
                ) : null}
              </>,
              document.body,
            )}
          </UiShell>
        </>
      )}
      <WinBurst play={won && !juiceDone} stamp="Night held!" />
    </main>
  )
}
