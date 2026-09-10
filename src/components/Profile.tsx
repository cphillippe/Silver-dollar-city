import { CAST } from '../content/story'
import { isEasy } from '../lib/easy'
import { profileInventory, openIdeaView, openPlaceView } from '../lib/profile'
import { useProgress } from '../store/progress'
import type { View } from '../types'
import { Avatar } from './Avatar'
import { AbilityMark } from './GemMark'
import { DigDeeper } from './DigDeeper'
import { PlainTalk } from './PlainTalk'

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
        ← The town
      </button>

      <header className="profile-hero">
        <Avatar who="river" size="xl" />
        <div>
          <p className="eyebrow">You · {you.shortName}</p>
          <h1>{you.name}</h1>
          <p className="quiet">
            {you.role} · {you.seeking}
          </p>
          <p className="memory-pipe">Learn {inv.learned} · Hold {inv.held} · Deploy {inv.deployed}</p>
        </div>
      </header>

      <section className="profile-section" aria-label="Held ideas">
        <p className="eyebrow">Held ideas / proofs</p>
        <h2>What you can still say</h2>
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
                  {idea.held ? 'Held' : idea.stored ? 'Stored' : 'Walked'} · {idea.source}
                </p>
                <strong>{idea.claim}</strong>
                <PlainTalk id={idea.id} />
                {easy ? null : <p>{idea.reason}</p>}
              </button>
              <DigDeeper id={idea.id} surface="profile" compact />
            </article>
          ))
        )}
      </section>

      <section className="profile-section" aria-label="Places">
        <p className="eyebrow">Places</p>
        <h2>Lots that remember you</h2>
        {inv.places.map((place) => (
          <article key={place.id} className="profile-unlock">
            <button
              type="button"
              className="profile-unlock-hit"
              onClick={() => onNavigate(openPlaceView(place.id))}
            >
              <p className="eyebrow">{place.stage}</p>
              <strong>{place.title}</strong>
              <p>{place.blurb}</p>
            </button>
          </article>
        ))}
      </section>

      <section className="profile-section" aria-label="People">
        <p className="eyebrow">People</p>
        <h2>Who walks with you</h2>
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
      </section>

      <section className="profile-section" aria-label="Tools">
        <p className="eyebrow">Tools / abilities</p>
        <h2>What you can deploy</h2>
        {inv.tools.map((tool) => (
          <article
            key={tool.id}
            className={`profile-unlock ${tool.unlocked ? '' : 'is-dim'}`}
          >
            {tool.unlocked ? (
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
            ) : (
              <p className="profile-unlock-hit is-tool is-locked">
                <AbilityMark ability={tool.id} size="sm" />
                <span>
                  <strong>{tool.label}</strong>
                  <em>Still locked — hold a line that opens it.</em>
                </span>
              </p>
            )}
          </article>
        ))}
      </section>

      <section className="profile-section" aria-label="Mind-map links">
        <p className="eyebrow">Mind-map links</p>
        <h2>Idea · place · person</h2>
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
              ? 'Link the street from Town to match idea · place · person. Lit nodes reopen in your scrapbook of links.'
              : 'Link the street from Town to snap idea · place · person. Lit nodes reopen here.'}
          </p>
        )}
      </section>
    </main>
  )
}
