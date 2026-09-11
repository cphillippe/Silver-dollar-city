/** Display + envelope version. Keep in lockstep with package.json. */
export const APP_VERSION = '1.4.37'

/** Capacitor / Play id — do not change without a migration story. */
export const APP_ID = 'city.silver.unending'

/**
 * Save envelope version. Bump when the persisted shape changes.
 * `src/lib/save.ts` must migrate every older version (and unversioned v0).
 */
export const SAVE_SCHEMA_VERSION = 1

export const STORAGE_KEY = 'silver-city-progress-v1'
export const STORAGE_BACKUP_KEY = 'silver-city-progress-v1.bak'
