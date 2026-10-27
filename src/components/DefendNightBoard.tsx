import { useLayoutEffect, useRef, useState, type ReactElement } from 'react'
import { createPortal } from 'react-dom'
import type { CityPlotId } from '../lib/city'
import { clampGhostHintLeft, clientToMap, lampRoadNote, ROAD_COVER_WORD } from '../lib/lampPlace'
import { CLEAR_BAR_RESERVE } from '../lib/towerCardPlace'
import { EASY_CROWN_HIT_R, EASY_FACE_HIT_R, PATH_WALKER_FACE_DY, WATCH_ABILITY_LABEL, easyFaceGlows } from '../lib/defend'
import { boardFill, boardFillPoint, boardPoint as mapBoardPoint, boardView, lampIconBox, nightTowers } from '../nightWatch'
import type { DefendNightSkyProps } from './DefendNightSky'
import { DefendNightSky } from './DefendNightSky'
import { DefendTowerCard, lampPlotTitle, type TowerCardPoint } from './DefendTowerCard'
import { camPoint } from './nwCamera'
import { samePillarLessons } from '../nightWatch/lampPillar'
import { easyShotReach, pathsOf, type BonusGate, type LampPaths, type TreePath } from '../nightWatch/upgradeTree'
import { bellPathKey, isBell } from '../nightWatch/bell'
import { crossPathKey, CROSS_LABEL, isCross } from '../nightWatch/cross'
import { incensePathKey, INCENSE_LABEL, isIncense } from '../nightWatch/incense'
import { candleFarBonus, candlePathKey, candleRoadNote, isCandle } from '../nightWatch/candle'
import {
  DefendNightActorsSvg,
  DefendNightWalkerCue,
  type DefendNightActorsProps,
} from './DefendNightActors'

/** Easy HUD: hide the walker tap disc while it would overlap the pace chip bbox (#792b NWUI-2). */
function walkerTapDiscOverlapsPace(face: { left: number; top: number }, radius: number): boolean {
  const pace = document.querySelector('.nw-pace')?.getBoundingClientRect()
  if (!pace || pace.width <= 1 || pace.height <= 1) return false
  const left = face.left - radius
  const top = face.top - radius
  const right = face.left + radius
  const bottom = face.top + radius
  return left < pace.right && right > pace.left && top < pace.bottom && bottom > pace.top
}

export type DefendNightBoardProps = Omit<DefendNightSkyProps, 'children'> &
  DefendNightActorsProps & {
    upgradePoint?: TowerCardPoint | null
    boardBox?: { w: number; h: number }
    runSparks?: number
    /** Set while Upgrade just raised this lamp. */
    levelBurst?: { from: number; to: number } | null
    onPullLamp?: () => void
    /** Sparks a pull would return. Free lamps are 0. */
    pullSparks?: number
    onCloseUpgrade?: () => void
    onUpgradePath?: (plotId: CityPlotId, path: TreePath, fromPip?: boolean) => void
    onArmPathBuy?: (path: TreePath) => void
    onBuyBright?: (plotId: CityPlotId) => void
    /** Round 7 and later. Bright stays off the card before that. */
    showBright?: boolean
    runPaths?: Record<string, LampPaths>
    /** Held Lock In lines. The bonus step counts the ones on this lamp's pillar. */
    heldLessons?: readonly string[]
    /** playtest=1 or the debug freeze. Opens the bonus step with no lessons. */
    playtestSteps?: boolean
    /** Leave the night for this lamp's lessons, and come back. */
    onOpenLessons?: () => void
    /** Easy phone: overlays share the fill camera with the board. */
    plateFill?: boolean
    /** Easy phone camera (#818). Plate px are `s0`, the world is zoomed by `z` and panned by `tx, ty`. */
    cam?: { s0: number; z: number; tx: number; ty: number }
  }

