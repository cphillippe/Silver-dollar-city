import type { ReactNode } from 'react'

interface ResultPanelProps {
  tone: 'ok' | 'teach' | 'idle'
  title: string
  body?: string
  deeper?: string
  children?: ReactNode
}

export function ResultPanel({
  tone,
  title,
  body,
  deeper,
  children,
}: ResultPanelProps) {
  if (tone === 'idle') return null

  return (
    <div className={`result result-${tone}`} role="status">
      <p className="result-kicker">{tone === 'ok' ? 'Well reasoned' : 'Think again'}</p>
      <h3>{title}</h3>
      {body ? <p>{body}</p> : null}
      {tone === 'ok' && deeper ? <p className="result-deeper">{deeper}</p> : null}
      {children}
    </div>
  )
}
