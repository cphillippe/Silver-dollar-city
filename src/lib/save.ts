import { APP_VERSION, SAVE_SCHEMA_VERSION, STORAGE_BACKUP_KEY, STORAGE_KEY } from '../config/app.ts'
import { localDateKey } from './dates.ts'
import { emptyTrace } from './memory.ts'
import type { MemoryTrace, ProgressState, StarCount } from '../types.ts'

export { STORAGE_KEY, STORAGE_BACKUP_KEY, SAVE_SCHEMA_VERSION }

export const SAVE_KIND = 'silver-city-save'

export interface SaveEnvelope {
  kind: typeof SAVE_KIND
  schemaVersion: number
  appVersion: string
  savedAt: string
  progress: ProgressState
}

export interface SaveMeta {
  schemaVersion: number
  appVersion: string
  savedAt: string
  source: 'legacy' | 'envelope'
}

export interface ParseOk {
  ok: true
  progress: ProgressState
  meta: SaveMeta
  envelope: SaveEnvelope
}

export interface ParseFail {
  ok: false
  error: string
}

export type ParseResult = ParseOk | ParseFail

export function emptyProgress(): ProgressState {
  return {
    started: false,
    completed: [],
    journal: [],
    firstTry: [],
    stars: {},
    dailyDates: [],
    streak: 0,
    bestStreak: 0,
    held: [],
    memory: {},
    elaborations: {},
  }
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function asMemoryMap(value: unknown): Record<string, MemoryTrace> {
  if (!value || typeof value !== 'object') return {}
  const next: Record<string, MemoryTrace> = {}
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!raw || typeof raw !== 'object') continue
    const item = raw as MemoryTrace
    next[key] = {
      id: typeof item.id === 'string' ? item.id : key,
      pillar: typeof item.pillar === 'string' ? item.pillar : 'unspecified',
      intervalIndex: typeof item.intervalIndex === 'number' ? item.intervalIndex : 0,
      nextReviewAt: typeof item.nextReviewAt === 'string' ? item.nextReviewAt : localDateKey(),
      lastReviewAt: item.lastReviewAt,
      reviews: typeof item.reviews === 'number' ? item.reviews : 0,
      cleanRecalls: typeof item.cleanRecalls === 'number' ? item.cleanRecalls : 0,
      elaborated: Boolean(item.elaborated),
    }
  }
  return next
}

function asStringMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object') return {}
  const next: Record<string, string> = {}
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw === 'string') next[key] = raw
  }
  return next
}

function asStarMap(value: unknown): Record<string, StarCount> {
  if (!value || typeof value !== 'object') return {}
  const next: Record<string, StarCount> = {}
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (raw === 1 || raw === 2 || raw === 3) next[key] = raw
  }
  return next
}

function migrateMemory(parsed: ProgressState): Record<string, MemoryTrace> {
  const memory = asMemoryMap(parsed.memory)
  const today = localDateKey()
  for (const id of parsed.held ?? []) {
    if (memory[id]) continue
    memory[id] = {
      ...emptyTrace(id, 'unspecified', today),
      nextReviewAt: today,
      lastReviewAt: undefined,
    }
  }
  return memory
}

/** Normalize any saved progress object. Never drops known fields. */
export function normalizeProgress(parsed: Partial<ProgressState> | ProgressState): ProgressState {
  const held = asStringArray(parsed.held)
  const base: ProgressState = {
    started: Boolean(parsed.started),
    completed: asStringArray(parsed.completed),
    journal: asStringArray(parsed.journal),
    firstTry: asStringArray(parsed.firstTry),
    lastAreaId: typeof parsed.lastAreaId === 'string' ? parsed.lastAreaId : undefined,
    lastChallengeId:
      typeof parsed.lastChallengeId === 'string' ? parsed.lastChallengeId : undefined,
    stars: asStarMap(parsed.stars),
    dailyDates: asStringArray(parsed.dailyDates),
    lastDailyDate: typeof parsed.lastDailyDate === 'string' ? parsed.lastDailyDate : undefined,
    streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
    bestStreak: typeof parsed.bestStreak === 'number' ? parsed.bestStreak : 0,
    held,
    memory: {},
    elaborations: asStringMap(parsed.elaborations),
    lastReviewPillar:
      typeof parsed.lastReviewPillar === 'string' ? parsed.lastReviewPillar : undefined,
  }
  base.memory = migrateMemory({ ...base, memory: parsed.memory ?? {} })
  return base
}

function isEnvelope(value: unknown): value is SaveEnvelope {
  if (!value || typeof value !== 'object') return false
  const row = value as Record<string, unknown>
  const progress = row.progress
  return (
    (row.kind === SAVE_KIND || typeof row.schemaVersion === 'number') &&
    Boolean(progress) &&
    typeof progress === 'object'
  )
}

function looksLikeProgress(value: unknown): value is Partial<ProgressState> {
  if (!value || typeof value !== 'object') return false
  const row = value as Record<string, unknown>
  return (
    Array.isArray(row.completed) ||
    Array.isArray(row.journal) ||
    Array.isArray(row.held) ||
    Array.isArray(row.dailyDates) ||
    typeof row.started === 'boolean'
  )
}

