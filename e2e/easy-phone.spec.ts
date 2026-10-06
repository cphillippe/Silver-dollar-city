import { expect, test, type Locator, type Page } from '@playwright/test'

/**
 * Cold Easy phone walk (375×667).
 * Quiet pause follows quietPauseAllowed in src/config/ads.ts:
 * it may show only on a clean Home return after a finished scene
 * (Lock In sceneRecap → Home) when ads are on and cooldown is clear.
 * It must not show on Match/link exit, the Lock In quiz, or hub → lesson.
 */

type Cell = { r: number; c: number }

const QUIET = 'A quiet pause'

test.use({ viewport: { width: 375, height: 667 } })

test('Easy phone trail stays honest from the road through Lock In', async ({ page }) => {
  await seedColdEasy(page)
  await page.goto('/')
  await expect(page.getByRole('main', { name: 'Home' })).toBeVisible()
  await expectNoQuietPause(page)

  const steps = page.getByRole('list', { name: 'Next step: Read, then Match, then Lock In' })
  const read = steps.locator('li').filter({ hasText: 'Read' })
  const match = steps.locator('li').filter({ hasText: 'Help' })
  const lock = steps.locator('li').filter({ hasText: 'Lock In' })

  await test.step('Home order: Help is gold, Lock In waits', async () => {
    await expect(read).not.toHaveClass(/is-now/)
    await expectGold(match)
    await expect(lock).toHaveClass(/is-later/)
    await expect(lock.getByRole('button')).toBeDisabled()
  })

  await test.step('hub → Match does not open a quiet pause', async () => {
    await match.getByRole('button', { name: /Help/ }).click()
    await expect(page.getByRole('grid', { name: 'Jericho road' })).toBeVisible()
    await expect(page.locator('.match-score')).toContainText('Find the hurt man')
    await expectNoQuietPause(page)
  })

  await test.step('fast taps stay on the road', async () => {
    await expectFastTapsStayOnRoad(page)
  })

  await test.step('inn shows Helped! and a readable win dock', async () => {
    await playRoad(page)
    await expectHelpedDock(page)
  })

  await test.step('One more road responds on the first tap', async () => {
    await page.getByRole('button', { name: 'One more road', exact: true }).click()
    await expect(page.getByRole('grid', { name: 'Jericho road' })).toBeVisible()
    await expect(page.locator('.match-score')).toContainText('Find the hurt man')
    await expectNoQuietPause(page)
  })

  await test.step('Lock In next responds on the first tap', async () => {
    await playRoad(page)
    await expectHelpedDock(page)
    await page.getByRole('button', { name: 'Lock In next', exact: true }).click()
    await expect(page.getByText(/Tap why this is true/)).toBeVisible()
    await expect(page.getByRole('grid', { name: 'Jericho road' })).toHaveCount(0)
    await expectNoQuietPause(page)
  })

  await test.step('Lock In quiz → Home does not pause, and step 3 goes gold', async () => {
    await page.getByRole('button', { name: '← Home' }).click()
    await expect(page.getByRole('main', { name: 'Home' })).toBeVisible()
    await expectNoQuietPause(page)
    await expectGold(lock)
    await expect(match).not.toHaveClass(/is-now/)
    await expect(read).not.toHaveClass(/is-now/)
  })

  await test.step('Match exit back to Home does not pause', async () => {
    await match.getByRole('button', { name: /Help/ }).click()
    await expect(page.getByRole('grid', { name: 'Jericho road' })).toBeVisible()
    await expectNoQuietPause(page)
    await page.getByRole('banner').getByRole('button', { name: 'Home', exact: true }).click()
    await expect(page.getByRole('main', { name: 'Home' })).toBeVisible()
    await expectNoQuietPause(page)
    await expectGold(lock)
  })

  await test.step('hub → Lock In does not pause', async () => {
    await lock.getByRole('button', { name: /Lock In/ }).click()
    await expect(page.getByText(/Tap why this is true/)).toBeVisible()
    await expectNoQuietPause(page)
  })

  await test.step('correct why shows LOCKED! then Say this tomorrow, with no quiet pause', async () => {
    await page.getByRole('button', { name: 'First the hurt man, then help.', exact: true }).click()
    await expect(page.locator('.win-stamp', { hasText: 'LOCKED!' })).toBeVisible()
    await expectNoQuietPause(page)
    await expect(page.getByText('Say this tomorrow', { exact: true })).toBeVisible()
    await expect(page.locator('.win-stamp', { hasText: 'LOCKED!' })).toHaveCount(0)
    await expectNoQuietPause(page)
  })

  await test.step('scene recap → Home may show the quiet pause', async () => {
    await page.getByRole('button', { name: '← Home' }).click()
    await expect(page.getByRole('dialog', { name: QUIET })).toBeVisible()
    await expect(page.getByRole('heading', { name: QUIET })).toBeVisible()
    await page.getByRole('button', { name: 'Continue the trail' }).click()
    await expect(page.getByRole('dialog', { name: QUIET })).toHaveCount(0)
    await expect(page.getByRole('main', { name: 'Home' })).toBeVisible()
  })
})

