import type { CityPlotId } from '../lib/city'
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
    onPullLamp?: () => void
    onCloseUpgrade?: () => void
  }

export function DefendNightBoard(props: DefendNightBoardProps) {
  const {
    boardRef, viewBox, shake, won, phase, fireBest, easyTap, onBoardTap,
    pads, planted, progress, raiders, raiderAt, ability, unlocked,
    flash, togglePad, fire, fireAtRaider, shots, easy, blasts, tapTarget, tapPos, tapJuice,
    walkerCalls, loreLine, runTier, boosting, onBoostTower, upgradeAt, onOpenUpgrade, upFlashId,
    upgradePoint, boardBox, runSparks = 0, onPullLamp, onCloseUpgrade,
  } = props
  const showCard = Boolean(upgradeAt && upgradePoint && boardBox && boardBox.w > 0 && onCloseUpgrade)
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
          ability={ability}
          runTier={runTier}
          sparks={runSparks}
          point={upgradePoint as TowerCardPoint}
          board={boardBox as { w: number; h: number }}
          onUpgrade={() => onBoostTower?.()}
          onPull={onPullLamp}
          onClose={onCloseUpgrade as () => void}
        />
      ) : null}
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
