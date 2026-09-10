import { useMemo, useState } from 'react'
import type { LinkChallenge, LinkKind, LinkNode } from '../../types'
import { burstStyle } from '../../lib/juice'
import { shuffle } from '../../lib/shuffle'
import { Avatar } from '../Avatar'
import { PuzzleHint } from './PuzzleHint'
import { PuzzleLead } from './PuzzleLead'
import { WinBurst } from './WinBurst'

interface LinkPlayProps {
  challenge: LinkChallenge
  onMiss: () => void
  onSolved: () => void
  onPeek?: () => void
}

interface Edge {
  a: string
  b: string
  triple: string
}

const KIND_ORDER: LinkKind[] = ['idea', 'place', 'person']

function pairKey(a: string, b: string) {
  return a < b ? `${a}:${b}` : `${b}:${a}`
}

function nodeOf(nodes: LinkNode[], id: string) {
  return nodes.find((node) => node.id === id)
}

export function LinkPlay({ challenge, onMiss, onSolved, onPeek }: LinkPlayProps) {
  const columns = useMemo(() => {
    return KIND_ORDER.map((kind) => ({
      kind,
      nodes: shuffle(challenge.nodes.filter((node) => node.kind === kind)),
    }))
  }, [challenge.nodes])

  const [picked, setPicked] = useState<string | null>(null)
  const [edges, setEdges] = useState<Edge[]>([])
  const [flash, setFlash] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'wrong' | 'ok'>('idle')
  const [shake, setShake] = useState(false)
  const [misses, setMisses] = useState(0)

  function recover() {
    setFlash(null)
    setShake(false)
    setStatus('idle')
    setPicked(null)
  }

  function tripleOf(a: string, b: string) {
    return challenge.triples.find((triple) => {
      const ids = [triple.ideaId, triple.placeId, triple.personId]
      return ids.includes(a) && ids.includes(b) && a !== b
    })
  }

  function needed(tripleId: string) {
    const triple = challenge.triples.find((item) => item.id === tripleId)
    if (!triple) return []
    return [
      pairKey(triple.ideaId, triple.placeId),
      pairKey(triple.placeId, triple.personId),
    ]
  }

  function choose(id: string) {
    if (status === 'ok') return
    if (shake) recover()
    if (!picked || picked === id) {
      setPicked((current) => (current === id ? null : id))
      setStatus('idle')
      return
    }
    const left = nodeOf(challenge.nodes, picked)
    const right = nodeOf(challenge.nodes, id)
    if (!left || !right || left.kind === right.kind) {
      setPicked(id)
      return
    }
    const triple = tripleOf(picked, id)
    const key = pairKey(picked, id)
    const already = edges.some((edge) => pairKey(edge.a, edge.b) === key)
    const wanted = triple ? needed(triple.id) : []
    if (triple && wanted.includes(key) && !already) {
      const next = [...edges, { a: picked, b: id, triple: triple.id }]
      setEdges(next)
      setPicked(null)
      setFlash(id)
      window.setTimeout(() => setFlash(null), 380)
      const done = challenge.triples.every((item) => {
        const have = new Set(
          next
            .filter((edge) => edge.triple === item.id)
            .map((edge) => pairKey(edge.a, edge.b)),
        )
        return needed(item.id).every((need) => have.has(need))
      })
      if (done) {
        setStatus('ok')
        onSolved()
      }
      return
    }
    setFlash(picked)
    setStatus('wrong')
    setShake(true)
    setMisses((count) => count + 1)
    onMiss()
  }

  const locked = new Set(edges.flatMap((edge) => [edge.a, edge.b]))

  return (
    <div
      className={`play is-link ${shake ? 'is-shake' : ''} ${status === 'ok' ? 'is-win' : ''}`}
    >
      <WinBurst play={status === 'ok'} />
      <PuzzleLead challenge={challenge} />
      <PuzzleHint text={challenge.context} onPeek={onPeek} />
      <p className="sort-how">
        <strong>Tap a block</strong>, then the place or person that belongs
      </p>

      {status === 'wrong' || misses > 0 ? (
        <p className="match-toast" role="status">
          <strong>
            {status === 'wrong'
              ? misses >= 2
                ? 'One more look.'
                : 'Those don’t snap.'
              : 'Try another pair.'}
          </strong>{' '}
          {misses >= 2 ? challenge.teachOnWrong : 'Same story: idea, place, person.'}
        </p>
      ) : null}

      {misses > 0 && status !== 'ok' ? (
        <button type="button" className="btn tiny match-recover" onClick={recover}>
          Try again
        </button>
      ) : null}

      <div className="link-grid">
        {columns.map((column, colIndex) => (
          <div key={column.kind} className={`link-col is-${column.kind}`}>
            <p className="match-col-label">
              {column.kind === 'idea'
                ? 'Idea'
                : column.kind === 'place'
                  ? 'Place'
                  : 'Person'}
            </p>
            {column.nodes.map((node, index) => {
              const snapped = locked.has(node.id)
              return (
                <button
                  key={node.id}
                  type="button"
                  className={`link-block is-${node.kind} ${picked === node.id ? 'is-selected' : ''} ${snapped ? 'is-locked' : ''} ${flash === node.id ? 'is-flash' : ''}`}
                  style={status === 'ok' ? burstStyle(colIndex + index, 'mid') : undefined}
                  onClick={() => choose(node.id)}
                >
                  {node.who ? <Avatar who={node.who} size="sm" /> : null}
                  <span>{node.text}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <p className="match-score">
        {challenge.triples.length * 2 - edges.length} links left · {edges.length} /{' '}
        {challenge.triples.length * 2} snapped
      </p>
    </div>
  )
}
