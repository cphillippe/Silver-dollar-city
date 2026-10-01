import { GemMark } from '../../components/GemMark'

/** Left chrome orb. Decorative read of an existing count — no spend loop. */
export function MoneyBalloon({ count, label }: { count: number; label: string }) {
  return (
    <span className="nw-balloon" role="img" aria-label={`${label}: ${count}`}>
      <span className="nw-balloon-orb" aria-hidden>
        ★
      </span>
      <span className="nw-balloon-count" aria-hidden>
        {count}
      </span>
      <span className="nw-balloon-label" aria-hidden>
        {label}
      </span>
    </span>
  )
}

/** Top-right coin chip. Decorative read of an existing count — no spend loop. */
export function CoinRead({ count, label }: { count: number; label: string }) {
  return (
    <span className="nw-coin" role="img" aria-label={`${label}: ${count}`}>
      <GemMark gem="coin" size="sm" />
      <span className="nw-coin-count" aria-hidden>
        {count}
      </span>
    </span>
  )
}
