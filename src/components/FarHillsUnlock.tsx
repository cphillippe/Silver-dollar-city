import { FAR_HILLS_HEADER, FAR_HILLS_NAME, FAR_HILLS_SOON } from '../nightWatch/farHills'

interface FarHillsUnlockProps {
  held: string
  home: string
  onHome: () => void
}

/** Easy round-25 clear. The hills are a teaser — the walk there is not built yet. */
export function FarHillsUnlock({ held, home, onHome }: FarHillsUnlockProps) {
  return (
    <section className="nw-far-hills" aria-label={FAR_HILLS_HEADER} data-far-hills="yes">
      <h1 className="nw-far-hills-title">{FAR_HILLS_HEADER}</h1>
      <p className="nw-far-hills-held">{held}</p>
      <article className="nw-far-hills-card" data-area-unlocked="yes">
        <svg className="nw-far-hills-art" viewBox="0 0 160 72" aria-hidden="true">
          <rect width="160" height="72" rx="12" fill="#241048" />
          <circle cx="122" cy="18" r="7" fill="#ffe9b0" />
          <path
            fill="#3a1868"
            d="M0 72V46l22-16 18 12 26-24 22 16 16-10 20 14 36-20v54H0z"
          />
          <path fill="#12082c" d="M0 72V54l28-8 24 10 30-14 22 12 28-16 28 18v16H0z" />
        </svg>
        <div className="nw-far-hills-copy">
          <p className="nw-far-hills-name">{FAR_HILLS_NAME}</p>
          <p className="nw-far-hills-tags">
            <span className="nw-area-badge">Unlocked</span>
            <span className="nw-far-hills-soon">{FAR_HILLS_SOON}</span>
          </p>
        </div>
      </article>
      <button type="button" className="btn primary xl nw-far-hills-home" onClick={onHome}>
        {home}
      </button>
    </section>
  )
}
