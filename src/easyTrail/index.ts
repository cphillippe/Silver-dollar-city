/**
 * Easy Trail module seams. Each folder fills on its own.
 * RecallGate stays in its component file —
 * shelves wrap, they do not fork. A1 Match registry lives in match/registry.tsx.
 * A2 Father home lives in father/ (old Father paths are re-export shims).
 * A3 Lock In peel: hold practice lives in lockIn/HoldPractice.tsx; Journal gates and renders it.
 * A4 trail peel: the Easy loop lives in trail/loop.ts; lib/easy.ts re-exports the same bindings.
 */
export type { EasyTrailFocus } from './types.ts'
export * from './trail/index.ts'
export * from './match/index.ts'
export * from './father/index.ts'
export * from './lockIn/index.ts'