export function DefendNightBoard(props: DefendNightBoardProps) {
  const {
    boardRef, viewBox, shake, won, phase, fireBest, easyTap, onBoardTap,
    pads, planted, progress, raiders, raiderAt, ability, towerType, unlocked,
    flash, togglePad, fire, fireAtRaider, shots, easy, blasts, tapTarget, tapPos, tapJuice,
    walkerCalls, loreLine, runTier, boosting, onBoostTower,     upgradeAt, onOpenUpgrade, upFlashId, ghost = null,
    groundHints = [],
    firstSeatAt,
    reachMiss = [],
    upgradePoint, boardBox, runSparks = 0, levelBurst = null, onPullLamp, pullSparks = 0, onCloseUpgrade,
    onUpgradePath, onArmPathBuy, onBuyBright, showBright = false, runPaths, roundIndex = -1, armorFrom = 7,
    heldLessons, playtestSteps = false, onOpenLessons, spawnLog = false,
    plateFill = false, onPlacePointer, cueNudge = false,
    map, roadD, porchCandy, roadLabel, mapFeatures, pops, mapId, walkIn, cam,
  } = props
  const walkerAim = useRef<{ id: number; point: { x: number; y: number } | null; pointerType: string } | null>(null)
  const place = cam ? camPoint(cam.s0) : plateFill ? boardFillPoint : mapBoardPoint
  const cardAbility = upgradeAt ? towerType[upgradeAt] : undefined
  const bellCard = Boolean(cardAbility && isBell(cardAbility) && upgradeAt)
  const incenseCard = Boolean(cardAbility && isIncense(cardAbility) && upgradeAt)
  const candleCard = Boolean(cardAbility && isCandle(cardAbility) && upgradeAt)
  const crossCard = Boolean(cardAbility && isCross(cardAbility) && upgradeAt)
  const cardKey =
    incenseCard && upgradeAt
      ? incensePathKey(upgradeAt)
      : bellCard && upgradeAt
        ? bellPathKey(upgradeAt)
        : crossCard && upgradeAt
          ? crossPathKey(upgradeAt)
          : candleCard && upgradeAt
            ? candlePathKey(upgradeAt)
            : cardAbility
  const cardPaths = easy && cardKey ? pathsOf(runPaths, cardKey) : undefined
  const reachBonus =
    bellCard || incenseCard || crossCard
      ? 0
      : candleCard && upgradeAt
        ? candleFarBonus(pathsOf(runPaths, candlePathKey(upgradeAt)))
        : easy && cardAbility
          ? easyShotReach(pathsOf(runPaths, cardAbility))
          : 0
  const roadNote = bellCard || incenseCard || crossCard
    ? ''
    : candleCard && upgradeAt
      ? candleRoadNote(upgradeAt, reachBonus)
      : upgradeAt && cardAbility
        ? lampRoadNote(upgradeAt, cardAbility, progress, runTier, easy, reachBonus)
        : ''
  const lessonGate: BonusGate | undefined =
    easy && cardAbility
      ? {
          lessons: samePillarLessons(cardAbility, heldLessons),
          playtest: playtestSteps,
          roundIndex,
          cleared: boosting,
        }
      : undefined
  const showCard = Boolean(
    upgradeAt && cardAbility && upgradePoint && boardBox && boardBox.w > 0 && onCloseUpgrade,
  )
  // The card is not scaled with the world, so its anchors move to frame px.
  const toFrame = (at: { left: number; top: number }) =>
    cam ? { left: cam.tx + at.left * cam.z, top: cam.ty + at.top * cam.z } : at
  const clearOf =
    showCard && boardBox
      ? planted
          .filter((id) => id !== upgradeAt)
          .map((id) => toFrame(place(boardBox, nightTowers.anchor(id))))
      : []
  const cameraScale = cam
    ? cam.s0
    : boardBox && boardBox.w > 0
      ? (plateFill ? boardFill(boardBox) : boardView(boardBox)).scale
      : 0.55
  const camOn = Boolean(cam)
  // CSS pixels. Measured from layout (offsetTop), never from a transformed box, so the lift cannot chase itself.
  const [lampLift, setLampLift] = useState<Record<string, number>>({})
  useLayoutEffect(() => {
    if (!easy || !boosting || camOn) {
      setLampLift((prev) => (Object.keys(prev).length > 0 ? {} : prev))
      return
    }
    const frame = boardRef.current?.closest('.defend-frame')
    if (!(frame instanceof HTMLElement)) return
    const gap = 8
    const measure = () => {
      const panel = frame.querySelector('.nw-docks')
      if (!(panel instanceof HTMLElement)) return
      const obstacles = [
        panel,
        ...frame.querySelectorAll<HTMLElement>('.defend-clear-row [data-candle-lamp="yes"], .defend-clear-spend'),
      ]
      const frameBox = frame.getBoundingClientRect()
      const next: Record<string, number> = {}
      frame.querySelectorAll<HTMLElement>('.defend-clear-lamp').forEach((button) => {
        const id = button.getAttribute('data-clear-lamp')
        if (!id) return
        const left = frameBox.left + frame.clientLeft + button.offsetLeft
        const right = left + button.offsetWidth
        const bottom = frameBox.top + frame.clientTop + button.offsetTop + button.offsetHeight
        let limit = Number.POSITIVE_INFINITY
        for (const node of obstacles) {
          const box = node.getBoundingClientRect()
          const overlaps = Math.min(right, box.right) - Math.max(left, box.left) > 1
          if (overlaps) limit = Math.min(limit, box.top - gap)
        }
        if (bottom > limit) next[id] = Math.ceil(bottom - limit)
      })
      setLampLift((prev) => {
        const keys = new Set([...Object.keys(prev), ...Object.keys(next)])
        for (const key of keys) {
          if ((prev[key] ?? 0) !== (next[key] ?? 0)) return next
        }
        return prev
      })
    }
    measure()
    const panel = frame.querySelector('.nw-docks')
    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    if (panel instanceof HTMLElement) observer.observe(panel)
    return () => observer.disconnect()
  }, [easy, boosting, boardBox, planted, cameraScale, boardRef, camOn])
  const lampRise: Record<string, number> = {}
  if (cameraScale > 0) {
    for (const [id, lift] of Object.entries(lampLift)) {
      if (lift > 0) lampRise[id] = -lift / cameraScale
    }
  }
  const typeChips =
    boardBox && boardBox.w > 0
      ? planted.map((id) => {
          const type = towerType[id]
          if (!type) return null
          const at = place(boardBox, nightTowers.anchor(id))
          return (
            <span
              key={id}
              className={`defend-type-chip is-${type}`}
              style={{ left: at.left, top: at.top }}
            >
              {isIncense(type) ? INCENSE_LABEL : isCross(type) ? CROSS_LABEL : isBell(type) ? 'Bell' : isCandle(type) ? 'Candle' : (WATCH_ABILITY_LABEL[type] ?? type)}
            </span>
          )
        })
      : null
  const towerCard = showCard ? (
    <DefendTowerCard
      plotId={upgradeAt as CityPlotId}
      ability={cardAbility ?? ''}
      runTier={runTier}
      sparks={runSparks}
      point={toFrame(upgradePoint as TowerCardPoint)}
      board={boardBox as { w: number; h: number }}
      onUpgrade={() => onBoostTower?.(upgradeAt as CityPlotId)}
      onUpgradePath={(path, fromPip) => onUpgradePath?.(upgradeAt as CityPlotId, path, fromPip)}
      onArmPathBuy={onArmPathBuy}
      onBuyBright={onBuyBright ? () => onBuyBright(upgradeAt as CityPlotId) : undefined}
      showBright={showBright}
      paths={cardPaths}
      clearOf={clearOf}
      cameraScale={cam ? cam.s0 * cam.z : cameraScale}
      onPull={onPullLamp}
      pullSparks={pullSparks}
      onClose={onCloseUpgrade as () => void}
      levelBurst={levelBurst}
      roadNote={roadNote}
      easy={easy}
      midWave={phase === 'wave'}
      reserveBottom={easy && (boosting || phase === 'plant') ? CLEAR_BAR_RESERVE : 0}
      gate={lessonGate}
      onOpenLessons={onOpenLessons}
    />
  ) : null
  const cardFrame = cam ? boardRef.current?.closest('.defend-frame') : null
  const cardPortal = (node: ReactElement | null) =>
    cardFrame instanceof HTMLElement && node ? createPortal(node, cardFrame) : null
  return (
    <>
      <DefendNightSky
        boardRef={boardRef}
        viewBox={viewBox}
        shake={shake}
        won={won}
        phase={phase}
        fireBest={fireBest}
        easyTap={easyTap}
        onBoardTap={onBoardTap}
        onPlacePointer={onPlacePointer}
        map={map}
        roadD={roadD}
        porchCandy={porchCandy}
        roadLabel={roadLabel}
        mapFeatures={mapFeatures}
        pops={pops}
        easy={easy}
        mapId={mapId}
      >
        <DefendNightActorsSvg
          easyTap={easyTap}
          pads={pads}
          planted={planted}
          progress={progress}
          raiders={raiders}
          raiderAt={raiderAt}
          walkIn={walkIn}
          ability={ability}
          towerType={towerType}
          unlocked={unlocked}
          flash={flash}
          togglePad={togglePad}
          fire={fire}
          fireAtRaider={fireAtRaider}
          tapTarget={tapTarget}
          shots={shots}
          easy={easy}
          blasts={blasts}
          phase={phase}
          runTier={runTier}
          runPaths={runPaths}
          boosting={boosting}
          upgradeAt={upgradeAt}
          onOpenUpgrade={onOpenUpgrade}
          upFlashId={upFlashId}
          ghost={ghost}
          groundHints={groundHints}
          firstSeatAt={firstSeatAt}
          reachMiss={reachMiss}
          roundIndex={roundIndex}
          armorFrom={armorFrom}
          lampRise={lampRise}
          spawnLog={spawnLog}
          cueNudge={cueNudge}
        />
      </DefendNightSky>
      {cam ? cardPortal(towerCard) : towerCard}
      {ghost && !ghost.blocked && (ghost.cover || ghost.note) && boardBox && boardBox.w > 0 ? (
        <span
          className={`defend-ghost-hint${ghost.cover ? ` is-${ghost.cover}` : ''}`}
          data-road-note={ghost.cover ? ROAD_COVER_WORD[ghost.cover] : ghost.note}
          data-road-rank={ghost.cover || ''}
          style={{
            left: clampGhostHintLeft(place(boardBox, ghost.at).left, cam ? 798 * cam.s0 : boardBox.w),
            top: place(boardBox, { x: ghost.at.x, y: ghost.at.y - ghost.range }).top,
          }}
        >
          {ghost.cover ? ROAD_COVER_WORD[ghost.cover] : ghost.note}
        </span>
      ) : null}
      {easy && (phase === 'plant' || boosting || phase === 'wave') && boardBox && boardBox.w > 0
        ? planted.map((id) => {
            const at = place(boardBox, nightTowers.anchor(id))
            const type = towerType[id]
            const label = isIncense(type) ? INCENSE_LABEL : isCross(type) ? CROSS_LABEL : isBell(type) ? 'Bell' : isCandle(type) ? 'Candle' : (WATCH_ABILITY_LABEL[type ?? ''] ?? 'lamp')
            const baseName = `Upgrade ${label} at ${lampPlotTitle(id)}`
            const sameName = planted.filter((other) => {
              const t = towerType[other]
              const l = isIncense(t) ? INCENSE_LABEL : isCross(t) ? CROSS_LABEL : isBell(t) ? 'Bell' : isCandle(t) ? 'Candle' : (WATCH_ABILITY_LABEL[t ?? ''] ?? 'lamp')
              return `Upgrade ${l} at ${lampPlotTitle(other)}` === baseName
            })
            const lampName = sameName.length > 1 ? `${baseName}, ${sameName.indexOf(id) + 1} of ${sameName.length}` : baseName
            const icon = lampIconBox(isIncense(type) ? 'incense' : isCross(type) ? 'cross' : isBell(type) ? 'bell' : isCandle(type) ? 'candle' : 'tower')
            const scale = cameraScale > 0 ? cameraScale : 1
            const lift = lampLift[id] ?? 0
            return (
              <button
                key={`clear-lamp-${id}`}
                type="button"
                className="defend-clear-lamp"
                data-clear-lamp={id}
                data-lamp-icon="yes"
                data-incense-icon={isIncense(type) ? 'yes' : undefined}
                data-tower-type={type}
                aria-label={lampName}
                aria-expanded={easy ? upgradeAt === id : undefined}
                style={{
                  left: at.left + icon.x * scale,
                  top: at.top + icon.y * scale,
                  width: icon.w * scale,
                  height: icon.h * scale,
                  transform: lift > 0 ? `translateY(-${lift}px)` : 'none',
                }}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation()
                  if (phase === 'wave' && isIncense(type)) return
                  onOpenUpgrade?.(id)
                }}
              />
            )
          })
        : null}
      {easyTap && boardBox && boardBox.w > 0
        ? raiders
            .filter((raider) => !raider.turned && !walkIn?.held(raider))
            .map((raider) => {
              const at = walkIn ? walkIn.drawAt(raider) : raiderAt(raider)
              const face = place(boardBox, { x: at.x, y: at.y + PATH_WALKER_FACE_DY })
              const radius = (raider.boss ? EASY_CROWN_HIT_R : EASY_FACE_HIT_R) * (cameraScale > 0 ? cameraScale : 1)
              if (walkerTapDiscOverlapsPace(face, radius)) return null
              const glowing = easyFaceGlows(raider, raiders, roundIndex, armorFrom)
              return (
                <button
                  key={`walker-tap-${raider.id}`}
                  type="button"
                  className={`defend-walker-tap${glowing ? ' is-cue is-easy-cue' : ''}`}
                  data-walker-tap={raider.id}
                  data-walker-id={raider.id}
                  data-fog={raider.fog ? 'yes' : undefined}
                  data-boss={raider.boss ? 'yes' : undefined}
                  aria-label="Tap walker"
                  style={{
                    left: face.left - radius,
                    top: face.top - radius,
                    width: radius * 2,
                    height: radius * 2,
                    zIndex: glowing ? 11 : 10,
                  }}
                  onPointerDown={(event) => {
                    event.stopPropagation()
                    const svg = boardRef.current
                    const point = svg ? clientToMap(svg, event.clientX, event.clientY) : null
                    walkerAim.current = {
                      id: raider.id,
                      point,
                      pointerType: event.pointerType || 'none',
                    }
                  }}
                  onClick={(event) => {
                    event.stopPropagation()
                    const aim = walkerAim.current
                    const mine = aim && aim.id === raider.id ? aim : null
                    fireAtRaider(raider.id, mine?.point ?? null, mine?.pointerType)
                  }}
                />
              )
            })
        : null}
      {typeChips}
      <DefendNightWalkerCue
        easyTap={easyTap}
        tapTarget={tapTarget}
        tapPos={tapPos}
        tapJuice={tapJuice}
        walkerCalls={walkerCalls}
        loreLine={loreLine}
      />
    </>
  )
}
