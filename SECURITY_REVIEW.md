# Security review — Silver City (PR #1)

**Scope:** defensive source review of `https://github.com/cphillippe/Silver-dollar-city/pull/1`  
**Branch / commit:** `cursor/silver-city-unending-evidence-8233` @ `9223d7b`  
**Stack:** React 19 + Vite 7 + TypeScript + Capacitor Android 8  
**Date:** 2026-09-07  
**Method:** static review of application source, Android manifests/Gradle, Capacitor config, save/import path, ad placeholders, `package-lock.json` (`npm audit --package-lock-only`), and the committed debug APK’s embedded config / signing identity. No exploit PoCs, payloads, or attack procedures.

This is a local-first playtest app (no backend, no auth, no third-party ad SDK yet). Residual risk is concentrated in **untrusted save import**, **Android debug distribution**, **WebView mixed content**, and **missing web hardening (CSP / headers)** before a public or Play release.

---

## Summary

| Severity | Count |
| --- | --- |
| Critical | 0 |
| High | 1 |
| Medium | 6 |

Areas with **no issue found** are listed explicitly after the findings.

---

## Critical / High / Medium findings

### HIGH-1 — Public Android binary is a debug-signed debug build

**Where:** `releases/silver_city_debug.apk` (linked from `README.md` / PR body); produced by `assembleDebug` (`package.json` `android:apk`). Signing identity inside the APK includes `CN=Android Debug`. `android/app/build.gradle` has no release signing config; debug `buildType` remains the default (debuggable).

**Risk:** Testers are directed to sideload this file. A debug-signed, debug-build WebView app is not a release identity: it is easier to inspect at runtime, uses a non-production signing cert, and must not be uploaded to Play or treated as the installable product. Anyone who can replace a debug package on a device (or confuse testers into installing a look-alike) is not constrained by a private release key.

**Remediation (defensive):**

- Keep `assembleDebug` for local developers only.
- For any shared APK, use `assembleRelease` (or a dedicated `playtest` build type) with `debuggable false`, a **private** upload keystore that is **not** the SDK debug cert, and `minifyEnabled` / R8 at least considered for store builds.
- Do not commit that keystore. Uncomment `*.jks` / `*.keystore` in `android/.gitignore` (those lines are currently commented out — see MED-6).
- Label store/Play binaries separately from `releases/silver_city_debug.apk`. Remove or stop linking the debug APK once a playtest/release keystore exists.

---

### MED-1 — Save export/import accepts untrusted JSON without size, key, or shape hardness

**Where:** `src/lib/save.ts` (`parseIncomingSave`, `parseUnknownSave`, `normalizeProgress`, `asMemoryMap`, `asStringMap`, `asStringArray`); `src/store/ProgressProvider.tsx` (`importSaveText`); `src/components/Settings.tsx` (`onFile` / paste import).

**What is already good:** versioned envelope (`kind`, `schemaVersion`), `JSON.parse` in try/catch, field-wise normalization (stars only 1|2|3, arrays filtered to strings, memory records rebuilt field-by-field), legacy v0 migration, backup key written before import/reset, UI `maxLength={220}` on the in-app “private sentence”.

**Risk:** Import is an **untrusted input** boundary (file + paste + `SC1.` share code). Gaps:

1. **No size limit** on paste, file `FileReader.readAsText`, or decoded `SC1.` payload. A huge document can stall or OOM the WebView / tab before/during `JSON.parse`.
2. **Dangerous object keys** (`__proto__`, `constructor`, `prototype`) are copied with `next[key] = …` in `asMemoryMap` / `asStringMap`. Use `Object.create(null)` maps and skip those keys so untrusted JSON cannot reshape prototypes of imported maps.
3. **Envelope check is loose:** `isEnvelope` treats any object with a numeric `schemaVersion` *or* the expected `kind`, plus a `progress` object, as a save. `looksLikeProgress` accepts any object with one of several arrays/booleans. Future schema versions are accepted and `normalizeProgress`’d rather than rejected with a clear “newer app required” error.
4. **Incomplete type checks:** `lastReviewAt` is copied through without `typeof === 'string'`; numeric fields (`intervalIndex`, `reviews`, `streak`) are not required to be finite / bounded; string arrays and `elaborations` values have no max length or max count. Imported elaborations **bypass** the 220-character UI cap. Those strings are stored in `localStorage` and would become an XSS problem if a later screen rendered them as HTML/Markdown.
5. **File import does not confirm** replacement; paste import does. Accidental overwrite of the on-device save is easier via file.
6. **No integrity binding** (expected for local-only). Share codes are bearer data: whoever imports them replaces local progress. That is a product choice, not a crypto bug — still warn in UI that import fully replaces this device’s save.

**Remediation (defensive):**

