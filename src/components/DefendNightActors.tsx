import { useEffect, useState } from 'react'
import {
  EASY_FACE_HIT_R,
  EASY_WALKER_FACE_PX,
  EASY_WALKER_HIT_PX,
  PATH_WALKER_FACE_DY,
  PATH_WALKER_FACE_U,
  PATH_WALKER_HIT_R,
  WATCH_ABILITY_LABEL,
  type WatchAbility,
} from '../lib/defend'
import { combatTier, TIER_MARK, WALKER_LABEL } from '../lib/watchTools'
import { CITY_PLOTS, type CityPlotId } from '../lib/city'
import { TOWER_TYPE_SRC } from '../lib/towerTypeArt'
import { EASY } from '../lib/easy'
import {
  nightEnemies,
  nightTowers,
  SHOT_JUICE_MS,
  type NightBlast as Blast,
  type NightPhase,
  type NightPoint,
  type NightRaider as Raider,
  type NightShot as Shot,
} from '../nightWatch'
import type { ProgressState, WalkerKind } from '../types'

export interface EasyTapJuice {
  key: number
  combo: number
  left: number
  top: number
  kind: WalkerKind
  /** Last hit — juice lifts heavenward; otherwise squash only. */
  down?: boolean
}

export interface DefendNightActorsProps {
  easyTap: boolean
  pads: CityPlotId[]
  planted: CityPlotId[]
  progress: ProgressState
  raiders: Raider[]
  raiderAt: (raider: Raider) => NightPoint
  ability: WatchAbility
  /** Ability planted on each pad. Empty pads use the selected rail type. */
  towerType: Record<string, string>
  unlocked: WatchAbility[]
  flash: readonly CityPlotId[]
  togglePad: (id: CityPlotId) => void
  fire: (id: CityPlotId) => void
  fireAtRaider: (id: number) => void
  fireBest: () => void
  shots: Shot[]
  easy: boolean
  blasts: Blast[]
  phase: NightPhase
  tapTarget: Raider | undefined
  tapPos: { left: number; top: number } | null
  tapJuice?: EasyTapJuice | null
  /** Living walkers: kind name + taunt in the left slide-out, not on the path. */
  walkerCalls?: EasyWalkerCall[]
  /** First-meet story, shown once above the side list. */
  loreLine?: string | null
  /** Run tier for lamp range. Combat reads this, not trail mastery. */
  runTier: Record<string, number>
  /** Between waves: a planted lamp can open the upgrade card. */
  boosting?: boolean
  onBoostTower?: () => void
  /** Planted lamp whose upgrade card is open. */
  upgradeAt?: CityPlotId | null
  /** Tap a planted lamp to open or close its upgrade card. */
  onOpenUpgrade?: (id: CityPlotId) => void
  /** Lamp that just spent a spark. Brief ring only — peel 4 owns the burst. */
  upFlashId?: CityPlotId | null
}

/**
 * Thin HP bar in A2 viewBox units. Width matches the path face so the
 * bar does not stick out past the sprite (Fixes #472).
 */
const HP_TRACK = {
  w: PATH_WALKER_FACE_U,
  h: 10,
  y: Math.round(PATH_WALKER_FACE_U * (14 / 36)),
  rx: 5,
}
const HP_FILL = { inset: 2, h: 6, rx: 3 }

/** Short sparkle offsets from the lamp center, in CSS pixels. */
const LEVEL_SPARKS = [
  { dx: -28, dy: -40, r: 16, delay: '0s' },
  { dx: 4, dy: -56, r: 18, delay: '0.04s' },
  { dx: 32, dy: -36, r: 15, delay: '0.08s' },
  { dx: -40, dy: -8, r: 13, delay: '0.02s' },
  { dx: 40, dy: -4, r: 14, delay: '0.1s' },
  { dx: 10, dy: -20, r: 12, delay: '0.12s' },
] as const
const FACE_HALF = PATH_WALKER_FACE_U / 2
const FACE_TOP = -PATH_WALKER_FACE_U * (24 / 36)
/** Ring sits on the clipped face (clip radius is 0.36 of the chip). */
const CUE_RING_R = PATH_WALKER_FACE_U * 0.5
/** Downward chevron above the lead face. */
const CUE_ARROW = `M0 ${FACE_TOP - 30} L-28 ${FACE_TOP - 68} L-14 ${FACE_TOP - 62} L0 ${FACE_TOP - 46} L14 ${FACE_TOP - 62} L28 ${FACE_TOP - 68} Z`

