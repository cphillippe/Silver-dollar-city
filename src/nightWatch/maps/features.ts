import { pathPoint, roadById } from '../path/data.ts'
import type { NightPoint } from '../types.ts'

/** Face center above the feet. Same shift as `PATH_WALKER_FACE_DY`. */
export const FEATURE_FACE_DY = -12

export interface NightSprite {
  name: 'hill' | 'gate' | 'pool' | 'fog' | 'pop'
  /** Top-left of the sprite in plate units. The anchor sits on the feature point. */
  x: number
  y: number
  w: number
  h: number
}

interface Zone {
  /** Plate center. */
  x: number
  y: number
  /** Radius in normalized 0..1 space, so the zone is a circle on the pack. */
  r: number
  width: number
  height: number
}

export interface HillFeature extends Zone {
  type: 'hill'
  rangeBonus: number
  sprite: NightSprite
}

export interface SpeedFeature extends Zone {
  type: 'sprint' | 'sticky'
  speedMul: number
  sprite: NightSprite
}

export interface FogFeature extends Zone {
  type: 'fog'
  sprite: NightSprite
}

export interface SplitFeature {
  type: 'split'
  into: number
  hpFrac: number
  minHp: number
  /** 1-based round the pops start. */
  fromRound: number
  notFast: boolean
  notBoss: boolean
  sprite: NightSprite | null
}

export type NightFeature = HillFeature | SpeedFeature | FogFeature | SplitFeature

const SPRITE_PX: Record<string, { name: NightSprite['name']; w: number; h: number }> = {
  'overlays/hill.png': { name: 'hill', w: 192, h: 192 },
  'overlays/gate.png': { name: 'gate', w: 168, h: 152 },
  'overlays/pool.png': { name: 'pool', w: 200, h: 152 },
  'overlays/fog.png': { name: 'fog', w: 336, h: 336 },
  'overlays/pop.png': { name: 'pop', w: 144, h: 144 },
}

let boundFeatures: readonly NightFeature[] = []

export function bindNightFeatures(features: readonly NightFeature[] | null): void {
  boundFeatures = features ?? []
}

export function boundNightFeatures(): readonly NightFeature[] {
  return boundFeatures
}

