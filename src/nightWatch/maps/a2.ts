import { A2_LAMP_GROUND } from '../../lib/lampPlace.ts'
import { DEFEND_ANCHOR, DEFEND_PATH } from '../path/data.ts'

/**
 * Today's Silver City night. The road, cottages, and no-go lists are the
 * arrays the live game already uses, not a copy.
 */
export const A2_NIGHT_MAP = {
  id: 'a2' as const,
  name: 'Silver City',
  badge: 'A2',
  width: 798,
  height: 1134,
  hpMul: 1,
  path: DEFEND_PATH,
  anchors: DEFEND_ANCHOR,
  ground: A2_LAMP_GROUND,
  porchCandy: true,
}
