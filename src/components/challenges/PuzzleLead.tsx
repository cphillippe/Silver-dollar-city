import type { Challenge } from '../../types'

export function PuzzleLead({ challenge }: { challenge: Challenge }) {
  return (
    <>
      {challenge.idea ? (
        <p className="puzzle-idea">Today’s idea: {challenge.idea}</p>
      ) : null}
      <p className="prompt">{challenge.prompt}</p>
    </>
  )
}
