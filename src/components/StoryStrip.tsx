import { storyCaption, type StoryPanel } from '../lib/storyPanels'
import { StoryPanelArt } from './StoryPanelArt'

export type StoryStripMode = 'hero' | 'dock' | 'sheet'

export interface StoryStripWord {
  id: string
  label: string
  found: boolean
}

interface StoryStripProps {
  kicker?: string
  panels: StoryPanel[]
  opened: number
  flipping: number | null
  complete: boolean
  /** hero = big intro; dock = tiny in-flow top bar (not overlay); sheet = expand over the board */
  mode?: StoryStripMode
  /** Target Match words shown in the tiny dock bar */
  words?: StoryStripWord[]
  /** Bonus extras listed only inside the expand sheet (not above the board) */
  bonusWords?: StoryStripWord[]
  /** Long bonus copy — sheet only; never a first-paint banner */
  bonusHint?: string
  /** Arcade +N flash on the dock collapse */
  dockJuice?: number | null
  onDockTap?: () => void
  onSheetClose?: () => void
}

export function StoryStrip({
  kicker,
  panels,
  opened,
  flipping,
  complete,
  mode = 'hero',
  words = [],
  bonusWords = [],
  bonusHint,
  dockJuice = null,
  onDockTap,
  onSheetClose,
}: StoryStripProps) {
  const latest = opened > 0 ? panels[Math.min(opened, panels.length) - 1] : null
  const caption = complete
    ? panels[panels.length - 1]?.text ?? storyCaption(panels, opened)
    : storyCaption(panels, opened)

  const thumbs = (
    <ol className="story-thumbs" aria-label="Story panels">
      {panels.map((panel, index) => {
        const open = index < opened
        const now = index === opened - 1 || (complete && index === panels.length - 1)
        // Dock: open thumbs paint real StoryPanelArt (no 3D seal trap at tiny size).
        // Hero/sheet keep the flip card for the big unlock beat.
        if (mode === 'dock' || mode === 'sheet') {
          return (
            <li
              key={panel.id}
              data-beat={panel.beatId}
              className={`story-thumb ${open ? 'is-open' : 'is-sealed'} ${now ? 'is-now' : ''} ${flipping === index ? 'is-flip' : ''}`}
            >
              {open ? (
                <div className="story-thumb-art">
                  <StoryPanelArt scene={panel.scene} media={panel.media} size="thumb" />
                </div>
              ) : (
                <span className="story-thumb-seal" aria-hidden>
                  {index + 1}
                </span>
              )}
            </li>
          )
        }
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
  )

  const wordRow =
    words.length > 0 ? (
      <ul className="story-dock-words" aria-label="Words to find">
        {words.map((word) => (
          <li key={word.id} className={`story-dock-word ${word.found ? 'is-found' : ''}`}>
            <span className="story-dock-word-label">{word.label}</span>
          </li>
        ))}
      </ul>
    ) : null

  const bonusRow =
    bonusWords.length > 0 ? (
      <ul className="story-sheet-bonus gem-words is-bonus" aria-label="Bonus words">
        {bonusWords.map((word) => (
          <li key={word.id} className={`gem-word is-bonus ${word.found ? 'is-found' : ''}`}>
            <span className="gem-word-label">{word.label}</span>
            <span className="gem-word-kind">bonus</span>
          </li>
        ))}
      </ul>
    ) : null

  if (mode === 'dock' || mode === 'sheet') {
    return (
      <>
        <div
          role="button"
          tabIndex={0}
          className={`story-strip is-dock ${complete ? 'is-complete' : ''} ${opened === 0 ? 'is-sealed' : ''} ${dockJuice ? 'is-juice' : ''}`}
          style={{ ['--story-n' as string]: panels.length }}
          onClick={onDockTap}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onDockTap?.()
            }
          }}
          aria-expanded={mode === 'sheet'}
          aria-label="Story pictures — tap to expand"
        >
          <div className="story-dock-row">
            {thumbs}
            {wordRow}
            {bonusWords.length > 0 ? (
              <span className="story-dock-extras" aria-hidden>
                +{bonusWords.length} extras
              </span>
            ) : null}
          </div>
          {dockJuice ? (
            <span className="story-dock-juice" aria-hidden>
              +{dockJuice}
            </span>
          ) : null}
        </div>
        {mode === 'sheet' ? (
          <div
            className="story-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Story pictures"
            onClick={onSheetClose}
          >
            <div className="story-sheet-card" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                className="story-sheet-close"
                onClick={onSheetClose}
                aria-label="Close story"
              >
                Close
              </button>
              {kicker ? <p className="story-kicker">{kicker}</p> : null}
              <div className="story-sheet-grid" style={{ ['--story-n' as string]: panels.length }}>
                {panels.map((panel, index) => {
                  const open = index < opened
                  return (
                    <div
                      key={panel.id}
                      className={`story-sheet-panel ${open ? 'is-open' : 'is-sealed'}`}
                    >
                      {open ? (
                        <StoryPanelArt scene={panel.scene} media={panel.media} size="hero" />
                      ) : (
                        <span className="story-thumb-seal">{index + 1}</span>
                      )}
                    </div>
                  )
                })}
              </div>
              {wordRow}
              {bonusRow ? (
                <>
                  <p className="story-sheet-bonus-label">
                    {bonusHint ?? '+100 extras'}
                  </p>
                  {bonusRow}
                </>
              ) : null}
              <p className="story-caption" role="status">
                {caption}
              </p>
            </div>
          </div>
        ) : null}
      </>
    )
  }

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
      {thumbs}
      <p className="story-caption" role="status">
        {caption}
      </p>
    </div>
  )
}
