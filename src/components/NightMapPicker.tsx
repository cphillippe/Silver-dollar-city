import type { NightMapId } from '../nightWatch/maps/resolve'

interface NightMapPickerProps {
  mapId: NightMapId
  /** Far Hills can be chosen. Locked until an Easy round 25, unless this is a playtest. */
  hillsOpen: boolean
  onPick: (id: NightMapId) => void
}

/** A2 or the Far Hills, on the plant step, so a night can start on either map. */
export function NightMapPicker({ mapId, hillsOpen, onPick }: NightMapPickerProps) {
  return (
    <div className="nw-map-pick" role="group" aria-label="Night map" data-map-pick="yes">
      <button
        type="button"
        className={mapId === 'a2' ? 'is-on' : ''}
        data-map="a2"
        aria-pressed={mapId === 'a2'}
        onClick={() => onPick('a2')}
      >
        A2
      </button>
      <button
        type="button"
        className={mapId === 'far-hills' ? 'is-on' : ''}
        data-map="far-hills"
        data-map-locked={hillsOpen ? 'no' : 'yes'}
        aria-pressed={mapId === 'far-hills'}
        aria-label={hillsOpen ? 'Far Hills' : 'Far Hills, locked'}
        disabled={!hillsOpen}
        onClick={() => {
          if (hillsOpen) onPick('far-hills')
        }}
      >
        Far Hills
        {hillsOpen ? null : (
          <svg className="nw-map-lock" viewBox="0 0 16 16" aria-hidden="true">
            <rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor" />
            <path
              d="M5 7V5a3 3 0 0 1 6 0v2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
          </svg>
        )}
      </button>
    </div>
  )
}
