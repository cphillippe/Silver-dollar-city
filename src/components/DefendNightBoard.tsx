import type { CityPlotId } from '../lib/city'
import { WATCH_ABILITY_LABEL } from '../lib/defend'
import { boardFill, boardFillPoint, boardPoint as mapBoardPoint, boardView, nightTowers } from '../nightWatch'
import type { DefendNightSkyProps } from './DefendNightSky'
import { DefendNightSky } from './DefendNightSky'
import { DefendTowerCard, type TowerCardPoint } from './DefendTowerCard'
import {
  DefendNightActorsSvg,
  DefendNightWalkerCue,
  type DefendNightActorsProps,
} from './DefendNightActors'

export type DefendNightBoardProps = Omit<DefendNightSkyProps, 'children'> &
  DefendNightActorsProps & {
    upgradePoint?: TowerCardPoint | null
    boardBox?: { w: number; h: number }
    runSparks?: number
    /** Set while Upgrade just raised this lamp. */
    levelBurst?: { from: number; to: number } | null
    onPullLamp?: () => void
    onCloseUpgrade?: () => void
    /** Easy phone: overlays share the fill camera with the board. */
    plateFill?: boolean
  }

export function DefendNightBoard(props: DefendNightBoardProps) {
  const {
    boardRef, viewBox, shake, won, phase, fireBest, easyTap, onBoardTap,
    pads, planted, progress, raiders, raiderAt, ability, towerType, unlocked,
    flash, togglePad, fire, fireAtRaider, shots, easy, blasts, tapTarget, tapPos, tapJuice,
    walkerCalls, loreLine, runTier, boosting, onBoostTower, upgradeAt, onOpenUpgrade, upFlashId,
    upgradePoint, boardBox, runSparks = 0, levelBurst = null, onPullLamp, onCloseUpgrade,
    plateFill = false,
  } = props
  const place = plateFill ? boardFillPoint : mapBoardPoint
  const cardAbility = upgradeAt ? towerType[upgradeAt] : undefined
  const showCard = Boolean(
    upgradeAt && cardAbility && upgradePoint && boardBox && boardBox.w > 0 && onCloseUpgrade,
  )
  const clearOf =
    showCard && boardBox
      ? planted
          .filter((id) => id !== upgradeAt)
          .map((id) => place(boardBox, nightTowers.anchor(id)))
      : []
  const cameraScale =
    boardBox && boardBox.w > 0 ? (plateFill ? boardFill(boardBox) : boardView(boardBox)).scale : 0.55
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
              {WATCH_ABILITY_LABEL[type] ?? type}
            </span>
          )
        })
      : null
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
      >
        <DefendNightActorsSvg
          easyTap={easyTap}
          pads={pads}
          planted={planted}
          progress={progress}
          raiders={raiders}
          raiderAt={raiderAt}
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
          boosting={boosting}
          upgradeAt={upgradeAt}
          onOpenUpgrade={onOpenUpgrade}
          upFlashId={upFlashId}
        />
      </DefendNightSky>
      {showCard ? (
        <DefendTowerCard
          plotId={upgradeAt as CityPlotId}
          ability={cardAbility ?? ''}
          runTier={runTier}
          sparks={runSparks}
          point={upgradePoint as TowerCardPoint}
          board={boardBox as { w: number; h: number }}
          onUpgrade={() => onBoostTower?.(upgradeAt as CityPlotId)}
          clearOf={clearOf}
          cameraScale={cameraScale}
          onPull={onPullLamp}
          onClose={onCloseUpgrade as () => void}
          levelBurst={levelBurst}
        />
      ) : null}
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
