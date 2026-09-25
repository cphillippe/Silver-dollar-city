import { Avatar } from '../Avatar'
import plotGateBuilt from '../../assets/city/plots/plot-gate-built.webp'
import plotGateLit from '../../assets/city/plots/plot-gate-lit.webp'
import plotGateScaffold from '../../assets/city/plots/plot-gate-scaffold.webp'
import plotHollowBuilt from '../../assets/city/plots/plot-hollow-built.webp'
import plotHollowLit from '../../assets/city/plots/plot-hollow-lit.webp'
import plotHollowScaffold from '../../assets/city/plots/plot-hollow-scaffold.webp'
import plotJournalBuilt from '../../assets/city/plots/plot-journal-built.webp'
import plotJournalLit from '../../assets/city/plots/plot-journal-lit.webp'
import plotJournalScaffold from '../../assets/city/plots/plot-journal-scaffold.webp'
import plotPorchBuilt from '../../assets/city/plots/plot-porch-built.webp'
import plotPorchLit from '../../assets/city/plots/plot-porch-lit.webp'
import plotPorchScaffold from '../../assets/city/plots/plot-porch-scaffold.webp'
import { townAck, townVoice } from '../../content/story'
import {
  CITY_AGES,
  CITY_PLOTS,
  SPINE_GROW,
  heavenChip,
  heavenForm,
  type CityAge,
  type CityPlotId,
  type CityStage,
  type CityUpgrade,
} from '../../lib/city'
import {
  EASY_FOLK_LIFT,
  EASY_TAG_SLOT,
  easyTagMetrics,
  HEAVEN_TAG,
  plotTag,
} from '../../lib/cityBuild'
import { isEasy } from '../../lib/easy'
import { useProgress } from '../../store/progress'

export const ANCHOR: Record<CityPlotId, { x: number; y: number }> = {
  lookout: { x: 532, y: 62 },
  observatory: { x: 422, y: 126 },
  hollow: { x: 92, y: 294 },
  journal: { x: 262, y: 244 },
  bench: { x: 368, y: 288 },
  lamps: { x: 208, y: 318 },
  gate: { x: 486, y: 256 },
  porch: { x: 582, y: 306 },
}

const BUILD_SCALE = 1.58

/** Phone-big candy stills for Easy-trail Pack A (porch/gate/journal/hollow). */
type PackAPlotId = 'porch' | 'gate' | 'journal' | 'hollow'
type PlotImageStage = 'scaffold' | 'built' | 'lit'

export const PLOT_IMG: Record<
  PackAPlotId,
  Record<PlotImageStage, string>
> = {
  porch: {
    scaffold: plotPorchScaffold,
    built: plotPorchBuilt,
    lit: plotPorchLit,
  },
  gate: {
    scaffold: plotGateScaffold,
    built: plotGateBuilt,
    lit: plotGateLit,
  },
  journal: {
    scaffold: plotJournalScaffold,
    built: plotJournalBuilt,
    lit: plotJournalLit,
  },
  hollow: {
    scaffold: plotHollowScaffold,
    built: plotHollowBuilt,
    lit: plotHollowLit,
  },
}

/** SVG viewBox width for Pack A candy images (72–110; scaled by BUILD_SCALE on phone). */
const PLOT_IMG_W = 96

const FOLK: Record<CityPlotId, { x: number; y: number }> = {
  lookout: { x: 568, y: 118 },
  observatory: { x: 472, y: 178 },
  hollow: { x: 148, y: 352 },
  journal: { x: 312, y: 300 },
  bench: { x: 420, y: 344 },
  lamps: { x: 178, y: 358 },
  gate: { x: 538, y: 322 },
  porch: { x: 534, y: 356 },
}

const SPARKS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]

const SPINE_MARKS: { age: CityAge; x: number; y: number }[] = [
  { age: 'eden', x: 58, y: 338 },
  { age: 'village', x: 118, y: 300 },
  { age: 'town', x: 280, y: 292 },
  { age: 'gold', x: 498, y: 268 },
  { age: 'heaven', x: 572, y: 36 },
]

export function cityAgeReached(item: CityAge, current: CityAge) {
  return CITY_AGES.indexOf(item) <= CITY_AGES.indexOf(current)
}

