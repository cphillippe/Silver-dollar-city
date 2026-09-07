# Contributing to Silver City

Content is data, not engine work. Read this first:

- [`src/content/README.md`](src/content/README.md) — add a district, challenge, journal card, and evidence line
- [`PLAYTEST.md`](PLAYTEST.md) — fun / clarity / retention bars and the release smoke list

## App version

`package.json` `version`, `src/config/app.ts` `APP_VERSION`, and Android `versionName` must match. Bump `SAVE_SCHEMA_VERSION` only when the persisted save shape changes, and add a migrator in `src/lib/save.ts`. Unversioned localStorage (`silver-city-progress-v1` gameplay object) still loads.

## Progress

Saves stay **offline-first** on this device. Players move devices with **Export JSON** or a **share code** in Settings. There is no cloud login.

## Ads

`src/config/ads.ts` — `adsEnabledDefault` is **false** for playtest. Placeholders never mount on Keep/Toss, the takeaway step, or Journal. See README → Ads.

## Android

```bash
npm run android:apk
```

Copy `android/app/build/outputs/apk/debug/app-debug.apk` to `releases/silver_city_debug.apk` when shipping a playtest build.

## Tests

```bash
npm test
npm run build
```