async function seedColdEasy(page: Page) {
  await page.addInitScript(() => {
    const now = new Date()
    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-')
    localStorage.clear()
    localStorage.setItem(
      'silver-city-progress-v1',
      JSON.stringify({
        kind: 'silver-city-save',
        schemaVersion: 1,
        appVersion: '1.4.364',
        savedAt: new Date().toISOString(),
        progress: {
          started: true,
          easyMode: true,
          lastDailyDate: today,
          dailyDates: [today],
          completed: [],
          held: [],
          easyTaught: [],
          easyHeld: [],
          taught: [],
          journal: [],
          learnings: [],
        },
      }),
    )
    localStorage.setItem('silver-city-ads', 'on')
    localStorage.removeItem('silver-city-commerce-v1')
    localStorage.removeItem('silver-city-progress-v1.bak')
  })
}

async function expectNoQuietPause(page: Page) {
  await expect(page.getByRole('dialog', { name: QUIET })).toHaveCount(0)
}

async function expectGold(step: Locator) {
  await expect(step).toHaveClass(/is-now/)
  const background = await step.locator('.easy-coach-step').evaluate((el) => {
    return getComputedStyle(el).backgroundImage
  })
  expect(background).toContain('linear-gradient')
}

async function expectReadableLabel(locator: Locator, text: string) {
  await expect(locator).toBeVisible()
  await expect(locator).toHaveText(text)
  const box = await locator.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.height).toBeGreaterThan(40)
  expect(box!.width).toBeGreaterThan(40)
  const style = await locator.evaluate((el) => {
    const computed = getComputedStyle(el)
    return {
      color: computed.color,
      size: Number.parseFloat(computed.fontSize),
    }
  })
  expect(style.size).toBeGreaterThanOrEqual(16)
  const channels = style.color.match(/\d+/g)?.slice(0, 3).map(Number) ?? []
  expect(channels).toHaveLength(3)
  expect(Math.max(...channels)).toBeLessThan(90)
}

async function expectHelpedDock(page: Page) {
  await expect(page.locator('.win-stamp', { hasText: 'Helped!' })).toBeVisible()
  await expect(page.locator('.match-score')).toContainText('Safe at the inn')
  await expect(page.locator('.match-yes')).toContainText('Neighbor is the one who shows mercy')
  await expect(page.getByRole('grid', { name: 'Jericho road' })).toHaveCount(0)
  await expect(page.getByText('Find the hurt man')).toHaveCount(0)
  await expectNoQuietPause(page)
  await expectReadableLabel(page.getByRole('button', { name: 'Lock In next', exact: true }), 'Lock In next')
  await expectReadableLabel(page.getByRole('button', { name: 'One more road', exact: true }), 'One more road')
}

async function expectFastTapsStayOnRoad(page: Page) {
  const board = page.locator('.maze-board')
  const touch = await board.evaluate((node) => {
    const body = document.querySelector('.app-body')
    const before = body instanceof HTMLElement ? body.scrollTop : 0
    const start = new TouchEvent('touchstart', { bubbles: true, cancelable: true })
    const move = new TouchEvent('touchmove', { bubbles: true, cancelable: true })
    node.dispatchEvent(start)
    node.dispatchEvent(move)
    const after = body instanceof HTMLElement ? body.scrollTop : 0
    return {
      startBlocked: start.defaultPrevented,
      moveBlocked: move.defaultPrevented,
      scrolled: after !== before,
    }
  })
  expect(touch.startBlocked).toBe(true)
  expect(touch.moveBlocked).toBe(true)
  expect(touch.scrolled).toBe(false)

  const hurt = await readCell(page.locator('[data-maze-cell].is-hurt'))
  const open = await roads(page)
  for (let i = 0; i < 5; i += 1) {
    const at = await here(page)
    const path = shortest(at, hurt, open)
    if (!path || path.length < 3) break
    const beforeKey = key(at)
    const scrollBefore = await scrollOf(page)
    const boardBefore = await board.boundingBox()
    await tapCell(page, hurt)
    await expect.poll(async () => key(await here(page)), { timeout: 1_500 }).not.toBe(beforeKey)
    const next = await here(page)
    expect(Math.abs(next.r - at.r) + Math.abs(next.c - at.c)).toBe(1)
    expect(open.has(key(next))).toBe(true)
    expect(Math.abs((await scrollOf(page)) - scrollBefore)).toBeLessThan(8)
    const boardAfter = await board.boundingBox()
    expect(boardBefore).not.toBeNull()
    expect(boardAfter).not.toBeNull()
    expect(Math.abs(boardAfter!.y - boardBefore!.y)).toBeLessThan(12)
    expect(Math.abs(boardAfter!.x - boardBefore!.x)).toBeLessThan(12)
  }
  await expect(page.locator('.match-score')).toContainText('Find the hurt man')
  await expect(page.locator('.play.is-road-maze')).not.toHaveClass(/is-win/)
}