export function EdenGrove({ age }: { age: CityAge }) {
  return (
    <g className={`city-eden is-${age}`} aria-hidden>
      <ellipse className="city-eden-canopy" cx="46" cy="268" rx="22" ry="16" />
      <ellipse className="city-eden-canopy" cx="78" cy="258" rx="18" ry="14" />
      <ellipse className="city-eden-canopy" cx="28" cy="292" rx="16" ry="12" />
      <circle className="city-eden-fruit" cx="40" cy="262" r="3.2" />
      <circle className="city-eden-fruit" cx="70" cy="250" r="2.8" />
      <circle className="city-eden-fruit" cx="88" cy="266" r="2.4" />
      <path
        className="city-eden-river"
        d="M8 236 C 40 258, 54 300, 36 348 C 22 382, 70 404, 118 396"
      />
    </g>
  )
}

export function SpinePath({ age }: { age: CityAge }) {
  const grown = SPINE_GROW[age]
  return (
    <g className={`city-spine is-${age}`} aria-hidden>
      <path
        className="city-spine-line"
        pathLength={1}
        strokeDasharray={`${grown} ${1 - grown}`}
        d="M58 338 C 100 312, 160 300, 280 292 C 380 286, 460 220, 520 80 C 540 48, 560 32, 572 36"
      />
      {SPINE_MARKS.map((mark) => (
        <g
          key={mark.age}
          className={`city-spine-mark ${cityAgeReached(mark.age, age) ? 'is-lit' : 'is-wait'}`}
          transform={`translate(${mark.x} ${mark.y})`}
        >
          <circle r="7" />
          <circle r="3.2" className="city-spine-core" />
        </g>
      ))}
    </g>
  )
}

export function EasyPlotChip({ id }: { id: CityPlotId }) {
  const { lines, x0, y0, w, h } = easyTagMetrics(id)
  const slot = EASY_TAG_SLOT[id]
  return (
    <g className="city-easy-chip">
      <rect className="city-plot-tag-bg" x={x0} y={y0} width={w} height={h} rx={10} />
      <text className="city-plot-tag" x={slot.x} y={slot.y} textAnchor="middle">
        {lines.map((line, i) => (
          <tspan key={line} x={slot.x} dy={i === 0 ? 0 : 13}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  )
}

export function HeavenCity({
  age,
  easy,
  onOpen,
}: {
  age: CityAge
  easy?: boolean
  onOpen: () => void
}) {
  const form = easy ? 'seed' : heavenForm(age)
  const chip = easy ? null : heavenChip(age)
  const earned = form === 'city'
  return (
    <g
      className={`city-heaven is-${age} is-${form}`}
      aria-label={chip ?? 'Heaven waits on the ridge'}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen()
        }
      }}
    >
      {form === 'seed' || form === 'wait' ? (
        <circle className="city-heaven-seed" cx="575" cy="36" r={form === 'wait' ? 7 : 5} />
      ) : (
        <circle className="city-heaven-glory" cx="575" cy="28" r={earned ? 46 : 28} fill="url(#city-glory)" />
      )}
      {form === 'wait' || form === 'rise' ? (
        <path
          className="city-heaven-foot"
          d="M538 62 h76"
        />
      ) : null}
      {form === 'rise' || form === 'ridge' || form === 'city' ? (
        <path
          className="city-heaven-wall"
          d="M530 48 l18-22 16 10 14-18 16 12 18-16 16 20 v22 H530 Z"
          fill="url(#city-heaven-wall)"
        />
      ) : null}
      {form === 'ridge' || form === 'city' ? (
        <>
          <path className="city-heaven-gate" d="M568 58 v-16 a8 10 0 0 1 16 0 v16" />
          <rect className="city-heaven-tower" x="538" y="18" width="10" height="22" rx="1" />
          <rect className="city-heaven-tower" x="602" y="14" width="10" height="26" rx="1" />
        </>
      ) : null}
      {earned ? (
        <>
          <path className="city-heaven-spire" d="M543 18 l5-10 5 10" />
          <path className="city-heaven-spire" d="M607 14 l5-12 5 12" />
        </>
      ) : null}
      {chip ? (
        <text className="city-heaven-label" x={HEAVEN_TAG.x} y={HEAVEN_TAG.y} textAnchor="middle">
          {chip}
        </text>
      ) : null}
    </g>
  )
}

