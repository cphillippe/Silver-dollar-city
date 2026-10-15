import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal, flushSync } from 'react-dom'
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
import { walkerRoadId } from '../nightWatch/path/data'
import { roundMark, easyRound } from '../nightWatch/rounds'
import { pickWalkerFace, WALKER_FACE_POOL } from '../nightWatch/enemies/faces'
import {
  BOSS_PACE,
  easyBossClearSparks,
  easyClearSparkBonus,
  easyBossHp,
  easyBossRound,
  easyBossSpawnId,
  easyJumpLoad,
  easyJumpSparkBank,
  easyLatePush,
  easyWalkerHp,
  scaledWalkerHp,
  FAST_PACE,
  gaitForSlot,
  nightTune,
  roundForTune,
  walkerPace,
  walkerSpark,
} from '../nightWatch/walkers'
import { localDateKey } from '../lib/dates'
import {
  DEFEND_BRIEF_ID,
  DEFEND_HEARTS,
  nightLength,
  applyBossExitLeak,
  applyEasyPaceLeaks,
  applyGateLeaks,
  easyClearHeart,
  easyLiveSpawnT,
  easyPointerTapGate,
  r10ShrugCue,
  easyRoundHeartCap,
  liveBossClearPhase,
  liveNightDamage,
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
  NIGHT_PACE_FAST,
  PACE_UNLOCK_WAVE,
  paceScale,
  paceUnlocked,
  pacedCooldown,
  pacedDt,
} from '../lib/nightPace'
import {
  nightWatchDebugFrozen,
  nightWatchDebugHolds,
  nightWatchDebugPanel,
  nightWatchJumpAllowed,
  nightWatchMapMissing,
  nightWatchMapQuery,
  nightWatchSkipsMapSheet,
  readNightWatchDebug,
  readNightWatchRoundJump,
} from '../lib/nightWatchDebug'
import {
  bindNightRoll,
  NIGHT_SEED_STEP,
  nightSeedFaceShift,
  nightSeedFirstShotAt,
  nightSeedPlan,
  nightSeedSpawnScale,
  nightSeedSteps,
  nightWatchSeed,
} from '../nightWatch/seed'
import { FarHillsUnlock } from './FarHillsUnlock'
import { NightMapPicker } from './NightMapPicker'
import { activeNightRoadD } from '../nightWatch/path/data'
import { applyNightMap } from '../nightWatch/maps/bind'
import { mapIsOpen, nextMap, NIGHT_MAP_NAME } from '../nightWatch/maps/chain'
import { playableNightMap } from '../nightWatch/maps/mazeMaps'
import { resolveNightMap, type NightMapId } from '../nightWatch/maps/resolve'
import {
  miniHp,
  minisOnKill,
  splitFeature,
  walkerZone,
  type NightFeature,
} from '../nightWatch/maps/features'
import { waveRound, waveWalkerHp, type NightWave } from '../nightWatch/maps/wave'
import {
  clearPanelFolded,
  clientToMap,
  commitLamp,
  dragGhostClient,
  hudCoversPoint,
  LAMP_DRAG_START_PX,
  lampSpotBlocked,
  lampUnderFinger,
  magnetCandlePoint,
  overTowerCards,
  pathSpendControl,
  plantableHints,
  previewLamp,
  roundStartKind,
  startsNextRound,
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
import { applyBoost, buyExtraLamp, combatTier, EASY_LAMP_COST, freshRunTier, WATCH_TOOLS } from '../lib/watchTools'
import {
  applyCandleStep,
  CANDLE_COST,
  CANDLE_ID,
  CANDLE_INTRO,
  candleFarBonus,
  candleRowSize,
  candlePathKey,
  candlePlateReach,
  candleRowReachBonus,
  candleRoom,
  candleEarlyPace,
  candleStrike,
  candleWalkerDamage,
  candleUnlocked,
  isCandle,
} from '../nightWatch/candle'
import {
  applyBellStep,
  bellPaceFor,
  bellPathKey,
  walkerSlowPace,
  bellRoom,
  bellUnlocked,
  BELL_COST,
  BELL_ID,
  isBell,
} from '../nightWatch/bell'
import {
  applyIncenseStep,
  incenseBonusFor,
  incensePathKey,
  incenseRoom,
  incenseUnlocked,
  INCENSE_COST,
  INCENSE_ID,
  isIncense,
} from '../nightWatch/incense'
import { lessonAreaFor, samePillarLessons } from '../nightWatch/lampPillar'
import { clearNightReturn, readNightReturn, saveNightReturn } from '../nightWatch/nightReturn'
import {
  applyBright,
  applyPathStep,
  brightRoundOpen,
  easyShotReach,
  freshLampPaths,
  freshRunPaths,
  lampStrike,
  pathSparkSpend,
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
import { NightSkillTray } from './NightSkillTray'
import type { EasyTapJuice, EasyWalkerCall } from './DefendNightActors'

interface DefendScreenProps {
  onNavigate: (view: View) => void
  /** Start the plant step over. Used when Play opens the Far Hills. */
  onFreshNight?: () => void
}

/** 1.4.375: how long the lamp level-up burst, roman bump, and −1✦ stay readable. */
const LEVEL_BURST_MS = 1100

/** Playtest jump applied on the first paint, so Begin cannot start round 1 under a round 25 label. */
function initialNightJump(easy: boolean) {
  if (!easy || typeof window === 'undefined') return null
  if (readNightReturn()) return null
  const jump = readNightWatchRoundJump(nightLength(true))
  if (jump == null) return null
  return { index: jump, load: easyJumpLoad(jump) }
}

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

export function DefendScreen({ onNavigate, onFreshNight }: DefendScreenProps) {
  const { progress, recordNight, markMet, markMiss, chooseNightMap, recordMazeBeat } = useProgress()
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
  const [sessionMap, setSessionMap] = useState<NightMapId | null>(null)
  const [mapChosen, setMapChosen] = useState(
    () => typeof window !== 'undefined' && nightWatchSkipsMapSheet(window.location.search, readNightWatchDebug()),
  )
  const [waveIndex, setWaveIndex] = useState(() => initialNightJump(easy)?.index ?? 0)
  const [runTier, setRunTier] = useState<Record<string, number>>(freshRunTier)
  const [runPaths, setRunPaths] = useState(() => initialNightJump(easy)?.load.paths ?? freshRunPaths())
  const [runSparks, setRunSparks] = useState(() => initialNightJump(easy)?.load.sparks ?? 0)
  const [skillReady, setSkillReady] = useState<Record<KitId, number>>({ still: 0, mend: 0 })
  const [skillNow, setSkillNow] = useState(0)
  const [skillNote, setSkillNote] = useState<KitId | null>(null)
  const [candleNote, setCandleNote] = useState(false)
  const seenCandle = useRef(false)
  const [fastOn, setFastOn] = useState(false)
  const [pulseId, setPulseId] = useState<KitId | null>(null)
  const [stillOn, setStillOn] = useState(false)
  const [mendOn, setMendOn] = useState(false)
  const [mendShield, setMendShield] = useState(false)
  const [powerBanner, setPowerBanner] = useState<string | null>(null)
  const [nwDebug, setNwDebug] = useState(() => readNightWatchDebug())
  const [tapHits, setTapHits] = useState(0)
  const [tapMisses, setTapMisses] = useState(0)
  const [tapDamage, setTapDamage] = useState(0)
  const tapScoreRef = useRef({ hits: 0, misses: 0, damage: 0 })
  const tapClaim = useRef(0)
  const missLock = useRef<string | null>(null)
  const missUntil = useRef(0)
  const missShown = useRef<string | null>(null)
  const lampHurtRef = useRef(0)
  const hudRef = useRef<HTMLParagraphElement>(null)
  const [debugPaused, setDebugPaused] = useState(false)
  const [plantPulse, setPlantPulse] = useState(false)
  const plantPulseTimer = useRef(0)
  const nwDebugRef = useRef(nwDebug)
  const debugPausedRef = useRef(debugPaused)
  const debugPanelRef = useRef(false)
  nwDebugRef.current = nwDebug
  debugPausedRef.current = debugPaused
  const [boostNote, setBoostNote] = useState<string | null>(null)
  const [bossBonus, setBossBonus] = useState(0)
  const [clearSpark, setClearSpark] = useState(0)
  const [upgradeAt, setUpgradeAt] = useState<CityPlotId | null>(null)
  const [returnPlot, setReturnPlot] = useState<CityPlotId | null>(null)
  const [spendOpen, setSpendOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
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
  const plantOpenGroundRef = useRef<(clientX: number, clientY: number) => boolean>(() => false)
  placeArmRef.current = placeArm
  /** A card press at a clear must not also hit Continue. */
  const clearCardAt = useRef(0)
  const newLampStop = useRef<(() => void) | null>(null)
  const swallowNewLampClick = useRef(false)
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
  const seenSkill = useRef<Record<KitId, boolean>>({ still: false, mend: false })
  const mendShieldUntilRef = useRef(0)
  const sparksRef = useRef(runSparks)
  sparksRef.current = runSparks
  const hpMulRef = useRef(1)
  const tuneRef = useRef(nightTune())
  const mapIdRef = useRef<NightMapId>('a2')
  const mazeBeatRef = useRef(recordMazeBeat)
  mazeBeatRef.current = recordMazeBeat
  const mazeBeatListRef = useRef<readonly string[]>([])
  mazeBeatListRef.current = progress.defense.mazeBeat ?? []
  const waveRef = useRef<NightWave | null>(null)
  const featuresRef = useRef<NightFeature[]>([])
  const sparkFracRef = useRef(0)
  const [unlockNote, setUnlockNote] = useState<string | null>(null)
  const [pops, setPops] = useState<{ key: number; x: number; y: number }[]>([])
  const paidTypes = useRef<Set<string>>(new Set())
  const prevSparks = useRef(runSparks)
  const [sparkPop, setSparkPop] = useState(false)
  const burstTimer = useRef(0)
  const stillTimer = useRef(0)
  const mendTimer = useRef(0)
  const shieldTimer = useRef(0)
  const bannerTimer = useRef(0)
  const pulseTimer = useRef(0)
  const metRef = useRef<string[]>([...(progress.defense.met ?? [])])
  const markMetRef = useRef(markMet)
  markMetRef.current = markMet
  const [plants, setPlants] = useState<Record<string, string>>(() => {
    if (!easy) return starterPlants(pads, unlocked)
    return initialNightJump(true)?.load.plants ?? {}
  })
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
  const fxRef = useRef({
    shots: [] as (Shot & { until: number })[],
    blasts: [] as (Blast & { until: number })[],
    juice: null as (EasyTapJuice & { until: number }) | null,
    flash: [] as { id: CityPlotId; until: number }[],
    firingUntil: 0,
    firingId: null as string | null,
    firingOn: false,
    shakeUntil: 0,
    shakeOn: false,
    combo: 0,
    downed: 0,
    dirty: false,
  })
  const publishFxRef = useRef<() => void>(() => {})
  publishFxRef.current = () => {
    const fx = fxRef.current
    const nowMs = performance.now()
    if (missLock.current && nowMs >= missUntil.current) {
      missLock.current = null
      fx.dirty = true
    }
    const shotN = fx.shots.length
    const blastN = fx.blasts.length
    const flashN = fx.flash.length
    fx.shots = fx.shots.filter((shot) => shot.until > nowMs)
    fx.blasts = fx.blasts.filter((blast) => blast.until > nowMs)
    fx.flash = fx.flash.filter((item) => item.until > nowMs)
    if (fx.juice && fx.juice.until <= nowMs) {
      fx.juice = null
      fx.dirty = true
    }
    if (fx.shots.length !== shotN || fx.blasts.length !== blastN || fx.flash.length !== flashN) fx.dirty = true
    const shaking = nowMs < fx.shakeUntil
    const firingNow = nowMs < fx.firingUntil
    if (shaking !== fx.shakeOn || firingNow !== fx.firingOn) fx.dirty = true
    if (!fx.dirty) return
    fx.dirty = false
    fx.shakeOn = shaking
    fx.firingOn = firingNow
    const score = tapScoreRef.current
    setTapHits(score.hits)
    setTapMisses(score.misses)
    setTapDamage(score.damage)
    setShots(fx.shots.map(({ until: _until, ...shot }) => shot))
    setBlasts(fx.blasts.map(({ until: _until, ...blast }) => blast))
    setFlash(fx.flash.map((item) => item.id))
    setTapJuice(
      fx.juice
        ? {
            key: fx.juice.key,
            combo: fx.juice.combo,
            left: fx.juice.left,
            top: fx.juice.top,
            kind: fx.juice.kind,
            face: fx.juice.face,
            down: fx.juice.down,
            shrug: fx.juice.shrug,
            shrugCue: fx.juice.shrugCue,
          }
        : null,
    )
    setCombo(fx.combo)
    setShake(shaking)
    setFiring(firingNow)
    setFiringId(firingNow ? fx.firingId : null)
    setDowned(fx.downed)
    if (missShown.current !== missLock.current) {
      missShown.current = missLock.current
      setToolLock(missLock.current)
    }
  }
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
    /** Easy boss was turned this round. A leak does not set this. */
    bossDown: false,
    freezeUntil: 0,
    /** Minis still owed before a downed count can clear the round. */
    extras: 0,
    nextId: 100000,
  })
  const autoFireRef = useRef<(now: number, frozen: boolean) => void>(() => {})
  const shotSeq = useRef(0)

  useEffect(() => {
    live.current.planted = planted
    live.current.plants = plants
  }, [planted, plants])

  function towerAbility(id: CityPlotId): WatchAbility {
    const plantedType = plants[id]
    if (plantedType && (isBell(plantedType) || isIncense(plantedType) || isCandle(plantedType) || unlocked.includes(plantedType))) return plantedType
    return unlocked.includes(ability) ? ability : 'love'
  }

  useEffect(() => {
    const finish = (ev: PointerEvent) => {
      const armed = armedPathBuy.current
      if (!armed) return
      const node = ev.target as Element | null
      const hit = node?.closest?.('.defend-ability, .defend-path-buy, .defend-path-pip')
      // A planted card opens its tree. Releasing on it must not spend the armed step.
      if (hit && !pathSpendControl(hit.className)) {
        armedPathBuy.current = null
        return
      }
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
    if (!returnPlot) return
    if (phase !== 'plant' && phase !== 'boost') return
    upgradeAtRef.current = returnPlot
    setUpgradeAt(returnPlot)
    setReturnPlot(null)
  }, [returnPlot, phase])

  useEffect(() => {
    if (runSparks > prevSparks.current) {
      setSparkPop(true)
      const timer = window.setTimeout(() => setSparkPop(false), 700)
      prevSparks.current = runSparks
      return () => window.clearTimeout(timer)
    }
    prevSparks.current = runSparks
  }, [runSparks])

  const nightSearch = typeof window === 'undefined' ? '' : window.location.search
  const nightPlaytest = nightWatchJumpAllowed(nightSearch, nwDebug)
  const nightSeed = nightWatchSeed(nightSearch)
  const seedPlanRef = useRef(nightSeed == null ? null : nightSeedPlan(nightSeed))
  seedPlanRef.current = nightSeed == null ? null : nightSeedPlan(nightSeed)
  const faceShiftRef = useRef(
    nightSeed == null ? 0 : nightSeedFaceShift(nightSeed, WALKER_FACE_POOL.length),
  )
  faceShiftRef.current = nightSeed == null ? 0 : nightSeedFaceShift(nightSeed, WALKER_FACE_POOL.length)
  useEffect(() => {
    bindNightRoll(nightSeed)
    return () => bindNightRoll(null)
  }, [nightSeed])
  const mapMissing = nightWatchMapMissing(nightSearch, nightPlaytest)
  const mapId = resolveNightMap({
    easy,
    unlocked: progress.defense.farHills === true,
    mazeBeat: progress.defense.mazeBeat,
    saved: progress.defense.nightMap,
    playtest: nightPlaytest,
    query: nightWatchMapQuery(nightSearch, nightPlaytest),
    session: sessionMap,
  })
  const playingMap = playableNightMap(mapId)
  mapIdRef.current = mapId
  tuneRef.current = nightTune(playingMap?.rules)
  hpMulRef.current = playingMap?.hpMul ?? 1
  waveRef.current = playingMap?.wave ?? null
  featuresRef.current = playingMap?.mapFeatures ?? []
  const candleOpen = candleUnlocked(easy, waveIndex, playingMap != null, phase)
  const bellOpen = bellUnlocked(easy, waveIndex, phase)
  const incenseOpen = incenseUnlocked(easy, waveIndex, phase)

  useEffect(() => {
    if (!candleOpen || seenCandle.current) return
    seenCandle.current = true
    setCandleNote(true)
    const timer = window.setTimeout(() => setCandleNote(false), 2800)
    return () => window.clearTimeout(timer)
  }, [candleOpen])

  const [roadD, setRoadD] = useState(activeNightRoadD)
  useLayoutEffect(() => {
    applyNightMap(mapId)
    setRoadD(activeNightRoadD())
    setGhost(null)
    return () => {
      applyNightMap('a2')
    }
  }, [mapId])

  useEffect(() => {
    const sync = () => setNwDebug(readNightWatchDebug())
    window.addEventListener('silver-city-nw-debug', sync)
    return () => window.removeEventListener('silver-city-nw-debug', sync)
  }, [])

  useEffect(() => {
    const search = typeof window === 'undefined' ? '' : window.location.search
    if (!easy || !nightWatchDebugPanel(search, nwDebug)) {
      setDebugPaused(false)
      return
    }
    if (phase === 'wave' && nightWatchDebugHolds(search, nwDebug)) setDebugPaused(true)
  }, [phase, waveIndex, nwDebug, easy])

  useEffect(() => {
    if (!(easy && phase === 'plant')) return
    const onDown = (event: PointerEvent) => {
      const target = event.target as Element | null
      if (!target?.closest) return
      if (target.closest('.defend-go, .defend-ability')) return
      if (!target.closest('.nw-docks')) return
      if (!plantOpenGroundRef.current(event.clientX, event.clientY)) return
      event.preventDefault()
      event.stopPropagation()
      const swallow = (follow: Event) => {
        follow.preventDefault()
        follow.stopPropagation()
      }
      window.addEventListener('pointerup', swallow, true)
      window.addEventListener('click', swallow, true)
      window.setTimeout(() => {
        window.removeEventListener('pointerup', swallow, true)
        window.removeEventListener('click', swallow, true)
      }, 400)
    }
    window.addEventListener('pointerdown', onDown, true)
    return () => window.removeEventListener('pointerdown', onDown, true)
  }, [easy, phase])

  useEffect(() => {
    if (phase !== 'wave' && phase !== 'boost') return
    setSkillNow(performance.now())
    const timer = window.setInterval(() => setSkillNow(performance.now()), 200)
    return () => window.clearInterval(timer)
  }, [phase])

  useEffect(() => {
    if (!juiceDone || saved.current || !brief) return
    saved.current = true
    recordNight(today, easy && mapId === 'a2')
  }, [juiceDone, brief, recordNight, today, easy, mapId])

  const roundJumpOnce = useRef(false)
  useEffect(() => {
    if (!easy || roundJumpOnce.current) return
    if (readNightReturn()) return
    const jump = readNightWatchRoundJump(nightLength(true))
    if (jump == null) return
    roundJumpOnce.current = true
    const bank = easyJumpSparkBank(jump)
    const planted = easyJumpLoad(jump)
    sparksRef.current = bank
    setRunSparks(bank)
    setWaveIndex(jump)
    runPathsRef.current = planted.paths
    setRunPaths(planted.paths)
    plantsRef.current = planted.plants
    setPlants(planted.plants)
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
      setSkillNote(null)
      return
    }
    const wave = waveIndexRef.current
    tapScoreRef.current = { hits: 0, misses: 0, damage: 0 }
    setTapHits(0)
    setTapMisses(0)
    setTapDamage(0)
    lampHurtRef.current = 0
    if (nightPlaytest) hudRef.current?.setAttribute('data-lamp-damage', '0')
    const intro = skillUnlockOnWave(wave)
    if (intro === 'still') {
      seenSkill.current.still = true
    } else if (intro && !seenSkill.current[intro]) {
      seenSkill.current[intro] = true
      setSkillNote(intro)
      setPulseId(intro)
      window.clearTimeout(pulseTimer.current)
      pulseTimer.current = window.setTimeout(() => {
        setPulseId((current) => (current === intro ? null : current))
      }, 2600)
    }
    const tune = waveCombat(wave, easy)
    const spec = easy ? waveRef.current : null
    const shaped = spec
      ? waveRound(roundForTune(easyRound(wave), wave, tuneRef.current), wave, spec)
      : null
    const liveTune =
      spec && shaped
        ? {
            ...tune,
            size: shaped.count + (easyBossRound(wave) ? 1 : 0),
            spawnScale: tune.spawnScale * spec.spawnMul,
          }
        : tune
    const cleared = progress.defense.cleared
    live.current.playing = true
    live.current.raiders = []
    live.current.spawned = 0
    live.current.downed = 0
    live.current.extras = 0
    live.current.nextId = 100000
    sparkFracRef.current = 0
    live.current.bossDown = false
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
    let seedCarry = 0
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
      // 3× is three steps of the 1× clock, so a clump of leaks is not one cheaper heart.
      const gameDt = pacedDt(wallDt, pace)
      const slices = pace === NIGHT_PACE_FAST ? NIGHT_PACE_FAST : 1
      const seedPlan = seedPlanRef.current
      let seededSteps = slices
      if (seedPlan) {
        const stepped = nightSeedSteps(seedCarry, gameDt)
        seedCarry = stepped.carry
        seededSteps = stepped.steps
      }
      last = now
      if (seedPlan && seededSteps < 1) {
        frame = requestAnimationFrame(tick)
        return
      }
      const dt = gameDt / slices
      const clockDt = seedPlan ? NIGHT_SEED_STEP : dt
      const frozen = nightWatchDebugFrozen(
        easy,
        debugPanelRef.current,
        debugPausedRef.current,
        now,
        live.current.freezeUntil,
      )
      for (let slice = 0; slice < (seedPlan ? seededSteps : slices); slice += 1) {
      if (!frozen) {
        spawnAt += dt
        if (easy) live.current.clock += dt * 1000
        // A playtest seed spends fixed steps. These two lines stay the unseeded clock.
        if (seedPlan) {
          spawnAt += clockDt - dt
          if (easy) live.current.clock += (clockDt - dt) * 1000
        }
      }
      const next = live.current.raiders.map((item) => {
        if (item.turned) {
          const tier = combatTier(item.turned, runTierRef.current)
          return { ...item, heavenT: (item.heavenT ?? 0) + nightEnemies.heavenSpeed(tier, easy) * (seedPlan ? clockDt : dt) }
        }
        const gaitPace = item.boss ? BOSS_PACE : walkerPace(easy ? item.gait : undefined)
        const paceMul = item.paceScale ?? 1
        let step = nightEnemies.speed(easy) * tune.speedScale * gaitPace * paceMul * (seedPlan ? clockDt : dt)
        let fog = item.fog
        let mapPace = 1
        if (easy && featuresRef.current.length > 0) {
          const zone = walkerZone(item.t, item.pathId, featuresRef.current)
          mapPace = zone.speed
          fog = zone.fog
        }
        // Round 7 and later. Rounds 1–6 do not read the bell.
        // One multiply for this slice. A second bell does not stack, and the
        // next frame starts from the new t, so the slow does not compound.
        let bellPace = 1
        if (easy && waveIndexRef.current >= 6) {
          bellPace = bellPaceFor(plantsRef.current, runPathsRef.current, nightEnemies.at(item))
        }
        step *= walkerSlowPace(mapPace, bellPace)
        return {
          ...item,
          fog,
          t: unturnedStep(item.t, step, frozen),
        }
      })
      let leaked = 0
      let bossThrough = false
      const walking = next.filter((item) => {
        if (item.turned) {
          if (easy) return false
          if ((item.heavenT ?? 0) >= 1) return false
          return true
        }
        if (item.t < 1) return true
        if (easy && item.boss) bossThrough = true
        else leaked += 1
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
      if (easy && bossThrough) {
        gate = applyBossExitLeak(live.current.hearts)
      } else if (easy) {
        const paced = applyEasyPaceLeaks(
          live.current.hearts,
          leaked,
          live.current.clock,
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
        const through = bossThrough
          ? 'The boss got through!'
          : gate.lostHearts === 1
            ? 'One got through!'
            : `${gate.lostHearts} got through!`
        setPowerBanner(through)
        window.clearTimeout(bannerTimer.current)
        bannerTimer.current = window.setTimeout(() => setPowerBanner(null), 1600)
        window.setTimeout(() => {
          setHeartDrop((current) => (current && current.at === gate.hearts ? null : current))
        }, 900)
        markMissRef.current(DEFEND_BRIEF_ID)
      }
      const unturnedLive = walking.filter((item) => !item.turned).length
      const spawnRound = shaped ?? roundForTune(easyRound(wave), wave, tuneRef.current)
      const bossWaiting =
        easy && wave > 5 && live.current.spawned === easyBossSpawnId(spawnRound.count, wave)
      const holdSpawn = easy && nightEnemies.holdSpawn(unturnedLive) && !bossWaiting
      if (
        !frozen &&
        live.current.spawned < liveTune.size &&
        !holdSpawn &&
        (live.current.spawnNow ||
          spawnAt >=
            nightEnemies.spawnEvery(easy) *
              liveTune.spawnScale *
              (seedPlan ? nightSeedSpawnScale(seedPlan.spawnFrac) : 1) ||
          (easy && live.current.spawned === 0))
      ) {
        live.current.spawnNow = false
        spawnAt = 0
        let packLeft = spec?.pack ?? 1
        while (
          packLeft > 0 &&
          live.current.spawned < liveTune.size &&
          (walking.filter((item) => !item.turned).length < (spec?.liveCap ?? 3) ||
            (easy && wave > 5 && live.current.spawned === easyBossSpawnId(spawnRound.count, wave)))
        ) {
        packLeft -= 1
        const id = live.current.spawned
        const cast = nightEnemies.cast(cleared, id, wave, easy)
        const round = spawnRound
        const boss = easy && id === easyBossSpawnId(round.count, wave)
        const gait = easy && !boss ? gaitForSlot(round, id) : undefined
        const hp = boss
          ? easyBossHp(wave)
          : easy
            ? spec
              ? waveWalkerHp(
                  nightEnemies.maxHp(cast.kind, easy),
                  tune.hpBonus + easyLatePush(wave),
                  gait,
                  wave,
                  tuneRef.current,
                  hpMulRef.current,
                  spec,
                )
              : scaledWalkerHp(
                  easyWalkerHp(
                    nightEnemies.maxHp(cast.kind, easy),
                    tune.hpBonus + easyLatePush(wave),
                    gait,
                    wave,
                    tuneRef.current,
                  ),
                  hpMulRef.current,
                )
            : nightEnemies.maxHp(cast.kind, easy) + tune.hpBonus
        if (boss) {
          setPowerBanner('Boss!')
          window.clearTimeout(bannerTimer.current)
          bannerTimer.current = window.setTimeout(() => setPowerBanner(null), 1800)
        }
        if (!metRef.current.includes(cast.id)) {
          metRef.current = [...metRef.current, cast.id]
          markMetRef.current(cast.id)
          const line = `${cast.label}: ${cast.lore}`
          setLoreMeet({ id: cast.id, line })
          window.setTimeout(() => {
            setLoreMeet((current) => (current?.id === cast.id ? null : current))
          }, 2200)
        }
        const face = easy
          ? pickWalkerFace(
              wave,
              id,
              walking.flatMap((item) => (item.face ? [item.face] : [])),
              faceShiftRef.current,
            )
          : undefined
        walking.push({
          id,
          t: easy
            ? easyLiveSpawnT(tune.speedScale * (boss ? BOSS_PACE : walkerPace(gait)))
            : nightEnemies.spawnT(id),
          text: cast.text,
          kind: cast.kind,
          label: cast.label,
          castId: cast.id,
          face,
          hp,
          maxHp: hp,
          gait,
          boss,
          spark: walkerSpark(gait),
          pathId: easy ? walkerRoadId(id) : undefined,
          fog: false,
        })
        live.current.spawned += 1
        }
      }
      live.current.raiders = walking
      const debugHold = easy && debugPanelRef.current && debugPausedRef.current
      autoFireRef.current(now, debugHold)
      const alive = live.current.raiders
      publishFxRef.current()
      setRaiders(alive)
      if (gate.failed || live.current.hearts <= 0) {
        live.current.playing = false
        setPhase('lost')
        return
      }
      const grantClearHeart = () => {
        const next = easyClearHeart(live.current.hearts)
        if (next === live.current.hearts) {
          setHeartPop(false)
          return
        }
        live.current.hearts = next
        setHearts(next)
        setHeartPop(true)
        window.setTimeout(() => setHeartPop(false), 1200)
      }
      const grantBossSparks = () => {
        if (!easy) {
          setBossBonus(0)
          return
        }
        if (easyBossRound(wave) && !live.current.bossDown) {
          setBossBonus(0)
          return
        }
        const bonus = easyBossClearSparks(wave)
        setBossBonus(bonus)
        if (bonus <= 0) return
        sparksRef.current += bonus
        setRunSparks((count) => count + bonus)
      }
      const grantClearSpark = () => {
        if (!easy) {
          setClearSpark(0)
          return
        }
        const bonus = easyClearSparkBonus(wave)
        setClearSpark(bonus)
        if (bonus <= 0) return
        sparksRef.current += bonus
        setRunSparks((count) => count + bonus)
      }
      const endNight = () => {
        const exit = applyBossExitLeak(live.current.hearts)
        live.current.hearts = exit.hearts
        setHearts(exit.hearts)
        live.current.playing = false
        setPhase('lost')
      }
      const roadClear =
        nightEnemies.isClear(
          easy,
          live.current.downed,
          live.current.spawned,
          alive.length,
          liveTune.size + live.current.extras,
        ) ||
        (easy &&
          live.current.spawned >= liveTune.size &&
          alive.filter((item) => !item.turned).length === 0 &&
          live.current.hearts > 0)
      const fate = liveBossClearPhase({
        easy,
        bossRound: easyBossRound(wave),
        bossDown: live.current.bossDown,
        roadClear,
      })
      if (fate === 'lost') {
        endNight()
        return
      }
      if (fate === 'clear') {
        if (easy && wave === 9) {
          const id = mapIdRef.current
          const known = mazeBeatListRef.current.includes(id)
          const opened = nextMap(id)
          mazeBeatRef.current(id)
          if (!known && opened) {
            const line = `New map unlocked: ${NIGHT_MAP_NAME[opened]}!`
            setUnlockNote(line)
            window.setTimeout(() => {
              setUnlockNote((current) => (current === line ? null : current))
            }, 4200)
          }
        }
        if (easy) grantClearHeart()
        grantBossSparks()
        grantClearSpark()
        live.current.playing = false
        setToolLock(null)
        setPhase('boost')
        return
      }
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      live.current.playing = false
      cancelAnimationFrame(frame)
    }
  }, [phase, easy, progress.defense.cleared, waveIndex])

  useEffect(() => {
    if (phase === 'wave') return
    window.clearTimeout(stillTimer.current)
    setStillOn(false)
  }, [phase])

  useEffect(() => {
    if (phase === 'boost') return
    setSpendOpen(false)
    setHelpOpen(false)
  }, [phase])

  useEffect(() => () => newLampStop.current?.(), [])

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
    const bell = isBell(id)
    const incense = isIncense(id)
    const candle = isCandle(id)
    if (bell) {
      if (phase !== 'wave' && phase !== 'boost' && phase !== 'plant') return
      if (!bellRoom(plantsRef.current)) {
        clearPlaceArm()
        return
      }
    } else if (incense) {
      if (phase !== 'wave' && phase !== 'boost' && phase !== 'plant') return
      if (!incenseRoom(plantsRef.current)) {
        clearPlaceArm()
        return
      }
    } else if (candle) {
      if (phase !== 'wave' && phase !== 'boost' && phase !== 'plant') return
      if (!candleRoom(plantsRef.current)) {
        clearPlaceArm()
        return
      }
    } else if (phase !== 'wave' && phase !== 'boost') {
      return
    } else if (Object.values(plantsRef.current).includes(id)) {
      clearPlaceArm()
      return
    }
    if (phase === 'boost') clearCardAt.current = performance.now()
    setSpendOpen(false)
    setHelpOpen(false)
    placeArmRef.current = id
    setPlaceArm(id)
    if (!candle && !bell && !incense) setAbility(id)
    closeUpgrade(true)
  }

  function armBell() {
    if (!easy || won) return
    if (!bellUnlocked(easy, waveIndexRef.current, phase)) return
    if (isBell(placeArmRef.current)) {
      clearPlaceArm()
      return
    }
    if (!bellRoom(plantsRef.current)) {
      flashKit('One bell')
      return
    }
    if (sparksRef.current < BELL_COST) {
      flashKit(`Need ${BELL_COST} sparks`)
      return
    }
    armPlace(BELL_ID)
  }

  function armIncense() {
    if (!easy || won) return
    if (!incenseUnlocked(easy, waveIndexRef.current, phase)) return
    if (isIncense(placeArmRef.current)) {
      clearPlaceArm()
      return
    }
    if (!incenseRoom(plantsRef.current)) {
      flashKit('One incense')
      return
    }
    if (sparksRef.current < INCENSE_COST) {
      flashKit(`Need ${INCENSE_COST} sparks`)
      return
    }
    armPlace(INCENSE_ID)
  }

  function armCandle() {
    if (!easy || won) return
    if (!candleUnlocked(easy, waveIndexRef.current, mapIdRef.current !== 'a2', phase)) return
    if (isCandle(placeArmRef.current)) {
      clearPlaceArm()
      return
    }
    if (!candleRoom(plantsRef.current)) {
      flashKit('Six candles')
      return
    }
    if (sparksRef.current < CANDLE_COST) {
      flashKit(`Need ${CANDLE_COST} sparks`)
      return
    }
    armPlace(CANDLE_ID)
  }

  function unplantedLampId(): WatchAbility | null {
    const standing = Object.values(plantsRef.current)
    const open = WATCH_TOOLS.map((tool) => tool.id).filter((id) => !standing.includes(id))
    if (open.length < 1) return null
    return (open.includes(ability) ? ability : open[0]) as WatchAbility
  }

  function armUnplantedLamp() {
    if (!easy || won || phase !== 'boost') return
    clearCardAt.current = performance.now()
    const pick = unplantedLampId()
    if (!pick) {
      flashKit('Every lamp is planted')
      return
    }
    if (sparksRef.current < EASY_LAMP_COST) {
      flashKit(`Need ${EASY_LAMP_COST} sparks`)
      return
    }
    armPlace(pick)
  }

  /** Tap arms a ground plant. A slide drops the lamp where the finger lifts. */
  function trackNewLamp(event: {
    pointerId: number
    pointerType: string
    button: number
    clientX: number
    clientY: number
    stopPropagation: () => void
  }) {
    if (!easy || won || phase !== 'boost') return
    event.stopPropagation()
    clearCardAt.current = performance.now()
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const pick = unplantedLampId()
    if (!pick) {
      flashKit('Every lamp is planted')
      return
    }
    if (sparksRef.current < EASY_LAMP_COST) {
      flashKit(`Need ${EASY_LAMP_COST} sparks`)
      return
    }
    newLampStop.current?.()
    const start = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      moved: false,
    }
    let last = { x: event.clientX, y: event.clientY }
    let done = false
    onCardPress(true)
    const finish = (ev: PointerEvent, drop: boolean) => {
      if (done || ev.pointerId !== start.pointerId) return
      done = true
      newLampStop.current?.()
      newLampStop.current = null
      onCardPress(false)
      clearCardAt.current = performance.now()
      if (!start.moved) {
        flushSync(() => armPlace(pick))
        return
      }
      swallowNewLampClick.current = true
      if (ev.cancelable) ev.preventDefault()
      ev.stopPropagation()
      const point = drop ? last : { x: ev.clientX, y: ev.clientY }
      onLampDrag(drop ? 'drop' : 'cancel', pick, point.x, point.y)
    }
    const move = (ev: PointerEvent) => {
      if (done || ev.pointerId !== start.pointerId) return
      const dx = ev.clientX - start.x
      const dy = ev.clientY - start.y
      if (!start.moved && dx * dx + dy * dy < LAMP_DRAG_START_PX * LAMP_DRAG_START_PX) return
      if (!start.moved) {
        start.moved = true
        flushSync(() => armPlace(pick))
      }
      last = { x: ev.clientX, y: ev.clientY }
      if (ev.cancelable) ev.preventDefault()
      onLampDrag('move', pick, ev.clientX, ev.clientY)
    }
    const up = (ev: PointerEvent) => {
      last = { x: ev.clientX, y: ev.clientY }
      finish(ev, true)
    }
    const cancel = (ev: PointerEvent) => finish(ev, start.moved)
    const opts: AddEventListenerOptions = { capture: true, passive: false }
    window.addEventListener('pointermove', move, opts)
    window.addEventListener('pointerup', up, opts)
    window.addEventListener('pointercancel', cancel, opts)
    newLampStop.current = () => {
      window.removeEventListener('pointermove', move, opts)
      window.removeEventListener('pointerup', up, opts)
      window.removeEventListener('pointercancel', cancel, opts)
    }
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
    const bell = isBell(using)
    const incense = isIncense(using)
    const candle = isCandle(using)
    if (paid && bell && !bellRoom(plantsNow)) return false
    if (paid && incense && !incenseRoom(plantsNow)) return false
    if (paid && candle && !candleRoom(plantsNow)) return false
    if (paid && !bell && !incense && !candle && Object.values(plantsNow).includes(using)) return false
    const next = commitLamp(
      plantsNow,
      point,
      using,
      progress,
      runTier,
      hud,
      easy,
      placeBonus(using),
    )
    if (!next.ok) {
      setGhost(next.preview)
      return false
    }
    if (paid) {
      const bought = bell
        ? buyExtraLamp(sparksRef.current, BELL_COST)
        : incense
          ? buyExtraLamp(sparksRef.current, INCENSE_COST)
          : candle
            ? buyExtraLamp(sparksRef.current, CANDLE_COST)
            : buyExtraLamp(sparksRef.current)
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
    if (paid) {
      if (bell || incense || candle) paidTypes.current.add(next.preview.spot)
      else paidTypes.current.add(using)
    }
    setGhost(null)
    closeUpgrade(true)
    return true
  }

  plantOpenGroundRef.current = (clientX, clientY) => {
    if (phase !== 'plant') return false
    const svg = boardRef.current
    if (!svg) return false
    const point = clientToMap(svg, clientX, clientY)
    if (!point) return false
    const finger = lampUnderFinger(point)
    const using = unlocked.includes(ability) ? ability : 'love'
    if (lampSpotBlocked(finger, plantsRef.current)) return false
    return finishPlace(plantsRef.current, finger, using, false, false)
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
    const armed = placeArmRef.current
    const bellArm = isBell(armed)
    const incenseArm = isIncense(armed)
    const candleArm = isCandle(armed)
    const opening = easy && phase === 'plant' && !candleArm && !bellArm && !incenseArm
    const typeFree = armed
      ? bellArm
        ? bellRoom(plantsRef.current)
        : incenseArm
          ? incenseRoom(plantsRef.current)
          : candleArm
            ? candleRoom(plantsRef.current)
            : !Object.values(plantsRef.current).includes(armed)
      : false
    const paid = Boolean(
      armed && typeFree && easy && !opening && (bellArm || incenseArm || candleArm || phase === 'wave' || phase === 'boost'),
    )
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
    const using = paid ? (armed as WatchAbility) : unlocked.includes(ability) ? ability : 'love'
    const hud = hudCoversPoint(event.clientX, event.clientY, svg.ownerDocument)
    const finger = lampUnderFinger(point)
    const snapped = candleArm
      ? magnetCandlePoint(point, plantsRef.current, progress, runTier, hud, placeBonus(using))
      : null
    const seat = snapped ?? finger
    const look = previewLamp(
      seat,
      using,
      progress,
      runTier,
      plantsRef.current,
      hud,
      easy,
      placeBonus(using),
    )
    if (event.type === 'pointercancel') {
      setGhost(null)
      return
    }
    if (event.type === 'pointerup') {
      if (phase === 'wave') swallowWaveTap.current = true
      finishPlace(plantsRef.current, seat, using, hud, paid)
      return
    }
    setGhost(look)
  }

  function onCardPress(down: boolean) {
    lampDragLive.current = down
  }

  function onLampDrag(kind: LampDragPhase, using: WatchAbility, clientX: number, clientY: number) {
    const bellArm = isBell(using)
    const incenseArm = isIncense(using)
    const candleArm = isCandle(using)
    const opening = easy && phase === 'plant' && !candleArm && !bellArm && !incenseArm
    const typeFree = bellArm
      ? bellRoom(plantsRef.current)
      : incenseArm
        ? incenseRoom(plantsRef.current)
        : candleArm
          ? candleRoom(plantsRef.current)
          : !Object.values(plantsRef.current).includes(using)
    const paid = typeFree && easy && (bellArm || incenseArm || candleArm || phase === 'wave' || phase === 'boost')
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
    const raw = clientToMap(svg, lifted.x, lifted.y)
    if (!raw) {
      setGhost(null)
      return
    }
    const finger = lampUnderFinger(raw)
    const hud = overTowerCards(clientX, clientY, doc) || hudCoversPoint(lifted.x, lifted.y, doc)
    const snapped = candleArm
      ? magnetCandlePoint(raw, plantsRef.current, progress, runTier, hud, placeBonus(using))
      : null
    const point = snapped ?? finger
    if (kind === 'move') {
      setGhost(
        previewLamp(point, using, progress, runTier, plantsRef.current, hud, easy, placeBonus(using)),
      )
      return
    }
    finishPlace(plantsRef.current, point, using, hud, paid)
  }

  /** Far steps this type already owns. The ghost ring uses the same bonus as a shot. */
  function placeBonus(using: string): number {
    if (!easy) return 0
    return easyShotReach(pathsOf(runPathsRef.current, using))
  }

  function openUpgrade(id: CityPlotId) {
    setSpendOpen(false)
    setHelpOpen(false)
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
    const type = plantsRef.current[id]
    if (!type) return 0
    if (isBell(type)) {
      const paid = lampPullRefund(paidTypes.current.has(id), BELL_COST)
      return paid + pathSparkSpend(pathsOf(runPathsRef.current, bellPathKey(id)))
    }
    if (isIncense(type)) {
      const paid = lampPullRefund(paidTypes.current.has(id), INCENSE_COST)
      return paid + pathSparkSpend(pathsOf(runPathsRef.current, incensePathKey(id)))
    }
    if (isCandle(type)) {
      const paid = lampPullRefund(paidTypes.current.has(id), CANDLE_COST)
      return paid + pathSparkSpend(pathsOf(runPathsRef.current, candlePathKey(id)))
    }
    const paid = lampPullRefund(paidTypes.current.has(type), EASY_LAMP_COST)
    return paid + pathSparkSpend(pathsOf(runPathsRef.current, type))
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
    if (type && (isBell(type) || isIncense(type) || isCandle(type))) {
      paidTypes.current.delete(id)
      const cleared = { ...runPathsRef.current }
      delete cleared[isBell(type) ? bellPathKey(id) : isIncense(type) ? incensePathKey(id) : candlePathKey(id)]
      runPathsRef.current = cleared
      setRunPaths(cleared)
    } else if (type) {
      paidTypes.current.delete(type)
      const cleared = { ...runPathsRef.current, [type]: freshLampPaths() }
      runPathsRef.current = cleared
      setRunPaths(cleared)
    }
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

  function lampCombat(toolId: string, plotId?: string) {
    if (easy && isCandle(toolId) && plotId) {
      const paths = pathsOf(runPathsRef.current, candlePathKey(plotId))
      const strike = candleStrike(paths, candleRowSize(plotId, plantsRef.current))
      return { damage: strike.damage, rangeBonus: strike.rangeBonus, strike }
    }
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
    if (easy && isCandle(toolId)) {
      const rowReach =
        waveIndexRef.current >= 6 ? candleRowReachBonus(candleRowSize(id, plantsRef.current)) : 0
      return candlePlateReach(
        id,
        candleFarBonus(pathsOf(runPathsRef.current, candlePathKey(id))) + rowReach,
      )
    }
    const combat = lampCombat(toolId)
    const extra = easy ? easyShotReach(pathsOf(runPathsRef.current, toolId)) : combat.rangeBonus
    return nightTowers.range(id, toolId, progress, runTierRef.current, extra)
  }

  function grantSparks(pay: number) {
    const mul = waveRef.current?.sparkMul ?? 1
    if (!(pay > 0) || !(mul > 0)) return
    sparkFracRef.current += pay * mul
    const whole = Math.floor(sparkFracRef.current)
    if (whole <= 0) return
    sparkFracRef.current -= whole
    sparksRef.current += whole
    setRunSparks((count) => count + whole)
  }

  function releaseMinis(parent: Raider) {
    const split = splitFeature(featuresRef.current)
    const born = minisOnKill(split, waveIndexRef.current, parent.gait, !!parent.boss, !!parent.mini)
    if (!split || born < 1) return
    const at = raiderAt(parent)
    const taken = live.current.raiders.flatMap((item) => (item.face ? [item.face] : []))
    for (let q = 0; q < born; q += 1) {
      const hp = miniHp(parent.maxHp ?? parent.hp, split)
      const id = live.current.nextId
      live.current.nextId += 1
      live.current.extras += 1
      const face = easy
        ? pickWalkerFace(waveIndexRef.current, id, taken, faceShiftRef.current)
        : parent.face
      if (face) taken.push(face)
      live.current.raiders.push({
        id,
        t: Math.max(0, parent.t - 0.02 * q),
        text: parent.text,
        kind: parent.kind,
        label: parent.label,
        face,
        castId: parent.castId,
        hp,
        maxHp: hp,
        gait: 'plain',
        boss: false,
        spark: 0,
        pathId: parent.pathId,
        paceScale: FAST_PACE * 0.8,
        mini: true,
      })
    }
    const key = performance.now()
    setPops((current) => [...current, { key, x: at.x, y: at.y }])
    window.setTimeout(() => {
      setPops((current) => current.filter((pop) => pop.key !== key))
    }, 300)
  }

  function fire(id: CityPlotId, forceRaiderId?: number, manual = false) {
    if (phase !== 'wave' || won) return false
    const now = performance.now()
    const at = nightTowers.anchor(id)
    const using = towerAbility(id)
    if (isBell(using)) return false
    if (isIncense(using)) return false
    const combat = lampCombat(using, id)
    const rawCd = combat.strike ? combat.strike.cooldownMs : nightTowers.cooldown(id, progress)
    // Easy: the clock already runs at 1× or 3×, so the cooldown stays in game ms.
    // Hard keeps the wall clock. A face tap is its own hit and does not wait.
    const wait = easy ? rawCd : pacedCooldown(nightTowers.cooldown(id, progress), combatPace())
    const rowPace =
      easy && isCandle(using)
        ? candleEarlyPace(candleRowSize(id, plantsRef.current), waveIndexRef.current)
        : undefined
    const gate = wait * (rowPace ?? 1)
    const shotAt = easy ? live.current.clock : now
    if (!manual) {
      const last = easy ? live.current.cool[id] : (live.current.cool[id] ?? 0)
      if (last != null && last + gate > shotAt) return false
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
    const fx = fxRef.current
    fx.firingUntil = performance.now() + SHOT_JUICE_MS
    fx.firingId = using
    fx.dirty = true
    if (!best) return false
    const to = raiderAt(best)
    const aim = { x: to.x, y: to.y + PATH_WALKER_FACE_DY }
    const fit = nightEnemies.fit(easy, using, best.kind)
    const heldLine = learningForTool(progress, using)
    comboRef.current += 1
    const nextCombo = comboRef.current
    fx.combo = nextCombo
    fx.shakeUntil = performance.now() + 160
    fx.dirty = true
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
      const cloud =
        easy && manual
          ? incenseBonusFor(plantsRef.current, runPathsRef.current, to)
          : 0
      const sized = liveNightDamage(best, {
        easy,
        manual,
        roundIndex: waveIndexRef.current,
        lampDamage: tier,
        armorFrom: tuneRef.current.armorFrom,
        tapBonus: cloud,
      })
      if (isCandle(using) && !manual) {
        sized.damage = candleWalkerDamage(
          sized.damage,
          candleRowSize(id, plantsRef.current),
          waveIndexRef.current,
          Boolean(best.boss),
        )
      }
      const struck = nightEnemies.hit(best, sized.damage)
      if (easy && !manual && nightPlaytest) {
        const applied = Math.max(0, best.hp - struck.raider.hp)
        if (applied > 0) {
          lampHurtRef.current += applied
          hudRef.current?.setAttribute('data-lamp-damage', String(lampHurtRef.current))
        }
      }
      const tapDmg = sized.damage
      const armored = sized.armored
      const nextChip = sized.nextChip
      const sparks = sparkAwardForHit(struck.down, best.spark ?? 1)
      blast.pop = struck.down
      blast.spark = sparks
      if (easy) {
        const juiceAt = boardPoint(aim.x, aim.y)
        fx.juice = {
          key: now,
          combo: nextCombo,
          left: juiceAt.left,
          top: juiceAt.top,
          kind: best.kind,
          face: best.face,
          down: struck.down,
          shrug: manual && armored && tapDmg <= 0,
          shrugCue: r10ShrugCue(
            waveIndexRef.current,
            !!best.boss,
            tapDmg,
            armored,
            tuneRef.current.armorFrom,
          ),
          until: now + 620,
        }
        fx.dirty = true
      }
      live.current.raiders = live.current.raiders.map((item) =>
        item.id !== best.id
          ? item
          : struck.down
            ? {
                ...struck.raider,
                tapChip: nextChip,
                turned: using,
                from: to,
                heavenT: 0,
                struckAt: now,
                text: 'Toward heaven',
              }
            : { ...struck.raider, tapChip: nextChip, struckAt: now },
      )
      if (struck.down) {
        if (best.boss) live.current.bossDown = true
        live.current.downed += 1
        const sparks = best.spark ?? walkerSpark(best.gait)
        if (waveRef.current) grantSparks(sparks)
        else setRunSparks((count) => count + sparks)
        releaseMinis(best)
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
          const beforeHp = pick.hp
          const nick = nightEnemies.hit(
            pick,
            isCandle(using)
              ? candleWalkerDamage(
                  amount,
                  candleRowSize(id, plantsRef.current),
                  waveIndexRef.current,
                  Boolean(pick.boss),
                )
              : amount,
          )
          const nicked = Math.max(0, beforeHp - nick.raider.hp)
          if (nicked > 0 && nightPlaytest) {
            lampHurtRef.current += nicked
            hudRef.current?.setAttribute('data-lamp-damage', String(lampHurtRef.current))
          }
          const spot = raiderAt(pick)
          live.current.raiders = live.current.raiders.map((item) =>
            item.id !== pick.id
              ? item
              : nick.down
                ? { ...nick.raider, turned: using, from: spot, heavenT: 0, struckAt: now, text: 'Toward heaven' }
                : { ...nick.raider, struckAt: now },
          )
          if (nick.down) {
            if (pick.boss) live.current.bossDown = true
            live.current.downed += 1
            if (waveRef.current) grantSparks(pick.spark ?? walkerSpark(pick.gait))
            else setRunSparks((count) => count + walkerSpark(pick.gait))
            releaseMinis(pick)
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
    const muzzle = isCandle(using) ? { x: at.x, y: at.y - 36 } : nightTowers.muzzle(id)
    fx.shots = [
      ...fx.shots.filter((shot) => shot.until > now).slice(-3),
      { key: shotKey, from: muzzle, to: aim, until: now + SHOT_JUICE_MS },
    ]
    fx.blasts = [...fx.blasts.filter((item) => item.until > now).slice(-3), { ...blast, until: now + 620 }]
    fx.downed = live.current.downed
    fx.dirty = true
    return true
  }

  function lightPad(id: CityPlotId) {
    const until = performance.now() + SHOT_JUICE_MS
    const fx = fxRef.current
    fx.flash = [...fx.flash.filter((item) => item.id !== id && item.until > performance.now()), { id, until }]
    fx.dirty = true
  }

  autoFireRef.current = (now: number, frozen: boolean) => {
    for (const id of live.current.planted) {
      const using = towerAbility(id)
      if (isBell(using)) continue
      if (isIncense(using)) continue
      const rawCd = easy
        ? lampCombat(using, id).strike!.cooldownMs
        : nightTowers.cooldown(id, progress)
      const wait = easy ? rawCd : pacedCooldown(nightTowers.cooldown(id, progress), combatPace())
      const rowPace =
        easy && isCandle(using)
          ? candleEarlyPace(candleRowSize(id, plantsRef.current), waveIndexRef.current)
          : undefined
      const gate = wait * (rowPace ?? 1)
      const shotAt = easy ? live.current.clock : now
      const shotFrac = seedPlanRef.current?.shotFrac ?? null
      let last = live.current.cool[id]
      if (easy && last == null) {
        last = nightSeedFirstShotAt(shotFrac, shotAt, gate)
        if (shotFrac != null) live.current.cool[id] = last
      } else if (!easy && last == null) {
        last = 0
      }
      if (!lampReadyToFire(last, shotAt, gate, frozen)) continue
      const at = nightTowers.anchor(id)
      const range = hitRange(id, using)
      const aimed = live.current.raiders.some(
        (raider) => !raider.turned && dist(at, raiderAt(raider)) <= range,
      )
      if (aimed) fire(id)
    }
  }

  function claimTap(): boolean {
    if (tapClaim.current) return false
    tapClaim.current = 1
    queueMicrotask(() => {
      tapClaim.current = 0
    })
    return true
  }

  function noteFaceTap(hit: boolean, damage: number) {
    if (!easy) return
    const score = tapScoreRef.current
    if (hit) {
      score.hits += 1
      score.damage += damage
    } else {
      score.misses += 1
    }
    const node = hudRef.current?.ownerDocument.querySelector('.nw-tap-readout')
    if (node) {
      node.setAttribute('data-tap-hits', String(score.hits))
      node.setAttribute('data-tap-misses', String(score.misses))
      node.setAttribute('data-tap-damage', String(score.damage))
      const boss = node.getAttribute('data-boss-hp')
      const max = node.getAttribute('data-boss-max')
      node.textContent = `Taps ${score.hits} hit · ${score.misses} miss · ${score.damage} dmg · Boss ${boss ? `${boss}/${max}` : '—'}`
    }
    fxRef.current.dirty = true
  }

  function showMiss() {
    missLock.current = EASY.nightMiss
    missUntil.current = performance.now() + EASY_MISS_HOLD_MS
    fxRef.current.dirty = true
  }

  function dismissMiss() {
    if (missLock.current == null) return
    missLock.current = null
    missUntil.current = 0
    fxRef.current.dirty = true
  }

  function fireAtRaider(raiderId: number) {
    if (phase !== 'wave' || won) return
    if (!claimTap()) return
    const raider = live.current.raiders.find((item) => item.id === raiderId && !item.turned)
    if (!raider) return
    const gate = easyPointerTapGate(easy, raider, live.current.raiders, waveIndexRef.current, tuneRef.current.armorFrom)
    if (gate === 'miss') {
      noteFaceTap(false, 0)
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
      const damage =
        easy && lamp
          ? liveNightDamage(raider, {
              easy: true,
              manual: true,
              roundIndex: waveIndexRef.current,
              lampDamage: 0,
              armorFrom: tuneRef.current.armorFrom,
              tapBonus: incenseBonusFor(plantsRef.current, runPathsRef.current, point),
            }).damage
          : 0
      if (lamp && fire(lamp, raiderId, easy)) {
        if (easy) {
          dismissMiss()
          noteFaceTap(true, damage)
        }
        return
      }
    }
    if (easy) {
      noteFaceTap(false, 0)
      showMiss()
    }
  }

  function fireBest() {
    if (swallowWaveTap.current) {
      swallowWaveTap.current = false
      return
    }
    if (phase !== 'wave' || won) return
    if (!claimTap()) return
    if (faceTapStrike(easy, false, false) === 'miss' && easy) {
      noteFaceTap(false, 0)
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
    tapScoreRef.current = { hits: 0, misses: 0, damage: 0 }
    fxRef.current.shots = []
    fxRef.current.blasts = []
    fxRef.current.juice = null
    fxRef.current.flash = []
    fxRef.current.dirty = false
    setTapHits(0)
    setTapMisses(0)
    setTapDamage(0)
    lampHurtRef.current = 0
    setRunTier(freshRunTier())
    setRunPaths(freshRunPaths())
    runPathsRef.current = freshRunPaths()
    paidTypes.current = new Set()
    setPlants(easy ? {} : starterPlants(pads, unlocked))
    clearPlaceArm()
    setRunSparks(0)
    sparksRef.current = 0
    setBossBonus(0)
    setClearSpark(0)
    const ready = { still: 0, mend: 0 }
    skillReadyRef.current = ready
    setSkillReady(ready)
    seenSkill.current = { still: false, mend: false }
    skillHoldRef.current = false
    setSkillNote(null)
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

  function bonusGateFor(id: string) {
    return {
      lessons: samePillarLessons(id, progress.held),
      playtest: nightWatchJumpAllowed(
        typeof window === 'undefined' ? '' : window.location.search,
        nwDebugRef.current,
      ),
    }
  }

  function openLockInLessons() {
    if (phase !== 'plant' && phase !== 'boost') return
    const plotId = upgradeAtRef.current
    const tool = plotId ? plantsRef.current[plotId] : ''
    if (!plotId || !tool) return
    if (typeof history !== 'undefined') history.pushState({ nwNight: true }, '')
    saveNightReturn({
      phase: phase === 'boost' ? 'boost' : 'plant',
      waveIndex,
      plants: { ...plantsRef.current },
      paths: { ...runPathsRef.current },
      sparks: sparksRef.current,
      hearts,
      paid: [...paidTypes.current],
      upgradePlot: plotId,
    })
    onNavigate({ name: 'area', areaId: lessonAreaFor(tool, progress.held) })
  }

  useEffect(() => {
    if (!easy || roundJumpOnce.current) return
    const snap = readNightReturn()
    if (!snap) return
    roundJumpOnce.current = true
    clearNightReturn()
    sparksRef.current = snap.sparks
    setRunSparks(snap.sparks)
    setWaveIndex(snap.waveIndex)
    runPathsRef.current = snap.paths
    setRunPaths(snap.paths)
    plantsRef.current = snap.plants
    setPlants(snap.plants)
    paidTypes.current = new Set(snap.paid)
    live.current.hearts = snap.hearts
    setHearts(snap.hearts)
    if (snap.upgradePlot) setReturnPlot(snap.upgradePlot as CityPlotId)
    setPhase(snap.phase)
  }, [easy])

  function boostPath(id: WatchAbility, path: TreePath, lampId?: CityPlotId | null) {
    if (!easy) return
    if (placeArmRef.current) {
      placeArmRef.current = null
      setPlaceArm(null)
      setGhost(null)
    }
    const beforeSparks = sparksRef.current
    const next = applyPathStep(id, runPathsRef.current, sparksRef.current, path, bonusGateFor(id))
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
    armedPathBuy.current = null
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

  function boostIncense(plotId: CityPlotId) {
    if (!easy || !incenseUnlocked(easy, waveIndexRef.current, phase)) return
    if (placeArmRef.current) {
      placeArmRef.current = null
      setPlaceArm(null)
      setGhost(null)
    }
    const beforeSparks = sparksRef.current
    const next = applyIncenseStep(plotId, runPathsRef.current, sparksRef.current)
    setBoostNote(next.note)
    if (!next.ok) return
    runPathsRef.current = next.paths
    sparksRef.current = next.sparks
    setRunPaths(next.paths)
    setRunSparks(next.sparks)
    setSparkSpent(Math.max(1, beforeSparks - next.sparks))
    setToolLock(null)
    window.clearTimeout(burstTimer.current)
    setSparkSpend(true)
    setUpFlash(plotId)
    burstTimer.current = window.setTimeout(() => {
      setSparkSpend(false)
      setUpFlash((current) => (current === plotId ? null : current))
    }, LEVEL_BURST_MS)
  }

  function boostBell(plotId: CityPlotId) {
    if (!easy || !bellUnlocked(easy, waveIndexRef.current, phase)) return
    if (placeArmRef.current) {
      placeArmRef.current = null
      setPlaceArm(null)
      setGhost(null)
    }
    const beforeSparks = sparksRef.current
    const next = applyBellStep(plotId, runPathsRef.current, sparksRef.current)
    setBoostNote(next.note)
    if (!next.ok) return
    runPathsRef.current = next.paths
    sparksRef.current = next.sparks
    setRunPaths(next.paths)
    setRunSparks(next.sparks)
    setSparkSpent(Math.max(1, beforeSparks - next.sparks))
    setToolLock(null)
    window.clearTimeout(burstTimer.current)
    setSparkSpend(true)
    setUpFlash(plotId)
    burstTimer.current = window.setTimeout(() => {
      setSparkSpend(false)
      setUpFlash((current) => (current === plotId ? null : current))
    }, LEVEL_BURST_MS)
  }

  function boostCandle(plotId: CityPlotId, path: TreePath) {
    if (!easy) return
    if (placeArmRef.current) {
      placeArmRef.current = null
      setPlaceArm(null)
      setGhost(null)
    }
    const beforeSparks = sparksRef.current
    const next = applyCandleStep(plotId, runPathsRef.current, sparksRef.current, path)
    setBoostNote(next.note)
    if (!next.ok) return
    runPathsRef.current = next.paths
    sparksRef.current = next.sparks
    setRunPaths(next.paths)
    setRunSparks(next.sparks)
    setSparkSpent(Math.max(1, beforeSparks - next.sparks))
    setToolLock(null)
    window.clearTimeout(burstTimer.current)
    setSparkSpend(true)
    setUpFlash(plotId)
    burstTimer.current = window.setTimeout(() => {
      setSparkSpend(false)
      setUpFlash((current) => (current === plotId ? null : current))
    }, LEVEL_BURST_MS)
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
    if (isBell(plantsRef.current[plotId])) {
      boostBell(plotId)
      return
    }
    if (isIncense(plantsRef.current[plotId])) {
      boostIncense(plotId)
      return
    }
    if (isCandle(plantsRef.current[plotId])) {
      boostCandle(plotId, path)
      return
    }
    const tool = lampUpgradeTool(plotId, plantsRef.current)
    if (!tool || !unlocked.includes(tool as WatchAbility)) return
    boostPath(tool as WatchAbility, path, plotId)
  }
  boostPathRef.current = boostSelectedPath

  function buyBright(plotId: CityPlotId) {
    if (!easy || !brightRoundOpen(waveIndexRef.current)) return
    const tool = lampUpgradeTool(plotId, plantsRef.current)
    if (!tool || !unlocked.includes(tool as WatchAbility)) return
    const beforeSparks = sparksRef.current
    const next = applyBright(tool, runPathsRef.current, sparksRef.current)
    setBoostNote(next.note)
    if (!next.ok) return
    runPathsRef.current = next.paths
    sparksRef.current = next.sparks
    setRunPaths(next.paths)
    setRunSparks(next.sparks)
    setSparkSpent(Math.max(1, beforeSparks - next.sparks))
    setToolLock(null)
    window.clearTimeout(burstTimer.current)
    setSparkSpend(true)
    setUpFlash(plotId)
    burstTimer.current = window.setTimeout(() => {
      setSparkSpend(false)
      setUpFlash((current) => (current === plotId ? null : current))
    }, LEVEL_BURST_MS)
  }

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
    if (won) return
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

  function continueFromBoost(event: { currentTarget: HTMLButtonElement }) {
    if (!startsNextRound(roundStartKind(event.currentTarget.className))) return
    if (performance.now() - clearCardAt.current < 450) return
    if (won || phase !== 'boost' || roundChangeBlocked()) return
    clearPlaceArm()
    setBoostNote(null)
    setBossBonus(0)
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
  const tapTarget = easyTap
    ? nightEnemies.cueTarget(raiders, waveIndex, tuneRef.current.armorFrom)
    : undefined
  const tapPos =
    tapTarget && boardBox.w > 0
      ? boardPoint(raiderAt(tapTarget).x, raiderAt(tapTarget).y)
      : null
  const upgradePoint =
    upgradeAt && boardBox.w > 0
      ? boardPoint(nightTowers.anchor(upgradeAt).x, nightTowers.anchor(upgradeAt).y)
      : null
  const midWave = phase === 'wave' && !won
  const debugPanel = nightWatchDebugPanel(nightSearch, nwDebug)
  debugPanelRef.current = debugPanel
  const debugHarness = easy && debugPanel && midWave
  const debugFrozen = debugHarness && debugPaused
  const cardOn = Boolean(easy && phase === 'plant' && ability)
  const groundPick = Boolean(easy && !won && (placeArm || cardOn))
  const groundHints = useMemo(
    () => (groundPick ? plantableHints(plants) : []),
    [groundPick, plants],
  )
  const tapReadoutOn =
    easy &&
    nightWatchJumpAllowed(
      typeof window === 'undefined' ? '' : window.location.search,
      nwDebug,
    )
  const bossLive = raiders.find((raider) => raider.boss && !raider.turned)
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
  const clearSpendOpen = easy && boosting && spendOpen && !upgradeAt && !placeArm
  const clearHelpOpen = easy && boosting && helpOpen && !upgradeAt && !placeArm

  const heartShown = Math.min(DEFEND_HEARTS, Math.max(0, Math.floor(hearts) || 0))
  const hud = (
    <p
      ref={hudRef}
      className="defend-hud"
      aria-live="polite"
      data-nw-seed={nightSeed ?? undefined}
    >
      {phase === 'wave' ? (
        <span className="defend-wave">{roundLabel}</span>
      ) : null}
      {phase === 'lost' ? null : (
        <span
          className={`defend-hearts${mendShield ? ' is-mend-shield' : ''}${mendOn ? ' is-mend-pop' : ''}`}
          data-hearts={heartShown}
          data-heart-cap={DEFEND_HEARTS}
        >
          {Array.from({ length: DEFEND_HEARTS }, (_, index) => {
            const full = index < heartShown
            const dropped = heartDrop && index >= heartDrop.at && index < heartDrop.at + heartDrop.count
            return (
              <span
                key={index}
                className={`defend-heart-slot${full ? ' is-on' : ' is-empty'}${dropped ? ' is-drop' : ''}`}
                data-heart-slot={full ? 'full' : 'empty'}
              >
                {full ? '♥' : '♡'}
              </span>
            )
          })}
          {mendShield ? <span className="nw-mend-hold">Gate</span> : null}
          {powerBanner ? <span className="nw-power-chip">{powerBanner}</span> : null}
        </span>
      )}
      {heartPop ? (
        <span className="defend-heart-gain" data-heart-gain="+1">
          +1
        </span>
      ) : null}
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
            ? null
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

  const showMapSheet = easy && phase === 'plant' && planted.length < 1 && !won && !mapChosen

  const docks = (
    <>
      {tapReadoutOn && (phase === 'wave' || phase === 'boost' || phase === 'lost') ? (
        <p
          className="nw-tap-readout"
          role="status"
          data-tap-hits={tapHits}
          data-tap-misses={tapMisses}
          data-tap-damage={tapDamage}
          data-boss-hp={bossLive ? bossLive.hp : ''}
          data-boss-max={bossLive ? bossLive.maxHp : ''}
        >
          {`Taps ${tapHits} hit · ${tapMisses} miss · ${tapDamage} dmg · Boss ${bossLive ? `${bossLive.hp}/${bossLive.maxHp ?? bossLive.hp}` : '—'}`}
        </p>
      ) : null}
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
      {phase === 'wave' && !won ? (
        <div className="defend-kits nw-skill-tray" role="group" aria-label="Skills">
          {candleOpen ? (
            <button
              type="button"
              className="btn defend-new-lamp defend-candle-lamp"
              data-candle-lamp="yes"
              data-candle-cost={CANDLE_COST}
              aria-label={`Candle, ${CANDLE_COST} sparks`}
              aria-pressed={isCandle(placeArm) ? true : undefined}
              onClick={(event) => {
                event.stopPropagation()
                armCandle()
              }}
            >
              {`Candle ${CANDLE_COST}✦`}
            </button>
          ) : null}
          {bellOpen ? (
            <button
              type="button"
              className="btn defend-new-lamp defend-bell-lamp"
              data-bell-lamp="yes"
              data-bell-cost={BELL_COST}
              aria-label={`Bell, ${BELL_COST} sparks`}
              aria-pressed={isBell(placeArm) ? true : undefined}
              onClick={(event) => {
                event.stopPropagation()
                armBell()
              }}
            >
              {`Bell ${BELL_COST}✦`}
            </button>
          ) : null}
          {incenseOpen ? (
            <button
              type="button"
              className="btn defend-new-lamp defend-incense-lamp"
              data-incense-lamp="yes"
              data-incense-cost={INCENSE_COST}
              aria-label={`Incense, ${INCENSE_COST} sparks`}
              aria-pressed={isIncense(placeArm) ? true : undefined}
              onClick={(event) => {
                event.stopPropagation()
                armIncense()
              }}
            >
              {`Incense ${INCENSE_COST}✦`}
            </button>
          ) : null}
          {skillTray}
        </div>
      ) : null}
      {phase === 'lost' ? (
        <div className="defend-lost">
          <p>
            {easy
              ? `The night won this time. You reached round ${waveIndex + 1}.`
              : 'Porch flickered. Turn them again.'}
          </p>
          {easy ? (
            <>
              <p
                className="defend-hearts"
                data-hearts={0}
                data-heart-cap={DEFEND_HEARTS}
                data-heart-slots={DEFEND_HEARTS}
              >
                {Array.from({ length: DEFEND_HEARTS }, (_, index) => (
                  <span key={index} className="defend-heart-slot is-empty" data-heart-slot="empty">
                    ♡
                  </span>
                ))}
              </p>
              <p className="defend-hearts-left" data-hearts-left={0}>
                Hearts left: 0
              </p>
            </>
          ) : null}
          <button type="button" className="btn primary" onClick={retry}>
            Try again
          </button>
        </div>
      ) : null}
      {phase === 'boost' && !won ? (
        <div
          className={`defend-boost${easy ? ' is-clear-bar' : ''}${clearSpendOpen ? ' is-spend-open' : ''}${clearHelpOpen ? ' is-help-open' : ''}`}
        >
          {easy ? (
            <p className="defend-clear-note" data-clear-note={toolLock ? 'yes' : 'no'} role="status">
              {toolLock ?? ''}
            </p>
          ) : null}
          <p className="defend-boost-status" role="status">
            {easy ? `Round ${waveIndex + 1} clear` : `Wave ${waveIndex + 1} clear`}
            {easy && bossBonus > 0 ? (
              <span className="defend-boss-bonus" data-boss-bonus={bossBonus}>
                {` · Boss down +${bossBonus} sparks`}
              </span>
            ) : null}
            {easy && clearSpark > 0 ? (
              <span className="defend-clear-spark" data-clear-spark={clearSpark}>
                {' +1 spark'}
              </span>
            ) : null}
            {` · spend sparks`}
            {boostNote ? ` · ${boostNote}` : ''}
          </p>
          {easy ? (
            <div className="defend-clear-row">
              <button type="button" className="btn primary defend-continue" onClick={continueFromBoost}>
                Continue
              </button>
              <button
                type="button"
                className="btn defend-new-lamp"
                data-lamp-cost={EASY_LAMP_COST}
                data-new-lamp="yes"
                aria-label={`New lamp, ${EASY_LAMP_COST} sparks`}
                aria-pressed={placeArm && !isCandle(placeArm) && !isBell(placeArm) && !isIncense(placeArm) ? true : undefined}
                onPointerDown={trackNewLamp}
                onClick={() => {
                  if (swallowNewLampClick.current) {
                    swallowNewLampClick.current = false
                    return
                  }
                  armUnplantedLamp()
                }}
              >
                {`New lamp ${EASY_LAMP_COST}✦`}
              </button>
              {candleOpen ? (
                <button
                  type="button"
                  className="btn defend-new-lamp defend-candle-lamp"
                  data-candle-lamp="yes"
                  data-candle-cost={CANDLE_COST}
                  aria-label={`Candle, ${CANDLE_COST} sparks`}
                  aria-pressed={isCandle(placeArm) ? true : undefined}
                  onClick={(event) => {
                    event.stopPropagation()
                    armCandle()
                  }}
                >
                  {`Candle ${CANDLE_COST}✦`}
                </button>
              ) : null}
              {bellOpen ? (
                <button
                  type="button"
                  className="btn defend-new-lamp defend-bell-lamp"
                  data-bell-lamp="yes"
                  data-bell-cost={BELL_COST}
                  aria-label={`Bell, ${BELL_COST} sparks`}
                  aria-pressed={isBell(placeArm) ? true : undefined}
                  onClick={(event) => {
                    event.stopPropagation()
                    armBell()
                  }}
                >
                  {`Bell ${BELL_COST}✦`}
                </button>
              ) : null}
              {incenseOpen ? (
                <button
                  type="button"
                  className="btn defend-new-lamp defend-incense-lamp"
                  data-incense-lamp="yes"
                  data-incense-cost={INCENSE_COST}
                  aria-label={`Incense, ${INCENSE_COST} sparks`}
                  aria-pressed={isIncense(placeArm) ? true : undefined}
                  onClick={(event) => {
                    event.stopPropagation()
                    armIncense()
                  }}
                >
                  {`Incense ${INCENSE_COST}✦`}
                </button>
              ) : null}
              <button
                type="button"
                className="btn defend-clear-spend"
                aria-expanded={clearSpendOpen}
                onClick={() => {
                  setHelpOpen(false)
                  const hadCard = Boolean(upgradeAtRef.current)
                  if (hadCard) closeUpgrade(true)
                  setSpendOpen((open) => (hadCard ? true : !open))
                }}
              >
                {clearSpendOpen ? 'Hide' : 'Spend'}
              </button>
              <button
                type="button"
                className="btn defend-clear-help"
                aria-expanded={clearHelpOpen}
                aria-label="How to spend sparks"
                onClick={() => {
                  setSpendOpen(false)
                  const hadCard = Boolean(upgradeAtRef.current)
                  if (hadCard) closeUpgrade(true)
                  setHelpOpen((open) => (hadCard ? true : !open))
                }}
              >
                ?
              </button>
            </div>
          ) : null}
          {!easy || clearSpendOpen ? (
            <div className="defend-spark-choices" role="group" aria-labelledby="defend-spark-pick">
              <p id="defend-spark-pick" className="defend-spark-choices-label">
                {easy ? EASY.nightBoostPick : 'Skills'}
              </p>
              {skillTray}
            </div>
          ) : null}
          {clearHelpOpen ? <p className="defend-tip">{EASY.nightBoost}</p> : null}
          {easy ? null : (
            <button type="button" className="btn primary defend-continue" onClick={continueFromBoost}>
              Continue
            </button>
          )}
        </div>
      ) : null}
      {(phase === 'plant' || planted.length < 1) &&
      !showMapSheet &&
      phase !== 'lost' &&
      phase !== 'boost' &&
      !won ? (
        <>
          <button
            type="button"
            className={`btn primary xl defend-go${awaitingLamp ? ' is-awaiting-plant' : ' is-after-plant'}`}
            onClick={(event) => {
              if (easy && awaitingLamp && phase === 'plant' && !arming) {
                setPlantPulse(true)
                window.clearTimeout(plantPulseTimer.current)
                plantPulseTimer.current = window.setTimeout(() => setPlantPulse(false), 900)
                return
              }
              if (!startsNextRound(roundStartKind(event.currentTarget.className))) return
              if (awaitingLamp || phase !== 'plant') return
              if (roundChangeBlocked()) return
              setGhost(null)
              setPhase('wave')
            }}
            disabled={(awaitingLamp || arming || phase !== 'plant') && !(easy && awaitingLamp && phase === 'plant' && !arming)}
            aria-disabled={awaitingLamp || arming || phase !== 'plant' ? true : undefined}
            aria-describedby={easy && awaitingLamp ? 'defend-plant-first' : undefined}
          >
            {easy ? EASY.nightDo : 'The road is coming'}
          </button>
          {easy && awaitingLamp ? (
            <p
              className={`defend-plant-first${plantPulse ? ' is-pulse' : ''}`}
              id="defend-plant-first"
              data-plant-pulse={plantPulse ? 'yes' : undefined}
            >
              {EASY.nightPlantFirst}
            </p>
          ) : null}
          {candleOpen && phase === 'plant' ? (
            <button
              type="button"
              className="btn defend-new-lamp defend-candle-lamp"
              data-candle-lamp="yes"
              data-candle-cost={CANDLE_COST}
              aria-label={`Candle, ${CANDLE_COST} sparks`}
              aria-pressed={isCandle(placeArm) ? true : undefined}
              onClick={(event) => {
                event.stopPropagation()
                armCandle()
              }}
            >
              {`Candle ${CANDLE_COST}✦`}
            </button>
          ) : null}
          {bellOpen && phase === 'plant' ? (
            <button
              type="button"
              className="btn defend-new-lamp defend-bell-lamp"
              data-bell-lamp="yes"
              data-bell-cost={BELL_COST}
              aria-label={`Bell, ${BELL_COST} sparks`}
              aria-pressed={isBell(placeArm) ? true : undefined}
              onClick={(event) => {
                event.stopPropagation()
                armBell()
              }}
            >
              {`Bell ${BELL_COST}✦`}
            </button>
          ) : null}
          {incenseOpen && phase === 'plant' ? (
            <button
              type="button"
              className="btn defend-new-lamp defend-incense-lamp"
              data-incense-lamp="yes"
              data-incense-cost={INCENSE_COST}
              aria-label={`Incense, ${INCENSE_COST} sparks`}
              aria-pressed={isIncense(placeArm) ? true : undefined}
              onClick={(event) => {
                event.stopPropagation()
                armIncense()
              }}
            >
              {`Incense ${INCENSE_COST}✦`}
            </button>
          ) : null}
        </>
      ) : null}
      {toolLock && !(easy && phase === 'boost') ? (
        <p className="match-toast" role="status">
          {toolLock}
        </p>
      ) : null}
      {tip ? <p className="defend-tip">{tip}</p> : null}
      {easy && boosting ? null : (
        <p className="defend-angel-help" aria-hidden="true">
          {ANGEL_STICKER}
        </p>
      )}
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
      onBoostCardPointer={() => {
        if (easy && phase === 'boost') clearCardAt.current = performance.now()
      }}
      playtestSteps={tapReadoutOn}
      onBoost={boostTool}
      onOpenTree={openPlantedTree}
    />
  )

  return (
    <main
      className={`defend-page ${taught ? 'is-puzzle' : 'is-teach'} ${arming ? 'is-arming' : ''} ${won ? 'is-win' : ''} ${shake ? 'is-shake' : ''} ${leakFlash ? 'is-leak' : ''} ${firing ? 'is-firing' : ''} ${stillOn ? 'is-still' : ''} ${mendOn ? 'is-mend' : ''} ${mendShield ? 'is-mend-shield' : ''} ${debugFrozen ? 'is-nw-debug-freeze' : ''} ${easy ? 'is-easy-watch' : ''} ${easyTap ? 'is-easy-tap' : ''} ${boosting ? 'is-boost' : ''} ${clearPanelFolded(boosting, placeArm) ? 'is-clear-fold' : ''} ${phase === 'lost' ? 'is-lost' : ''} ${boosting && runSparks < 1 ? 'is-spark-broke' : ''} ${easy && phase === 'plant' && awaitingLamp ? 'is-need-lamp' : ''} ${cardOn ? 'is-card-on' : ''} ${easy && (phase === 'plant' || placeArm) ? 'is-placing' : ''} ${easy && !won && (phase === 'wave' || phase === 'boost') ? 'is-shop' : ''}`}
      aria-label={WATCH_TITLE}
      data-night-map={mapId}
    >
      {after ? (
        easy && mapId === 'a2' ? (
          <FarHillsUnlock
            held={`The night held after round ${rounds}.`}
            home={EASY.home}
            onHome={() => onNavigate({ name: 'hub' })}
            onPlay={() => {
              chooseNightMap('far-hills')
              onFreshNight?.()
            }}
          />
        ) : easy ? (
          <section className="nw-far-hills" aria-label="Night held">
            <h1 className="nw-far-hills-title">Night held</h1>
            <p className="nw-far-hills-held">{`The night held after round ${rounds}.`}</p>
            <button type="button" className="btn primary xl nw-far-hills-home" onClick={() => onNavigate({ name: 'hub' })}>
              {EASY.home}
            </button>
          </section>
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
            {showMapSheet ? (
              <div className="nw-map-overlay" role="dialog" aria-label="Choose a map" data-map-overlay="yes">
                <NightMapPicker
                  mapId={mapId}
                  isOpen={(id) => mapIsOpen(id, progress.defense)}
                  onPick={(id) => {
                    setSessionMap(id)
                    if (mapIsOpen(id, progress.defense)) chooseNightMap(id)
                    setMapChosen(true)
                  }}
                />
              </div>
            ) : null}
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
              walkerCalls={easy ? [] : walkerCalls}
              loreLine={easy ? null : (loreMeet?.line ?? null)}
              runTier={runTier}
              runPaths={runPaths}
              boosting={boosting}
              onBoostTower={boostSelectedTool}
              onUpgradePath={boostSelectedPath}
              onArmPathBuy={armPathBuy}
              onBuyBright={buyBright}
              showBright={brightRoundOpen(waveIndex)}
              upgradeAt={upgradeAt}
              onOpenUpgrade={openUpgrade}
              roundIndex={waveIndex}
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
              heldLessons={progress.held}
              playtestSteps={tapReadoutOn}
              onOpenLessons={openLockInLessons}
              onBoardTap={closeUpgrade}
              onPlacePointer={onPlacePointer}
              ghost={ghost}
              groundHints={groundHints}
              plateFill={plateFill}
              map={playingMap?.plate}
              roadD={roadD}
              porchCandy={!playingMap}
              roadLabel={
                playingMap
                  ? `Night road through ${playingMap.name}`
                  : 'Night road through Silver City'
              }
              armorFrom={tuneRef.current.armorFrom}
              mapFeatures={playingMap?.mapFeatures}
              pops={pops}
            />
            {phase === 'wave' ? (
              <div className="nw-wave-overlay">
                <span className="defend-wave">{roundLabel}</span>
              </div>
            ) : null}
            {easy && phase === 'plant' ? (
              <p className="nw-skill-toast" role="status">
                New skill · Still
              </p>
            ) : null}
            {easy && phase === 'plant' && waveIndex === 0 && playingMap?.featureNote ? (
              <p className="nw-skill-toast is-feature" role="status">
                {playingMap.featureNote}
              </p>
            ) : null}
            {mapMissing ? (
              <p className="nw-skill-toast nw-map-toast" role="status" data-map-missing="yes">
                Map not found
              </p>
            ) : null}
            {unlockNote ? (
              <p className="nw-skill-toast nw-map-toast" role="status">
                {unlockNote}
              </p>
            ) : null}
            {skillNote ? (
              <p className="nw-skill-toast is-mid" role="status">
                {`New skill · ${KIT_LABEL[skillNote]}`}
              </p>
            ) : null}
            {candleNote ? (
              <p className="nw-skill-toast is-candle" role="status">
                {CANDLE_INTRO}
              </p>
            ) : null}
            {showPace ? (
              <NightPaceControl waveIndex={waveIndex} fastOn={fastOn} onToggle={togglePace} />
            ) : null}
            {createPortal(
              <>
                {stillOn ? <div className="nw-still-veil" aria-hidden="true" /> : null}
                {mendShield ? <div className="nw-mend-shield" aria-hidden="true" /> : null}
                {powerBanner ? (
                  <p
                    className={`nw-power-banner${powerBanner === 'Boss!' ? ' is-boss' : powerBanner.startsWith('Mend') || powerBanner === 'Held' ? ' is-mend' : ' is-still'}`}
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
