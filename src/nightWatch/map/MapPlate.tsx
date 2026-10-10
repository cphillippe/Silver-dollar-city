import porchArt from '../../assets/defend/nw-porch-candy.svg'
import { NIGHT_MAP, type NightMapSurface } from './surface.ts'

/** Plate slot inside the board SVG. Renders nothing until a plate is set. */
export function MapPlate({
  map = NIGHT_MAP,
  porchCandy = true,
}: {
  map?: NightMapSurface
  /** A2 paints the porch icing on top of the plate. Other maps leave it off. */
  porchCandy?: boolean
}) {
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
      {porchCandy ? (
        <image
          className="defend-porch-candy"
          href={porchArt}
          x={0}
          y={0}
          width={map.width}
          height={map.height}
          preserveAspectRatio="xMidYMid meet"
          pointerEvents="none"
        />
      ) : null}
    </g>
  )
}
