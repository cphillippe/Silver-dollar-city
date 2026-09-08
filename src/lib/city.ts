import type { ProgressState, View } from '../types.ts'

/** Keep in lockstep with `HOLLOW_WALKS_TO_WITNESS` in the progress store. */
export const CITY_HOLLOW_TO_WITNESS = 2

export type CityPlotId =
  | 'porch'
  | 'hollow'
  | 'bench'
  | 'observatory'
  | 'gate'
  | 'lookout'
  | 'journal'
  | 'lamps'

export type CityStage = 'empty' | 'scaffold' | 'built' | 'lit'

export interface CityPlotSpec {
  id: CityPlotId
  title: string
  blurb: string
  areaId?: string
}

export const CITY_PLOTS: CityPlotSpec[] = [
  {
    id: 'porch',
    title: 'East porch',
    blurb: 'Juniper’s lamp. Today’s Trail starts here.',
  },
  {
    id: 'hollow',
    title: 'Parable Hollow',
    blurb: 'Creek oaks and Mercy’s cabin.',
    areaId: 'parable-hollow',
  },
  {
    id: 'bench',
    title: 'Witness Bench',
    blurb: 'Silas’s ledger hall by the square.',
    areaId: 'witness-bench',
  },
  {
    id: 'observatory',
    title: 'The Observatory',
    blurb: 'Nora’s dome on the north ridge.',
    areaId: 'observatory',
  },
  {
    id: 'gate',
    title: 'The First Gate',
    blurb: 'Ansel’s stone arch on the east road.',
    areaId: 'first-gate',
  },
  {
    id: 'lookout',
    title: 'High Lookout',
    blurb: 'Hope’s tower on the high ridge.',
    areaId: 'high-lookout',
  },
  {
    id: 'journal',
    title: 'Dossier house',
    blurb: 'Pages you can still say.',
  },
  {
    id: 'lamps',
    title: 'Star lamps',
    blurb: 'Mastery lights along the street.',
  },
]

const HOLLOW = ['ph-road', 'ph-father', 'ph-seeds', 'ph-debt']
const BENCH = ['wb-creed', 'wb-early', 'wb-method', 'wb-women']
const OBS = ['ob-tuning', 'ob-design', 'ob-leibniz', 'ob-life']
const GATE = ['fg-mover', 'fg-contingent', 'fg-kalam', 'fg-limits']
const LOOK = ['hl-moral', 'hl-mind', 'hl-meaning', 'hl-beauty']

function countHits(ids: string[], completed: string[]): number {
  return ids.filter((id) => completed.includes(id)).length
}

function districtStage(
  done: number,
  total: number,
  unlocked: boolean,
): CityStage {
  if (done >= total && total > 0) return 'lit'
  if (done > 0) return 'built'
  if (unlocked) return 'scaffold'
  return 'empty'
}

function starTotal(stars: ProgressState['stars']): number {
  return Object.values(stars).reduce((sum, n) => sum + n, 0)
}

export function plotStage(id: CityPlotId, progress: ProgressState): CityStage {
  const hollow = countHits(HOLLOW, progress.completed)
  const bench = countHits(BENCH, progress.completed)
  const obs = countHits(OBS, progress.completed)
  const gate = countHits(GATE, progress.completed)
  const look = countHits(LOOK, progress.completed)
  const dailies = progress.dailyDates.length
  const journal = progress.journal.length
  const stars = starTotal(progress.stars)

  switch (id) {
    case 'porch':
      if (dailies >= 3 || progress.streak >= 3) return 'lit'
      if (dailies >= 1) return 'built'
      return 'scaffold'
    case 'hollow':
      return districtStage(hollow, HOLLOW.length, dailies >= 1)
    case 'bench':
      return districtStage(bench, BENCH.length, hollow >= CITY_HOLLOW_TO_WITNESS)
    case 'observatory':
      return districtStage(obs, OBS.length, bench >= BENCH.length)
    case 'gate':
      return districtStage(gate, GATE.length, obs >= OBS.length)
    case 'lookout':
      return districtStage(look, LOOK.length, gate >= GATE.length)
    case 'journal':
      if (journal >= 12) return 'lit'
      if (journal >= 4) return 'built'
      if (journal >= 1) return 'scaffold'
      return 'empty'
    case 'lamps':
      if (stars + (progress.defense?.cleared ?? 0) >= 12) return 'lit'
      if (stars + (progress.defense?.cleared ?? 0) >= 4) return 'built'
      if (stars + (progress.defense?.cleared ?? 0) >= 1) return 'scaffold'
      return 'empty'
    default:
      return 'empty'
  }
}