export function PlotGroup({
  id,
  stage,
  fill,
  next,
  rising,
  tapped,
  ready,
  onOpen,
}: {
  id: CityPlotId
  stage: CityStage
  fill: number
  next: boolean
  rising: boolean
  tapped: boolean
  ready: boolean
  onOpen: (id: CityPlotId) => void
}) {
  const { progress } = useProgress()
  const easy = isEasy(progress)
  const clickable = stage !== 'empty' || next || ready
  const at = ANCHOR[id]
  const vacant = stage === 'empty' && !next && !ready
  const title =
    easy && id === 'journal'
      ? 'River’s pages'
      : (CITY_PLOTS.find((plot) => plot.id === id)?.title ?? id)
  const scale = BUILD_SCALE
  const hit = easy ? 56 : 42
  const tag = plotTag(id)
  const showTag = !easy && clickable
  const tagW = Math.max(64, tag.length * 8 + 20)
  const tagX = Math.min(632 - tagW / 2, Math.max(tagW / 2 + 8, at.x))
  const tagY = at.y + 32
  const tagH = 18
  return (
    <g
      className={`city-plot is-${stage} ${next ? 'is-next' : ''} ${rising ? 'is-rising' : ''} ${tapped ? 'is-tapped' : ''} ${ready ? 'is-ready' : ''} ${easy ? 'is-easy-lot' : ''}`}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={`${title} ${stage}${ready ? ', upgrade ready' : ''}${next ? ', next to build' : ''}${rising ? ', just rose' : ''}`}
      onClick={() => {
        if (clickable) onOpen(id)
      }}
      onKeyDown={(event) => {
        if (!clickable) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen(id)
        }
      }}
    >
      {clickable ? (
        <circle className="city-plot-hit" cx={at.x} cy={at.y} r={hit} />
      ) : null}
      {vacant ? (
        next || ready ? (
          <g className="city-lot is-staked" transform={`translate(${at.x} ${at.y}) scale(${scale})`}>
            <ellipse rx="20" ry="9" className="city-earth" />
            <path
              className="city-timber"
              d="M-10 8 V-12 M10 8 V-12 M-12 -2 H12 M-5 8 V-7 M5 8 V-7"
            />
          </g>
        ) : null
      ) : (
        <g transform={`translate(${at.x} ${at.y}) scale(${scale}) translate(${-at.x} ${-at.y})`}>
          <PlotArt id={id} stage={stage} fill={fill} rising={rising} />
        </g>
      )}
      {showTag ? (
        <>
          <rect
            className="city-plot-tag-bg"
            x={tagX - tagW / 2}
            y={tagY - 14}
            width={tagW}
            height={tagH}
            rx={7}
          />
          <text className="city-plot-tag" x={tagX} y={tagY} textAnchor="middle">
            {tag}
          </text>
        </>
      ) : null}
      {rising ? (
        <g className="city-sparks" transform={`translate(${at.x} ${at.y})`}>
          <circle r="28" className="city-flash" />
          {SPARKS.map((deg) => (
            <circle
              key={deg}
              className="city-spark"
              r="4.2"
              style={{ ['--deg' as string]: `${deg}deg` }}
            />
          ))}
        </g>
      ) : null}
    </g>
  )
}

function plotImageHref(id: CityPlotId, stage: CityStage): string | undefined {
  if (stage !== 'scaffold' && stage !== 'built' && stage !== 'lit') return undefined
  const pack = PLOT_IMG[id as PackAPlotId]
  return pack?.[stage]
}

function PlotImageArt({ id, href }: { id: CityPlotId; href: string }) {
  const at = ANCHOR[id]
  const w = PLOT_IMG_W
  const h = w
  return (
    <image
      className="city-plot-img"
      href={href}
      x={at.x - w / 2}
      y={at.y - h / 2}
      width={w}
      height={h}
      preserveAspectRatio="xMidYMid meet"
    />
  )
}

function PlotArt({
  id,
  stage,
  fill,
  rising,
}: {
  id: CityPlotId
  stage: CityStage
  fill: number
  rising: boolean
}) {
  const img = plotImageHref(id, stage)
  if (img) return <PlotImageArt id={id} href={img} />
  if (id === 'hollow') return <HollowArt stage={stage} fill={fill} rising={rising} />
  if (id === 'porch') return <PorchArt stage={stage} />
  if (id === 'bench') return <BenchArt stage={stage} fill={fill} rising={rising} />
  if (id === 'observatory') return <ObservatoryArt stage={stage} fill={fill} rising={rising} />
  if (id === 'gate') return <GateArt stage={stage} fill={fill} rising={rising} />
  if (id === 'lookout') return <LookoutArt stage={stage} fill={fill} rising={rising} />
  if (id === 'journal') return <JournalArt stage={stage} fill={fill} />
  return <LampsArt stage={stage} fill={fill} />
}

