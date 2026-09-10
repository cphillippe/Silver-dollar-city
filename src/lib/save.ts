import { APP_VERSION, SAVE_SCHEMA_VERSION, STORAGE_BACKUP_KEY, STORAGE_KEY } from '../config/app.ts'
import { localDateKey } from './dates.ts'
import { emptyDefense } from './defend.ts'
import { emptyTrace } from './memory.ts'
import type {
  AppTheme,
  DefenseState,
  Learning,
  MemoryTrace,
  ProgressState,
  StarCount,
} from '../types.ts'

export { STORAGE_KEY, STORAGE_BACKUP_KEY, SAVE_SCHEMA_VERSION }

export const SAVE_KIND = 'silver-city-save'

/** Reject import payloads larger than this before JSON.parse. */
export const SAVE_MAX_BYTES = 256 * 1024
const SAVE_MAX_RAW = Math.floor(SAVE_MAX_BYTES * 1.5)
const SAVE_MAX_ARRAY = 256
const SAVE_MAX_MAP = 256
const SAVE_MAX_ID = 64
const SAVE_MAX_ELABORATION = 220
const SAVE_MAX_COUNT = 10_000
const SAVE_MAX_INTERVAL = 32
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/
const ID_KEY = /^[A-Za-z0-9._:-]{1,64}$/
const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

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
    defense: emptyDefense(),
    theme: 'candy',
    easyMode: false,
    learnings: [],
  }
}

function isDangerousKey(key: string): boolean {
  return DANGEROUS_KEYS.has(key)
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

function isDateKey(value: unknown): value is string {
  return typeof value === 'string' && DATE_KEY.test(value) && value.length <= SAVE_MAX_ID
}

function isSafeId(value: unknown): value is string {
  return typeof value === 'string' && ID_KEY.test(value)
}

function finiteInt(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value)) {
    return fallback
  }
  return Math.min(max, Math.max(min, value))
}

function clipString(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max)
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const next: string[] = []
  for (const item of value) {
    if (next.length >= SAVE_MAX_ARRAY) break
    if (!isSafeId(item) || isDangerousKey(item)) continue
    next.push(item)
  }
  return next
}

function asMemoryMap(value: unknown): Record<string, MemoryTrace> {
  const next = Object.create(null) as Record<string, MemoryTrace>
  if (!isPlainObject(value)) return next
  let count = 0
  for (const [key, raw] of Object.entries(value)) {
    if (count >= SAVE_MAX_MAP) break
    if (isDangerousKey(key) || !isSafeId(key)) continue
    if (!isPlainObject(raw)) continue
    const today = localDateKey()
    const id = isSafeId(raw.id) ? raw.id : key
    next[key] = {
      id,
      pillar: isSafeId(raw.pillar) ? raw.pillar : 'unspecified',
      intervalIndex: finiteInt(raw.intervalIndex, 0, SAVE_MAX_INTERVAL, 0),
      nextReviewAt: isDateKey(raw.nextReviewAt) ? raw.nextReviewAt : today,
      lastReviewAt: isDateKey(raw.lastReviewAt) ? raw.lastReviewAt : undefined,
      reviews: finiteInt(raw.reviews, 0, SAVE_MAX_COUNT, 0),
      cleanRecalls: finiteInt(raw.cleanRecalls, 0, SAVE_MAX_COUNT, 0),
      elaborated: Boolean(raw.elaborated),
    }
    count += 1
  }
  return next
}

function asStringMap(value: unknown): Record<string, string> {
  const next = Object.create(null) as Record<string, string>
  if (!isPlainObject(value)) return next
  let count = 0
  for (const [key, raw] of Object.entries(value)) {
    if (count >= SAVE_MAX_MAP) break
    if (isDangerousKey(key) || !isSafeId(key)) continue
    if (typeof raw !== 'string') continue
    next[key] = clipString(raw, SAVE_MAX_ELABORATION)
    count += 1
  }
  return next
}

