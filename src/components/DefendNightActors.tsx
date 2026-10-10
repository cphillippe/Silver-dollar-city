import { useEffect, useState } from 'react'
import {
  EASY_CROWN_HIT_R,
  EASY_FACE_HIT_R,
  EASY_WALKER_FACE_PX,
  easyTapSoaked,
  EASY_WALKER_HIT_PX,
  PATH_WALKER_FACE_DY,
  PATH_WALKER_FACE_U,
  PATH_WALKER_HIT_R,
  WATCH_ABILITY_LABEL,
  type WatchAbility,
} from '../lib/defend'
import { combatTier, TIER_MARK, WALKER_LABEL } from '../lib/watchTools'
import { lampStrike, pathBadge, pathsOf, type LampPaths } from '../nightWatch/upgradeTree'
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
import type { WalkerFaceId } from '../nightWatch/enemies/faces'
import type { ProgressState, WalkerKind } from '../types'

export interface EasyTapJuice {
  key: number
  combo: number
  left: number
  top: number
  kind: WalkerKind
  /** Portrait on the walker that was tapped. Falls back to kind. */
  face?: WalkerFaceId
  /** Last hit — juice lifts heavenward; otherwise squash only. */
  down?: boolean
  /** Armored tap after the chip. A puff, not a +1. */
  shrug?: boolean
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
  /** Easy upgrade tree. Hard leaves this empty and keeps Level I–III. */
  runPaths?: Record<string, LampPaths>
  /** Between waves: a planted lamp can open the upgrade card. */
  boosting?: boolean
  onBoostTower?: (plotId: CityPlotId) => void
  /** Planted lamp whose upgrade card is open. */
  upgradeAt?: CityPlotId | null
  /** Tap a planted lamp to open or close its upgrade card. */
  onOpenUpgrade?: (id: CityPlotId) => void
  /** Live round. A shrugged walker loses the glow from this round on. */
  roundIndex?: number
  /** Lamp that just spent a spark. Brief ring only — peel 4 owns the burst. */
  upFlashId?: CityPlotId | null
  /** Tap or drag preview. The ring radius is the combat hit radius. */
  ghost?: {
    at: { x: number; y: number }
    range: number
    blocked: boolean
    reaches: boolean
    road: string
    note?: string
  } | null
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
  runPaths,
  boosting = false,
  upgradeAt = null,
  onOpenUpgrade,
  upFlashId = null,
  ghost = null,
  roundIndex = -1,
}: Omit<DefendNightActorsProps, 'tapPos' | 'fireBest' | 'tapJuice' | 'easy' | 'onBoostTower'> & {
  easy: boolean
}) {
  const ghostBox = nightTowers.lampImageBox()
  return (
    <>
              {(easy || easyTap ? planted : pads).map((id) => {
                const at = nightTowers.anchor(id)
                const on = planted.includes(id)
                const stage = nightTowers.stage(id, progress)
                const plot = CITY_PLOTS.find((item) => item.id === id)
                const placeName = plot?.title ?? 'open ground'
                const plantedType = towerType[id]
                const using =
                  on && plantedType && unlocked.includes(plantedType)
                    ? plantedType
                    : unlocked.includes(ability)
                      ? ability
                      : 'love'
                const typeName = WATCH_ABILITY_LABEL[using] ?? 'Love'
                const typeSrc = TOWER_TYPE_SRC[using]
                const tree = easy ? pathsOf(runPaths, using) : null
                const reachBonus = tree ? lampStrike(tree).rangeBonus : 0
                const tierMark = tree ? pathBadge(tree) : TIER_MARK[combatTier(using, runTier)]
                const hot =
                  phase === 'wave' &&
                  on &&
                  raiders.some(
                    (raider) =>
                      !raider.turned &&
                      nightTowers.inRange(id, using, progress, raiderAt(raider), runTier, reachBonus),
                  )
                const firing = flash.includes(id)
                const pose = nightTowers.lampPose(hot || firing)
                const lampBox = nightTowers.lampImageBox()
                const boostPad = boosting && on
                const scenery = easyTap && !boostPad
                const upgrading = on && upgradeAt === id
                const justUp = on && upFlashId === id
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
                          ? `${on ? 'Upgrade' : 'Plant'} lamp at ${placeName}`
                          : boostPad
                            ? `Upgrade ${WATCH_ABILITY_LABEL[using] ?? using} at ${placeName}`
                            : `Fire ${placeName}`
                    }
                    onPointerDown={
                      on
                        ? (event) => {
                            event.stopPropagation()
                          }
                        : undefined
                    }
                    onPointerUp={
                      on
                        ? (event) => {
                            event.stopPropagation()
                          }
                        : undefined
                    }
                    onClick={
                      scenery && on
                        ? (event) => {
                            event.stopPropagation()
                          }
                        : scenery
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
                    {scenery && on ? (
                      <rect
                        className="defend-hit"
                        data-lamp-wave-hit="yes"
                        x="-42"
                        y="-96"
                        width="84"
                        height="128"
                      />
                    ) : scenery ? null : on ? (
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
                            r={nightTowers.range(id, using, progress, runTier, reachBonus)}
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
              {ghost?.road ? (
                <path className="defend-road-cover" data-road-cover="yes" d={ghost.road} pointerEvents="none" />
              ) : null}
              {ghost ? (
                <g
                  className={`defend-ghost${ghost.blocked ? ' is-nogo' : ghost.reaches ? ' is-reaches' : ' is-short'}`}
                  data-lamp-ghost={ghost.blocked ? 'nogo' : 'open'}
                  data-reaches={ghost.reaches ? 'yes' : 'no'}
                  data-reach-note={ghost.note ?? ''}
                  data-hit-range={ghost.range}
                  transform={`translate(${ghost.at.x} ${ghost.at.y})`}
                  pointerEvents="none"
                >
                  <circle className="defend-ghost-ring" r={ghost.range} />
                  {ghost.blocked ? null : (
                    <ellipse className="defend-plant-shadow" cx="0" cy="18" rx="20" ry="7" />
                  )}
                  <image
                    className="defend-ghost-lamp"
                    href={nightTowers.lampSrc('idle')}
                    x={ghostBox.x}
                    y={ghostBox.y}
                    width={ghostBox.w}
                    height={ghostBox.h}
                  />
                  {ghost.blocked ? null : (
                    <circle className="defend-plant-dot" data-plant-pin="yes" r="11" />
                  )}
                </g>
              ) : null}
              {raiders.map((raider) => {
                const at = raiderAt(raider)
                const isTap = easyTap && !raider.turned
                const shrugged = easyTapSoaked(roundIndex, raider)
                const isCue = isTap && (tapTarget?.id === raider.id || !!raider.boss) && !shrugged
                const lampHit =
                  raider.struckAt != null && performance.now() - raider.struckAt < SHOT_JUICE_MS
                return (
                  <g
                    key={raider.id}
                    data-person-node={isTap ? 'walker' : undefined}
                    data-gait={raider.gait && raider.gait !== 'plain' ? raider.gait : undefined}
                    data-face={raider.face ?? raider.kind}
                    className={`defend-raider ${raider.gait === 'fast' ? 'is-fast' : ''} ${raider.gait === 'tough' ? 'is-tough' : ''} ${raider.boss ? 'is-boss' : ''} ${raider.turned ? 'is-turned' : ''} ${isTap ? 'is-easy-tap-target' : ''} ${isCue ? 'is-easy-cue' : ''} ${lampHit ? 'is-lamp-hit' : ''}`}
                    data-boss={raider.boss ? 'yes' : undefined}
                    transform={`translate(${at.x} ${at.y})`}
                    role={isTap ? 'button' : undefined}
                    tabIndex={isTap ? 0 : undefined}
                    aria-label={isTap ? `Walker on the road. ${EASY.nightTap}` : undefined}
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
                    <g className="defend-raider-body">
                    {raider.gait === 'fast' && !raider.turned ? (
                      <g aria-hidden>
                        <g className="defend-fast-streaks">
                          <path d={`M${FACE_HALF * 0.2} ${FACE_TOP + 18} l22 10`} />
                          <path d={`M${FACE_HALF * 0.05} ${FACE_TOP + 34} l26 8`} />
                          <path d={`M${FACE_HALF * 0.35} ${FACE_TOP + 50} l18 12`} />
                        </g>
                      </g>
                    ) : null}
                    {raider.gait === 'tough' && !raider.turned ? (
                      <ellipse
                        className="defend-tough-bulk"
                        cy={PATH_WALKER_FACE_DY + 4}
                        rx={FACE_HALF * 0.92}
                        ry={FACE_HALF * 0.78}
                      />
                    ) : null}
                    {raider.boss && !raider.turned ? (
                      <g className="defend-boss-shape" aria-hidden>
                        <path
                          className="defend-boss-mantle"
                          d={`M0 ${PATH_WALKER_FACE_DY + 28} l${-FACE_HALF * 1.35} ${FACE_HALF * 0.15} l${FACE_HALF * 0.35} ${-FACE_HALF * 1.15} l${FACE_HALF * 1.0} ${FACE_HALF * 0.55} l${FACE_HALF * 1.0} ${-FACE_HALF * 0.55} l${FACE_HALF * 0.35} ${FACE_HALF * 1.15} Z`}
                        />
                        <path
                          className="defend-boss-crown"
                          d={`M${-FACE_HALF * 0.72} ${PATH_WALKER_FACE_DY - FACE_HALF * 0.72} l${FACE_HALF * 0.22} ${-FACE_HALF * 0.42} l${FACE_HALF * 0.18} ${FACE_HALF * 0.28} l${FACE_HALF * 0.32} ${-FACE_HALF * 0.5} l${FACE_HALF * 0.32} ${FACE_HALF * 0.5} l${FACE_HALF * 0.18} ${-FACE_HALF * 0.28} l${FACE_HALF * 0.22} ${FACE_HALF * 0.42} Z`}
                        />
                      </g>
                    ) : null}
                    <ellipse
                      className="defend-raider-shadow"
                      cy={12 * (PATH_WALKER_FACE_U / 36)}
                      rx={(raider.gait === 'tough' ? 18 : 13) * (PATH_WALKER_FACE_U / 36)}
                      ry={(raider.gait === 'tough' ? 6.2 : 4.6) * (PATH_WALKER_FACE_U / 36)}
                    />
                    {easy && !raider.turned ? (
                      <g className="defend-raider-face is-dark-face">
                        <circle
                          className="defend-face-back"
                          cx={0}
                          cy={PATH_WALKER_FACE_DY}
                          r={PATH_WALKER_FACE_U * 0.36}
                        />
                        <image
                          href={nightEnemies.faceSrc(raider.face ?? raider.kind, true)}
                          x={-FACE_HALF}
                          y={FACE_TOP}
                          width={PATH_WALKER_FACE_U}
                          height={PATH_WALKER_FACE_U}
                          clipPath="url(#defend-face-clip)"
                        />
                      </g>
                    ) : (
                      <image
                        className="defend-raider-face"
                        href={nightEnemies.faceSrc(raider.kind, easy)}
                        x={-FACE_HALF}
                        y={FACE_TOP}
                        width={PATH_WALKER_FACE_U}
                        height={PATH_WALKER_FACE_U}
                        clipPath="url(#defend-face-clip)"
                      />
                    )}
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
                          x={-(raider.boss ? HP_TRACK.w * 1.45 : HP_TRACK.w) / 2}
                          y={raider.boss ? HP_TRACK.y - 8 : HP_TRACK.y}
                          width={raider.boss ? HP_TRACK.w * 1.45 : HP_TRACK.w}
                          height={raider.boss ? HP_TRACK.h + 4 : HP_TRACK.h}
                          rx={HP_TRACK.rx}
                        />
                        <rect
                          className="defend-hp-fill"
                          x={-(raider.boss ? HP_TRACK.w * 1.45 : HP_TRACK.w) / 2 + HP_FILL.inset}
                          y={(raider.boss ? HP_TRACK.y - 8 : HP_TRACK.y) + HP_FILL.inset}
                          width={
                            (((raider.boss ? HP_TRACK.w * 1.45 : HP_TRACK.w) - HP_FILL.inset * 2) * raider.hp) /
                            (raider.maxHp ?? 1)
                          }
                          height={raider.boss ? HP_FILL.h + 2 : HP_FILL.h}
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
                    </g>
                    {raider.gait === 'fast' && !raider.turned ? (
                      <g className="defend-fast-mark" aria-hidden>
                        <circle
                          className="defend-fast-rim"
                          cy={PATH_WALKER_FACE_DY}
                          r={CUE_RING_R + 14}
                        />
                        <g className="defend-fast-badge">
                          <path d={`M${CUE_RING_R + 22} ${PATH_WALKER_FACE_DY - 16} l26 -8`} />
                          <path d={`M${CUE_RING_R + 20} ${PATH_WALKER_FACE_DY} l30 0`} />
                          <path d={`M${CUE_RING_R + 22} ${PATH_WALKER_FACE_DY + 16} l24 8`} />
                        </g>
                      </g>
                    ) : null}
                    <circle
                      className="defend-raider-hit"
                      data-face-hit={isTap ? 'easy' : undefined}
                      data-boss-hit={raider.boss ? 'yes' : undefined}
                      cy={isTap ? PATH_WALKER_FACE_DY : 0}
                      r={isTap ? (raider.boss ? EASY_CROWN_HIT_R : EASY_FACE_HIT_R) : PATH_WALKER_HIT_R}
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
                  data-cue-gait={tapTarget.boss ? 'boss' : tapTarget.gait && tapTarget.gait !== 'plain' ? tapTarget.gait : 'plain'}
                  transform={`translate(${raiderAt(tapTarget).x} ${raiderAt(tapTarget).y})`}
                  aria-hidden
                  pointerEvents="none"
                >
                  <circle className="walker-cue-pad" cy={PATH_WALKER_FACE_DY} r={CUE_RING_R} />
                  <circle className="walker-cue-under" cy={PATH_WALKER_FACE_DY} r={CUE_RING_R} />
                  <circle className="walker-cue-ring" cy={PATH_WALKER_FACE_DY} r={CUE_RING_R} />
                  <circle className="walker-cue-pulse" cy={PATH_WALKER_FACE_DY} r={CUE_RING_R + FACE_HALF * 0.22} />
                  {tapTarget.gait === 'fast' ? (
                    <g className="walker-cue-streaks" aria-hidden>
                      <path d={`M${CUE_RING_R + 16} ${PATH_WALKER_FACE_DY - 14} l34 -8`} />
                      <path d={`M${CUE_RING_R + 12} ${PATH_WALKER_FACE_DY + 2} l40 2`} />
                      <path d={`M${CUE_RING_R + 18} ${PATH_WALKER_FACE_DY + 16} l28 10`} />
                    </g>
                  ) : null}
                  {tapTarget.gait === 'tough' ? (
                    <g aria-hidden>
                      <ellipse
                        className="walker-cue-shoulders"
                        cx={-(CUE_RING_R + 16)}
                        cy={PATH_WALKER_FACE_DY}
                        rx="16"
                        ry="24"
                      />
                      <ellipse
                        className="walker-cue-shoulders"
                        cx={CUE_RING_R + 16}
                        cy={PATH_WALKER_FACE_DY}
                        rx="16"
                        ry="24"
                      />
                    </g>
                  ) : null}
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
                  className={`easy-walker is-easy-walker is-juice${tapJuice.shrug ? ' is-shrug' : juiceHeaven ? ' is-heaven' : ' is-squash'}`}
                  style={{
                    left: tapJuice.left,
                    top: tapJuice.top,
                    width: EASY_WALKER_HIT_PX,
                    height: EASY_WALKER_HIT_PX,
                  }}
                >
                  <span className="easy-hit-flash" />
                  {tapJuice.shrug ? (
                    <span className="easy-tap-puff" />
                  ) : (
                    <span className="easy-tap-plus">+</span>
                  )}
                  {tapJuice.combo > 1 ? (
                    <span className="easy-tap-combo">×{tapJuice.combo}</span>
                  ) : null}
                  <span className="easy-juice-head">
                    <img
                      className="walker-face easy-walker-face"
                      src={nightEnemies.faceSrc(tapJuice.face ?? tapJuice.kind, true)}
                      alt=""
                      draggable={false}
                      aria-hidden
                      style={{
                        width: EASY_WALKER_FACE_PX,
                        height: EASY_WALKER_FACE_PX,
                        margin: 0,
                        boxShadow: 'none',
                        background: 'transparent',
                      }}
                    />
                  </span>
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
