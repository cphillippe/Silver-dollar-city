import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import stillArt from '../assets/skills/still.svg'
import mendArt from '../assets/skills/mend.svg'
import { KIT_LABEL, type KitId } from '../lib/nightKits'
import { SKILL_BLURB } from '../lib/nightSkills'

const SKILL_ART: Record<KitId, string> = {
  still: stillArt,
  mend: mendArt,
}

export function NightSkillSplash({ id, onDismiss }: { id: KitId; onDismiss: () => void }) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const label = KIT_LABEL[id]

  useEffect(() => {
    buttonRef.current?.focus()
  }, [id])

  return createPortal(
    <div className="nw-skill-splash" role="dialog" aria-labelledby="nw-skill-splash-title">
      <div className="nw-skill-card">
        <img className="nw-skill-splash-art" src={SKILL_ART[id]} alt="" width={112} height={112} />
        <p className="nw-skill-kicker">New skill</p>
        <h2 id="nw-skill-splash-title">{label}</h2>
        <p className="nw-skill-blurb">{SKILL_BLURB[id]}</p>
        <button
          ref={buttonRef}
          type="button"
          className="btn primary"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onDismiss()
          }}
        >
          Got it
        </button>
      </div>
    </div>,
    document.body,
  )
}
