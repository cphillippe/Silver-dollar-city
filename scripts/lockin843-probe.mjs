/**
 * Browser-side probes for the #843 Lock In checks. Every function here is passed to
 * `page.evaluate`, so each one must be self-contained (no imports, no closures).
 */

/** Gold cues on screen, innermost-first de-duplicated. H1 counts these. */
export function goldCues() {
  const goldish = (value) => {
    const re = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?/g
    let match
    while ((match = re.exec(value || ''))) {
      const r = Number(match[1])
      const g = Number(match[2])
      const b = Number(match[3])
      const a = match[4] === undefined ? 1 : Number(match[4])
      if (a >= 0.5 && r > 190 && g > 140 && b < 120 && r > b + 60 && g > b + 30) return true
    }
    return false
  }
  const visible = (el) => {
    const st = getComputedStyle(el)
    const box = el.getBoundingClientRect()
    return st.display !== 'none' && st.visibility !== 'hidden' && box.width > 2 && box.height > 2
  }
  const hits = []
  for (const el of document.querySelectorAll('*')) {
    if (!visible(el)) continue
    const st = getComputedStyle(el)
    const cls = el.classList
    const named =
      (cls.contains('btn') && (cls.contains('gold') || cls.contains('primary'))) ||
      el.hasAttribute('data-gold-cue')
    const sides = ['Top', 'Right', 'Bottom', 'Left'].map((side) => ({
      color: st[`border${side}Color`],
      width: parseFloat(st[`border${side}Width`]),
      style: st[`border${side}Style`],
    }))
    const paints =
      [st.backgroundColor, st.backgroundImage].some(goldish) ||
      sides.some((side) => side.width > 0 && side.style !== 'none' && goldish(side.color))
    if (named || paints) hits.push(el)
  }
  const top = hits.filter((el) => !hits.some((other) => other !== el && other.contains(el)))
  return top.map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`)
}

/**
 * Gold cues on a QuickReview screen. QuickReview marks its one cue with `.is-now`
 * (gold text or a gold rim), so that class counts next to the painted cues from goldCues.
 */
export function keptGoldCues() {
  const painted = window.__probe.goldCues()
  const visible = (el) => {
    const st = getComputedStyle(el)
    const box = el.getBoundingClientRect()
    return st.display !== 'none' && st.visibility !== 'hidden' && box.width > 2 && box.height > 2
  }
  const label = (el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`
  const now = [...document.querySelectorAll('.app-body .is-now')].filter(visible)
  const topNow = now.filter((el) => !now.some((other) => other !== el && other.contains(el)))
  const named = new Set(painted)
  return [...painted, ...topNow.map(label).filter((entry) => !named.has(entry))]
}

/** Text and tap-target font sizes under the H2 floors. Teach text 14px, everything else 13px. */
export function fontViolations() {
  const teach = '.why-miss-hint, .why-miss-answer, .lockin-recall-claim, .why-keep-card .match-yes span, .why-keep-card .held-from'
  const bad = []
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    const node = walker.currentNode
    const text = node.textContent.trim()
    if (!text) continue
    const el = node.parentElement
    if (!el || el.closest('header, nav, [aria-hidden="true"], script, style')) continue
    const st = getComputedStyle(el)
    const box = el.getBoundingClientRect()
    if (st.display === 'none' || st.visibility === 'hidden' || box.width < 2 || box.height < 2) continue
    const size = parseFloat(st.fontSize)
    const floor = el.closest(teach) ? 14 : 13
    if (size < floor) bad.push(`${floor}px floor: ${size}px "${text.slice(0, 40)}"`)
  }
  return bad
}

/** Text of the screen under Home chrome, whitespace collapsed. */
export function screenText() {
  const root = document.querySelector('.app-body') ?? document.body
  return (root.innerText || '').replace(/\s+/g, ' ').trim()
}

/** Computed look of each card, to prove the cards match before a pick. */
export function chipLooks() {
  return [...document.querySelectorAll('.why-chip')].map((el) => {
    const st = getComputedStyle(el)
    const box = el.getBoundingClientRect()
    return {
      text: el.textContent.trim(),
      fontSize: st.fontSize,
      color: st.color,
      background: `${st.backgroundColor}|${st.backgroundImage}`,
      border: [st.borderTopColor, st.borderTopWidth, st.borderTopStyle].join(' '),
      shadow: st.boxShadow,
      width: Math.round(box.width),
      height: Math.round(box.height),
    }
  })
}

