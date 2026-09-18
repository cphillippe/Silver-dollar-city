import { DEFEND_PATH, HEAVEN_POINT } from '../lib/defend'
import type { RefObject, ReactNode } from 'react'

export interface DefendNightSkyProps {
  boardRef: RefObject<SVGSVGElement | null>
  shake: boolean
  won: boolean
  phase: 'plant' | 'wave' | 'lost'
  fireBest: () => void
  easyTap: boolean
  children?: ReactNode
}

export function DefendNightSky({
  boardRef,
  shake,
  won,
  phase,
  fireBest,
  easyTap,
  children,
}: DefendNightSkyProps) {
  return (
            <svg
              ref={boardRef}
              className={`defend-board ${shake ? 'is-shake' : ''} ${won ? 'is-clear' : ''}`}
              viewBox="0 0 640 420"
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="Night road through Silver City"
              onClick={() => {
                if (phase === 'wave') fireBest()
              }}
            >
              <defs>
                <linearGradient id="defend-dusk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--city-sky-0)" />
                  <stop offset="22%" stopColor="var(--city-sky-1)" />
                  <stop offset="52%" stopColor="var(--city-sky-2)" />
                  <stop offset="100%" stopColor="var(--city-sky-3)" />
                </linearGradient>
                <linearGradient id="defend-ridge" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--city-ridge-0)" />
                  <stop offset="100%" stopColor="var(--city-ridge-1)" />
                </linearGradient>
                <linearGradient id="defend-wood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffd24a" />
                  <stop offset="100%" stopColor="#ff9f1a" />
                </linearGradient>
                <linearGradient id="defend-gold-roof" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fff6b8" />
                  <stop offset="100%" stopColor="#ff9f1a" />
                </linearGradient>
                <radialGradient id="defend-moon-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fff6d4" stopOpacity="1" />
                  <stop offset="55%" stopColor="#ffcc33" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ff5a7a" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="defend-pool" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffcc33" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#ff5a7a" stopOpacity="0" />
                </radialGradient>
                <clipPath id="defend-face-clip" clipPathUnits="objectBoundingBox">
                  <circle cx="0.5" cy="0.5" r="0.36" />
                </clipPath>
                <filter id="defend-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <rect width="640" height="420" fill="url(#defend-dusk)" />
              <ellipse cx="320" cy="198" rx="280" ry="28" fill="#ffcc33" opacity="0.28" />
              <circle cx="548" cy="48" r="32" fill="url(#defend-moon-glow)" />
              <circle cx="548" cy="48" r="9" fill="#fff6d8" />
              <g className="defend-stars">
                <circle cx="72" cy="42" r="1.6" />
                <circle cx="118" cy="28" r="1.2" />
                <circle cx="510" cy="36" r="1.5" />
                <circle cx="430" cy="22" r="1.3" />
                <circle cx="300" cy="34" r="1.1" />
                <circle cx="196" cy="50" r="1.1" />
                <circle cx="248" cy="20" r="0.9" />
                <circle cx="390" cy="54" r="1.2" />
                <circle cx="88" cy="68" r="0.8" />
              </g>
              <path
                className="defend-ridge"
                d="M-20 210 L80 120 160 168 250 96 340 150 430 78 520 130 660 70 V230 H-20 Z"
                fill="url(#defend-ridge)"
                opacity="0.92"
              />
              <path d="M-20 248 L40 200 120 228 210 176 300 214 410 168 500 206 660 150 V430 H-20 Z" fill="#3dcc7a" opacity="0.55" />
              <g className="defend-windows">
                <circle cx="156" cy="214" r="1.8" />
                <circle cx="248" cy="198" r="1.5" />
                <circle cx="364" cy="188" r="1.6" />
                <circle cx="476" cy="196" r="1.4" />
              </g>
              <ellipse className="defend-canopy" cx="96" cy="268" rx="28" ry="16" />
              <ellipse className="defend-canopy" cx="214" cy="252" rx="22" ry="13" />
              <ellipse className="defend-canopy" cx="402" cy="246" rx="24" ry="14" />
              <ellipse className="defend-canopy" cx="528" cy="258" rx="20" ry="12" />
              <path
                className="defend-road-bed"
                d="M70 310 C 140 300, 200 280, 280 292 C 360 304, 430 286, 560 300"
              />
              <path
                className="defend-road"
                d="M70 310 C 140 300, 200 280, 280 292 C 360 304, 430 286, 560 300"
              />
              <path
                className="defend-road-shine"
                d="M70 310 C 140 300, 200 280, 280 292 C 360 304, 430 286, 560 300"
              />
              <path
                className="defend-heaven-path"
                d="M280 292 C 400 210, 500 90, 572 36"
              />
              <g className="defend-heaven" transform={`translate(${HEAVEN_POINT.x} ${HEAVEN_POINT.y})`}>
                <circle className="defend-heaven-glow" r="36" />
                <path className="defend-heaven-wall" d="M-28 14 l12-16 10 8 8-12 10 8 10-10 10 14 v16 H-28 Z" />
                <path className="defend-heaven-gate" d="M-6 22 v-12 a6 8 0 0 1 12 0 v12" />
                <text className="defend-heaven-label" y="-22" textAnchor="middle">
                  City of Heaven
                </text>
              </g>
              <path d="M-10 368 Q 180 340 320 358 T 660 372 V430 H-10 Z" fill="#148a48" />
              <g className="defend-porch" transform="translate(564 292)">
                <path d="M-20 22 h40 l5 7 H-25 Z" />
                <rect x="-16" y="-4" width="32" height="26" rx="2" />
                <rect className="defend-porch-window" x="-5" y="4" width="10" height="9" rx="1" />
              </g>
              {easyTap ? null : (
              <g className="defend-gate" transform={`translate(${DEFEND_PATH[0].x} ${DEFEND_PATH[0].y})`}>
                <path d="M-10 6 V-16 M10 6 V-16" />
                <path d="M-12 -16 H12" />
              </g>
              )}
{children}
            </svg>
  )
}