- Reject raw input over a hard cap (e.g. 256–512 KiB) **before** `JSON.parse` / base64 decode; reject files over that size in `onFile`.
- Parse with `JSON.parse` only after the cap; then require `kind === 'silver-city-save'` for the versioned path (keep a narrow legacy detector).
- Reject `schemaVersion` that is not a safe integer in `0 … SAVE_SCHEMA_VERSION` (or migrate only known versions; refuse newer with a message).
- When copying maps, skip `__proto__` / `constructor` / `prototype`, and assign onto `Object.create(null)`.
- Cap array lengths and string lengths (align elaborations with the 220 UI cap; cap id-like strings and date keys to a short charset).
- Require `lastReviewAt` / `nextReviewAt` to be `YYYY-MM-DD` strings; require finite integers in range for counts and `intervalIndex`.
- Confirm before **file** import the same way paste import already does.
- Keep rendering imported text as React text children only (no HTML). Add tests in `scripts/check-save.mjs` for oversized input, bad keys, and future schema versions.

---

### MED-2 — Capacitor WebView allows mixed content

**Where:** `capacitor.config.ts` → `android.allowMixedContent: true` (also present in the APK’s `assets/capacitor.config.json`).

**Risk:** The WebView may load **cleartext HTTP** subresources (scripts, frames, images) even though the app `targetSdk` is 36 and the manifest does **not** set `usesCleartextTraffic` (so app-level cleartext is off by default). Mixed content is the usual path for a later ad/analytics/font URL to be downgraded or hijacked on hostile networks. The app already loads Google Fonts over HTTPS from `index.html`; mixed content is not required for current first-party assets (`webDir: 'dist'`, no remote `server.url`).

**Remediation:** Set `allowMixedContent: false`. If a future HTTP-only partner appears, prefer HTTPS or a tight `network_security_config.xml` allowlist rather than global mixed content. Re-`cap sync` and rebuild.

**Related (no extra finding):** `AndroidManifest.xml` does not enable cleartext traffic; `MainActivity` has no extra intent filters beyond `MAIN`/`LAUNCHER`; `FileProvider` is `exported="false"`. See MED-3 for FileProvider paths.

---

### MED-3 — FileProvider paths share the entire external volume

**Where:** `android/app/src/main/res/xml/file_paths.xml`

```xml
<external-path name="my_images" path="." />
<cache-path name="my_cache_images" path="." />
```

**Risk:** Capacitor’s default FileProvider is not exported (good), but `grantUriPermissions` is true. `external-path` with `path="."` is the **entire** external storage tree. If any future share/camera/file plugin grants a content URI, the grant can be broader than the file you intended. Unused today (no Camera/Filesystem plugin in `package.json`), but this is the stock hole that shows up at plugin add time.

**Remediation:** Narrow to a subdirectory you actually write (e.g. `path="Pictures/SilverCity"` or Capacitor’s cache dir only). Do not use `.` for external storage. Re-check the **merged** manifest after `npx cap sync` before Play.

---

### MED-4 — Vite `allowedHosts: true` on both `server` and `preview`

**Where:** `vite.config.ts` (`server.host` / `preview.host` and `allowedHosts: true`); `.stackblitzrc` starts `npm run dev -- --host`; README playtest is a public tunnel in front of `vite preview`.

**Risk:** `allowedHosts: true` turns off Vite’s Host-header check (documented DNS-rebinding protection). That matters if **`vite` / `vite --host` (dev)** is exposed beyond localhost. `vite preview` is a static server (narrower than the transform pipeline) but is still a public origin without CSP (see MED-5). Do not expose `npm start` / `npm run dev` on a tunnel.

**Remediation:**

- Production / Pages: ship `npm run build` output only (GitHub Actions already builds `dist`).
- For tunnels, prefer `vite preview` **or** the `docs/` / Actions artifact, not the dev server.
- Set `allowedHosts` to the explicit tunnel / Pages hostnames you need, not `true`.
- Keep `host: true` only when you intentionally listen on LAN.

---

### MED-5 — No CSP or other security headers on the web origin

**Where:** `index.html` (no `<meta http-equiv="Content-Security-Policy">`); GitHub Pages deploy (`.github/workflows/pages.yml` + `docs/`); Cloudflare tunnel playtest. `main.tsx` registers a Workbox service worker with `immediate: true` on web only.

