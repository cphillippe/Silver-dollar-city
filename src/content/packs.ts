import { APP_VERSION } from '../config/app.ts'

/**
 * Content-pack registry. Schema v3 XML in `src/content/packs/` is the
 * Learn → Match → Hold source of truth. The engine adapts those files
 * (`packCatalog.ts`); TypeScript area modules still own district puzzles.
 *
 * Drop CoS packs into `src/content/packs/` (index.xml + one file per area),
 * then `node scripts/embed-packs.mjs`.
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
    notes: 'Schema v3 XML packs in src/content/packs/. Easy trail is all 39 facts in easyOrder.',
  },
]

export function packForArea(areaId: string) {
  return CONTENT_PACKS.find((pack) => pack.areaIds.includes(areaId))
}
