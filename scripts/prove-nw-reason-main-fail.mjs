/**
 * Gate proof for #991: run checkNwReasonStripRoad against origin/main placer (same repro URL).
 * Prints combined stdout; exits non-zero when the check fails (overlap>0 or other fail line).
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const mainPlacer = execFileSync('git', ['show', 'origin/main:src/lib/towerCardPlace.ts'], { encoding: 'utf8' })
writeFileSync(new URL('../src/lib/towerCardPlace.ts', import.meta.url), mainPlacer)
try {
  execFileSync(
    process.execPath,
    ['scripts/check-phone-fixes.mjs'],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        NW_REASON_STRIP_ROAD_ONLY: '1',
        NW_REASON_STRIP_ROAD_SIZE: '390x844',
        NW_REASON_STRIP_ROAD_TOOL: 'reason',
      },
    },
  )
} finally {
  execFileSync('git', ['checkout', 'HEAD', '--', 'src/lib/towerCardPlace.ts'], { stdio: 'inherit' })
}