function asStarMap(value: unknown): Record<string, StarCount> {
  const next = Object.create(null) as Record<string, StarCount>
  if (!isPlainObject(value)) return next
  let count = 0
  for (const [key, raw] of Object.entries(value)) {
    if (count >= SAVE_MAX_MAP) break
    if (isDangerousKey(key) || !isSafeId(key)) continue
    if (raw === 1 || raw === 2 || raw === 3) {
      next[key] = raw
      count += 1
    }
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
    lastAreaId: isSafeId(parsed.lastAreaId) ? parsed.lastAreaId : undefined,
    lastChallengeId: isSafeId(parsed.lastChallengeId) ? parsed.lastChallengeId : undefined,
    stars: asStarMap(parsed.stars),
    dailyDates: asStringArray(parsed.dailyDates),
    lastDailyDate: isDateKey(parsed.lastDailyDate) ? parsed.lastDailyDate : undefined,
    streak: finiteInt(parsed.streak, 0, SAVE_MAX_COUNT, 0),
    bestStreak: finiteInt(parsed.bestStreak, 0, SAVE_MAX_COUNT, 0),
    held,
    memory: {},
    elaborations: asStringMap(parsed.elaborations),
    lastReviewPillar: isSafeId(parsed.lastReviewPillar) ? parsed.lastReviewPillar : undefined,
    defense: asDefense(parsed.defense),
    theme: asTheme(parsed.theme),
    easyMode: parsed.easyMode === true,
    learnings: asLearningArray(parsed.learnings),
  }
  base.memory = migrateMemory({ ...base, memory: parsed.memory ?? {} })
  return base
}

function asTheme(value: unknown): AppTheme {
  if (value === 'dusk' || value === 'parchment' || value === 'candy') return value
  return 'candy'
}

function asDefense(value: unknown): DefenseState {
  if (!isPlainObject(value)) return emptyDefense()
  const nights = asStringArray(value.nights).filter(isDateKey)
  return {
    cleared: finiteInt(value.cleared, 0, SAVE_MAX_COUNT, 0),
    nights,
    lastNight: isDateKey(value.lastNight) ? value.lastNight : undefined,
  }
}

function asLearningArray(value: unknown): Learning[] {
  if (!Array.isArray(value)) return []
  const next: Learning[] = []
  for (const raw of value) {
    if (next.length >= SAVE_MAX_ARRAY) break
    if (!isPlainObject(raw)) continue
    if (!isSafeId(raw.id) || isDangerousKey(raw.id)) continue
    const claim = typeof raw.claim === 'string' ? clipString(raw.claim, 280) : ''
    if (!claim) continue
    next.push({
      id: raw.id,
      claim,
      reason: typeof raw.reason === 'string' ? clipString(raw.reason, 280) : '',
      source: typeof raw.source === 'string' ? clipString(raw.source, 120) : '',
      anchor: typeof raw.anchor === 'string' ? clipString(raw.anchor, 180) : '',
      picture:
        typeof raw.picture === 'string' && raw.picture.length <= 16
          ? (raw.picture as Learning['picture'])
          : undefined,
      beat: typeof raw.beat === 'string' ? clipString(raw.beat, 180) : undefined,
      toolId: isSafeId(raw.toolId) ? raw.toolId : undefined,
      acquiredAt: isDateKey(raw.acquiredAt) ? raw.acquiredAt : '',
    })
  }
  return next
}

function isEnvelope(value: unknown): value is SaveEnvelope {
  if (!isPlainObject(value)) return false
  return value.kind === SAVE_KIND && isPlainObject(value.progress)
}

function looksLikeProgress(value: unknown): value is Partial<ProgressState> {
  if (!isPlainObject(value)) return false
  if (value.kind === SAVE_KIND) return false
  return (
    Array.isArray(value.completed) ||
    Array.isArray(value.journal) ||
    Array.isArray(value.held) ||
    Array.isArray(value.dailyDates) ||
    typeof value.started === 'boolean'
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
    const schemaVersion = value.schemaVersion
    if (schemaVersion === undefined) {
      // kind-matched envelopes without a version are treated as v1
    } else if (
      typeof schemaVersion !== 'number' ||
      !Number.isInteger(schemaVersion) ||
      schemaVersion < 0
    ) {
      return { ok: false, error: 'That save’s schema version is not valid.' }
    } else if (schemaVersion > SAVE_SCHEMA_VERSION) {
      return {
        ok: false,
        error: 'This save needs a newer Silver City before it can be imported.',
      }
    }
    const version = typeof schemaVersion === 'number' ? schemaVersion : 1
    const progress = migrateToCurrent(version, normalizeProgress(value.progress))
    const savedAt =
      typeof value.savedAt === 'string' && value.savedAt.length <= 40
        ? value.savedAt
        : new Date().toISOString()
    const appVersion =
      typeof value.appVersion === 'string' && value.appVersion.length <= SAVE_MAX_ID
        ? clipString(value.appVersion, SAVE_MAX_ID)
        : APP_VERSION
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
  if (trimmed.length > SAVE_MAX_RAW) {
    return { ok: false, error: 'That save is too large to import.' }
  }
  let text = trimmed
  if (trimmed.startsWith('SC1.')) {
    try {
      text = base64UrlToUtf8(trimmed.slice(4))
    } catch {
      return { ok: false, error: 'That share code could not be read.' }
    }
  }
  if (text.length > SAVE_MAX_BYTES) {
    return { ok: false, error: 'That save is too large to import.' }
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
