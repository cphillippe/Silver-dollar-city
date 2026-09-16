import { storyCaption, type StoryPanel } from '../lib/storyPanels'
import { StoryPanelArt } from './StoryPanelArt'

interface StoryStripProps {
  kicker?: string
  panels: StoryPanel[]
  opened: number
  flipping: number | null
  complete: boolean
}

export function StoryStrip({ kicker, panels, opened, flipping, complete }: StoryStripProps) {
  const latest = opened > 0 ? panels[Math.min(opened, panels.length) - 1] : null
  const caption = complete
    ? panels[panels.length - 1]?.text ?? storyCaption(panels, opened)
    : storyCaption(panels, opened)

  return (
    <div
      className={`story-strip ${complete ? 'is-complete' : ''} ${opened === 0 ? 'is-sealed' : ''}`}
      style={{ ['--story-n' as string]: panels.length }}
    >
      {kicker ? <p className="story-kicker">{kicker}</p> : null}
      <div
        key={opened}
        className={`story-hero ${latest ? 'is-open' : ''} ${flipping !== null ? 'is-flip' : ''}`}
        aria-hidden={!latest}
      >
        <div className="story-hero-inner">
          <div className="story-hero-face is-front">
            {latest ? <StoryPanelArt scene={latest.scene} media={latest.media} size="hero" /> : null}
          </div>
          <div className="story-hero-face is-back">
            <span className="story-hero-foil">
              <span className="story-hero-foil-shine" />
              <span className="story-hero-foil-gem" />
              <span className="story-hero-foil-label">{opened === 0 ? '1' : String(opened)}</span>
            </span>
          </div>
        </div>
      </div>
      <ol className="story-thumbs" aria-label="Story panels">
        {panels.map((panel, index) => {
          const open = index < opened
          const now = index === opened - 1 || (complete && index === panels.length - 1)
          return (
            <li
              key={panel.id}
              data-beat={panel.beatId}
              className={`story-thumb ${open ? 'is-open' : ''} ${now ? 'is-now' : ''} ${flipping === index ? 'is-flip' : ''}`}
            >
              <div className="story-thumb-inner">
                <div className="story-thumb-face is-front">
                  <StoryPanelArt scene={panel.scene} media={panel.media} size="thumb" />
                </div>
                <div className="story-thumb-face is-back" aria-hidden>
                  <span className="story-thumb-seal">{index + 1}</span>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
      <p className="story-caption" role="status">
        {caption}
      </p>
    </div>
  )
}
