import { NIGHT_MAP, type NightMapSurface } from './surface.ts'

/** Plate slot inside the board SVG. Renders nothing until a plate is set. */
export function MapPlate({ map = NIGHT_MAP }: { map?: NightMapSurface }) {
  if (!map.plate) return null
  return (
    <image
      className="defend-map-plate"
      href={map.plate}
      x={0}
      y={0}
      width={map.width}
      height={map.height}
      preserveAspectRatio="xMidYMid meet"
    />
  )
}