function HollowArt({
  stage,
  fill,
  rising,
}: {
  stage: CityStage
  fill: number
  rising: boolean
}) {
  if (stage === 'scaffold') {
    return (
      <>
        <ellipse cx="116" cy="320" rx="24" ry="8" className="city-earth" />
        <path
          className="city-timber"
          d="M98 318 V288 M134 318 V288 M96 288 H136 M108 318 V272 L116 260 L124 272 V318"
        />
      </>
    )
  }
  return (
    <>
      <ellipse cx="92" cy="286" rx="28" ry="18" className="city-canopy" />
      <ellipse cx="128" cy="278" rx="22" ry="16" className="city-canopy" />
      {fill >= 2 ? (
        <ellipse
          cx="70"
          cy="300"
          rx="16"
          ry="12"
          className={`city-canopy ${rising && fill === 2 ? 'is-sprout' : ''}`}
        />
      ) : null}
      {fill >= 3 ? (
        <ellipse
          cx="148"
          cy="268"
          rx="14"
          ry="11"
          className={`city-canopy ${rising && fill === 3 ? 'is-sprout' : ''}`}
        />
      ) : null}
      {fill >= 4 ? (
        <ellipse
          cx="54"
          cy="278"
          rx="12"
          ry="9"
          className={`city-canopy ${rising && fill === 4 ? 'is-sprout' : ''}`}
        />
      ) : null}
      <path className="city-porch" d="M94 320 h44 l5 8 H90 Z" />
      <rect x="98" y="292" width="36" height="28" rx="3" />
      <path className="city-roof" d="M94 292 l22-16 22 16" />
      {stage === 'lit' ? (
        <path className="city-roof city-roof-tile" d="M90 294 l26-20 26 20" />
      ) : null}
      {fill >= 1 ? (
        <rect x="110" y="300" width="10" height="10" rx="1" className="city-window" />
      ) : null}
      {stage === 'lit' ? <circle className="city-lamp" cx="142" cy="302" r="4.5" /> : null}
    </>
  )
}

function PorchArt({ stage }: { stage: CityStage }) {
  if (stage === 'scaffold') {
    return (
      <>
        <ellipse cx="565" cy="334" rx="30" ry="9" className="city-earth" />
        <path
          className="city-timber"
          d="M538 330 V296 M590 330 V296 M536 296 H592 M574 330 V256"
        />
        <circle className="city-lamp" cx="574" cy="252" r="6" />
      </>
    )
  }
  return (
    <>
      <path className="city-porch" d="M532 334 h66 l7 9 H526 Z" />
      <path className="city-roof" d="M530 292 l35-22 35 22" />
      <rect x="536" y="292" width="58" height="42" rx="3" />
      <rect x="552" y="306" width="12" height="14" rx="1" className="city-window" />
      {stage === 'lit' ? (
        <path className="city-roof city-roof-tile" d="M526 294 l39-26 39 26" />
      ) : null}
      <path d="M574 292 v-36" />
      <circle cx="574" cy="252" r="8" className="city-lamp" />
      {stage === 'lit' ? (
        <>
          <path className="city-porch-rail" d="M538 328 h54 M538 328 v-8 M564 328 v-8 M592 328 v-8" />
          <g className="city-smoke" transform="translate(574 236)">
            <circle className="city-puff city-puff-a" r="3" cx="0" cy="0" />
            <circle className="city-puff city-puff-b" r="2.4" cx="3" cy="-8" />
          </g>
        </>
      ) : (
        <g className="city-smoke" transform="translate(574 236)">
          <circle className="city-puff city-puff-a" r="3" cx="0" cy="0" />
          <circle className="city-puff city-puff-b" r="2.4" cx="3" cy="-8" />
        </g>
      )}
    </>
  )
}