export function nextPlotId(
  progress: ProgressState,
  dailyDone: boolean,
): CityPlotId {
  if (!dailyDone) return 'porch'
  const hollow = countHits(HOLLOW, progress.completed)
  if (hollow < HOLLOW.length) return 'hollow'
  if (countHits(BENCH, progress.completed) < BENCH.length) return 'bench'
  if (countHits(OBS, progress.completed) < OBS.length) return 'observatory'
  if (countHits(GATE, progress.completed) < GATE.length) return 'gate'
  if (countHits(LOOK, progress.completed) < LOOK.length) return 'lookout'
  if (progress.journal.length < 12) return 'journal'
  return 'lamps'
}

export function plotView(id: CityPlotId, unlocked: boolean): View {
  switch (id) {
    case 'porch':
      return { name: 'daily' }
    case 'journal':
    case 'lamps':
      return { name: 'journal' }
    case 'hollow':
      return { name: 'area', areaId: 'parable-hollow' }
    case 'bench':
      return unlocked
        ? { name: 'area', areaId: 'witness-bench' }
        : { name: 'area', areaId: 'parable-hollow' }
    case 'observatory':
      return { name: 'area', areaId: unlocked ? 'observatory' : 'witness-bench' }
    case 'gate':
      return { name: 'area', areaId: unlocked ? 'first-gate' : 'observatory' }
    case 'lookout':
      return { name: 'area', areaId: unlocked ? 'high-lookout' : 'first-gate' }
    default:
      return { name: 'hub' }
  }
}

export function cityStanding(progress: ProgressState): {
  standing: number
  possible: number
} {
  const possible = CITY_PLOTS.length
  const standing = CITY_PLOTS.filter((plot) => {
    const stage = plotStage(plot.id, progress)
    return stage === 'built' || stage === 'lit'
  }).length
  return { standing, possible }
}

export function plotFill(id: CityPlotId, progress: ProgressState): number {
  switch (id) {
    case 'porch':
      return progress.dailyDates.length
    case 'hollow':
      return countHits(HOLLOW, progress.completed)
    case 'bench':
      return countHits(BENCH, progress.completed)
    case 'observatory':
      return countHits(OBS, progress.completed)
    case 'gate':
      return countHits(GATE, progress.completed)
    case 'lookout':
      return countHits(LOOK, progress.completed)
    case 'journal':
      return progress.journal.length
    case 'lamps':
      return starTotal(progress.stars) + (progress.defense?.cleared ?? 0)
    default:
      return 0
  }
}

export function nextKicker(stage: CityStage, plotId: CityPlotId, dailyDone: boolean): string {
  if (plotId === 'porch' && !dailyDone) return 'Walk next'
  if (stage === 'scaffold' || stage === 'empty') return 'Build next'
  return 'Still lit'
}

/** What visibly appears if the player takes the next build. */
export function nextGift(id: CityPlotId, stage: CityStage, fill: number): string {
  switch (id) {
    case 'porch':
      if (stage === 'scaffold' || stage === 'empty') return 'Juniper’s porch roof will go on'
      if (stage === 'built') return 'The east lantern will hold'
      return 'The porch stays lit'
    case 'hollow':
      if (stage === 'empty' || stage === 'scaffold') return 'Mercy’s cabin will stand'
      if (fill < 2) return 'Another oak will rise'
      if (fill < 3) return 'A porch oak will sprout'
      if (fill < 4) return 'The last oak will rise'
      return 'The oaks will light'
    case 'bench':
      if (stage === 'empty' || stage === 'scaffold') return 'Silas’s hall will stand'
      if (fill < 2) return 'A window will open'
      if (fill < 3) return 'Another window will open'
      if (fill < 4) return 'The last window will open'
      return 'The square will warm'
    case 'observatory':
      if (stage === 'empty' || stage === 'scaffold') return 'Nora’s dome will rise'
      if (fill < 2) return 'Glass will set in the dome'
      if (fill < 3) return 'The oculus will catch'
      if (fill < 4) return 'The last glass will set'
      return 'Stars will catch the glass'
    case 'gate':
      if (stage === 'empty' || stage === 'scaffold') return 'Ansel’s arch will stand'
      if (fill < 2) return 'Stone will settle'
      if (fill < 3) return 'A lantern will hang'
      if (fill < 4) return 'The last stone will set'
      return 'The east road will warm'
    case 'lookout':
      if (stage === 'empty' || stage === 'scaffold') return 'Hope’s tower will rise'
      if (fill < 2) return 'The flag will kick'
      if (fill < 3) return 'A ridge lantern will hang'
      if (fill < 4) return 'The last timber will set'
      return 'The ridge lantern will hold'
    case 'journal':
      if (stage === 'empty' || stage === 'scaffold') return 'The dossier house will stand'
      if (fill < 4) return 'Another page will land'
      if (fill < 12) return 'The window will glow'
      return 'The pages will glow'
    case 'lamps':
      if (stage === 'empty' || stage === 'scaffold') return 'The first street lamp will catch'
      if (fill < 4) return 'Another lamp will catch'
      if (fill < 12) return 'The street will remember'
      return 'The street stays remembered'
    default:
      return 'The town will grow'
  }
}

