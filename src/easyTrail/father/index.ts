/**
 * Father shelf. FatherRunPlay stays mounted from its component file.
 * Timing symbols wrap lib/fatherRun.ts and do not fork it. A2 home move is later.
 */
export { FatherRunPlay } from '../../components/challenges/FatherRunPlay'
export {
  FATHER_RUN_AGAIN,
  FATHER_RUN_CLAIM,
  FATHER_RUN_HINT,
  FATHER_RUN_LINE,
  FATHER_RUN_WIN,
  fatherReached,
  hugBeforeSpeech,
  runOutcome,
} from '../../lib/fatherRun.ts'
export type { FatherRunPhase } from '../../lib/fatherRun.ts'
