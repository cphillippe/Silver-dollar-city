import type { DefendNightSkyProps } from './DefendNightSky'
import { DefendNightSky } from './DefendNightSky'
import {
  DefendNightActorsSvg,
  DefendNightWalkerCue,
  type DefendNightActorsProps,
} from './DefendNightActors'

export type DefendNightBoardProps = Omit<DefendNightSkyProps, 'children'> &
  DefendNightActorsProps

export function DefendNightBoard(props: DefendNightBoardProps) {
  const {
    boardRef, shake, won, phase, fireBest, easyTap,
    pads, planted, progress, raiders, raiderAt, ability, unlocked,
    flash, togglePad, fire, shots, easy, blasts, tapTarget, tapPos,
  } = props
  return (
    <>
      <DefendNightSky
        boardRef={boardRef}
        shake={shake}
        won={won}
        phase={phase}
        fireBest={fireBest}
        easyTap={easyTap}
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
          shots={shots}
          easy={easy}
          blasts={blasts}
          phase={phase}
        />
      </DefendNightSky>
      <DefendNightWalkerCue
        easyTap={easyTap}
        tapTarget={tapTarget}
        tapPos={tapPos}
        fireBest={fireBest}
      />
    </>
  )
}