/** SVG children: pads, shots, raiders, blasts (must render inside DefendNightSky). */
export function DefendNightActorsSvg({
  easyTap,
  pads,
  planted,
  progress,
  raiders,
  raiderAt,
  ability,
  towerType,
  unlocked,
  flash,
  togglePad,
  fire,
  fireAtRaider,
  tapTarget,
  shots,
  blasts,
  phase,
  easy,
  runTier,
  boosting = false,
  upgradeAt = null,
  onOpenUpgrade,
  upFlashId = null,
}: Omit<DefendNightActorsProps, 'tapPos' | 'fireBest' | 'tapJuice' | 'easy' | 'onBoostTower'> & {
  easy: boolean
}) {
  return (
    <>
              {(easyTap ? planted : pads).map((id) => {
                const at = nightTowers.anchor(id)
                const on = planted.includes(id)
                const stage = nightTowers.stage(id, progress)
                const plot = CITY_PLOTS.find((item) => item.id === id)
                const plantedType = towerType[id]
                const using =
                  on && plantedType && unlocked.includes(plantedType)
                    ? plantedType
                    : unlocked.includes(ability)
                      ? ability
                      : 'love'
                const typeName = WATCH_ABILITY_LABEL[using] ?? 'Love'
                const typeSrc = TOWER_TYPE_SRC[using]
                const hot =
                  phase === 'wave' &&
                  on &&
                  raiders.some(
                    (raider) =>
                      !raider.turned &&
                      nightTowers.inRange(id, using, progress, raiderAt(raider), runTier),
                  )
                const firing = flash.includes(id)
                const pose = nightTowers.lampPose(hot || firing)
                const lampBox = nightTowers.lampImageBox()
                const boostPad = boosting && on
                const scenery = easyTap && !boostPad
                const upgrading = on && upgradeAt === id
                const justUp = on && upFlashId === id
                const tierMark = TIER_MARK[combatTier(using, runTier)]
                const activatePad = () => {
                  if (phase === 'plant') {
                    if (on) onOpenUpgrade?.(id)
                    else togglePad(id)
                    return
                  }
                  if (phase === 'boost' && on) {
                    onOpenUpgrade?.(id)
                    return
                  }
                  if (phase === 'wave') fire(id)
                }
                return (
                  <g
                    key={id}
                    data-person-node={scenery ? undefined : 'pad'}
                    className={`defend-pad is-${stage} ${on ? `is-planted is-${using}` : ''} ${hot ? 'is-hot' : ''} ${firing ? 'is-flash' : ''} ${scenery ? 'is-tower-scenery' : ''} ${boostPad ? 'is-boost-pick' : ''} ${upgrading ? 'is-upgrade-open' : ''} ${justUp ? 'is-up' : ''}`}
                    data-tower-type={on ? using : undefined}
                    data-level={on ? tierMark : undefined}
                    transform={`translate(${at.x} ${at.y})`}
                    role={scenery ? undefined : 'button'}
                    tabIndex={scenery ? undefined : 0}
                    aria-hidden={scenery ? true : undefined}
                    aria-expanded={on && !scenery ? upgrading : undefined}
                    aria-label={
                      scenery
                        ? undefined
                        : phase === 'plant'
                          ? `${on ? 'Upgrade' : 'Plant'} lamp at ${plot?.title ?? id}`
                          : boostPad
                            ? `Upgrade ${WATCH_ABILITY_LABEL[using] ?? using} at ${plot?.title ?? id}`
                            : `Fire ${plot?.title ?? id}`
                    }
                    onClick={
                      scenery
                        ? undefined
                        : (event) => {
                            event.stopPropagation()
                            activatePad()
                          }
                    }
                    onKeyDown={
                      scenery
                        ? undefined
                        : (event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              activatePad()
                            }
                          }
                    }
                  >
                    {scenery ? null : on ? (
                      <rect className="defend-hit" x="-42" y="-96" width="84" height="128" />
                    ) : (
                      <circle className="defend-hit" r="52" />
                    )}
                    <ellipse className="defend-earth" cx="0" cy="10" rx="15" ry="6" />
                    {on ? (
                      <>
                        <ellipse className="defend-pool" cx="0" cy="12" rx={hot ? 30 : 20} ry={hot ? 11 : 7} />
                        <circle className="defend-type-ring" r="34" />
                        <g className="defend-lamp-sprite">
                          <image
                            className={`defend-tower-lamp is-${pose}`}
                            href={nightTowers.lampSrc(pose)}
                            x={lampBox.x}
                            y={lampBox.y}
                            width={lampBox.w}
                            height={lampBox.h}
                          />
                        </g>
                        {typeSrc ? (
                          <image
                            className="defend-type-mark"
                            href={typeSrc}
                            x={-22}
                            y={-78}
                            width={44}
                            height={44}
                          />
                        ) : null}
                        <text className="defend-type-label" y="30" textAnchor="middle">
                          {typeName}
                        </text>
                        {hot ? <circle className="defend-hot-halo" r="27" /> : null}
                        {upgrading || justUp ? <circle className="defend-upgrade-ring" r="36" /> : null}
                        {phase !== 'wave' ? (
                          <text
                            className={`defend-level-pip${justUp ? ' is-bump' : ''}`}
                            y="-98"
                            textAnchor="middle"
                            data-level={tierMark}
                            aria-hidden="true"
                          >
                            {tierMark}
                          </text>
                        ) : null}
                        {justUp ? (
                          <g className="defend-level-burst" pointerEvents="none" aria-hidden="true">
                            <circle className="defend-level-flash" cx="0" cy="-28" r="40" />
                            <circle className="defend-burst-ring" cx="0" cy="-28" r="34" />
                            {LEVEL_SPARKS.map((spark) => (
                              <circle
                                key={`${spark.dx}-${spark.dy}`}
                                className="defend-burst-spark"
                                cx="0"
                                cy="-28"
                                r={spark.r}
                                style={{
                                  ['--dx' as string]: `${spark.dx}px`,
                                  ['--dy' as string]: `${spark.dy}px`,
                                  animationDelay: spark.delay,
                                }}
                              />
                            ))}
                          </g>
                        ) : null}
                        {phase === 'wave' ? (
                          <circle
                            className={`defend-range${firing ? ' is-firing' : ''}`}
                            r={nightTowers.range(id, using, progress, runTier)}
                            pointerEvents="none"
                            style={
                              firing
                                ? {
                                    strokeDasharray: '100000',
                                    stroke: '#fff6a8',
                                    strokeWidth: 8,
                                    fill: 'rgba(255, 186, 40, 0.46)',
                                  }
                                : undefined
                            }
                          />
                        ) : null}
                      </>
                    ) : scenery ? null : (
                      <>
                        <circle className="defend-ring" data-plant-ring="gold" r="42" />
                        <path className="defend-post is-empty" d="M-1.6 8 V-8 H1.6 V8 Z" />
                      </>
                    )}
                  </g>
                )
              })}
              {raiders.map((raider) => {
                const at = raiderAt(raider)
                const isTap = easyTap && !raider.turned
                const isCue = isTap && tapTarget?.id === raider.id
                const lampHit =
                  raider.struckAt != null && performance.now() - raider.struckAt < SHOT_JUICE_MS
                return (
                  <g
                    key={raider.id}
                    data-person-node={isTap ? 'walker' : undefined}
                    className={`defend-raider ${raider.turned ? 'is-turned' : ''} ${isTap ? 'is-easy-tap-target' : ''} ${isCue ? 'is-easy-cue' : ''} ${lampHit ? 'is-lamp-hit' : ''}`}
                    transform={`translate(${at.x} ${at.y})`}
                    role={isTap ? 'button' : undefined}
                    tabIndex={isTap ? 0 : undefined}
                    aria-label={
                      isTap
                        ? `${raider.label ?? WALKER_LABEL[raider.kind]}: ${raider.text}. ${EASY.nightTap}`
                        : undefined
                    }
                    onClick={
                      isTap
                        ? (event) => {
                            event.stopPropagation()
                            fireAtRaider(raider.id)
                          }
                        : undefined
                    }
                    onKeyDown={
                      isTap
                        ? (event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              fireAtRaider(raider.id)
                            }
                          }
                        : undefined
                    }
                  >
                    <ellipse
                      className="defend-raider-shadow"
                      cy={12 * (PATH_WALKER_FACE_U / 36)}
                      rx={13 * (PATH_WALKER_FACE_U / 36)}
                      ry={4.6 * (PATH_WALKER_FACE_U / 36)}
                    />
                    <image
                      className={`defend-raider-face${easy && !raider.turned ? ' is-dark-face' : ''}`}
                      href={nightEnemies.faceSrc(raider.kind, easy)}
                      x={-FACE_HALF}
                      y={FACE_TOP}
                      width={PATH_WALKER_FACE_U}
                      height={PATH_WALKER_FACE_U}
                      clipPath="url(#defend-face-clip)"
                    />
                    {lampHit ? (
                      <circle
                        className="defend-face-flash"
                        cy={PATH_WALKER_FACE_DY}
                        r={FACE_HALF * 0.82}
                      />
                    ) : null}
                    {!raider.turned && (raider.maxHp ?? 0) > 1 ? (
                      <g className="defend-hp-bar" aria-hidden>
                        <rect
                          className="defend-hp-track"
                          x={-HP_TRACK.w / 2}
                          y={HP_TRACK.y}
                          width={HP_TRACK.w}
                          height={HP_TRACK.h}
                          rx={HP_TRACK.rx}
                        />
                        <rect
                          className="defend-hp-fill"
                          x={-HP_TRACK.w / 2 + HP_FILL.inset}
                          y={HP_TRACK.y + HP_FILL.inset}
                          width={((HP_TRACK.w - HP_FILL.inset * 2) * raider.hp) / (raider.maxHp ?? 1)}
                          height={HP_FILL.h}
                          rx={HP_FILL.rx}
                        />
                      </g>
                    ) : null}
                    {raider.turned ? (
                      <g className="defend-heaven-cheer" aria-hidden>
                        <circle className="defend-cheer-spark" cx="-10" cy="-18" r="2.2" />
                        <circle className="defend-cheer-spark is-2" cx="12" cy="-20" r="1.8" />
                        <circle className="defend-cheer-spark is-3" cx="2" cy="-26" r="1.4" />
                      </g>
                    ) : null}
                    <circle
                      className="defend-raider-hit"
                      data-face-hit={isTap ? 'easy' : undefined}
                      cy={isTap ? PATH_WALKER_FACE_DY : 0}
                      r={isTap ? EASY_FACE_HIT_R : PATH_WALKER_HIT_R}
                      fill="transparent"
                      pointerEvents="all"
                    />
                  </g>
                )
              })}
              {shots.map((shot) => (
                <g className="defend-shot" key={shot.key}>
                  <line
                    className="defend-beam-halo"
                    x1={shot.from.x}
                    y1={shot.from.y}
                    x2={shot.to.x}
                    y2={shot.to.y}
                  />
                  <line
                    className="defend-beam"
                    x1={shot.from.x}
                    y1={shot.from.y}
                    x2={shot.to.x}
                    y2={shot.to.y}
                  />
                </g>
              ))}
              {easyTap && tapTarget && !tapTarget.turned ? (
                <g
                  className="walker-target-cue"
                  data-cue="target"
                  transform={`translate(${raiderAt(tapTarget).x} ${raiderAt(tapTarget).y})`}
                  aria-hidden
                  pointerEvents="none"
                >
                  <circle className="walker-cue-pad" cy={PATH_WALKER_FACE_DY} r={CUE_RING_R} />
                  <circle className="walker-cue-under" cy={PATH_WALKER_FACE_DY} r={CUE_RING_R} />
                  <circle className="walker-cue-ring" cy={PATH_WALKER_FACE_DY} r={CUE_RING_R} />
                  <circle className="walker-cue-pulse" cy={PATH_WALKER_FACE_DY} r={CUE_RING_R + FACE_HALF * 0.22} />
                  <path className="walker-cue-arrow" d={CUE_ARROW} />
                </g>
              ) : null}
              {blasts.map((blast) => (
                <g key={blast.key} className="defend-blast" transform={`translate(${blast.x} ${blast.y})`}>
                  <circle className="defend-blast-ring" r="26" />
                  <circle className="defend-blast-core" r="10" />
                  <path className="defend-shard" d="M-2 -4 L4 -28 L8 -6 Z" />
                  <path className="defend-shard is-2" d="M4 2 L28 8 L8 8 Z" />
                  <path className="defend-shard is-3" d="M-4 4 L-26 16 L-8 8 Z" />
                  <path className="defend-shard is-4" d="M2 6 L10 26 L-2 10 Z" />
                  {blast.combo > 1 ? (
                    <text className="defend-combo-pop" y="-34" textAnchor="middle">
                      ×{blast.combo}
                    </text>
                  ) : null}
                  <text className="defend-blast-line" y="28" textAnchor="middle">
                    {blast.line}
                  </text>
                  {blast.pop ? (
                    <g className="defend-puff" aria-hidden>
                      <circle cx="-36" cy="-8" r="28" />
                      <circle cx="34" cy="-18" r="34" />
                      <circle cx="12" cy="22" r="22" />
                      <circle cx="-18" cy="18" r="18" />
                    </g>
                  ) : null}
                  {blast.spark ? (
                    <text className="defend-spark-pop" y="-72" textAnchor="middle">
                      +spark
                    </text>
                  ) : null}
                </g>
              ))}
              <g className="defend-shot-flashes" pointerEvents="none">
                {shots.map((shot) => (
                  <circle
                    key={`flash-${shot.key}`}
                    className="defend-face-flash"
                    cx={shot.to.x}
                    cy={shot.to.y}
                    r={PATH_WALKER_FACE_U * 0.42}
                  />
                ))}
              </g>

    </>
  )
}

