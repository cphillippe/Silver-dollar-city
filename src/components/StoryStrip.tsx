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
  const caption = complete
    ? panels[panels.length - 1]?.text ?? storyCaption(panels, opened)
    : storyCaption(panels, opened)

  return (
    <div className={`story-strip ${complete ? 'is-complete' : ''}`} style={{ ['--story-n' as string]: panels.length }}>
      {kicker ? <p className="story-kicker">{kicker}</p> : null}
      <ul className="story-strip-row" aria-label="Story panels">
        {panels.map((panel, index) => {
          const open = index < opened
          const now = index === opened - 1 || (complete && index === panels.length - 1)
          return (
            <li
              key={panel.id}
              className={`story-panel ${open ? 'is-open' : ''} ${now ? 'is-now' : ''} ${flipping === index ? 'is-flip' : ''}`}
            >
              <div className="story-panel-inner">
                <div className="story-panel-face is-front">
                  <StoryPanelArt scene={panel.scene} />
                </div>
                <div className="story-panel-face is-back" aria-hidden>
                  <span className="story-panel-seal">{index + 1}</span>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      <p className="story-caption" role="status">
        {caption}
      </p>
    </div>
  )
}
