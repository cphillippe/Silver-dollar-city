/**
 * Night Watch module seams. Each folder fills on its own; DefendScreen composes them.
 * Soft TD stays in lib/defend.ts + lib/watchTools.ts — modules wrap, they do not fork.
 */
export * from './types.ts'
export * from './ui/index.ts'
export * from './map/index.ts'
export * from './path/index.ts'
export * from './parts/index.ts'
export * from './towers/index.ts'
export * from './enemies/index.ts'
