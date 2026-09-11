import { useEffect, useMemo, useState } from 'react'
import type { LinkChallenge, LinkKind, LinkNode } from '../../types'
import { linkCaption, linkClue, linkMiss, linkPicture } from '../../content/links'
import { EASY, isEasy } from '../../lib/easy'
import { shuffle } from '../../lib/shuffle'
import { useProgress } from '../../store/progress'
import { Avatar } from '../Avatar'
import { PlaceGlyph } from '../Landmark'
import { PuzzleHint } from './PuzzleHint'
import { PuzzleLead } from './PuzzleLead'

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

function LinkFace({
  node,
  easy,
  challenge,
}: {
  node: LinkNode
  easy: boolean
  challenge: LinkChallenge
}) {
  const pic = linkPicture(node, challenge)
  const picture = Boolean(pic.who || pic.plotId)
  return (
    <>
      {pic.who ? <Avatar who={pic.who} size="xl" /> : null}
      {pic.plotId ? <PlaceGlyph plotId={pic.plotId} /> : null}
      <span className={picture ? 'link-label' : undefined}>{linkCaption(node, easy)}</span>
    </>
  )
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
  const [streetDone, setStreetDone] = useState(false)

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

  function finishStreet() {
    if (streetDone) return
    setStreetDone(true)
    onSolved()
  }

  function nextLink() {
    recover()
    setStep('idea')
  }

  const nextTap =
    status === 'ok'
      ? easy
        ? 'All 3 matches complete'
        : 'All 3 links complete'
      : step === 'linked'
        ? easy
          ? 'This match is complete. Tap Next.'
          : 'This link is complete. Tap Next.'
        : easy
          ? EASY.connectLink
          : 'Tap idea → place → person'

  const missStep = step === 'linked' ? 'idea' : step
  const needId = currentTriple
    ? missStep === 'idea'
      ? currentTriple.ideaId
      : missStep === 'place'
        ? currentTriple.placeId
        : currentTriple.personId
    : null
  const missNeed =
    easy && currentTriple
      ? linkMiss(currentTriple.id, missStep)
      : step === 'place'
        ? 'Wrong lot. Snap the idea to the place that keeps it.'
        : step === 'person'
          ? 'Wrong keeper. The person who lives on that lot is the match.'
          : 'Wrong idea. Pick the claim, then its place, then its person.'

  const wizardCue =
    step === 'linked' || status === 'ok'
      ? null
      : easy
        ? EASY.linkCue
        : step === 'idea'
          ? '1 of 3 — pick the idea.'
          : step === 'place'
            ? '2 of 3 — pick the place.'
            : '3 of 3 — pick the person.'

  useEffect(() => {
    if (!easy || misses === 0 || !needId) return
    const card = document.querySelector('.link-block.is-need')
    if (card instanceof HTMLElement) {
      card.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [easy, misses, needId, step])

  if (status === 'ok') {
    return (
      <div className="play is-link is-wizard is-finale">
        <p className="link-complete" role="status">
          {easy ? 'All 3 matches complete' : 'All 3 links complete'}
        </p>
        <ol className="link-checks" aria-label={easy ? 'All matches' : 'All links'}>
          <li className="is-done">✓ {easy ? 'Sentence' : 'Idea'}</li>
          <li className="is-done">✓ Place</li>
          <li className="is-done">✓ Person</li>
        </ol>
        <div className="link-dock">
          <button type="button" className="btn gold xl link-next" onClick={finishStreet}>
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`play is-link is-wizard ${easy ? 'is-easy-link' : ''} ${shake ? 'is-shake' : ''}`}
    >
      {easy ? null : <PuzzleLead challenge={challenge} />}
      {easy ? null : <PuzzleHint text={challenge.context} id={challenge.id} onPeek={onPeek} />}
      {easy ? null : <p className="next-tap">{nextTap}</p>}
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
          {missNeed}
        </p>
      ) : null}

      {misses > 0 && step !== 'linked' ? (
        <button type="button" className="btn tiny match-recover" onClick={recover}>
          Try again
        </button>
      ) : null}

      <p className="match-score">
        {easy
          ? `${challenge.triples.filter((item) => needed(item.id).every((need) => edges.some((edge) => edge.triple === item.id && pairKey(edge.a, edge.b) === need))).length} of ${challenge.triples.length} matches`
          : `${challenge.triples.length * 2 - edges.length} links left · ${edges.length} / ${challenge.triples.length * 2} snapped`}
      </p>

      {step === 'linked' ? (
        <div className="link-dock">
          <button type="button" className="btn primary xl link-next" onClick={nextLink}>
            Next
          </button>
        </div>
      ) : (
        <div className="link-grid is-wizard">
          <div className={`link-col is-${step}`}>
            {easy && currentTriple ? (
              <p className="link-clue">{linkClue(currentTriple.id, step)}</p>
            ) : null}
            <p className="match-col-label">{stepLabel(step, easy)}</p>
            {stepOptions.map((node) => {
              const pic = linkPicture(node, challenge)
              return (
              <button
                key={node.id}
                type="button"
                className={`link-block is-${node.kind} ${pic.who || pic.plotId ? 'is-picture' : ''} ${picked === node.id ? 'is-selected' : ''} ${flash === node.id ? 'is-flash' : ''} ${focusIds?.has(node.id) ? 'is-focus' : ''} ${easy && misses > 0 && node.id === needId ? 'is-need' : ''} ${easy && misses > 0 && node.id !== needId ? 'is-not' : ''}`}
                onClick={() => choose(node.id)}
              >
                {easy && misses > 0 && node.id === needId ? (
                  <span className="need-chip">This one</span>
                ) : null}
                <LinkFace node={node} easy={easy} challenge={challenge} />
              </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