**Risk:** There is **no current HTML XSS sink** (see “None found” below). Without CSP, a single future sink (Markdown, ad markup, `innerHTML`, a compromised font/CDN, a malicious SW update) becomes a full-origin script execution problem. GitHub Pages cannot set arbitrary headers; the app must ship a meta CSP or sit behind a host that can send `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, and a restrictive `frame-ancestors`.

Google Fonts (`fonts.googleapis.com` / `fonts.gstatic.com`) must be allowlisted if you add CSP. The PWA SW precaches same-origin assets only (good).

**Remediation:**

- Add a **strict CSP** in `index.html` now, while the app has no third-party scripts: `default-src 'self'`; `script-src 'self'`; `style-src 'self' fonts.googleapis.com` (or self-host fonts and drop Google); `font-src 'self' fonts.gstatic.com`; `img-src 'self' data: blob:`; `connect-src 'self'`; `base-uri 'self'`; `object-src 'none'`; `frame-ancestors 'none'`.
- Prefer self-hosted fonts so the policy stays `'self'`.
- When ads are wired, extend CSP with the **exact** ad origins — never `'unsafe-inline'` / `'unsafe-eval'` for ad HTML.
- If you move off GitHub Pages, set the same policy as HTTP headers (stronger than meta).

---

### MED-6 — Keystore / Google services ignore rules are commented out; CLI advisory in lockfile

**Where:**

- `android/.gitignore` — `*.jks` / `*.keystore` and `google-services.json` remain commented (Android template default). Root `.gitignore` does not ignore APKs or keystores (`releases/*.apk` is committed on purpose today).
- `npm audit --package-lock-only`: **uuid &lt; 11.1.1** (GHSA-w5hq-g745-h8pq, moderate) via `@capacitor/cli` → `xcode` → `uuid@7.0.3`. `@capacitor/cli` is in `dependencies` (not `devDependencies`).
- `serialize-javascript` in this lockfile is **7.1.1** (patched vs GHSA-5c6j-r48x-rmvq). **None found** for that advisory here.

**Risk:**

- The next person who adds a Play upload keystore or Firebase `google-services.json` can commit them unless gitignore is fixed first. **No live secrets, API keys, `.env`, or keystores are in the tree today.**
- The uuid advisory is **tooling**, not the WebView bundle. Still treat `npm audit` as a release gate; do not `npm audit fix --force` (it wants to downgrade Capacitor CLI).

**Remediation:**

- Uncomment `*.jks`, `*.keystore`, and `google-services.json` in `android/.gitignore`; add `*.p12`, `*.pem`, and `releases/*.apk` (or keep APKs in GitHub Releases, not git).
- Move `@capacitor/cli` to `devDependencies`.
- Override or wait for a Capacitor CLI release that pulls `uuid >= 11.1.1`. Re-run `npm audit` on every release.
- Add `gitleaks` / `trufflehog` (or GitHub secret scanning) to CI.

---

## Focus areas with no issue found

### 1. XSS / `dangerouslySetInnerHTML` / unsanitized HTML or Markdown

**None found.** No `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, Markdown renderer, or `srcDoc` in `src/`. Puzzle/journal/story copy is static TypeScript and rendered as React text. User “private sentence” is a controlled textarea (`maxLength={220}`) stored as a string; Journal does not currently render `progress.elaborations`. Keep it that way (or React-text only). Do not later pipe save fields or elaborations through Markdown/HTML without a sanitizer.

### 2. Unsafe external links (`target=_blank` / `openURL`)

**None found.** No `<a target="_blank">`, no Capacitor `Browser.open`, no `window.open`. `ShareInvite` uses `navigator.share` / clipboard with `window.location.href` (same origin). No custom URL schemes or App Links in the manifest.

### 3. Ad-slot injection (current code)

**None found for live third-party script load.** `adsEnabledDefault` is `false`. `AdSlot` renders static labeled placeholders (`src/components/AdSlot.tsx`, `src/config/ads.ts`) on Hub (`hub-banner`, `between-districts`). `after-daily` is defined but not mounted. The Settings toggle only shows those placeholders; it does not inject a network SDK.

**Release note (still do this before going live with ads):** load the official SDK only (no `innerHTML` of ad markup, no remote script URL from `localStorage`). Treat `silver-city-ads` as a UX pref, not a security control. Extend CSP (MED-5) with vendor origins. Never cover Keep/Toss, RecallGate, or Journal (already documented in `ADS_NEVER_COVER`).

### 4. Secrets in repo

**None found** (no `.env`, tokens, PEM/JKS, `google-services.json`, or API keys in tracked files). Residual process gap is MED-6 (gitignore). The Cloudflare tunnel URL in README is a playtest origin, not a credential.

### 5. Deep links / exported components (beyond HIGH-1 / MED-2 / MED-3)

**None found** for extra exported activities, custom `intent-filter`s, or `usesCleartextTraffic="true"`. `MainActivity` is `exported="true"` solely for `MAIN`/`LAUNCHER` (required). FileProvider `exported="false"`. Only `INTERNET` is declared. Confirm the **merged** manifest after Capacitor sync before Play.

### 6. Runtime npm packages in the shipped client

React, React DOM, Capacitor Android/core, and Vite-built app code: **no High/Critical `npm audit` hits on the web runtime tree.** The moderate uuid finding is CLI-only (MED-6). `vite-plugin-pwa` → `workbox-build` in this lockfile already pulls `serialize-javascript@7.1.1`.

---

## Release checklist

Use this before a public web cut or Play upload.

### Secrets scan

- [ ] `gitleaks` / GitHub secret scanning clean on the release tag.
- [ ] `android/.gitignore` ignores `*.jks`, `*.keystore`, `google-services.json`.
- [ ] Release keystore only in the Play Console / CI secret store — never git, never the debug APK path.
- [ ] No `.env`, Cloudflare tokens, or signing passwords in README / PR text.

### Dependency advisories

- [ ] `npm audit` (and `npm audit --omit=dev`) on the release lockfile; record accepted tooling-only items (e.g. Capacitor CLI `uuid`) in the release notes.
- [ ] Do not `--force` audit fixes that downgrade Capacitor.
- [ ] Re-check `serialize-javascript` stays `>= 7.0.5` (currently 7.1.1).
- [ ] Move `@capacitor/cli` to `devDependencies` unless you have a reason it ships.

### CSP / security headers (web / PWA)

- [ ] CSP in `index.html` (and HTTP headers if the host allows).
- [ ] `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `frame-ancestors 'none'` (or `X-Frame-Options: DENY` where headers exist).
- [ ] GitHub Pages: assume **no** custom headers — meta CSP is the control; or front the app with Cloudflare/Pages Functions.
- [ ] Service worker still same-origin only; `registerSW` stays gated with `!Capacitor.isNativePlatform()`.
- [ ] Self-host fonts **or** explicitly allow Google Font origins in CSP.

### Android export hardening

- [ ] Merged manifest review: no unexpected `exported="true"`, no extra intent filters, no cleartext.
- [ ] `allowMixedContent: false`; optional `network_security_config.xml` that denies cleartext.
- [ ] Narrow `file_paths.xml`; FileProvider remains unexported.
- [ ] `allowBackup`: keep `true` only if you want Google backup of WebView/`localStorage` (progress + optional private sentence). Set `false` or use a backup exclude if that is too much for the threat model.
- [ ] Release/playtest APK: `debuggable false`, private key, not `CN=Android Debug`.
- [ ] `minifyEnabled` / R8 for Play; drop `releases/silver_city_debug.apk` from the public README.
- [ ] No `server.url` pointing the WebView at a remote origin unless that origin is first-party HTTPS with CSP.

### Save-import validation

- [ ] Size cap before parse; confirm on file import; skip prototype-polluting keys; `Object.create(null)` maps.
- [ ] Strict `kind` + schema version range; finite/bounded numbers; date-key format; string/array caps (including elaborations).
- [ ] Imported text still never rendered as HTML.
- [ ] `scripts/check-save.mjs` covers reject paths (oversize, junk keys, newer schema).
- [ ] Settings copy states that import **replaces** this device’s save and that share codes are secret-equivalent for that save.

### Ads (when no longer placeholders)

- [ ] Official SDK only; no string-to-DOM for creatives.
- [ ] CSP allowlist of ad origins; no `'unsafe-eval'`.
- [ ] Slots stay out of Keep/Toss, takeaway, RecallGate, Journal due cards.
- [ ] Product flag default-off until the SDK is reviewed.

---

## Low / info (only where it affects release)

- **`android:allowBackup="true"`** — WebView storage (progress, optional private sentence) can be included in device backups. Fine for a game; turn off or exclude if you treat elaborations as sensitive.
- **`minifyEnabled false`** on the Gradle `release` type — store builds should enable shrinking.
- **City snapshot `localStorage`** (`src/lib/city.ts` `readCitySeen`) is parsed with little schema checking and interpolated into CSS class suffixes (`is-${stage}`). Same-origin only; not HTML. Still validate enum stages before use.
- **Google Fonts** — extra network dependency in an otherwise offline-first APK/PWA; privacy + CSP cost. Self-host for release.
- **Pages deploy from this feature branch** (workflow `on.push.branches` includes `cursor/silver-city-unending-evidence-8233`) — every push goes live. Restrict to `main` (or tags) for a stable public origin.
- **PWA `registerType: 'autoUpdate'`** — good for shipping fixes; testers may need a hard reload if a SW cached an old bundle (already noted in the PR).
- **`@capacitor/cli` in `dependencies`** — pulls audit noise into production installs; belongs in `devDependencies`.
- **No custom ProGuard keep rules** — unused until JS interfaces or reflection appear; Capacitor’s defaults are enough today.

---

## Out of scope / not claimed

- No dynamic DAST, device lab, or Play pre-launch report.
- No decompilation of Capacitor’s WebView defaults beyond config and the stock `BridgeActivity`.
- npm audit is lockfile-based; always re-run after `npm ci` on the release machine.
