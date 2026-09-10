import { useMemo, useState } from 'react'
import type { LinkChallenge, LinkKind, LinkNode } from '../../types'
import { plainFor } from '../../content/plain'
import { isEasy } from '../../lib/easy'
import { shuffle } from '../../lib/shuffle'
import { useProgress } from '../../store/progress'
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

type WizardStep = 'idea' | 'place' | 'person' | 'linked'

function pairKey(a: string, b: string) {
  return a < b ? `${a}:${b}` : `${b}:${a}`
}

function faceOf(node: LinkNode, easy: boolean) {
  if (!easy || node.kind !== 'idea' || !node.evidenceId) return node.text
  return plainFor(node.evidenceId)?.gloss ?? node.text
}

function stepLabel(step: Exclude<WizardStep, 'linked'>, easy: boolean) {
  if (step === 'idea') return easy ? 'Sentence' : 'Idea'
  if (step === 'place') return 'Place'
  return 'Person'
}

export function LinkPlay({ challenge, onMiss, onSolved, onPeek }: LinkPlayProps) {
  const { progress } = useProgress()
  const easy = isEasy(progress)
  const [edges, setEdges] = useState<Edge[]>([])
  const [step, setStep] = useState<WizardStep>('idea')
  const [flash, setFlash] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'wrong' | 'ok'>('idle')
  const [shake, setShake] = useState(false)
  const [misses, setMisses] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)

  function needed(tripleId: string) {
    const triple = challenge.triples.find((item) => item.id === tripleId)
    if (!triple) return []
    return [
      pairKey(triple.ideaId, triple.placeId),
      pairKey(triple.placeId, triple.personId),
    ]
  }

  const currentTriple = challenge.triples.find((item) => {
    const have = new Set(
      edges
        .filter((edge) => edge.triple === item.id)
        .map((edge) => pairKey(edge.a, edge.b)),
    )
    return !needed(item.id).every((need) => have.has(need))
  })
  const focusIds =
    currentTriple
      ? new Set([currentTriple.ideaId, currentTriple.placeId, currentTriple.personId])
      : null

  const marks = {
    idea: Boolean(currentTriple && edges.some((edge) => edge.triple === currentTriple.id && (edge.a === currentTriple.ideaId || edge.b === currentTriple.ideaId))) || step === 'place' || step === 'person' || step === 'linked',
    place: Boolean(currentTriple && edges.some((edge) => edge.triple === currentTriple.id && pairKey(edge.a, edge.b) === pairKey(currentTriple.ideaId, currentTriple.placeId))) || step === 'person' || step === 'linked',
    person: step === 'linked' || Boolean(currentTriple && needed(currentTriple.id).every((need) => edges.some((edge) => edge.triple === currentTriple.id && pairKey(edge.a, edge.b) === need))),
  }

  const stepOptions = useMemo(() => {
    if (!currentTriple || step === 'linked') return []
    const kind = step as LinkKind
    const want =
      step === 'idea'
        ? currentTriple.ideaId
        : step === 'place'
          ? currentTriple.placeId
          : currentTriple.personId
    const pool = challenge.nodes.filter((node) => node.kind === kind)
    const hit = pool.find((node) => node.id === want)
    const decoys = shuffle(pool.filter((node) => node.id !== want))
    const take = easy ? decoys.slice(0, 1) : decoys
    return shuffle([hit, ...take].filter((node): node is LinkNode => Boolean(node)))
  }, [challenge.nodes, currentTriple?.id, step, easy])

  function recover() {
    setFlash(null)
    setShake(false)
    setStatus('idle')
    setPicked(null)
  }

  function finishTriple(triple: NonNullable<typeof currentTriple>) {
    const next = [
      ...edges,
      { a: triple.ideaId, b: triple.placeId, triple: triple.id },
      { a: triple.placeId, b: triple.personId, triple: triple.id },
    ]
    setEdges(next)
    setPicked(null)
    setFlash(triple.personId)
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
      setStep('linked')
      setStatus('ok')
      onSolved()
      return
    }
    setStep('linked')
  }

  function choose(id: string) {
    if (status === 'ok' || step === 'linked' || !currentTriple) return
    if (shake) recover()
    const want =
      step === 'idea'
        ? currentTriple.ideaId
        : step === 'place'
          ? currentTriple.placeId
          : currentTriple.personId
    if (id === want) {
      setPicked(id)
      setFlash(id)
      setStatus('idle')
      window.setTimeout(() => setFlash(null), 380)
      if (step === 'idea') setStep('place')
      else if (step === 'place') setStep('person')
      else finishTriple(currentTriple)
      return
    }
    setPicked(id)
    setFlash(id)
    setStatus('wrong')
    setShake(true)
    setMisses((count) => count + 1)
    onMiss()
  }

  function nextLink() {
    recover()
    setStep('idea')
  }

  const nextTap =
    status === 'ok'
      ? 'Link complete'
      : step === 'linked'
        ? 'This link is complete. Tap Next.'
        : easy
          ? 'Connect sentence → place → person'
          : 'Tap idea → place → person'

  const wizardCue =
    step === 'linked' || status === 'ok'
      ? null
      : step === 'idea'
        ? easy
          ? '1 of 3 — pick the sentence.'
          : '1 of 3 — pick the idea.'
        : step === 'place'
          ? '2 of 3 — pick the place.'
          : '3 of 3 — pick the person.'

  return (
    <div
      className={`play is-link is-wizard ${easy ? 'is-easy-link' : ''} ${shake ? 'is-shake' : ''} ${status === 'ok' ? 'is-win' : ''}`}
    >
      <WinBurst play={status === 'ok'} />
      <PuzzleLead challenge={challenge} />
      <PuzzleHint text={challenge.context} id={challenge.id} onPeek={onPeek} />
      <p className="next-tap">{nextTap}</p>
      {wizardCue ? <p className="quiet wizard-step">{wizardCue}</p> : null}

      <ol className="link-checks" aria-label="Link steps">
        <li className={marks.idea ? 'is-done' : step === 'idea' ? 'is-now' : ''}>
          {marks.idea ? '✓' : '1'} {easy ? 'Sentence' : 'Idea'}
        </li>
        <li className={marks.place ? 'is-done' : step === 'place' ? 'is-now' : ''}>
          {marks.place ? '✓' : '2'} Place
        </li>
        <li className={marks.person ? 'is-done' : step === 'person' ? 'is-now' : ''}>
          {marks.person ? '✓' : '3'} Person
        </li>
      </ol>

      {status === 'wrong' || misses > 0 ? (
        <p className="match-toast" role="status">
          <strong>
            {status === 'wrong'
              ? misses >= 2
                ? 'One more look.'
                : easy
                  ? 'Not that one.'
                  : 'Those don’t snap.'
              : 'Try another pick.'}
          </strong>{' '}
          {misses >= 2
            ? easy
              ? 'Same story: sentence, place, person.'
              : challenge.teachOnWrong
            : easy
              ? 'Same story: sentence, place, person.'
              : 'Same story: idea, place, person.'}
        </p>
      ) : null}

      {misses > 0 && status !== 'ok' && step !== 'linked' ? (
        <button type="button" className="btn tiny match-recover" onClick={recover}>
          Try again
        </button>
      ) : null}

      {status === 'ok' ? (
        <p className="link-complete" role="status">
          Link complete
        </p>
      ) : null}

      {step === 'linked' && status !== 'ok' ? (
        <button type="button" className="btn primary xl link-next" onClick={nextLink}>
          Next
        </button>
      ) : null}

      {step !== 'linked' && status !== 'ok' ? (
        <div className="link-grid is-wizard">
          <div className={`link-col is-${step}`}>
            <p className="match-col-label">{stepLabel(step, easy)}</p>
            {stepOptions.map((node) => (
              <button
                key={node.id}
                type="button"
                className={`link-block is-${node.kind} ${picked === node.id ? 'is-selected' : ''} ${flash === node.id ? 'is-flash' : ''} ${focusIds?.has(node.id) ? 'is-focus' : ''}`}
                onClick={() => choose(node.id)}
              >
                {node.who ? <Avatar who={node.who} size="sm" /> : null}
                <span>{faceOf(node, easy)}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <p className="match-score">
        {easy
          ? `${challenge.triples.filter((item) => needed(item.id).every((need) => edges.some((edge) => edge.triple === item.id && pairKey(edge.a, edge.b) === need))).length} of ${challenge.triples.length} links`
          : `${challenge.triples.length * 2 - edges.length} links left · ${edges.length} / ${challenge.triples.length * 2} snapped`}
      </p>
    </div>
  )
}