/** Horizontal overflow and the smallest tap target on the screen. */
export function phoneFit() {
  const taps = [...document.querySelectorAll('.app-body button, .app-body a, .app-body [role="button"]')]
    .map((el) => {
      const st = getComputedStyle(el)
      const box = el.getBoundingClientRect()
      return { el, st, box }
    })
    .filter(({ st, box }) => st.display !== 'none' && st.visibility !== 'hidden' && box.width > 2 && box.height > 2)
  return {
    scrollOverflow: document.documentElement.scrollWidth > window.innerWidth,
    smallTaps: taps
      .filter(({ box }) => Math.min(box.width, box.height) < 44)
      .map(({ el, box }) => `${el.className || el.tagName} ${Math.round(box.width)}x${Math.round(box.height)}`),
  }
}

/**
 * Per-frame sampler. Starts a requestAnimationFrame loop and records, for every frame,
 * the rects of the named expected elements plus every visible text block and tap target.
 * `window.__lockinFrames.stop()` ends it and returns the frames.
 */
export function startFrameSampler(expected) {
  window.__lockinMark = undefined
  const frames = []
  let live = true
  const start = performance.now()
  const rectOf = (el) => {
    const box = el.getBoundingClientRect()
    return { x: box.x, y: box.y, w: box.width, h: box.height }
  }
  const isShown = (el) => {
    const st = getComputedStyle(el)
    const box = el.getBoundingClientRect()
    return st.display !== 'none' && st.visibility !== 'hidden' && box.width > 1 && box.height > 1
  }
  const opacityOf = (el) => {
    let value = 1
    for (let node = el; node && node !== document.documentElement; node = node.parentElement) {
      value *= parseFloat(getComputedStyle(node).opacity)
    }
    return value
  }
  const clipped = (el) => {
    const box = el.getBoundingClientRect()
    for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
      const st = getComputedStyle(node)
      if (st.overflow === 'visible' && st.overflowX === 'visible' && st.overflowY === 'visible') continue
      const parent = node.getBoundingClientRect()
      if (box.left < parent.left - 1 || box.right > parent.right + 1 || box.top < parent.top - 1 || box.bottom > parent.bottom + 1) return true
    }
    return false
  }
  function tick(now) {
    if (!live) return
    const frame = {
      t: now - (window.__lockinMark ?? start),
      els: {},
      blocks: [],
      shaking: Boolean(document.querySelector('.is-shake')),
      gold: window.__probe.goldCues(),
      fonts: window.__probe.fontViolations(),
    }
    for (const [name, selector] of Object.entries(expected)) {
      const list = [...document.querySelectorAll(selector)].filter(isShown)
      frame.els[name] = list.map((el) => {
        const box = el.getBoundingClientRect()
        const cx = box.x + box.width / 2
        const cy = box.y + box.height / 2
        const hit = document.elementFromPoint(cx, cy)
        return {
          ...rectOf(el),
          opacity: opacityOf(el),
          clipped: clipped(el),
          hit: Boolean(hit && (el === hit || el.contains(hit))),
          inView: box.left >= -1 && box.top >= -1 && box.right <= innerWidth + 1 && box.bottom <= innerHeight + 1,
          text: (el.textContent || '').trim().slice(0, 30),
        }
      })
    }
    const seen = new Set()
    const blockEls = []
    const blockSel = 'p, h1, h2, h3, strong, button, .match-yes span, .held-from, .why-chip, .why-claim, .lockin-recall-claim, .lockin-recall-cover, .win-stamp, .why-score'
    for (const el of document.querySelectorAll('.app-body ' + blockSel.split(', ').join(', .app-body '))) {
      if (!isShown(el) || seen.has(el)) continue
      if (el.closest('[aria-hidden="true"]')) continue
      seen.add(el)
      const hasOwnText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
      const isTap = el.matches('button')
      if (!hasOwnText && !isTap && !el.matches('.lockin-recall-cover')) continue
      blockEls.push(el)
      frame.blocks.push({ idx: blockEls.length - 1, name: (el.className || el.tagName).toString().split(' ')[0], text: (el.textContent || '').trim().slice(0, 24), ...rectOf(el) })
    }
    frame.nested = []
    for (let i = 0; i < blockEls.length; i += 1) {
      for (let j = i + 1; j < blockEls.length; j += 1) {
        if (blockEls[i].contains(blockEls[j]) || blockEls[j].contains(blockEls[i])) frame.nested.push(i + '-' + j)
      }
    }
    frames.push(frame)
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
  window.__lockinFrames = {
    stop() {
      live = false
      return frames
    },
  }
}

export function markFrameSampler() {
  window.__lockinMark = performance.now()
}

export function stopFrameSampler() {
  return window.__lockinFrames.stop()
}

/** Source of the in-page `window.__probe`, installed with `addInitScript` before any page script. */
export function probeInitSource() {
  return `window.__probe = { goldCues: ${goldCues}, fontViolations: ${fontViolations} }`
}
