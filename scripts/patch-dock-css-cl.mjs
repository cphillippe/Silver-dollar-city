#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCK_CSS = ".play.is-gem-search.is-panel-blast.is-story-docked .story-strip.is-dock {\n  flex-shrink: 0;\n  position: relative;\n  z-index: 6;\n  width: 100%;\n  max-width: none;\n  margin: 0;\n  padding: 4px 6px 6px;\n  gap: 2px;\n  border: 0;\n  border-radius: 14px;\n  background: linear-gradient(180deg, rgba(26, 8, 64, 0.98), rgba(26, 8, 64, 0.9));\n  box-shadow: 0 4px 0 rgba(80, 20, 40, 0.28);\n  color: inherit;\n  font: inherit;\n  text-align: left;\n  cursor: pointer;\n  -webkit-tap-highlight-color: transparent;\n}\n\n.play.is-gem-search.is-panel-blast.is-story-docked .story-strip.is-dock:focus-visible {\n  outline: 3px solid rgba(255, 204, 51, 0.95);\n  outline-offset: 2px;\n}\n\n.story-strip.is-dock .story-kicker.is-dock {\n  margin: 0;\n  font-size: 0.62rem;\n  letter-spacing: 0.06em;\n  opacity: 0.9;\n}\n\n.story-dock-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  min-width: 0;\n}\n\n.story-strip.is-dock .story-thumbs {\n  flex: 0 0 auto;\n  width: min(46%, 168px);\n  gap: 3px;\n}\n\n.story-strip.is-dock .story-thumb {\n  max-height: 36px;\n}\n\n.story-dock-words {\n  display: flex;\n  flex: 1 1 auto;\n  flex-wrap: wrap;\n  gap: 4px;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n  min-width: 0;\n}\n\n.story-dock-word {\n  padding: 2px 7px;\n  border-radius: 999px;\n  background: rgba(255, 246, 216, 0.12);\n  border: 1px solid rgba(255, 204, 51, 0.35);\n  color: var(--parchment);\n  font-size: 0.68rem;\n  font-weight: 800;\n  letter-spacing: 0.04em;\n  text-transform: uppercase;\n  line-height: 1.2;\n}\n\n.story-dock-word.is-found {\n  background: rgba(61, 204, 122, 0.22);\n  border-color: rgba(61, 204, 122, 0.7);\n  color: #d9ffe8;\n  text-decoration: line-through;\n  opacity: 0.85;\n}\n\n.story-dock-juice {\n  position: absolute;\n  right: 10px;\n  top: -6px;\n  z-index: 2;\n  padding: 4px 10px;\n  border-radius: 999px;\n  background: linear-gradient(180deg, #fff6b8, #ffcc33);\n  color: #2a1408;\n  font-size: 1.05rem;\n  font-weight: 900;\n  letter-spacing: 0.04em;\n  box-shadow: 0 3px 0 #c46a08;\n  animation: story-dock-juice-pop 1.05s cubic-bezier(0.2, 1.35, 0.3, 1) both;\n  pointer-events: none;\n}\n\n@keyframes story-dock-juice-pop {\n  0% { transform: translateY(8px) scale(0.6); opacity: 0; }\n  35% { transform: translateY(-4px) scale(1.18); opacity: 1; }\n  100% { transform: translateY(-16px) scale(1); opacity: 0; }\n}\n\n.story-sheet {\n  position: absolute;\n  inset: 0;\n  z-index: 30;\n  display: grid;\n  place-items: end center;\n  padding: 12px 10px max(16px, env(safe-area-inset-bottom));\n  background: rgba(10, 2, 28, 0.55);\n  backdrop-filter: blur(2px);\n}\n\n.story-sheet-card {\n  width: min(100%, 420px);\n  max-height: min(78vh, 640px);\n  overflow: auto;\n  -webkit-overflow-scrolling: touch;\n  padding: 12px 12px 14px;\n  border-radius: 18px;\n  background: linear-gradient(180deg, rgba(36, 12, 72, 0.98), rgba(22, 6, 48, 0.96));\n  border: 2px solid rgba(255, 204, 51, 0.45);\n  box-shadow: 0 12px 0 rgba(80, 20, 40, 0.35);\n}\n\n.story-sheet-close {\n  display: block;\n  margin: 0 0 8px auto;\n  padding: 6px 12px;\n  border-radius: 999px;\n  border: 1px solid rgba(255, 246, 216, 0.35);\n  background: rgba(255, 246, 216, 0.1);\n  color: var(--parchment);\n  font-weight: 800;\n  cursor: pointer;\n}\n\n.story-sheet-grid {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 8px;\n  margin-bottom: 8px;\n}\n\n.story-sheet-panel {\n  aspect-ratio: 1;\n  border-radius: 14px;\n  overflow: hidden;\n  background: #1a0840;\n  box-shadow: 0 4px 0 rgba(80, 20, 40, 0.28);\n  display: grid;\n  place-items: center;\n}\n\n.story-sheet-panel.is-sealed {\n  background:\n    repeating-linear-gradient(135deg, #ffcc33 0 10px, #ffb020 10px 20px);\n}\n\n.story-sheet-card .story-dock-words {\n  margin: 0 0 8px;\n}\n\n.play.is-gem-search.is-panel-blast.is-story-docked .gem-scroll {\n  flex: 1 1 auto;\n  min-height: 0;\n}\n\n";
const CHANGELOG_ENTRY = "  {\n    version: '1.4.97',\n    title: 'Match story dock \u00b7 Easy core trail',\n    when: '2026-09-20',\n    items: [\n      'Match: story pictures start big, then dock to a tiny top bar so the crossword owns the screen; tap the bar to expand. Dock collapse awards +1000 arcade juice',\n    ],\n  },\n";

