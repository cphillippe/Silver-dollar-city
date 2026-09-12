import type { ReactNode } from 'react'
import { CAST } from '../content/story'
import { EASY, easyFacingLine, isEasy } from '../lib/easy'
import { profileInventory, openIdeaView, openPlaceView } from '../lib/profile'
import { useProgress } from '../store/progress'
import type { View } from '../types'
import { Avatar } from './Avatar'
import { AbilityMark } from './GemMark'
import { DigDeeper } from './DigDeeper'
import { PlainTalk } from './PlainTalk'
import { SavedTree, SavedTreeSummary } from './SavedTree'

interface ProfileProps {
  onNavigate: (view: View) => void
}

export function Profile({ onNavigate }: ProfileProps) {
  const { progress } = useProgress()
  const easy = isEasy(progress)
  const inv = profileInventory(progress)
  const you = CAST.river

  return (
    <main className="profile page">
      <button
        type="button"
        className="text-link"
        onClick={() => onNavigate({ name: 'hub' })}
      >
        ← {easy ? EASY.home : 'The town'}
      </button>

      <header className="profile-hero">
        <Avatar who="river" size="xl" />
        <div>
          <p className="eyebrow">You · {you.shortName}</p>
          <h1>{you.name}</h1>
          <p className="quiet">
            {you.role} · {you.seeking}
          </p>
          <p className="memory-pipe">
            {easy
              ? `Learn ${inv.learned} · Hold ${inv.held} · Use ${inv.deployed}`
              : `Learn ${inv.learned} · Hold ${inv.held} · Deploy ${inv.deployed}`}
          </p>
        </div>
      </header>

      <TreeFold
        startOpen
        label={easy ? EASY.saved : 'Held ideas'}
        lead={
          easy
            ? 'These are the main ideas you kept.'
            : 'Claims you still hold — reason and source stay with the line.'
        }
        count={inv.ideas.length}
      >
        {inv.ideas.length === 0 ? (
          <p className="quiet">
            Walk the Trail, then Hold the takeaway — lines you keep land here.
          </p>
        ) : (
          inv.ideas.map((idea) => (
            <article key={idea.id} className="profile-unlock">
              <button
                type="button"
                className="profile-unlock-hit"
                onClick={() => onNavigate(openIdeaView(progress, idea.id))}
              >
                <p className="eyebrow">
                  {easy
                    ? idea.held
                      ? EASY.saved
                      : idea.stored
                        ? 'Kept'
                        : 'Walked'
                    : idea.held
                      ? 'Held'
                      : idea.stored
                        ? 'Stored'
                        : 'Walked'}{' '}
                  · {idea.source}
                </p>
                <strong>{easy ? easyFacingLine(idea.id, idea.claim) : idea.claim}</strong>
                <PlainTalk id={idea.id} />
                {easy ? null : <p>{idea.reason}</p>}
              </button>
              <DigDeeper id={idea.id} surface="profile" compact />
            </article>
          ))
        )}
      </TreeFold>

      <TreeFold
        label="Places"
        lead="Lots that remember you."
        count={inv.places.length}
      >
        {inv.places.map((place) => (
          <article key={place.id} className="profile-unlock">
            <button
              type="button"
              className="profile-unlock-hit"
              onClick={() => onNavigate(openPlaceView(place.id))}
            >
              <p className="eyebrow">
                {easy
                  ? place.stage === 'scaffold'
                    ? 'Wood up'
                    : place.stage === 'empty'
                      ? 'Empty lot'
                      : place.stage === 'lit'
                        ? 'Lamps on'
                        : 'House up'
                  : place.stage}
              </p>
              <strong>
                {easy && place.id === 'journal' ? 'River’s pages' : place.title}
              </strong>
              <p>
                {easy && place.id === 'bench'
                  ? 'Silas copies names on the square. Public names, not stories.'
                  : place.blurb}
              </p>
            </button>
          </article>
        ))}
      </TreeFold>

      <TreeFold
        label="People"
        lead="Who walks with you."
        count={inv.people.length}
      >
        {inv.people.length === 0 ? (
          <p className="quiet">Juniper waits on the east porch.</p>
        ) : (
          inv.people.map((person) => (
            <article key={person.id} className="profile-unlock">
              <button
                type="button"
                className="profile-unlock-hit is-person"
                onClick={() => onNavigate(openPlaceView(person.plotId))}
              >
                <Avatar who={person.id} size="sm" />
                <span>
                  <strong>{person.name}</strong>
                  <p>
                    {person.role} · {person.placeTitle}
                  </p>
                </span>
              </button>
            </article>
          ))
        )}
      </TreeFold>

      <TreeFold
        label={easy ? EASY.uses : 'Tools'}
        lead={easy ? `${EASY.nightSoon} — tools wait here.` : 'What you can deploy on Night Watch.'}
        count={inv.tools.length}
      >
        {inv.tools.map((tool) => (
          <article
            key={tool.id}
            className={`profile-unlock ${tool.unlocked ? '' : 'is-dim'}`}
          >
            {tool.unlocked ? (
              easy ? (
                <p className="profile-unlock-hit is-tool">
                  <AbilityMark ability={tool.id} size="sm" />
                  <span>
                    <strong>
                      {tool.label} {tool.tierMark}
                    </strong>
                    <p>{EASY.nightSoon}</p>
                  </span>
                </p>
              ) : (
              <button
                type="button"
                className="profile-unlock-hit is-tool"
                onClick={() => onNavigate({ name: 'defend' })}
              >
                <AbilityMark ability={tool.id} size="sm" />
                <span>
                  <strong>
                    {tool.label} {tool.tierMark}
                  </strong>
                  <p>Night Watch · Learn → Hold → Deploy</p>
                </span>
              </button>
              )
            ) : (
              <p className="profile-unlock-hit is-tool is-locked">
                <AbilityMark ability={tool.id} size="sm" />
                <span>
                  <strong>{tool.label}</strong>
                  <em>
                    {easy
                      ? 'Still closed — keep a main idea that opens it.'
                      : 'Still locked — hold a line that opens it.'}
                  </em>
                </span>
              </p>
            )}
          </article>
        ))}
      </TreeFold>

      <TreeFold
        label={easy ? EASY.connections : 'Connections'}
        lead={easy ? 'Places you matched.' : 'Idea · place · person — lit nodes reopen here.'}
        count={inv.streetLinked ? inv.links.length : 0}
      >
        {inv.streetLinked ? (
          inv.links.map((link) => (
            <article key={link.id} className="profile-unlock">
              <button
                type="button"
                className="profile-unlock-hit"
                onClick={() =>
                  onNavigate(
                    link.evidenceId
                      ? openIdeaView(progress, link.evidenceId)
                      : link.plotId
                        ? openPlaceView(link.plotId)
                        : { name: 'hub' },
                  )
                }
              >
                <p className="eyebrow">{link.place}</p>
                <strong>{link.idea}</strong>
                <p>{link.person}</p>
              </button>
              {link.evidenceId ? (
                <DigDeeper id={link.evidenceId} surface="profile" compact />
              ) : null}
            </article>
          ))
        ) : (
          <p className="quiet">
            {easy
              ? `${EASY.connectLink} Start from Match. Open Saved later to see what you held.`
              : 'Link the street from Town to snap idea · place · person. Lit nodes reopen here.'}
          </p>
        )}
      </TreeFold>
    </main>
  )
}

function TreeFold({
  startOpen = false,
  label,
  lead,
  count,
  children,
}: {
  startOpen?: boolean
  label: string
  lead?: string
  count?: number
  children: ReactNode
}) {
  return (
    <SavedTree startOpen={startOpen} className="profile-section">
      <SavedTreeSummary label={label} count={count} />
      {lead ? <p className="quiet saved-tree-lead">{lead}</p> : null}
      {children}
    </SavedTree>
  )
}