/**
 * Migrate an envelope's inner progress from schema N → current.
 * Schema 1 is the first versioned envelope (legacy unversioned = v0).
 * Add cases here when the shape changes; never wipe stars/journal/Daily.
 */
export function migrateToCurrent(
  schemaVersion: number,
  progress: ProgressState,
): ProgressState {
  let next = progress
  let version = schemaVersion
  // v0/v1 share the same gameplay fields; later bumps chain through here.
  if (version < 1) version = 1
  if (version === 1) {
    next = normalizeProgress(next)
  }
  if (version > SAVE_SCHEMA_VERSION) {
    next = normalizeProgress(next)
  }
  return next
}

export function wrapSave(progress: ProgressState, savedAt = new Date().toISOString()): SaveEnvelope {
  return {
    kind: SAVE_KIND,
    schemaVersion: SAVE_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    savedAt,
    progress: normalizeProgress(progress),
  }
}

export function parseUnknownSave(value: unknown): ParseResult {
  if (isEnvelope(value)) {
    const schemaVersion =
      typeof value.schemaVersion === 'number' ? value.schemaVersion : 1
    const progress = migrateToCurrent(schemaVersion, normalizeProgress(value.progress))
    const savedAt =
      typeof value.savedAt === 'string' ? value.savedAt : new Date().toISOString()
    const appVersion =
      typeof value.appVersion === 'string' ? value.appVersion : APP_VERSION
    return {
      ok: true,
      progress,
      meta: {
        schemaVersion: SAVE_SCHEMA_VERSION,
        appVersion,
        savedAt,
        source: 'envelope',
      },
      envelope: wrapSave(progress, savedAt),
    }
  }
  if (looksLikeProgress(value)) {
    const progress = migrateToCurrent(0, normalizeProgress(value))
    const savedAt = new Date().toISOString()
    return {
      ok: true,
      progress,
      meta: {
        schemaVersion: SAVE_SCHEMA_VERSION,
        appVersion: APP_VERSION,
        savedAt,
        source: 'legacy',
      },
      envelope: wrapSave(progress, savedAt),
    }
  }
  return { ok: false, error: 'That file is not a Silver City save.' }
}

function utf8ToBase64Url(text: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(text, 'utf8').toString('base64url')
  }
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToUtf8(code: string): string {
  const padded = code.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  const b64 = padded + pad
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(b64, 'base64').toString('utf8')
  }
  const binary = atob(b64)
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function encodeShareCode(envelope: SaveEnvelope): string {
  return `SC1.${utf8ToBase64Url(JSON.stringify(envelope))}`
}

export function parseIncomingSave(raw: string): ParseResult {
  const trimmed = raw.trim()
  if (!trimmed) return { ok: false, error: 'Nothing to import.' }
  let text = trimmed
  if (trimmed.startsWith('SC1.')) {
    try {
      text = base64UrlToUtf8(trimmed.slice(4))
    } catch {
      return { ok: false, error: 'That share code could not be read.' }
    }
  }
  try {
    return parseUnknownSave(JSON.parse(text) as unknown)
  } catch {
    return { ok: false, error: 'That save is not valid JSON.' }
  }
}

function storageGet(key: string): string | null {
  if (typeof localStorage === 'undefined') return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function storageSet(key: string, value: string) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(key, value)
}

export function loadSave(): { progress: ProgressState; meta: SaveMeta } {
  const raw = storageGet(STORAGE_KEY)
  if (!raw) {
    const empty = emptyProgress()
    return {
      progress: empty,
      meta: {
        schemaVersion: SAVE_SCHEMA_VERSION,
        appVersion: APP_VERSION,
        savedAt: '',
        source: 'envelope',
      },
    }
  }
  try {
    const parsed = parseUnknownSave(JSON.parse(raw) as unknown)
    if (!parsed.ok) {
      return {
        progress: emptyProgress(),
        meta: {
          schemaVersion: SAVE_SCHEMA_VERSION,
          appVersion: APP_VERSION,
          savedAt: '',
          source: 'legacy',
        },
      }
    }
    if (parsed.meta.source === 'legacy') {
      persistSave(parsed.progress, parsed.meta.savedAt)
    }
    return { progress: parsed.progress, meta: parsed.meta }
  } catch {
    return {
      progress: emptyProgress(),
      meta: {
        schemaVersion: SAVE_SCHEMA_VERSION,
        appVersion: APP_VERSION,
        savedAt: '',
        source: 'legacy',
      },
    }
  }
}

export function persistSave(progress: ProgressState, savedAt = new Date().toISOString()): SaveMeta {
  const envelope = wrapSave(progress, savedAt)
  storageSet(STORAGE_KEY, JSON.stringify(envelope))
  return {
    schemaVersion: envelope.schemaVersion,
    appVersion: envelope.appVersion,
    savedAt: envelope.savedAt,
    source: 'envelope',
  }
}

export function backupCurrentSave() {
  const raw = storageGet(STORAGE_KEY)
  if (raw) storageSet(STORAGE_BACKUP_KEY, raw)
}

export function cloudSyncStatus(): 'local-only' {
  return 'local-only'
}