function BenchArt({
  stage,
  fill,
  rising,
}: {
  stage: CityStage
  fill: number
  rising: boolean
}) {
  if (stage === 'scaffold') {
    return (
      <>
        <ellipse cx="350" cy="308" rx="28" ry="8" className="city-earth" />
        <path className="city-timber" d="M322 304 V270 M378 304 V270 M320 270 H380 M332 304 h36" />
      </>
    )
  }
  return (
    <>
      <path className="city-porch" d="M318 304 h64 l6 8 H312 Z" />
      <rect x="318" y="268" width="64" height="36" rx="3" />
      <path className="city-roof" d="M314 268 l34-16 34 16" />
      {stage === 'lit' ? (
        <path className="city-roof city-roof-tile" d="M310 270 l38-20 38 20" />
      ) : null}
      <rect x="338" y="278" width="10" height="12" rx="1" className="city-window" />
      <rect x="354" y="278" width="10" height="12" rx="1" className="city-window" />
      {fill >= 2 ? (
        <rect
          x="322"
          y="278"
          width="8"
          height="10"
          rx="1"
          className={`city-window ${rising && fill === 2 ? 'is-sprout' : ''}`}
        />
      ) : null}
      {fill >= 3 ? (
        <rect
          x="370"
          y="278"
          width="8"
          height="10"
          rx="1"
          className={`city-window ${rising && fill === 3 ? 'is-sprout' : ''}`}
        />
      ) : null}
      <path d="M332 304 h36 M338 304 v-12 h24 v12" />
      {stage === 'lit' ? <circle className="city-lamp" cx="350" cy="254" r="5" /> : null}
    </>
  )
}

function ObservatoryArt({
  stage,
  fill,
  rising,
}: {
  stage: CityStage
  fill: number
  rising: boolean
}) {
  if (stage === 'scaffold') {
    return (
      <>
        <ellipse cx="464" cy="142" rx="28" ry="9" className="city-earth" />
        <path className="city-timber" d="M440 140 V112 M488 140 V112 M438 112 H490 M464 140 V88" />
        <circle cx="464" cy="86" r="7" className="city-timber" />
      </>
    )
  }
  return (
    <>
      <path d="M428 118 a36 28 0 0 1 72 0 v22 h-72 z" />
      <rect x="454" y="86" width="8" height="16" rx="1" />
      <circle
        cx="464"
        cy="108"
        r={fill >= 2 ? 7 : 5}
        className={`city-window ${rising && fill === 2 ? 'is-sprout' : ''}`}
      />
      {fill >= 3 ? (
        <circle
          cx="448"
          cy="116"
          r="4"
          className={`city-window ${rising && fill === 3 ? 'is-sprout' : ''}`}
        />
      ) : null}
      {fill >= 4 || stage === 'lit' ? (
        <circle cx="480" cy="116" r="4" className="city-window" />
      ) : null}
      {stage === 'lit' ? (
        <>
          <path className="city-roof city-roof-tile" d="M432 118 a32 24 0 0 1 64 0" />
          <circle className="city-lamp" cx="498" cy="124" r="4.5" />
        </>
      ) : null}
    </>
  )
}

function GateArt({
  stage,
  fill,
  rising,
}: {
  stage: CityStage
  fill: number
  rising: boolean
}) {
  if (stage === 'scaffold') {
    return (
      <>
        <ellipse cx="498" cy="314" rx="26" ry="8" className="city-earth" />
        <path className="city-timber" d="M474 312 V252 M522 312 V252" />
      </>
    )
  }
  return (
    <>
      <path d="M470 250 v62 h56 v-62" />
      <path className="city-roof" d="M478 250 a20 28 0 0 1 40 0" />
      {fill >= 2 ? (
        <path
          className={`city-roof ${rising && fill === 2 ? 'is-sprout' : ''}`}
          d="M474 252 a24 30 0 0 1 48 0"
        />
      ) : null}
      {fill >= 3 || stage === 'lit' ? (
        <circle className="city-lamp" cx="474" cy="248" r="4.5" />
      ) : null}
      {stage === 'lit' ? (
        <>
          <path className="city-roof city-roof-tile" d="M476 248 a22 30 0 0 1 44 0" />
          <circle className="city-lamp" cx="522" cy="248" r="4.5" />
        </>
      ) : null}
    </>
  )
}

