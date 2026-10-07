import porchCandy from '../../assets/defend/nw-porch-candy.svg'
import { NIGHT_MAP, type NightMapSurface } from './surface.ts'

/** Plate slot inside the board SVG. Renders nothing until a plate is set. */
export function MapPlate({ map = NIGHT_MAP }: { map?: NightMapSurface }) {
  if (!map.plate) return null
  return (
    <g className="defend-map-plate-wrap">
      <image
        className="defend-map-plate"
        href={map.plate}
        x={0}
        y={0}
        width={map.width}
        height={map.height}
        preserveAspectRatio="xMidYMid meet"
      />
      {/* 1.4.382: thick candy porch→road art, same camera as the plate. */}
      <image
        className="defend-porch-candy"
        href={porchCandy}
        x={0}
        y={0}
        width={map.width}
        height={map.height}
        preserveAspectRatio="xMidYMid meet"
        pointerEvents="none"
      />
    </g>
  )
}