export interface EasyWalkerCall {
  id: number
  kind: WalkerKind
  text: string
  /** Climb name when it differs from the shared face. */
  label?: string
  /** First meeting this night — highlight the row. The story sits above the list. */
  fresh?: boolean
}

export function DefendNightWalkerCue({
  easyTap,
  tapTarget,
  tapPos,
  tapJuice,
  walkerCalls = [],
  loreLine = null,
}: Pick<DefendNightActorsProps, 'easyTap' | 'tapTarget' | 'tapPos' | 'tapJuice'> & {
  walkerCalls?: EasyWalkerCall[]
  /** First-meet story. One line above the side list, not on the road. */
  loreLine?: string | null
}) {
  const [juiceHeaven, setJuiceHeaven] = useState(false)
  useEffect(() => {
    if (!tapJuice) {
      setJuiceHeaven(false)
      return
    }
    setJuiceHeaven(false)
    if (tapJuice.down === false) return
    const heavenAt = window.setTimeout(() => setJuiceHeaven(true), 280)
    return () => window.clearTimeout(heavenAt)
  }, [tapJuice?.key])

  return (
    <>
            {walkerCalls.length > 0 || loreLine ? (
              <aside className="nw-walker-slide easy-walker-roster" aria-label="Walkers on the road">
                {loreLine ? <span className="easy-walker-lore is-new">{loreLine}</span> : null}
                {walkerCalls.map((call) => (
                  <span
                    key={call.id}
                    className={`easy-walker-call${tapTarget?.id === call.id ? ' is-cue' : ''}${call.fresh ? ' is-new' : ''}`}
                  >
                    <span className="easy-walker-kind">{call.label ?? WALKER_LABEL[call.kind]}</span>
                    <span className="easy-walker-taunt">{call.text}</span>
                  </span>
                ))}
              </aside>
            ) : null}
            {tapJuice ? (
              <div className="easy-walkers easy-walkers-juice" aria-hidden>
                <div
                  className={`easy-walker is-easy-walker is-juice${juiceHeaven ? ' is-heaven' : ' is-squash'}`}
                  style={{
                    left: tapJuice.left,
                    top: tapJuice.top,
                    width: EASY_WALKER_HIT_PX,
                    height: EASY_WALKER_HIT_PX,
                  }}
                >
                  <span className="easy-hit-flash" />
                  <span className="easy-tap-plus">+</span>
                  {tapJuice.combo > 1 ? (
                    <span className="easy-tap-combo">×{tapJuice.combo}</span>
                  ) : null}
                  <img
                    className="walker-face easy-walker-face"
                    src={nightEnemies.faceSrc(tapJuice.kind, true)}
                    alt=""
                    draggable={false}
                    aria-hidden
                    style={{
                      width: EASY_WALKER_FACE_PX,
                      height: EASY_WALKER_FACE_PX,
                    }}
                  />
                </div>
              </div>
            ) : null}
            {easyTap && tapTarget && tapPos ? (
              <div className="easy-walkers easy-walkers-path-cue" aria-hidden>
                <span
                  className="easy-walker-cue-label is-path-cue"
                  style={{
                    left: tapPos.left,
                    top: tapPos.top + EASY_WALKER_FACE_PX,
                  }}
                >
                  {EASY.nightTap}
                </span>
              </div>
            ) : null}
    </>
  )
}