function num(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function spriteBox(
  raw: unknown,
  anchor: unknown,
  perUnit: unknown,
  cx: number,
  cy: number,
): NightSprite | null {
  if (typeof raw !== 'string') return null
  const known = SPRITE_PX[raw]
  if (!known) return null
  const scale = num(perUnit)
  const px = scale != null && scale > 0 ? scale : 2
  const ax = Array.isArray(anchor) ? num(anchor[0]) : null
  const ay = Array.isArray(anchor) ? num(anchor[1]) : null
  return {
    name: known.name,
    x: cx - (ax ?? known.w / 2) / px,
    y: cy - (ay ?? known.h / 2) / px,
    w: known.w / px,
    h: known.h / px,
  }
}

/** Circle in normalized pack space. Plate x grows with width, y with height. */
export function featureContains(point: NightPoint, zone: Zone): boolean {
  if (!(zone.width > 0) || !(zone.height > 0) || !(zone.r > 0)) return false
  const dx = point.x / zone.width - zone.x / zone.width
  const dy = point.y / zone.height - zone.y / zone.height
  return dx * dx + dy * dy <= zone.r * zone.r
}

export function featuresFromPack(raw: unknown, width: number, height: number): NightFeature[] {
  if (!Array.isArray(raw)) return []
  const features: NightFeature[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    const type = row.type
    const sprite = spriteBox(row.sprite, row.spriteAnchorPx, row.spritePxPerUnit, 0, 0)
    if (type === 'split') {
      const into = Math.max(0, Math.floor(num(row.into) ?? 0))
      if (into < 1) continue
      features.push({
        type: 'split',
        into,
        hpFrac: num(row.hpFrac) ?? 0.2,
        minHp: Math.max(1, Math.floor(num(row.minHp) ?? 2)),
        fromRound: Math.max(1, Math.floor(num(row.fromRound) ?? 3)),
        notFast: row.notFast !== false,
        notBoss: row.notBoss !== false,
        sprite,
      })
      continue
    }
    const x = num(row.x)
    const y = num(row.y)
    const r = num(row.r)
    if (x == null || y == null || r == null || r <= 0) continue
    const zone: Zone = { x: x * width, y: y * height, r, width, height }
    const drawn = spriteBox(row.sprite, row.spriteAnchorPx, row.spritePxPerUnit, zone.x, zone.y)
    if (type === 'hill') {
      if (!drawn) continue
      features.push({ ...zone, type: 'hill', rangeBonus: num(row.rangeBonus) ?? 0, sprite: drawn })
    } else if (type === 'sprint' || type === 'sticky') {
      if (!drawn) continue
      features.push({
        ...zone,
        type,
        speedMul: num(row.speedMul) ?? (type === 'sprint' ? 1.8 : 0.5),
        sprite: drawn,
      })
    } else if (type === 'fog') {
      if (!drawn) continue
      features.push({ ...zone, type: 'fog', sprite: drawn })
    }
  }
  return features
}

export function hillRangeBonus(at: NightPoint, features: readonly NightFeature[] = boundFeatures): number {
  let bonus = 0
  for (const feature of features) {
    if (feature.type === 'hill' && featureContains(at, feature)) bonus += feature.rangeBonus
  }
  return bonus
}

/** Walk speed while the feet are inside a gate or a pool. Overlaps multiply. */
export function featureSpeed(at: NightPoint, features: readonly NightFeature[] = boundFeatures): number {
  let mul = 1
  for (const feature of features) {
    if ((feature.type === 'sprint' || feature.type === 'sticky') && featureContains(at, feature)) {
      mul *= feature.speedMul
    }
  }
  return mul
}

/** Speed and fog for one walker, looked up on its road so the screen stays off the path math. */
export function walkerZone(
  t: number,
  pathId: string | undefined,
  features: readonly NightFeature[] = boundFeatures,
): { speed: number; fog: boolean } {
  const road = roadById(pathId)
  const feet = road && road.length > 1 ? pathPoint(t, road) : pathPoint(t)
  return { speed: featureSpeed(feet, features), fog: faceInFog(feet, features) }
}

/** A face inside fog cannot be tapped. Lamps do not read this. */
export function faceInFog(feet: NightPoint, features: readonly NightFeature[] = boundFeatures): boolean {
  const face = { x: feet.x, y: feet.y + FEATURE_FACE_DY }
  return features.some((feature) => feature.type === 'fog' && featureContains(face, feature))
}

export function splitFeature(features: readonly NightFeature[] = boundFeatures): SplitFeature | null {
  return features.find((feature): feature is SplitFeature => feature.type === 'split') ?? null
}

/** Health of one mini. Minis pay no sparks. */
export function miniHp(maxHp: number, split: SplitFeature): number {
  return Math.max(split.minHp, Math.round(Math.max(0, maxHp) * split.hpFrac))
}

export function splitDue(
  split: SplitFeature | null,
  roundIndex: number,
  gait: string | undefined,
  boss: boolean,
  mini: boolean,
): boolean {
  if (!split || mini) return false
  if (split.notBoss && boss) return false
  if (split.notFast && gait === 'fast') return false
  return Math.floor(roundIndex) + 1 >= split.fromRound
}

export function featureSprites(features: readonly NightFeature[], layer: 'under' | 'over'): NightSprite[] {
  const sprites: NightSprite[] = []
  for (const feature of features) {
    if (feature.type === 'split' || !('sprite' in feature) || !feature.sprite) continue
    const over = feature.type === 'fog'
    if (layer === 'over' ? over : !over) sprites.push(feature.sprite)
  }
  return sprites
}
