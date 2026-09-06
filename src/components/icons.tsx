type IconProps = {
  name: string
  className?: string
}

export function AreaIcon({ name, className }: IconProps) {
  const common = {
    viewBox: '0 0 48 48',
    className,
    'aria-hidden': true as const,
  }

  switch (name) {
    case 'oak':
      return (
        <svg {...common}>
          <path
            d="M24 42V22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M24 24c-7-1-11-6-11-12 0-2 4 1 6 3 1-5 4-9 5-9s4 4 5 9c2-2 6-5 6-3 0 6-4 11-11 12Z"
            fill="currentColor"
            opacity="0.9"
          />
        </svg>
      )
    case 'scroll':
      return (
        <svg {...common}>
          <path
            d="M12 14c0-3 3-5 6-5h16v26c0 2.4-2 4-4.4 4H16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
          />
          <path
            d="M12 14v20c0 2.5 2.2 4 5 4h3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
          />
          <path
            d="M20 16h10M20 22h10M20 28h7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'star':
      return (
        <svg {...common}>
          <circle
            cx="24"
            cy="24"
            r="6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M24 6v6M24 36v6M6 24h6M36 24h6M11 11l4 4M33 33l4 4M11 37l4-4M33 15l4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'gate':
      return (
        <svg {...common}>
          <path
            d="M10 40V20c0-8 6.2-14 14-14s14 6 14 14v20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
          />
          <path
            d="M10 40h28M18 40V24a6 6 0 0 1 12 0v16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
          />
          <circle cx="24" cy="27" r="1.6" fill="currentColor" />
        </svg>
      )
    case 'peak':
      return (
        <svg {...common}>
          <path
            d="M6 38h36L29 14l-5 8-6-12L6 38Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <path
            d="M20 26l4 6 7-10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <circle
            cx="24"
            cy="24"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
          />
        </svg>
      )
  }
}

export function kindLabel(kind: string): string {
  switch (kind) {
    case 'multiple-choice':
      return 'Choose & learn'
    case 'sequence':
      return 'Put in order'
    case 'build-argument':
      return 'Build the argument'
    case 'match':
      return 'Match the claims'
    case 'scenario':
      return 'Scenario'
    default:
      return kind
  }
}
