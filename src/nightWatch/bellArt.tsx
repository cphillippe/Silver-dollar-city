/**
 * Flat candy church bell (1.4.467).
 * Warm gold only. No flash, no beam, no strike.
 */
export function BellSprite() {
  return (
    <g className="defend-bell" aria-hidden="true">
      <path d="M-12 -34 H12" stroke="#e09412" strokeWidth="3" strokeLinecap="round" />
      <rect x="-2.2" y="-34" width="4.4" height="8" rx="1.2" fill="#ffd36a" />
      <path
        d="M-18 -6 C-18 -28 -10 -32 0 -32 C10 -32 18 -28 18 -6 Z"
        fill="#ffcc33"
        stroke="#e09412"
        strokeWidth="2"
      />
      <path d="M-14 -14 C-8 -22 8 -22 14 -14" fill="none" stroke="#ffe9a0" strokeWidth="2" />
      <ellipse cx="0" cy="-4" rx="18" ry="5.5" fill="#ffe08a" />
      <rect x="-1.1" y="-20" width="2.2" height="14" rx="1" fill="#a86818" />
      <circle cx="0" cy="2" r="3.4" fill="#fff6e4" stroke="#e09412" strokeWidth="1" />
    </g>
  )
}
