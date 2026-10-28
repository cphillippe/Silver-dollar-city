#!/usr/bin/env node
/**
 * #871 Easy type floors must only raise sizes vs main — never shrink preserved baselines.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

/** Main-branch computed targets at 375×667 (Easy). Floors must be >= min; preserved must match exactly. */
export const MAIN_EASY_TYPE_BASELINES = {
  fatherCaption: { selector: '.play.is-father-run .story-caption', px: 15 },
  fatherSpeechLine: { selector: '.play.is-father-run .run-speech-line', px: 18 },
  /** Main at 375×667 uses gem.css @430px sort-how 0.95rem (~15.2px), not the 1.02rem desktop rule. */
  gemSortHow: { selector: '.play.is-gem-search .sort-how', px: 15.2, tolerance: 0.6 },
  gemTeachSay: { selector: '.play.is-gem-search .match-teach-say', px: 14, tolerance: 0.05 },
  /** Main inherits .gem-cell clamp(0.92rem, 4.4vw, …) — must not get the 13px :is() floor. */
  gemLetter: {
    selector: '.play.is-gem-search .gem-letter',
    byViewport: { 375: 16.5, 390: 17.16 },
    tolerance: 0.25,
  },
}

export function assertTypeFloorCss() {
  const father = readFileSync(new URL('../src/styles/fatherRunHint.css', import.meta.url), 'utf8')
  const gem = readFileSync(new URL('../src/styles/gem.css', import.meta.url), 'utf8')
  const loci = readFileSync(new URL('../src/styles/loci-stamp.css', import.meta.url), 'utf8')

  assert.match(
    father,
    /#871:[\s\S]*:is\(\.run-speech-kicker, \.run-speech-count, \.match-score\)[\s\S]*font-size: 0\.8125rem/,
    '#871 father floor targets only sub-13px speech chrome',
  )
  assert.doesNotMatch(
    father,
    /:is\(\.story-caption, \.run-speech-line/,
    '#871 father floor must not shrink caption or speech line',
  )

  assert.doesNotMatch(
    gem,
    /#871:[\s\S]*:is\([\s\S]*\.sort-how,/,
    '#871 gem :is() floor must not include sort-how',
  )
  assert.doesNotMatch(
    gem,
    /#871:[\s\S]*:is\([\s\S]*\.match-teach-say,/,
    '#871 gem teach say uses 14px rule outside the 13px :is() block',
  )
  assert.doesNotMatch(
    gem,
    /#871:[\s\S]*:is\([\s\S]*\.gem-letter,/,
    '#871 gem :is() floor must not shrink grid letters',
  )
  assert.match(
    gem,
    /html\[data-easy='on'\] \.play\.is-gem-search \.match-teach-say[\s\S]*?font-size: 0\.875rem/,
    '#871 Easy match-teach-say stays at 14px',
  )
  assert.match(
    loci,
    /html\[data-easy='on'\][\s\S]*\.match-teach-say[\s\S]*?font-size: 0\.875rem/,
    '#871 loci teach say matches 14px floor',
  )
}

export async function assertMainEasyTypeBaselines(page, label) {
  async function fontPx(selector) {
    const loc = page.locator(selector).first()
    if ((await loc.count()) === 0) return NaN
    return loc.evaluate((node) => parseFloat(getComputedStyle(node).fontSize))
  }

  for (const [key, spec] of Object.entries(MAIN_EASY_TYPE_BASELINES)) {
    const px = await fontPx(spec.selector)
    if (!Number.isFinite(px)) continue
    const tol = spec.tolerance ?? 0.05
    if (key === 'fatherCaption' || key === 'fatherSpeechLine') {
      assert.ok(
        Math.abs(px - spec.px) <= tol,
        `#871 ${label} ${key} stays main ${spec.px}px (got ${px}px)`,
      )
    } else if (key === 'gemSortHow') {
      assert.ok(
        px >= spec.px - tol,
        `#871 ${label} ${key} must not shrink below main ~${spec.px}px (got ${px}px)`,
      )
    } else if (key === 'gemTeachSay') {
      assert.ok(
        Math.abs(px - spec.px) <= tol,
        `#871 ${label} ${key} stays ${spec.px}px teach floor (got ${px}px)`,
      )
    } else if (key === 'gemLetter') {
      const w = page.viewportSize()?.width ?? 0
      const minPx = spec.byViewport?.[w]
      if (!minPx) continue
      assert.ok(
        px >= minPx - tol,
        `#871 ${label} ${key} must not shrink below main ~${minPx}px at ${w}w (got ${px}px)`,
      )
    }
  }
}

if (import.meta.url.startsWith('file:') && process.argv[1]?.endsWith('check-type-floor-baseline.mjs')) {
  assertTypeFloorCss()
  console.log('check-type-floor-baseline: css ok')
}
