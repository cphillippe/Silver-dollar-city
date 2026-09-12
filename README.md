# Silver City: Unending Evidence

A progressive web app — playable in the browser — that walks the case for God as a mountain-town adventure. You move through themed districts, finish challenges, and fill an Evidence Journal. The trail always names a next step.

The product goal is **keeping the evidence**: claims, reasons, and sources you can still say after the page folds. Puzzles, streaks, polish, and a small Christian cast are the delivery system — the game has to be fun enough to play, or nothing is retained.

A stranger should know in 60 seconds: this is a **Christian reasoning game**. Sort ideas, choose one takeaway, remember why it stands tomorrow. You are **River**. **Juniper** is your guide. Each day you practice one Christian idea. The town map lights when a line holds.

## Play now (no install)

**Sticky public preview (GitHub Pages):**  
https://cphillippe.github.io/Silver-dollar-city/

Hard-reload once if you still see the old game (the PWA can keep a cached copy). Live bundle is published with V0 **1.4.43**. **Easy mode** is off by default — check **Easier words · bigger taps** on Welcome, or Settings → Reading → Easy mode. Easy home is Match → Hold. Town (soon) waits under Settings → More. Night Watch stays on Hard until Match→Hold is solid. We teach hard words first: a claim is the main idea we hold to be true. After that, Easy buttons say main idea. After a win, say the line out loud; Dig deeper holds the reason. Open **Profile** from Town or Settings for every unlock.

Pages deploys `docs/` from `main` once that source is selected. Until then the same `docs/` is also on `cursor/silver-city-unending-evidence-8233`. Hard-reload github.io after it updates.

Skip older trycloudflare links. Skip StackBlitz.

## The story

**River** arrives in Silver City with a folded letter: the evidence is a trail, not a shout. **Juniper Wick** lights the east porch each morning (Today’s Trail). Five Christians already live on the longer trail and walk with you — they will not lock you in a pew:

| Guide | District | Role |
| --- | --- | --- |
| Mercy Wren | Story Creek | Parable-teller |
| Silas Whitman | Witness Square | Witness clerk |
| Nora Skye | Sky Watch | Sky-watch keeper |
| Ansel Gate | Why Gate | Why-gate keeper |
| Hope Ridge | Meaning Ridge | Meaning-ridge keeper |

Portraits are candy circular faces (`src/assets/cast/`, `src/components/Avatar.tsx`). Light dialogue, not sermons.

The town map is a memory walk, not a flat list: you arrive at Juniper’s east porch (a lamp is meant to be seen), then Mercy’s creek for Jesus pictures, Silas’s square for the public creed, Nora’s ridge for the sky’s fit, Ansel’s east-road gate for why there is a world, and Hope’s lookout for duty, mind, meaning, and beauty. River’s dossier house holds pages you can still say. Star lamps remember walks you kept.

The world is **Silver City**, named for this repository. The through-line is unending evidence: biblical narrative, eyewitness testimony, empirical clues, classical cosmological arguments, and later questions of mind, morality, meaning, and beauty.

The tone is respectful. Arguments are framed as claims with sources and limits — not slogans, and not mockery of doubt.

## Play

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

Production build:

```bash
npm run build
npm run preview
```

`vite preview` listens on **127.0.0.1**. Do not tunnel `vite --host` (unbound / `0.0.0.0`) or the Vite **dev** server. A playtest tunnel should front `vite preview` or the `docs/` build only.

Progress is stored **offline-first on this device** (versioned save, same localStorage key). Open **Settings** for Export / Import. **Profile** (Town tools or Settings) lists every unlock. **Reset progress** lives only in Settings → Danger zone and asks before it wipes the save.

Installable as a PWA (Add to Home Screen) after a production build, or as an Android debug APK (below).

## Android debug APK

**Direct download (debug, sideload):**  
https://github.com/cphillippe/Silver-dollar-city/raw/cursor/silver-city-unending-evidence-8233/releases/silver_city_debug.apk

