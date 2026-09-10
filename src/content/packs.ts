import { APP_VERSION } from '../config/app.ts'

/**
 * Content-pack registry. The engine already reads one Area module at a time.
 * A future pack is a new file + one row here — not a rewrite of play code.
 *
 * Add a pack:
 * 1. `src/content/<packArea>.ts` exporting an `Area`
 * 2. Push it onto `areas` in `src/content/index.ts` (order is the trail)
 * 3. Journal cards, evidence briefs, city plot ids, optional WATCH_TOOLS row
 * 4. One `CONTENT_PACKS` row + a `CHANGELOG` entry
 */
export interface ContentPackSpec {
  id: string
  title: string
  version: string
  areaIds: string[]
  toolIds: string[]
  notes: string
}

export const CONTENT_PACKS: ContentPackSpec[] = [
  {
    id: 'core-v0',
    title: 'Core trail',
    version: APP_VERSION,
    areaIds: [
      'parable-hollow',
      'witness-bench',
      'observatory',
      'first-gate',
      'high-lookout',
    ],
    toolIds: ['love', 'logic', 'reason', 'science'],
    notes: 'V0 ship-in-place. Next drop is a new Area module plus one row.',
  },
]

export function packForArea(areaId: string) {
  return CONTENT_PACKS.find((pack) => pack.areaIds.includes(areaId))
}
