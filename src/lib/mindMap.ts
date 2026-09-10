import { evidenceFor } from '../content/evidence.ts'
import { STREET_LIGHTS } from '../content/links.ts'
import { CAST, townVoice, type Character } from '../content/story.ts'
import { WATCH_TOOLS } from './watchTools.ts'
import { CITY_PLOTS, type CityPlotId } from './city.ts'
import type { ProgressState } from '../types.ts'

/** Known walks that belong on each town lot. */
export const PLOT_IDEAS: Record<CityPlotId, readonly string[]> = {
  porch: [
    'daily-lantern',
    'daily-gems',
    'daily-seed',
    'daily-neighbor',
    'daily-names',
    'daily-creed',
    'daily-empty',
    'daily-stars',
    'daily-life',
    'daily-cosmos',
    'daily-scroll',
    'daily-isaiah',
    'daily-grace',
    'daily-rest',
    'daily-door',
  ],
  hollow: ['ph-road', 'ph-father', 'ph-seeds', 'ph-debt'],
  bench: ['wb-creed', 'wb-early', 'wb-method', 'wb-women'],
  observatory: ['ob-tuning', 'ob-design', 'ob-leibniz', 'ob-life'],
  gate: ['fg-mover', 'fg-contingent', 'fg-kalam', 'fg-limits'],
  lookout: ['hl-moral', 'hl-mind', 'hl-meaning', 'hl-beauty'],
  journal: [],
  lamps: [],
}

export interface MindIdea {
  id: string
  claim: string
  reason: string
  source: string
  lit: boolean
}

export interface MindTool {
  id: string
  label: string
  lit: boolean
}

export interface MindGraph {
  plotId: CityPlotId
  placeTitle: string
  person: Character
  ideas: MindIdea[]
  tools: MindTool[]
}

export function streetLinked(progress: ProgressState): boolean {
  return (progress.completed ?? []).includes('ln-street')
}

/** A claim is openable when held, walked, stored, or lit by the street links. */
export function ideaUnlocked(progress: ProgressState, id: string): boolean {
  if ((progress.held ?? []).includes(id)) return true
  if ((progress.completed ?? []).includes(id)) return true
  if ((progress.learnings ?? []).some((item) => item.id === id)) return true
  if (streetLinked(progress) && (STREET_LIGHTS as readonly string[]).includes(id)) {
    return true
  }
  return false
}

function ideaNode(progress: ProgressState, id: string): MindIdea | undefined {
  const brief = evidenceFor(id)
  const stored = (progress.learnings ?? []).find((item) => item.id === id)
  const claim = brief?.claim ?? stored?.claim
  if (!claim) return undefined
  return {
    id,
    claim,
    reason: brief?.reason ?? stored?.reason ?? '',
    source: brief?.source ?? stored?.source ?? '',
    lit: ideaUnlocked(progress, id),
  }
}

export function mindGraph(plotId: CityPlotId, progress: ProgressState): MindGraph {
  const spec = CITY_PLOTS.find((plot) => plot.id === plotId)
  const voice = townVoice(plotId)
  const person = CAST[voice.who]
  const known = PLOT_IDEAS[plotId] ?? []

  if (plotId === 'journal') {
    const ideas = (progress.learnings ?? [])
      .map((item) => ideaNode(progress, item.id))
      .filter((item): item is MindIdea => Boolean(item))
    return {
      plotId,
      placeTitle: spec?.title ?? 'Dossier house',
      person,
      ideas,
      tools: [],
    }
  }

  if (plotId === 'lamps') {
    const tools = WATCH_TOOLS.map((tool) => ({
      id: tool.id,
      label: tool.label,
      lit:
        tool.unlockKeys.length === 0 ||
        tool.unlockKeys.some((key) => ideaUnlocked(progress, key)),
    }))
    return {
      plotId,
      placeTitle: spec?.title ?? 'Star lamps',
      person,
      ideas: [],
      tools,
    }
  }

  const extras = (progress.learnings ?? [])
    .map((item) => item.id)
    .filter((id) => !known.includes(id) && ideaUnlocked(progress, id))
    .filter((id) => {
      const stored = (progress.learnings ?? []).find((item) => item.id === id)
      return Boolean(stored?.anchor?.includes(spec?.title ?? ''))
    })

  const showIds =
    plotId === 'porch'
      ? known.filter(
          (id) => ideaUnlocked(progress, id) || (STREET_LIGHTS as readonly string[]).includes(id),
        )
      : [...known, ...extras]

  const ideas = showIds
    .map((id) => ideaNode(progress, id))
    .filter((item): item is MindIdea => Boolean(item))

  return {
    plotId,
    placeTitle: spec?.title ?? plotId,
    person,
    ideas,
    tools: [],
  }
}

export function mindMapHasLit(plotId: CityPlotId, progress: ProgressState): boolean {
  const graph = mindGraph(plotId, progress)
  return graph.ideas.some((item) => item.lit) || graph.tools.some((item) => item.lit)
}
