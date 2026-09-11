import { evidenceFor } from '../content/evidence.ts'
import { journalEntries } from '../content/journal.ts'
import { CAST, townVoice, type CharacterId } from '../content/story.ts'
import { STREET_CHALLENGE } from '../content/links.ts'
import type { ProgressState, View } from '../types.ts'
import { CITY_PLOTS, plotStage, type CityPlotId } from './city.ts'
import { ideaUnlocked, PLOT_IDEAS, streetLinked } from './mindMap.ts'
import { findLearning, storedLearnings } from './learning.ts'
import { TIER_MARK, toolTier, toolUnlocked, WATCH_TOOLS } from './watchTools.ts'

export interface ProfileIdea {
  id: string
  claim: string
  reason: string
  source: string
  held: boolean
  stored: boolean
}

export interface ProfilePlace {
  id: CityPlotId
  title: string
  blurb: string
  stage: string
}

export interface ProfilePerson {
  id: CharacterId
  name: string
  role: string
  plotId: CityPlotId
  placeTitle: string
}

export interface ProfileTool {
  id: string
  label: string
  tierMark: string
  unlocked: boolean
}

export interface ProfileLink {
  id: string
  idea: string
  place: string
  person: string
  evidenceId?: string
  plotId?: CityPlotId
}

export interface ProfileInventory {
  ideas: ProfileIdea[]
  places: ProfilePlace[]
  people: ProfilePerson[]
  tools: ProfileTool[]
  links: ProfileLink[]
  streetLinked: boolean
  learned: number
  held: number
  deployed: number
}

function asPlot(id: string | undefined): CityPlotId | null {
  if (!id) return null
  return CITY_PLOTS.some((plot) => plot.id === id) ? (id as CityPlotId) : null
}

export function openIdeaView(progress: ProgressState, id: string): View {
  const page = journalEntries.find((entry) => entry.unlockAfter === id)
  if (page && progress.journal.includes(page.id)) {
    return { name: 'journal', focusId: page.id }
  }
  if (findLearning(progress, id)) {
    return { name: 'journal', focusId: `learn-${id}` }
  }
  return { name: 'journal', focusId: page?.id ?? id }
}

export function openPlaceView(plotId: CityPlotId): View {
  return { name: 'hub', mindPlot: plotId }
}

function ideaFrom(
  progress: ProgressState,
  id: string,
): ProfileIdea | undefined {
  if (id === 'ln-street' || id === 'td-watch') return undefined
  const brief = evidenceFor(id)
  const stored = findLearning(progress, id)
  const claim = brief?.claim ?? stored?.claim
  if (!claim) return undefined
  return {
    id,
    claim,
    reason: brief?.reason ?? stored?.reason ?? '',
    source: brief?.source ?? stored?.source ?? '',
    held: (progress.held ?? []).includes(id),
    stored: Boolean(stored),
  }
}

export function profileInventory(progress: ProgressState): ProfileInventory {
  const seen = new Set<string>()
  const ideas: ProfileIdea[] = []

  function push(id: string) {
    if (seen.has(id)) return
    const row = ideaFrom(progress, id)
    if (!row) return
    seen.add(id)
    ideas.push(row)
  }

  for (const item of storedLearnings(progress)) push(item.id)
  for (const id of [...(progress.held ?? [])].reverse()) push(id)
  for (const id of progress.completed ?? []) {
    if (ideaUnlocked(progress, id)) push(id)
  }

  const places = CITY_PLOTS.filter((plot) => {
    const stage = plotStage(plot.id, progress)
    if (stage !== 'empty') return true
    return (PLOT_IDEAS[plot.id] ?? []).some((id) => ideaUnlocked(progress, id))
  }).map((plot) => ({
    id: plot.id,
    title: plot.title,
    blurb: plot.blurb,
    stage: plotStage(plot.id, progress),
  }))

  const people: ProfilePerson[] = []
  const whoSeen = new Set<CharacterId>()
  for (const place of places) {
    const who = townVoice(place.id).who
    if (who === 'river' || whoSeen.has(who)) continue
    whoSeen.add(who)
    const person = CAST[who]
    people.push({
      id: who,
      name: person.name,
      role: person.role,
      plotId: place.id,
      placeTitle: place.title,
    })
  }

  const tools = WATCH_TOOLS.map((tool) => ({
    id: tool.id,
    label: tool.label,
    tierMark: TIER_MARK[toolTier(tool, progress)] ?? '',
    unlocked: toolUnlocked(tool, progress),
  }))

  const linked = streetLinked(progress)
  const links: ProfileLink[] = linked
    ? STREET_CHALLENGE.triples.map((triple) => {
        const idea = STREET_CHALLENGE.nodes.find((node) => node.id === triple.ideaId)
        const place = STREET_CHALLENGE.nodes.find((node) => node.id === triple.placeId)
        const person = STREET_CHALLENGE.nodes.find((node) => node.id === triple.personId)
        return {
          id: triple.id,
          idea: idea?.text ?? triple.ideaId,
          place: place?.text ?? triple.placeId,
          person: person?.text ?? triple.personId,
          evidenceId: idea?.evidenceId,
          plotId: asPlot(place?.plotId) ?? undefined,
        }
      })
    : []

  const unlockedTools = tools.filter((tool) => tool.unlocked).length

  return {
    ideas,
    places,
    people,
    tools,
    links,
    streetLinked: linked,
    learned: (progress.completed ?? []).filter((id) => id !== 'ln-street').length,
    held: (progress.held ?? []).length,
    deployed: unlockedTools + (progress.defense?.cleared ?? 0),
  }
}

