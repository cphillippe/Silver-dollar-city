import { evidenceFor } from '../content/evidence'
import { journalForChallenge } from '../content'
import { mindGraph } from '../lib/mindMap'
import type { CityPlotId } from '../lib/city'
import { rehearseGo, useProgress } from '../store/progress'
import type { View } from '../types'
import { Avatar } from './Avatar'
import { AbilityMark } from './GemMark'

interface MindMapProps {
  plotId: CityPlotId
  onClose: () => void
  onEnter: (id: CityPlotId) => void
  onNavigate: (view: View) => void
}

export function MindMap({ plotId, onClose, onEnter, onNavigate }: MindMapProps) {
  const { progress } = useProgress()
  const graph = mindGraph(plotId, progress)
  const litCount =
    graph.ideas.filter((item) => item.lit).length +
    graph.tools.filter((item) => item.lit).length

  function openIdea(id: string) {
    const page = journalForChallenge(id)
    if (page && progress.journal.includes(page.id)) {
      onNavigate({ name: 'journal', focusId: page.id, autoQuiz: true })
      return
    }
    if (evidenceFor(id) && (progress.held.includes(id) || progress.completed.includes(id))) {
      onNavigate(rehearseGo(progress, graph.plotId === 'porch' ? 'porch' : undefined))
      return
    }
    onNavigate({ name: 'journal', focusId: page?.id ?? id })
  }

  return (
    <div className="mind-map" role="dialog" aria-label={`${graph.placeTitle} mind map`}>
      <button type="button" className="mind-map-scrim" aria-label="Close mind map" onClick={onClose} />
      <div className="mind-map-card">
        <header className="mind-map-head">
          <Avatar who={graph.person.id} size="md" />
          <div>
            <p className="eyebrow">Mind map · {litCount} lit</p>
            <h2>{graph.placeTitle}</h2>
            <p className="quiet">
              {graph.person.name} · where + who + what claim
            </p>
          </div>
          <button type="button" className="btn tiny" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="mind-web" aria-label="Linked nodes">
          <div className="mind-node is-place is-lit">
            <span className="mind-kicker">Place</span>
            <strong>{graph.placeTitle}</strong>
          </div>
          <div className="mind-node is-person is-lit">
            <span className="mind-kicker">Person</span>
            <Avatar who={graph.person.id} size="sm" />
            <strong>{graph.person.shortName}</strong>
          </div>
          {graph.ideas.map((idea) => (
            <button
              key={idea.id}
              type="button"
              className={`mind-node is-idea ${idea.lit ? 'is-lit' : 'is-dim'}`}
              disabled={!idea.lit}
              onClick={() => {
                if (idea.lit) openIdea(idea.id)
              }}
            >
              <span className="mind-kicker">{idea.lit ? 'Idea' : 'Locked'}</span>
              <strong>{idea.claim}</strong>
              {idea.lit && idea.source ? <em>{idea.source}</em> : null}
            </button>
          ))}
          {graph.tools.map((tool) => (
            <div
              key={tool.id}
              className={`mind-node is-tool ${tool.lit ? 'is-lit' : 'is-dim'}`}
            >
              <span className="mind-kicker">{tool.lit ? 'Tool' : 'Locked'}</span>
              <AbilityMark ability={tool.id} size="sm" />
              <strong>{tool.label}</strong>
            </div>
          ))}
          {graph.ideas.length === 0 && graph.tools.length === 0 ? (
            <p className="quiet mind-empty">
              Walk this lot — or link the street — to light idea nodes here.
            </p>
          ) : null}
        </div>

        <div className="mind-map-actions">
          <button type="button" className="btn primary" onClick={() => onEnter(plotId)}>
            Enter {graph.placeTitle}
          </button>
        </div>
      </div>
    </div>
  )
}