function LookoutArt({
  stage,
  fill,
  rising,
}: {
  stage: CityStage
  fill: number
  rising: boolean
}) {
  if (stage === 'scaffold') {
    return (
      <>
        <ellipse cx="520" cy="140" rx="18" ry="7" className="city-earth" />
        <path className="city-timber" d="M520 140 V70 M508 96 H532 M512 118 H528" />
      </>
    )
  }
  return (
    <>
      <path d="M502 86 l18-38 18 38 v52 h-36 z" />
      <path className="city-roof" d="M502 86 l18-38 18 38" />
      <rect x="514" y="78" width="12" height="18" rx="1" className="city-window" />
      {fill >= 2 ? (
        <path
          d="M520 48 l14 8 v10 h-8 z"
          className={`city-flag ${rising && fill === 2 ? 'is-sprout' : ''}`}
        />
      ) : null}
      {fill >= 3 || stage === 'lit' ? (
        <circle className="city-lamp" cx="538" cy="70" r="4.5" />
      ) : null}
      {stage === 'lit' ? (
        <path className="city-roof city-roof-tile" d="M498 88 l22-44 22 44" />
      ) : null}
    </>
  )
}

function JournalArt({ stage, fill }: { stage: CityStage; fill: number }) {
  if (stage === 'scaffold') {
    return (
      <>
        <ellipse cx="288" cy="290" rx="26" ry="8" className="city-earth" />
        <path className="city-timber" d="M266 286 V250 M310 286 V250 M264 250 H312" />
      </>
    )
  }
  return (
    <>
      <path className="city-porch" d="M260 288 h56 l6 8 H254 Z" />
      <path className="city-roof" d="M256 248 l32-20 32 20" />
      <rect x="262" y="248" width="52" height="40" rx="3" />
      <rect x="280" y="262" width="16" height="14" rx="1" className="city-window" />
      {fill >= 4 || stage === 'lit' ? (
        <path className="city-roof city-roof-tile" d="M252 250 l36-24 36 24" />
      ) : null}
      {stage === 'lit' ? <circle className="city-lamp" cx="312" cy="246" r="4" /> : null}
    </>
  )
}

function LampsArt({ stage, fill }: { stage: CityStage; fill: number }) {
  const first = stage !== 'empty'
  const second = fill >= 4 || stage === 'built' || stage === 'lit'
  const third = fill >= 8 || stage === 'lit'
  return (
    <>
      {first ? (
        <>
          <path d="M214 318 v-28" />
          <circle cx="214" cy="286" r="6" className="city-lamp" />
        </>
      ) : null}
      {second ? (
        <>
          <path d="M258 322 v-28" />
          <circle cx="258" cy="290" r="6" className="city-lamp" />
        </>
      ) : null}
      {third ? (
        <>
          <path d="M392 326 v-28" />
          <circle cx="392" cy="294" r="6" className="city-lamp" />
        </>
      ) : null}
    </>
  )
}

export function TownFolk({
  id,
  stage,
  next,
  rising,
  speaking,
  ack,
}: {
  id: CityPlotId
  stage: CityStage
  next: boolean
  rising: boolean
  speaking: boolean
  ack?: CityUpgrade['beat']
}) {
  const { progress } = useProgress()
  if (stage === 'empty' && !next) return null
  const easy = isEasy(progress)
  const seat = FOLK[id]
  const at = easy ? { x: seat.x, y: seat.y - EASY_FOLK_LIFT } : seat
  const voice = townVoice(id)
  const line = ack ? townAck(id, ack, isEasy(progress)) : voice.here
  const short = line.length > 22 ? `${line.slice(0, 20)}…` : line
  const home = stage === 'built' || stage === 'lit'
  return (
    <g transform={`translate(${at.x} ${at.y})`} pointerEvents="none">
      <g
        className={`city-folk is-${stage} ${next ? 'is-next' : ''} ${rising ? 'is-waving' : ''} ${home ? 'is-home' : ''}`}
      >
        <ellipse className="city-home-pad" rx={home ? 20 : 13} ry={home ? 8 : 5} cy="7" />
        {home ? (
          <path className="city-porch-rail" d="M-16 2 H16 M-16 2 v-8 M0 2 v-8 M16 2 v-8" />
        ) : null}
        {stage === 'lit' ? <circle className="city-lamp" cx="18" cy="-4" r="3.8" /> : null}
        <foreignObject x="-22" y="-50" width="44" height="44" overflow="hidden">
          <div className="city-portrait">
            <Avatar who={voice.who} size="sm" />
          </div>
        </foreignObject>
        {speaking ? (
          <g className="city-bubble">
            <rect x="-38" y="-62" width="76" height="16" rx="8" />
            <text y="-51" textAnchor="middle">
              {short}
            </text>
          </g>
        ) : null}
      </g>
    </g>
  )
}
