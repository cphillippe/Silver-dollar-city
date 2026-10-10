import fog from '../../assets/night-watch/maps/overlays/fog.png'
import gate from '../../assets/night-watch/maps/overlays/gate.png'
import hill from '../../assets/night-watch/maps/overlays/hill.png'
import pool from '../../assets/night-watch/maps/overlays/pool.png'
import pop from '../../assets/night-watch/maps/overlays/pop.png'
import { featureSprites, type NightFeature, type NightSprite } from '../maps/features.ts'

const SRC: Record<NightSprite['name'], string> = { hill, gate, pool, fog, pop }

function Sprite({ sprite, puff = false }: { sprite: NightSprite; puff?: boolean }) {
  return (
    <image
      className={puff ? 'nw-pop-puff' : 'nw-feature'}
      href={SRC[sprite.name]}
      x={sprite.x}
      y={sprite.y}
      width={sprite.w}
      height={sprite.h}
      pointerEvents="none"
    />
  )
}

/** Hill, gates, and pools sit on the road. Fog sits above the walkers. */
export function FeatureSprites({
  features,
  layer,
}: {
  features: readonly NightFeature[]
  layer: 'under' | 'over'
}) {
  const sprites = featureSprites(features, layer)
  if (sprites.length < 1) return null
  return (
    <g className={layer === 'over' ? 'nw-features-over' : 'nw-features-under'} pointerEvents="none">
      {sprites.map((sprite, index) => (
        <Sprite key={`${sprite.name}-${index}`} sprite={sprite} />
      ))}
    </g>
  )
}

/** A short puff where a berry popped. */
export function PopPuffs({ pops }: { pops: readonly { key: number; x: number; y: number }[] }) {
  if (pops.length < 1) return null
  const box = SRC.pop ? { w: 144 / 2, h: 144 / 2 } : { w: 72, h: 72 }
  return (
    <g className="nw-pops" pointerEvents="none">
      {pops.map((puff) => (
        <image
          key={puff.key}
          className="nw-pop-puff"
          href={pop}
          x={puff.x - box.w / 2}
          y={puff.y - box.h / 2}
          width={box.w}
          height={box.h}
          pointerEvents="none"
        />
      ))}
    </g>
  )
}
