import { useState } from 'react'
import { createPortal } from 'react-dom'
import { evidenceFor } from '../content/evidence'
import { journalForChallenge } from '../content'
import { plainFor } from '../content/plain'
import { LOT_STORY, easyPlaceSub, lotWhy } from '../content/lots'
import { EASY, isEasy, scrapbookLabel } from '../lib/easy'
import { mindGraph } from '../lib/mindMap'
import {
  appliedTier,
  canUpgrade,
  ideaLockWhy,
  nextUpgradeNeed,
  TIER_MAX,
  tierJob,
  tierTitle,
} from '../lib/cityBuild'
import type { CityPlotId } from '../lib/city'
import { WORDS } from '../lib/words'
import { rehearseGo, useProgress } from '../store/progress'
import type { View } from '../types'
import { Avatar } from './Avatar'
import { AbilityMark } from './GemMark'
import { DigDeeper } from './DigDeeper'
import { WordGloss } from './WordGloss'

interface MindMapProps {
  plotId: CityPlotId
  onClose: () => void
  onEnter: (id: CityPlotId) => void
  onNavigate: (view: View) => void
}

export function MindMap({ plotId, onClose, onEnter, onNavigate }: MindMapProps) {
  const { progress, upgradeBuilding } = useProgress()
  const easy = isEasy(progress)
  const graph = mindGraph(plotId, progress)
  const applied = appliedTier(plotId, progress)
  const ready = canUpgrade(plotId, progress)
  const need = nextUpgradeNeed(plotId, progress, easy)
  const [ideaLock, setIdeaLock] = useState<string | null>(null)
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

  const sheet = (
    <div
      className="mind-map is-manage"
      role="dialog"
      aria-label={`Manage ${graph.placeTitle}`}
    >
      <button type="button" className="mind-map-scrim" aria-label="Close building" onClick={onClose} />
      <div className="mind-map-card">
        <header className="mind-map-head">
          <Avatar who={graph.person.id} size="md" />
          <div>
            <p className="eyebrow">
              {easy
                ? `${EASY.manage} · ${applied} · ${tierTitle(applied, easy)}`
                : `Manage · Level ${applied} · ${tierTitle(applied, easy)}`}
            </p>
            <h2>{graph.placeTitle}</h2>
            {easy && easyPlaceSub(plotId) ? (
              <p className="quiet place-sub">{easyPlaceSub(plotId)}</p>
            ) : null}
          </div>
          <button type="button" className="btn tiny" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="mind-map-scroll">
        <p className="quiet">{lotWhy(graph.plotId, easy)}</p>

        {easy ? null : <WordGloss words={[WORDS.upgrade]} />}

        <p className="build-job">{tierJob(applied, easy)}</p>
        {ideaLock ? (
          <p className="match-toast" role="status">
            {ideaLock}
          </p>
        ) : null}

        <div className="mind-web" aria-label="Linked nodes">
          <div className="mind-node is-place is-lit">
            <span className="mind-kicker">Place</span>
            <strong>{graph.placeTitle}</strong>
            <em className="mind-why">{LOT_STORY[graph.plotId].path}</em>
          </div>
          <div className="mind-node is-person is-lit">
            <span className="mind-kicker">Person</span>
            <Avatar who={graph.person.id} size="sm" />
            <strong>{graph.person.shortName}</strong>
          </div>
          {graph.ideas.map((idea) => (
            <div key={idea.id} className="mind-idea-wrap">
              <button
                type="button"
                className={`mind-node is-idea ${idea.lit ? 'is-lit' : 'is-dim'}`}
                onClick={() => {
                  if (idea.lit) {
                    setIdeaLock(null)
                    openIdea(idea.id)
                    return
                  }
                  setIdeaLock(ideaLockWhy(easy))
                }}
              >
                <span className="mind-kicker">{idea.lit ? (easy ? 'Main idea' : 'Idea') : 'Locked'}</span>
                <strong>{idea.lit && easy ? (plainFor(idea.id)?.gloss ?? idea.claim) : idea.claim}</strong>
                {idea.lit && idea.source && !easy ? <em>{idea.source}</em> : null}
              </button>
              {idea.lit ? <DigDeeper id={idea.id} surface="map" compact /> : null}
            </div>
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

        {easy ? null : <p className="quiet scrap-kicker">{scrapbookLabel(easy, litCount)}</p>}
        {applied >= TIER_MAX || ready ? null : (
          <p className="quiet build-cap">
            {easy
              ? `${applied} of ${TIER_MAX} looks. Learn more to earn the next.`
              : `${applied} of ${TIER_MAX} looks earned by learning.`}
          </p>
        )}
        </div>

        <div className="mind-map-dock">
          {ready ? null : <p className="build-next">{need.line}</p>}
          {ready ? (
            <button
              type="button"
              className="btn gold xl build-upgrade"
              onClick={() => upgradeBuilding(plotId)}
            >
              Build this
            </button>
          ) : (
            <button type="button" className="btn primary xl" onClick={() => onEnter(plotId)}>
              {easy ? `Walk ${graph.placeTitle}` : `Enter ${graph.placeTitle}`}
            </button>
          )}
          {ready ? (
            <button type="button" className="text-link mind-map-walk" onClick={() => onEnter(plotId)}>
              {easy ? `Walk ${graph.placeTitle}` : `Enter ${graph.placeTitle}`}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
  return typeof document === 'undefined' ? sheet : createPortal(sheet, document.body)
}
