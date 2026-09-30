import {
  DEFEND_WAVE_SIZE,
  easyHoldSpawn,
  easySpawnT,
  easyTapFit,
  easyTapTarget,
  heavenPoint,
  heavenSpeed,
  raidForWave,
  waveIsClear,
  waveSpawnEvery,
  waveSpeed,
} from '../../lib/defend.ts'
import type { WalkerKind } from '../../types.ts'
import { nightPath } from '../path/index.ts'
import type { NightPoint, NightRaider } from '../types.ts'

export interface NightEnemiesModule {
  readonly waveSize: number
  /** Who walks next in this wave. */
  cast(cleared: number, index: number): { text: string; kind: WalkerKind }
  /** Easy: where on the road a new walker appears. */
  spawnT(index: number): number
  /** Easy: hold the next spawn while this many unturned walkers are live. */
  holdSpawn(liveUnturned: number): boolean
  spawnEvery(easy: boolean): number
  speed(easy: boolean): number
  heavenSpeed(tier: number, easy: boolean): number
  /** Walker position: on the road, or lifting toward heaven once turned. */
  at(raider: NightRaider): NightPoint
  /** Front-most unturned walker (Easy cue). */
  cueTarget<T extends NightRaider>(raiders: T[]): T | undefined
  fit(easy: boolean, toolId: string, kind: WalkerKind): 'match' | 'weak'
  isClear(easy: boolean, downed: number, spawned: number, walking: number): boolean
}

export const nightEnemies: NightEnemiesModule = {
  waveSize: DEFEND_WAVE_SIZE,
  cast: raidForWave,
  spawnT: easySpawnT,
  holdSpawn: easyHoldSpawn,
  spawnEvery: waveSpawnEvery,
  speed: waveSpeed,
  heavenSpeed,
  at: (raider) =>
    raider.turned && raider.from
      ? heavenPoint(raider.from, raider.heavenT ?? 0)
      : nightPath.pointAt(raider.t),
  cueTarget: easyTapTarget,
  fit: easyTapFit,
  isClear: waveIsClear,
}
