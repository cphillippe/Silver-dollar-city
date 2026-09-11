import { EASY, easyFacingLine, isEasy } from '../lib/easy'
import { RECALL_SESSION_CAP } from '../lib/recall'
import { useProgress } from '../store/progress'

export interface RecallOfferItem {
  id: string
  title: string
}

interface RecallOfferProps {
  items: RecallOfferItem[]
  onOpen: (id: string) => void
  onLater: () => void
  onNotToday: () => void
}

/** Optional dust-off — never pinned as the only next step. */
export function RecallOffer({ items, onOpen, onLater, onNotToday }: RecallOfferProps) {
  const { progress } = useProgress()
  const easy = isEasy(progress)
  if (items.length === 0) return null
  const first = items[0]
  const extra = items.length - 1

  return (
    <section className="recall-offer" aria-label="A held line is ready">
      <p className="eyebrow">{easy ? 'A sentence you kept' : 'A held line is ready'}</p>
      <h2>{easy ? easyFacingLine(first.id, first.title) : first.title}</h2>
      <p className="quiet">
        {easy
          ? `Up to ${RECALL_SESSION_CAP} this sitting — not every page.`
          : `A short sitting — about ${RECALL_SESSION_CAP}, not the whole journal.`}
        {extra > 0 ? ` · ${items.length} ready now.` : ''}
      </p>
      <button type="button" className="btn primary" onClick={() => onOpen(first.id)}>
        {easy ? EASY.rememberSentence : 'Dust this off'}
      </button>
      <div className="recall-skip">
        <button type="button" className="text-link" onClick={onLater}>
          Later
        </button>
        <button type="button" className="text-link" onClick={onNotToday}>
          Not today
        </button>
      </div>
      {easy ? null : (
      <p className="quiet">
        Later leaves them for this walk. Not today puts them off until morning. No guilt.
      </p>
      )}
    </section>
  )
}