export const CITY_SEEN_KEY = 'silver-city-seen-city-v1'
export const CITY_FILL_KEY = 'silver-city-seen-fill-v1'
export const CITY_HOMECOMING_KEY = 'silver-city-homecoming-v1'

const HOMECOMING_ORDER: CityPlotId[] = [
  'lookout',
  'lamps',
  'gate',
  'observatory',
  'bench',
  'hollow',
  'journal',
  'porch',
]

export function newestStanding(snap: CitySnapshot): CityPlotId | null {
  for (const id of HOMECOMING_ORDER) {
    if (snap[id] === 'lit' || snap[id] === 'built') return id
  }
  return null
}

export function readHomecomingDay(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(CITY_HOMECOMING_KEY)
  } catch {
    return null
  }
}

export function writeHomecomingDay(day: string) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CITY_HOMECOMING_KEY, day)
  } catch {
    /* ignore quota */
  }
}

export const STAGE_RANK: Record<CityStage, number> = {
  empty: 0,
  scaffold: 1,
  built: 2,
  lit: 3,
}

export type CitySnapshot = Record<CityPlotId, CityStage>
export type CityFills = Record<CityPlotId, number>

export interface CityUpgrade {
  id: CityPlotId
  from: CityStage
  to: CityStage
  beat: 'Built!' | 'Lit!' | 'Unlocked' | 'Grew!'
  title: string
}

export function citySnapshot(progress: ProgressState): CitySnapshot {
  const snap = {} as CitySnapshot
  for (const plot of CITY_PLOTS) {
    snap[plot.id] = plotStage(plot.id, progress)
  }
  return snap
}

export function fillSnapshot(progress: ProgressState): CityFills {
  const snap = {} as CityFills
  for (const plot of CITY_PLOTS) {
    snap[plot.id] = plotFill(plot.id, progress)
  }
  return snap
}

export function cityUpgrades(
  prev: CitySnapshot,
  next: CitySnapshot,
): CityUpgrade[] {
  const list: CityUpgrade[] = []
  for (const plot of CITY_PLOTS) {
    const from = prev[plot.id]
    const to = next[plot.id]
    if (STAGE_RANK[to] <= STAGE_RANK[from]) continue
    list.push({
      id: plot.id,
      from,
      to,
      beat: to === 'lit' ? 'Lit!' : to === 'built' ? 'Built!' : 'Unlocked',
      title: plot.title,
    })
  }
  list.sort(
    (a, b) => STAGE_RANK[b.to] - STAGE_RANK[a.to] || STAGE_RANK[a.from] - STAGE_RANK[b.from],
  )
  return list
}

export function fillGrows(
  prev: CityFills,
  next: CityFills,
  stages: CitySnapshot,
  stageUps: CityUpgrade[],
): CityUpgrade[] {
  const jumped = new Set(stageUps.map((item) => item.id))
  const list: CityUpgrade[] = []
  for (const plot of CITY_PLOTS) {
    const from = prev[plot.id] ?? 0
    const to = next[plot.id] ?? 0
    if (to <= from) continue
    if (jumped.has(plot.id)) continue
    const stage = stages[plot.id]
    list.push({
      id: plot.id,
      from: stage,
      to: stage,
      beat: 'Grew!',
      title: plot.title,
    })
  }
  return list
}

export function readCitySeen(): CitySnapshot | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(CITY_SEEN_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CitySnapshot
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

export function writeCitySeen(snap: CitySnapshot) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(CITY_SEEN_KEY, JSON.stringify(snap))
}

export function readFillsSeen(): CityFills | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(CITY_FILL_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CityFills
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

export function writeFillsSeen(snap: CityFills) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(CITY_FILL_KEY, JSON.stringify(snap))
}

export function forgetCitySeen() {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(CITY_SEEN_KEY)
  localStorage.removeItem(CITY_FILL_KEY)
}