Same file in the repo: [`releases/silver_city_debug.apk`](https://github.com/cphillippe/Silver-dollar-city/blob/cursor/silver-city-unending-evidence-8233/releases/silver_city_debug.apk)

App id: `city.silver.unending` · name: **Silver City**. This is a **debug** build for testing, not a Play Store release.

**Install on a phone**

1. Open the download link on the phone (or copy the APK over USB/Drive).
2. Settings → Security → allow **Install unknown apps** for Chrome/Files.
3. Open the APK and tap Install.

Rebuild locally (needs Android SDK + JDK 17+, `ANDROID_HOME` or `ANDROID_SDK_ROOT`):

```bash
npm install
npm run android:apk
```

Gradle writes `android/app/build/outputs/apk/debug/app-debug.apk`. Copy it to `releases/silver_city_debug.apk` if you want the committed download file updated.

## How it works

1. **Today’s Trail** — one short puzzle each local calendar day. Completing the walk marks a gentle streak and can unseal trail notes. Miss a day and **the trail waits** — marks you already made stay. After a solve you see a locked **tomorrow teaser**.
2. **Recall Loop** — after the snap, the teaching folds. You rebuild **one claim + one reason** (retrieval practice). Two misses and the line is spoken, then you walk on. A peek marks the attempt as helped. Held lines are the real score. A later revisit uses a new angle and Dig deeper — not the first teach again.
3. **Spacing** — each locked line stores `nextReviewAt` in `localStorage`. Clean recalls expand the gap (~1, then 3, then 7, then 21 local days). A miss or peek brings it back tomorrow. Due pages are an **offer** — Later or Not today, no guilt — and a sitting is about **3**, not the whole journal. The queue **interleaves districts** so you don’t drill one pillar in a block.
4. **Say it back** — optional, skippable once: pick the load-bearing premise, and (if you want) one local sentence in your own words. That teach-back is how a line reaches 3★.
5. **Map** — five districts on one trail. Completing a district unbars the next. Finished districts stay playable. Stars are **mastery**, not a no-miss trophy: 1★ first walk, 2★ held after a rest, 3★ held after a rest and said back (or a second clean recall later).
6. **Puzzles** — order chains, snap-pairs, keep-or-toss bins, and build-the-argument. Misses shake and retry before a fuller hint.
7. **Evidence Journal** — unsealed vs sealed, % complete, mystery slots from Daily Trail, **due-for-recall** pages, and landmark marks (visual + verbal cues). Open pages start face-down.
8. **What’s next** — a persistent goal bar. **Held** counts lines you rebuilt from memory. **Due** counts pages waiting to be dusted off.

## Recall Loop / spacing (for the player)

The science stays inside the game — not a flashcard deck.

- After you solve, the long page folds. You snap the claim, then the reason, the way you snapped the puzzle.
- Forgetting is expected. When a line has rested, Today’s Trail often **resurfaces that same walk** instead of only a brand-new puzzle. Copy stays warm: the trail brings it back because memory needs the practice, not because you failed.
- Gaps grow after a clean recall: **about 1 day, then 3, 7, then 21**. Peeking or missing keeps the line close (back tomorrow) without deleting stars you already earned.
- Journal cards show the landmark for that district and whether a page is due this morning. Dual cues: a picture of the place plus the sentence.
- Optional “say it back” (load-bearing premise + a private sentence) is skippable so it doesn’t kill pace. Doing it is how mastery reaches three stars.

Progress shape (same key `silver-city-progress-v1`): `memory[id].nextReviewAt`, `intervalIndex`, `elaborated`, plus `stars` 1–3.

## Daily Trail and streaks

- Timezone: the device’s local calendar (`YYYY-MM-DD`).
- New-content pick (when nothing is due): `hash("silver-city-trail:" + date) % pool` over `src/content/daily.ts`.
- Due pick (when something has rested): mix pillars, prefer a different district than last time (`src/lib/memory.ts`).
- Streak: consecutive local days with a completed trail. A gap starts a new count (`The trail waited. Welcome back.`) without deleting journal cards, stars, held lines, or the recall schedule.
- Trail notes unseal after 1, 2, 3, 5, and 7 **distinct** mornings (replaying today does not count twice).
- Stars follow mastery (encode → spaced recall → teach-back), not a same-session no-miss badge.

## Friend preview (no install)

**Sticky:** https://cphillippe.github.io/Silver-dollar-city/ (hard-reload once if a cached PWA shows the old game).

Skip older trycloudflare links. Use the Pages URL above.

On the web app, tap **Share a morning**. The pitch is not a high score. It asks a friend to try the walk, fold the page, and see what they can still say.

Playtest notes live in [`PLAYTEST.md`](PLAYTEST.md).

## Districts

| District | Pillar |
| --- | --- |
| Story Creek | Biblical narrative and lessons |
| Witness Square | Gospels, the 1 Corinthians 15 creed, historical method |
| Sky Watch | Fine-tuning, “why something rather than nothing,” origin of life (carefully framed) |
| Why Gate | First mover, contingency, kalām — and what those arguments do *not* yet prove |
| Meaning Ridge | Morality, consciousness, meaning, beauty |

## Progress

Saves are **offline-first**. Nothing requires a login.

- **Key:** `localStorage` `silver-city-progress-v1` (unchanged, so existing playtest saves still load).
- **Envelope:** `{ kind: "silver-city-save", schemaVersion, appVersion, savedAt, progress }`. Unversioned gameplay objects from earlier builds are migrated on read, then rewritten as an envelope. Stars, journal, Daily dates, held lines, and `memory[id]` are kept.
- **Schema:** `SAVE_SCHEMA_VERSION` in `src/config/app.ts`. Bump it only when the persisted shape changes, and add a step in `src/lib/save.ts` `migrateToCurrent`. Do not wipe on upgrade.
- **Move devices:** Settings → **Export JSON** (file) or **Copy share code** (`SC1.…`). Import file or paste on the other device. Import replaces this device’s save and keeps a backup key (`silver-city-progress-v1.bak`).
- **Cloud:** not shipped. `cloudSyncStatus()` is `local-only` until there is real auth. Optional keys can be added later without dropping v1 fields.
- **UI:** Hub is the **overworld town** on Hard. Completing Daily / districts / journal / stars lights buildings you **manage and upgrade** by tapping. Tap a place to open its **manage** sheet (person + idea nodes). **Profile** (Town tools or Settings) lists River plus every unlock. **Dig deeper** on Hold, Journal, mind map, and Profile: Scripture and older witnesses when they fit; later faithful sources welcome when they help. Settings shows **What’s new** plus schema and app version (`1.4.43`). **Easy mode** (Welcome or Settings → Reading) hides the Town map: home is Match → Hold, and Town (soon) waits under Settings → More. Night Watch stays on Hard. Easy teaches hard words first (a claim is the main idea we hold to be true) and then uses main idea in buttons. After every win you say the line out loud. Reset progress lives only in Settings → Danger zone.

## The town

The hub is an **overworld map**, not a locked list. Buildings are derived from the same save (no extra schema):

| Landmark | Appears | Lights |
| --- | --- | --- |
| East porch | Always (scaffold) | 1 Daily built · 3 mornings lit |
| Story Creek | After first Daily | Walks build it · all four light it |
| Witness Square | After **two** Creek walks | Same pattern |
| Sky Watch / Why Gate / Meaning Ridge | After the previous district is finished | Same |
| Dossier house | First journal page | 4 pages built · 12 lit |
| Star lamps | First star | 4★ built · 12★ lit |

The gold ring is **what to unlock next**. Tap a building to open that lot’s **mind map** (who lives there + the claims you unlocked). **Link the street** snaps idea ↔ place ↔ person and lights those nodes. The legend button still walks the next lot. When a landmark rises, the camera punches in with sparks and a **Built!** / **Lit!** beat — empty lots become roofs, not outline counters.

## Ads

No live ad network in this build. Slots are empty, labeled placeholders behind a flag.

- **Flag:** `adsEnabledDefault` in `src/config/ads.ts` is **false** (playtest). Settings can show placeholders on this device only.
- **Slots:** hub banner (under Today’s Trail), once between Story Creek and Witness Square, after Daily **complete** (teaser screen).
- **Must never be blocked or covered:** Keep/Toss and Lock in the sort; takeaway / RecallGate; Journal due cards; puzzle boards. Ads are in-flow boxes, not overlays, and they do not mount on Trail/challenge/Journal play chrome.

Wire a test unit later by teaching `AdSlot` to render the network creative when `adsEnabledDefault` is true — still only in those three slots.

## Support

- **Version:** app `1.4.43` V0 (`package.json`, `src/config/app.ts`, Android `versionName`). Capacitor id `city.silver.unending`. `npm run android:apk` still builds the debug APK. Settings → **What’s new** (`src/content/changelog.ts`) is the hook for later packs.
- **Content packs:** core trail is `CONTENT_PACKS` in [`src/content/packs.ts`](src/content/packs.ts). Next drop: new Area module → register in `index.ts` → one pack row → changelog row → journal/evidence/city/tools. Details: [`src/content/README.md`](src/content/README.md).
- **Release smoke:** [`PLAYTEST.md`](PLAYTEST.md) (fun / clarity / retention plus the short checklist).
- **Playtest notes:** same file.

## Stack

React 19, TypeScript, Vite, `vite-plugin-pwa`, Capacitor Android. No backend.