// --- index.css ---
const cssPath = path.join(root, 'src/index.css');
let css = fs.readFileSync(cssPath, 'utf8');
if (css.includes('is-story-docked')) {
  console.log('index.css already has dock CSS');
} else {
  const marker = '.play.is-gem-search.is-panel-blast .gem-scroll';
  let insertAt = -1;
  let i = css.indexOf(marker);
  if (i >= 0) {
    let j = i;
    for (let n = 0; n < 40; n++) {
      const k = css.indexOf('\n}', j);
      if (k < 0) break;
      j = k + 2;
      const rest = css.slice(j).replace(/^\s+/, '');
      if (
        !rest.startsWith('.play.is-gem-search') &&
        !rest.startsWith('.story-strip') &&
        !rest.startsWith('/*')
      ) {
        break;
      }
    }
    insertAt = j;
  }
  if (insertAt < 0) insertAt = css.length;
  css =
    css.slice(0, insertAt) +
    '\n\n/* Match story dock 1.4.97 — board owns screen */\n' +
    DOCK_CSS +
    '\n' +
    css.slice(insertAt);
  fs.writeFileSync(cssPath, css);
  console.log('patched index.css', css.length);
}

// --- changelog.ts ---
const clPath = path.join(root, 'src/content/changelog.ts');
let cl = fs.readFileSync(clPath, 'utf8');
if (cl.includes("version: '1.4.97'")) {
  console.log('changelog already has 1.4.97');
} else {
  const needle = 'export const CHANGELOG: ChangeNote[] = [\n';
  if (!cl.includes(needle)) {
    console.error('CHANGELOG needle missing');
    process.exit(1);
  }
  cl = cl.replace(needle, needle + CHANGELOG_ENTRY);
  fs.writeFileSync(clPath, cl);
  console.log('patched changelog.ts', cl.length);
}

// --- check-gem-search.mjs ---
const checkPath = path.join(root, 'scripts/check-gem-search.mjs');
let check = fs.readFileSync(checkPath, 'utf8');
let checkChanged = false;
if (!check.includes('MATCH_DOCK_JUICE_POINTS')) {
  if (!check.includes("  MATCH_BONUS_POINTS,\n  MATCH_MISS_POINTS,\n} from '../src/lib/matchBonus.ts'")) {
    console.error('check import needle missing');
    process.exit(1);
  }
  check = check.replace("  MATCH_BONUS_POINTS,\n  MATCH_MISS_POINTS,\n} from '../src/lib/matchBonus.ts'", "  MATCH_BONUS_POINTS,\n  MATCH_DOCK_JUICE_POINTS,\n  MATCH_MISS_POINTS,\n} from '../src/lib/matchBonus.ts'");
  checkChanged = true;
}
if (!check.includes('assert.equal(MATCH_DOCK_JUICE_POINTS, 1000)')) {
  if (!check.includes("assert.equal(MATCH_BONUS_POINTS, 100)\nassert.equal(MATCH_MISS_POINTS, 25)")) {
    console.error('check eq needle missing');
    process.exit(1);
  }
  check = check.replace("assert.equal(MATCH_BONUS_POINTS, 100)\nassert.equal(MATCH_MISS_POINTS, 25)", "assert.equal(MATCH_BONUS_POINTS, 100)\nassert.equal(MATCH_DOCK_JUICE_POINTS, 1000)\nassert.equal(MATCH_MISS_POINTS, 25)");
  checkChanged = true;
}
if (!check.includes('is-story-docked')) {
  if (!check.includes("assert.match(playSrc, /is-panel-blast/)\nassert.match(playSrc, /StoryStrip/)")) {
    console.error('check play needle missing');
    process.exit(1);
  }
  check = check.replace("assert.match(playSrc, /is-panel-blast/)\nassert.match(playSrc, /StoryStrip/)", "assert.match(playSrc, /is-panel-blast/)\nassert.match(playSrc, /is-story-docked/)\nassert.match(playSrc, /recordMatchDockJuice/)\nassert.match(playSrc, /MATCH_DOCK_JUICE_POINTS/)\nassert.match(playSrc, /StoryStrip/)");
  checkChanged = true;
}
if (!check.includes('story-strip.is-dock') && check.includes('assert.match(gemCss, /pointer-events: none/)')) {
  check = check.replace(
    'assert.match(gemCss, /pointer-events: none/)',
    'assert.match(gemCss, /pointer-events: none/)\n' + "\nassert.match(gemCss, /is-story-docked/)\nassert.match(gemCss, /\\.story-strip\\.is-dock/)\nassert.match(gemCss, /\\.story-sheet/)\n".trim()
  );
  checkChanged = true;
}
if (checkChanged) {
  fs.writeFileSync(checkPath, check);
  console.log('patched check-gem-search.mjs', check.length);
} else {
  console.log('check-gem-search.mjs already has dock asserts');
}
