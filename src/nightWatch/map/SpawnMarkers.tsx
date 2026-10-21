import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import spawnA2 from '../../assets/night-watch/maps/overlays/spawn_a2.png'
import spawnFarHills from '../../assets/night-watch/maps/overlays/spawn_far-hills.png'
import spawnMap03 from '../../assets/night-watch/maps/overlays/spawn_map03.png'
import spawnMap04 from '../../assets/night-watch/maps/overlays/spawn_map04.png'
import spawnMap05 from '../../assets/night-watch/maps/overlays/spawn_map05.png'
import spawnMap06 from '../../assets/night-watch/maps/overlays/spawn_map06.png'
import type { NightPhase } from '../types'
import { DEFEND_PATH } from '../path/data'
import type { NightMapId } from '../maps/chain'
import { playableNightMap } from '../maps/mazeMaps'
import {
  SPAWN_BOX_U,
  nudgeSpawnIntoView,
  resolveSpawnFit,
  slideSpawnOffHud,
  spawnMarkersFor,
  type SpawnCamera,
  type SpawnEntry,
  type SpawnFit,
  type SpawnHudRect,
} from '../maps/spawnMarkers'

const SRC: Record<string, string> = {
  'spawn_a2.png': spawnA2,
  'spawn_far-hills.png': spawnFarHills,
  'spawn_map03.png': spawnMap03,
  'spawn_map04.png': spawnMap04,
  'spawn_map05.png': spawnMap05,
  'spawn_map06.png': spawnMap06,
}

function roadEntry(mapId: NightMapId, roadId: string): SpawnEntry {
  const points =
    mapId === 'a2'
      ? DEFEND_PATH
      : playableNightMap(mapId)?.roads.find((road) => road.id === roadId)?.points
  if (!points || points.length < 2) return { x: 0, y: 0, nx: 0, ny: -1 }
  const a = points[0]
  const b = points[1]
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
  return { x: a.x, y: a.y, nx: (b.x - a.x) / len, ny: (b.y - a.y) / len }
}

function readCamera(svg: SVGSVGElement): SpawnCamera | null {
  const box = svg.getBoundingClientRect()
  const vb = svg.viewBox.baseVal
  if (!(box.width > 0) || !(box.height > 0) || !(vb.width > 0) || !(vb.height > 0)) return null
  const scale = Math.min(box.width / vb.width, box.height / vb.height)
  if (!(scale > 0)) return null
  const left = box.left + (box.width - vb.width * scale) / 2
  const top = box.top + (box.height - vb.height * scale) / 2
  return {
    vbX: vb.x,
    vbY: vb.y,
    scale,
    originX: left - vb.x * scale,
    originY: top - vb.y * scale,
  }
}

const TRAY_SELECTOR = '.nw-skill-tray, .defend-hearts'
const CHROME_SELECTOR = '.defend-abilities, .defend-new-lamp, .defend-hud, .nw-wave-count, .nw-wave-survived, .nw-skill-tray, .nw-tap-readout, .defend-pad, .defend-hearts'

function boxesFor(doc: Document, selector: string): SpawnHudRect[] {
  const rects: SpawnHudRect[] = []
  for (const node of doc.querySelectorAll(selector)) {
    const box = node.getBoundingClientRect()
    if (box.width > 1 && box.height > 1) {
      rects.push({ left: box.left, right: box.right, top: box.top, bottom: box.bottom })
    }
  }
  return rects
}

function baseFits(mapId: NightMapId): Record<string, SpawnFit> {
  const fits: Record<string, SpawnFit> = {}
  for (const row of spawnMarkersFor(mapId)) {
    fits[row.roadId] = { x: row.x, y: row.y, scale: 1, step: 'base' }
  }
  return fits
}

function sameFits(a: Record<string, SpawnFit>, b: Record<string, SpawnFit>): boolean {
  const keys = Object.keys(a)
  if (keys.length !== Object.keys(b).length) return false
  return keys.every((key) => {
    const left = a[key]
    const right = b[key]
    return right && left.x === right.x && left.y === right.y && left.scale === right.scale && left.step === right.step
  })
}

/** Candy arches where each road enters. Easy, and only on a painted plate. */
export function SpawnMarkers({ mapId, phase }: { mapId: NightMapId; phase: NightPhase }) {
  const groupRef = useRef<SVGGElement>(null)
  const rows = spawnMarkersFor(mapId)
  const [fits, setFits] = useState<Record<string, SpawnFit>>(() => baseFits(mapId))
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (phase !== 'wave') {
      setPulse(false)
      return
    }
    setPulse(true)
    const timer = window.setTimeout(() => setPulse(false), 600)
    return () => window.clearTimeout(timer)
  }, [phase])

  useLayoutEffect(() => {
    const group = groupRef.current
    const svg = group?.ownerSVGElement
    if (!svg) return
    const measure = () => {
      const camera = readCamera(svg)
      if (!camera) return
      const doc = svg.ownerDocument
      const tray = boxesFor(doc, TRAY_SELECTOR)
      const chrome = boxesFor(doc, CHROME_SELECTOR)
      const view = { width: doc.defaultView?.innerWidth ?? 0, height: doc.defaultView?.innerHeight ?? 0 }
      const next: Record<string, SpawnFit> = {}
      for (const row of spawnMarkersFor(mapId)) {
        const fit = resolveSpawnFit(row, camera, tray, roadEntry(mapId, row.roadId))
        const clear = slideSpawnOffHud(row, fit, camera, chrome)
        next[row.roadId] = nudgeSpawnIntoView(row, clear, camera, view)
      }
      setFits((prev) => (sameFits(prev, next) ? prev : next))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(svg)
    const frame = svg.closest('.defend-frame')
    if (frame instanceof Element) observer.observe(frame)
    for (const node of svg.ownerDocument.querySelectorAll(CHROME_SELECTOR)) {
      observer.observe(node)
    }
    const view = new MutationObserver(measure)
    view.observe(svg, { attributes: true, attributeFilter: ['viewBox'] })
    return () => {
      observer.disconnect()
      view.disconnect()
    }
  }, [mapId, phase])

  if (rows.length < 1) return null
  return (
    <g ref={groupRef} className="nw-spawn-markers" pointerEvents="none" aria-hidden="true">
      {rows.map((row) => {
        const fit = fits[row.roadId] ?? { x: row.x, y: row.y, scale: 1, step: 'base' as const }
        const size = SPAWN_BOX_U * fit.scale
        return (
          <image
            key={row.roadId}
            className={pulse ? 'nw-spawn-marker is-pulse' : 'nw-spawn-marker'}
            href={SRC[row.asset]}
            x={fit.x - size / 2}
            y={fit.y - size / 2}
            width={size}
            height={size}
            transform={`rotate(${row.rotationDeg} ${fit.x} ${fit.y})`}
            pointerEvents="none"
            data-spawn-marker={`${row.mapId}:${row.roadId}`}
            data-spawn-fit={fit.step}
            data-spawn-scale={fit.scale.toFixed(2)}
          />
        )
      })}
    </g>
  )
}
