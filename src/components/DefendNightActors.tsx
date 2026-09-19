import {
  DEFEND_ANCHOR,
  abilityRange,
  dist,
  padStage,
  EASY_WALKER_FACE_PX,
  EASY_WALKER_HIT_PX,
  type WatchAbility,
} from '../lib/defend'
import { WALKER_LABEL } from '../lib/watchTools'
import { CITY_PLOTS, type CityPlotId } from '../lib/city'
import { EASY } from '../lib/easy'
import type { ProgressState, WalkerKind } from '../types'
import { walkerSrc, WalkerFace } from './Avatar'

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

export interface DefendNightActorsProps {
  easyTap: boolean
  pads: CityPlotId[]
  planted: CityPlotId[]
  progress: ProgressState
  raiders: Raider[]
  raiderAt: (raider: Raider) => { x: number; y: number }
  ability: WatchAbility
  unlocked: WatchAbility[]
  flash: CityPlotId | null
  togglePad: (id: CityPlotId) => void
  fire: (id: CityPlotId) => void
  fireBest: () => void
  shots: Shot[]
  easy: boolean
  blasts: Blast[]
  phase: 'plant' | 'wave' | 'lost'
  tapTarget: Raider | undefined
  tapPos: { left: number; top: number } | null
}

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
  shots,
  easy,
  blasts,
  phase,
}: Omit<DefendNightActorsProps, 'tapTarget' | 'tapPos' | 'fireBest'>) {
  return (
    <>
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

    </>
  )
}

export function DefendNightWalkerCue({
  easyTap,
  tapTarget,
  tapPos,
  fireBest,
}: Pick<DefendNightActorsProps, 'easyTap' | 'tapTarget' | 'tapPos' | 'fireBest'>) {
  return (
    <>
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
    </>
  )
}
