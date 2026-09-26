import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  FATHER_BLAST_IDS,
  FATHER_HUG_ID,
  FATHER_HUG_MEDIA,
  PANEL_BLAST_VERSION,
  ROAD_BLAST_IDS,
  ROAD_CLAIM_BADGE_ID,
  ROAD_CLAIM_MEDIA,
  panelBlastBeatMedia,
  panelBlastHref,
} from '../src/content/panelBlast.ts'
import { APP_VERSION } from '../src/config/app.ts'
import { gemWordsFor } from '../src/lib/gemSearch.ts'
import { resolveStoryMedia, storyPanelsFor } from '../src/lib/storyPanels.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

assert.equal(PANEL_BLAST_VERSION, '1.4.85')
assert.equal(APP_VERSION, '1.4.245')

const files = [
  ...ROAD_BLAST_IDS.flatMap((id) => [
    `public/assets/panel-blast/ph-road/${id}@512.webp`,
    `public/assets/panel-blast/ph-road/${id}@1024.webp`,
  ]),
  `public/assets/panel-blast/ph-road/${ROAD_CLAIM_BADGE_ID}@512.webp`,
  `public/assets/panel-blast/ph-road/${ROAD_CLAIM_BADGE_ID}@1024.webp`,
  ...FATHER_BLAST_IDS.flatMap((id) => [
    `public/assets/panel-blast/ph-father/${id}@512.webp`,
    `public/assets/panel-blast/ph-father/${id}@1024.webp`,
  ]),
  `public/assets/panel-blast/ph-father/${FATHER_HUG_ID}@512.webp`,
  `public/assets/panel-blast/ph-father/${FATHER_HUG_ID}@1024.webp`,
]

for (const rel of files) {
  assert.ok(existsSync(join(root, rel)), `missing ${rel}`)
}

assert.match(panelBlastHref('ph-road', '01-hurt-road', 1024), /assets\/panel-blast\/ph-road\/01-hurt-road@1024\.webp$/)
assert.match(panelBlastHref('ph-father', '03-speech-road', 512), /assets\/panel-blast\/ph-father\/03-speech-road@512\.webp$/)

const road = storyPanelsFor('ph-road', gemWordsFor('ph-road').length)
const father = storyPanelsFor('ph-father', gemWordsFor('ph-father').length)
assert.ok(road.length >= 3 && road.length <= 4)
assert.ok(father.length >= 3 && father.length <= 5)
assert.ok(
  road.every(
    (panel, index) =>
      panel.media.still?.includes(`ph-road/${ROAD_BLAST_IDS[index]}@1024.webp`) &&
      panel.media.thumb?.includes(`ph-road/${ROAD_BLAST_IDS[index]}@512.webp`),
  ),
  'ph-road panels map B1–B4 to blast stills',
)
assert.ok(father[2]?.media.still?.includes('03-speech-road@1024.webp'), 'father B3 is speech-road')
assert.doesNotMatch(father[2]?.media.still ?? '', /before-/)
if (father.length === 5) {
  assert.ok(father[4]?.media.still?.includes('05-hug-feast-hint@1024.webp'), 'father B5 is hug-feast')
}
assert.match(FATHER_HUG_MEDIA.still, /05-hug-feast-hint@1024\.webp/)
assert.match(ROAD_CLAIM_MEDIA.still, /claim-badge@1024\.webp/)
assert.equal(resolveStoryMedia(panelBlastBeatMedia('ph-father', 2)).still, father[2]?.media.still)
assert.equal(resolveStoryMedia({ kind: 'still', thumb: 't.webp' }).thumb, 't.webp')

const mazeSrc = readFileSync(new URL('../src/components/challenges/RoadMazePlay.tsx', import.meta.url), 'utf8')
assert.match(mazeSrc, /ROAD_HURT_FACE/)
assert.match(mazeSrc, /ROAD_HELP_FACE/)
assert.doesNotMatch(mazeSrc, /ROAD_CLAIM_MEDIA/)
assert.match(mazeSrc, /panelBlast/)

const runSrc = readFileSync(new URL('../src/components/challenges/FatherRunPlay.tsx', import.meta.url), 'utf8')
assert.match(runSrc, /FATHER_RUN_FACE/)
assert.match(runSrc, /FATHER_SON_FACE/)
assert.match(runSrc, /FATHER_HUG_MEDIA/)
assert.match(runSrc, /03-speech-road|panelBlast/)

const artSrc = readFileSync(new URL('../src/components/StoryPanelArt.tsx', import.meta.url), 'utf8')
assert.match(artSrc, /size === 'thumb'/)
assert.match(artSrc, /resolved\.thumb/)

console.log('check-panel-blast: ok')
