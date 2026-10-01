/**
 * Father home (A2). FatherRunPlay and its timing live here.
 * Father stays a Match kind: only the Match registry mounts FatherRunPlay; App has no Father route.
 * components/challenges/FatherRunPlay.tsx and lib/fatherRun.ts are re-export shims.
 */
export { FatherRunPlay } from './FatherRunPlay'
export {
  FATHER_RUN_AGAIN,
  FATHER_RUN_CLAIM,
  FATHER_RUN_HINT,
  FATHER_RUN_LINE,
  FATHER_RUN_WIN,
  fatherReached,
  hugBeforeSpeech,
  runOutcome,
} from './fatherRun.ts'
export type { FatherRunPhase } from './fatherRun.ts'
