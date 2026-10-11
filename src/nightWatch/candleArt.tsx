/**
 * Flat candy candle stand (1.4.445).
 * No backdrop, so the SVG alpha is the flame and the stand only.
 * Warm gold flame, smaller than the pillar lamp sprite.
 */
export function CandleSprite({ hot = false }: { hot?: boolean }) {
  const flame = hot ? 1.12 : 1
  return (
    <g className={`defend-candle${hot ? ' is-hot' : ''}`} aria-hidden="true">
      <ellipse cx="0" cy="6" rx="16" ry="5.5" fill="#a86818" />
      <rect x="-14" y="-1" width="28" height="9" rx="4" fill="#e09412" />
      <rect x="-12" y="-4" width="24" height="6" rx="3" fill="#ffcc33" />
      <rect x="-10" y="-6" width="20" height="4" rx="2" fill="#ffe9a0" />
      <rect x="-3.5" y="-30" width="7" height="28" rx="2" fill="#fff6e4" />
      <rect x="-3.5" y="-30" width="2.4" height="28" rx="1" fill="#ffe0b0" />
      <rect x="-0.55" y="-34" width="1.1" height="5" fill="#3a2414" />
      <g transform={`translate(0 -40) scale(${flame}) translate(0 40)`}>
        <ellipse cx="0" cy="-42" rx="4.6" ry="8" fill="#ff9f1a" />
        <ellipse cx="0" cy="-40" rx="2.5" ry="4.6" fill="#ffd36a" />
        <ellipse cx="0" cy="-38.5" rx="1.15" ry="2.1" fill="#fff4c4" />
      </g>
    </g>
  )
}
