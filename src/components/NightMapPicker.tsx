import { mapLockReason, NIGHT_MAP_IDS, NIGHT_MAP_NAME, type NightMapId } from '../nightWatch/maps/chain'

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

/** Every Easy map, before the night starts. Locked maps name the one before them. */
export function NightMapPicker({ mapId, isOpen, onPick }: NightMapPickerProps) {
  return (
    <div className="nw-map-pick" role="group" aria-label="Night map" data-map-pick="yes">
      <p className="nw-map-rule">Choose a map</p>
      <div className="nw-map-pick-scroll">
        {NIGHT_MAP_IDS.map((id) => {
          const open = isOpen(id)
          const name = NIGHT_MAP_NAME[id]
          const reason = open ? null : mapLockReason(id)
          return (
            <button
              key={id}
              type="button"
              className={`${mapId === id ? 'is-on' : ''}${open ? '' : ' is-locked'}`}
              data-map={id}
              data-map-locked={open ? 'no' : 'yes'}
              aria-pressed={mapId === id}
              aria-label={reason ? `${name}. ${reason}` : name}
              disabled={!open}
              onClick={() => {
                if (open) onPick(id)
              }}
            >
              <span className="nw-map-name">{name}</span>
              {reason ? (
                <>
                  <Lock />
                  <span className="nw-map-reason" data-map-reason="yes">
                    {reason}
                  </span>
                </>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