async function playRoad(page: Page) {
  // Replay rotates the preset in an effect, after the first paint. One tap
  // re-renders that layout before we read Hurt man and the inn.
  await syncMazeBoard(page)
  const hurt = await readCell(page.locator('[data-maze-cell].is-hurt'))
  const inn = await readCell(page.locator('[data-maze-cell].is-inn'))
  await walkUntil(page, hurt)
  await expect(page.locator('.play.is-road-maze')).toHaveClass(/is-found/)
  await tapCell(page, hurt)
  await expect(page.locator('.play.is-road-maze')).toHaveClass(/is-helped/)
  await walkUntil(page, inn, true)
}

async function syncMazeBoard(page: Page) {
  const at = await here(page)
  const cells = page.locator('[data-maze-cell].is-road')
  const count = await cells.count()
  for (let i = 0; i < count; i += 1) {
    const cell = await readCell(cells.nth(i))
    if (cell.r === at.r && cell.c === at.c) continue
    await tapCell(page, cell)
    break
  }
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined))))
}

async function walkUntil(page: Page, target: Cell, winOnArrival = false) {
  for (let guard = 0; guard < 30; guard += 1) {
    const at = await here(page)
    if (at.r === target.r && at.c === target.c) return
    const open = await roads(page)
    const path = shortest(at, target, open)
    if (!path || path.length < 2) {
      throw new Error(`no road from ${key(at)} to ${key(target)}`)
    }
    const next = path[1]
    if (!next) throw new Error('empty maze step')
    const winning = winOnArrival && next.r === target.r && next.c === target.c
    await tapCell(page, next)
    if (winning) {
      await expect(page.locator('.win-stamp', { hasText: 'Helped!' })).toBeVisible()
      return
    }
    await expect.poll(async () => key(await here(page))).toBe(key(next))
  }
  throw new Error(`maze walk did not reach ${key(target)}`)
}

async function tapCell(page: Page, cell: Cell) {
  const selector = `[data-maze-cell][data-r="${cell.r}"][data-c="${cell.c}"]`
  const loc = page.locator(selector)
  await loc.dispatchEvent('pointerdown', {
    bubbles: true,
    cancelable: true,
    pointerId: 1,
    pointerType: 'touch',
    isPrimary: true,
    button: 0,
    buttons: 1,
  })
  // The inn step unmounts the grid on pointerdown. Lift the finger on window
  // so the win dock can arm after that cell is gone.
  await page.evaluate((sel) => {
    const lift = (target: EventTarget) => {
      target.dispatchEvent(
        new PointerEvent('pointerup', {
          bubbles: true,
          cancelable: true,
          pointerId: 1,
          pointerType: 'touch',
          isPrimary: true,
        }),
      )
    }
    const cell = document.querySelector(sel)
    if (cell) lift(cell)
    lift(window)
  }, selector)
}

async function here(page: Page): Promise<Cell> {
  return readCell(page.locator('[data-maze-cell].is-here'))
}

async function readCell(loc: Locator): Promise<Cell> {
  const r = Number(await loc.getAttribute('data-r'))
  const c = Number(await loc.getAttribute('data-c'))
  if (!Number.isFinite(r) || !Number.isFinite(c)) throw new Error('maze cell has no coordinates')
  return { r, c }
}

async function roads(page: Page): Promise<Set<string>> {
  const keys = await page.locator('[data-maze-cell].is-road').evaluateAll((nodes) => {
    return nodes.map((node) => `${node.getAttribute('data-r')}:${node.getAttribute('data-c')}`)
  })
  return new Set(keys)
}

async function scrollOf(page: Page): Promise<number> {
  return page.evaluate(() => {
    const body = document.querySelector('.app-body')
    const bodyTop = body instanceof HTMLElement ? body.scrollTop : 0
    return window.scrollY + bodyTop
  })
}

function shortest(from: Cell, to: Cell, open: Set<string>): Cell[] | null {
  const start = key(from)
  const goal = key(to)
  if (!open.has(start) || !open.has(goal)) return null
  if (start === goal) return [from]
  const dirs = [
    { r: -1, c: 0 },
    { r: 1, c: 0 },
    { r: 0, c: -1 },
    { r: 0, c: 1 },
  ]
  const seen = new Set([start])
  const queue: Cell[][] = [[from]]
  while (queue.length) {
    const trail = queue.shift()
    if (!trail) break
    const last = trail[trail.length - 1]
    if (!last) break
    for (const dir of dirs) {
      const next = { r: last.r + dir.r, c: last.c + dir.c }
      const nextKey = key(next)
      if (!open.has(nextKey) || seen.has(nextKey)) continue
      const walk = [...trail, next]
      if (nextKey === goal) return walk
      seen.add(nextKey)
      queue.push(walk)
    }
  }
  return null
}

function key(cell: Cell) {
  return `${cell.r}:${cell.c}`
}
