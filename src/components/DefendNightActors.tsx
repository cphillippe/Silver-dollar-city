import { useEffect, useState } from 'react'
import {
  EASY_WALKER_FACE_PX,
  EASY_WALKER_HIT_PX,
  PATH_WALKER_FACE_U,
  PATH_WALKER_HIT_R,
  WATCH_ABILITY_LABEL,
  type WatchAbility,
} from '../lib/defend'
import { WALKER_LABEL } from '../lib/watchTools'
import { CITY_PLOTS, type CityPlotId } from '../lib/city'
import { EASY } from '../lib/easy'
import {
  nightEnemies,
  nightTowers,
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
  unlocked: WatchAbility[]
  flash: CityPlotId | null
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
  /** Between waves: tap a planted lamp to spend sparks on the selected tool. */
  boosting?: boolean
  onBoostTower?: () => void
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
const FACE_HALF = PATH_WALKER_FACE_U / 2
const FACE_TOP = -PATH_WALKER_FACE_U * (24 / 36)

/** SVG children: pads, shots, raiders, blasts (must render inside DefendNightSky). */
export function DefendNightActorsSvg({
  easyTap,
  pads,
  planted,
  progress,
  raiders,
  raiderAt,
  ability,
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
  onBoostTower,
}: Omit<DefendNightActorsProps, 'tapPos' | 'fireBest' | 'tapJuice' | 'easy'> & { easy: boolean }) {
  return (
    <>
              {(easyTap ? planted : pads).map((id) => {
                const at = nightTowers.anchor(id)
                const on = planted.includes(id)
                const stage = nightTowers.stage(id, progress)
                const plot = CITY_PLOTS.find((item) => item.id === id)
                const using = unlocked.includes(ability) ? ability : 'love'
                const hot =
                  phase === 'wave' &&
                  on &&
                  raiders.some(
                    (raider) =>
                      !raider.turned &&
                      nightTowers.inRange(id, using, progress, raiderAt(raider), runTier),
                  )
                const pose = nightTowers.lampPose(hot || flash === id)
                const lampBox = nightTowers.lampImageBox()
                const boostPad = boosting && on
                const scenery = easyTap && !boostPad
                return (
                  <g
                    key={id}
                    data-person-node={scenery ? undefined : 'pad'}
                    className={`defend-pad is-${stage} ${on ? 'is-planted' : ''} ${hot ? 'is-hot' : ''} ${flash === id ? 'is-flash' : ''} ${scenery ? 'is-tower-scenery' : ''} ${boostPad ? 'is-boost-pick' : ''}`}
                    transform={`translate(${at.x} ${at.y})`}
                    role={scenery ? undefined : 'button'}
                    tabIndex={scenery ? undefined : 0}
                    aria-hidden={scenery ? true : undefined}
                    aria-label={
                      scenery
                        ? undefined
                        : phase === 'plant'
                          ? `${on ? 'Pull' : 'Plant'} lamp at ${plot?.title ?? id}`
                          : boostPad
                            ? `Spend a spark on ${WATCH_ABILITY_LABEL[using] ?? using} at ${plot?.title ?? id}`
                            : `Fire ${plot?.title ?? id}`
                    }
                    onClick={
                      scenery
                        ? undefined
                        : (event) => {
                            event.stopPropagation()
                            if (phase === 'plant') togglePad(id)
                            else if (phase === 'boost' && on) onBoostTower?.()
                            else if (phase === 'wave') fire(id)
                          }
                    }
                    onKeyDown={
                      scenery
                        ? undefined
                        : (event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              if (phase === 'plant') togglePad(id)
                              else if (phase === 'boost' && on) onBoostTower?.()
                              else if (phase === 'wave') fire(id)
                            }
                          }
                    }
                  >
                    {scenery ? null : <circle className="defend-hit" r="38" />}
                    <ellipse className="defend-earth" cx="0" cy="10" rx="15" ry="6" />
                    {on ? (
                      <>
                        {phase === 'wave' ? (
                          <circle
                            className={`defend-range${flash === id ? ' is-firing' : ''}`}
                            r={nightTowers.range(id, using, progress, runTier)}
                            pointerEvents="none"
                          />
                        ) : null}
                        <ellipse className="defend-pool" cx="0" cy="12" rx={hot ? 30 : 20} ry={hot ? 11 : 7} />
                        <image
                          className={`defend-tower-lamp is-${pose}`}
                          href={nightTowers.lampSrc(pose)}
                          x={lampBox.x}
                          y={lampBox.y}
                          width={lampBox.w}
                          height={lampBox.h}
                        />
                        {hot ? <circle className="defend-hot-halo" r="27" /> : null}
                      </>
                    ) : scenery ? null : (
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
              {raiders.map((raider) => {
                const at = raiderAt(raider)
                const isTap = easyTap && !raider.turned
                const isCue = isTap && tapTarget?.id === raider.id
                const lampHit =
                  raider.struckAt != null && performance.now() - raider.struckAt < 340
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
                    <circle className="defend-raider-hit" r={PATH_WALKER_HIT_R} fill="transparent" />
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
                      <circle cx="-16" cy="-6" r="7" />
                      <circle cx="14" cy="-10" r="9" />
                      <circle cx="6" cy="8" r="5" />
                      <circle cx="-8" cy="6" r="4" />
                    </g>
                  ) : null}
                  {blast.spark ? (
                    <text className="defend-spark-pop" y="-50" textAnchor="middle">
                      +spark
                    </text>
                  ) : null}
                </g>
              ))}

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
