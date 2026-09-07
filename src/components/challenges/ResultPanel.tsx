import type { ReactNode } from 'react'

interface ResultPanelProps {
  tone: 'ok' | 'teach' | 'idle'
  title: string
  body?: string
  deeper?: string
  kicker?: string
  children?: ReactNode
}

export function ResultPanel({
  tone,
  title,
  body,
  kicker,
  children,
}: ResultPanelProps) {
  if (tone === 'idle') return null

  return (
    <div className={`result result-${tone}`} role="status">
      <p className="result-kicker">
        {kicker ?? (tone === 'ok' ? 'Well reasoned' : 'Not yet')}
      </p>
      <h3>{title}</h3>
      {body ? <p>{body}</p> : null}
      {children}
    </div>
  )
}
