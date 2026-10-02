/**
 * Easy Trail module seams. Each folder fills on its own.
 * RecallGate and the loop stay in their current files —
 * shelves wrap, they do not fork. A1 Match registry lives in match/registry.tsx.
 * A2 Father home lives in father/ (old Father paths are re-export shims).
 * A3 Lock In peel: hold practice lives in lockIn/HoldPractice.tsx; Journal gates and renders it.
 * Later hop: A4 trail peel.
 */
export type { EasyTrailFocus } from './types.ts'
export * from './trail/index.ts'
export * from './match/index.ts'
export * from './father/index.ts'
export * from './lockIn/index.ts'
