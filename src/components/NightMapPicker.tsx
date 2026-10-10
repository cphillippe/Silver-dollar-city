import { NIGHT_MAP_BADGE, NIGHT_MAP_IDS, type NightMapId } from '../nightWatch/maps/chain'

interface NightMapPickerProps {
  mapId: NightMapId
  /** True when this map can be started. A2 is always open. */
  isOpen: (id: NightMapId) => boolean
  onPick: (id: NightMapId) => void
}

function Lock() {
  return (
    <svg className="nw-map-lock" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor" />
      <path d="M5 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

/** Every Easy map, on the plant step. Locked maps wait for a round 10 boss. */
export function NightMapPicker({ mapId, isOpen, onPick }: NightMapPickerProps) {
  return (
    <div className="nw-map-pick" role="group" aria-label="Night map" data-map-pick="yes">
      <p className="nw-map-rule">Beat round 10 to unlock</p>
      <div className="nw-map-pick-scroll">
        {NIGHT_MAP_IDS.map((id) => {
          const open = isOpen(id)
          const badge = NIGHT_MAP_BADGE[id]
          return (
            <button
              key={id}
              type="button"
              className={mapId === id ? 'is-on' : ''}
              data-map={id}
              data-map-locked={open ? 'no' : 'yes'}
              aria-pressed={mapId === id}
              aria-label={open ? badge : `${badge}, locked`}
              disabled={!open}
              onClick={() => {
                if (open) onPick(id)
              }}
            >
              {badge}
              {open ? null : <Lock />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
