# Contributing to Silver City

Content is data, not engine work. Read this first:

- [`src/content/README.md`](src/content/README.md) — add a district, challenge, journal card, evidence line, or a later content pack (`packs.ts` + `changelog.ts`)
- [`PLAYTEST.md`](PLAYTEST.md) — fun / clarity / retention bars and the release smoke list

## App version

`package.json` `version`, `src/config/app.ts` `APP_VERSION`, and Android `versionName` must match. Bump `SAVE_SCHEMA_VERSION` only when the persisted save shape changes, and add a migrator in `src/lib/save.ts`. Unversioned localStorage (`silver-city-progress-v1` gameplay object) still loads.

## Progress

Saves stay **offline-first** on this device. Players move devices with **Export JSON** or a **share code** in Settings. There is no cloud login.

## Ads

`src/config/ads.ts` — live network flag `adsEnabledDefault` is **false**. Soft pauses default on between home and a lesson until Remove ads is granted. Never mount over Keep/Toss, Match, Hold, arcade play, or Journal. See README → Ads.

## Freemium

`src/config/commerce.ts` + `src/lib/commerce.ts` — `grantRemoveAds()` / `grantPack(id)` are the only unlock flags. Web Shop is an honest stub. Play Billing should call those same functions.

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
