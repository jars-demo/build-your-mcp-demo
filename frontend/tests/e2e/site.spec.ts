import { expect, test } from '@playwright/test'

test('home explains the workshop and starts it', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Build your own MCP server.')
  await expect(page.getByRole('figure', { name: /MCP client talks to your server/ })).toBeVisible()

  await page.getByRole('tab', { name: 'Bad input' }).click()
  await expect(page.getByRole('tabpanel')).toContainText('Give the note a title')

  await expect(page.locator('#primitives')).toContainText("'delete_note'")

  await page.getByRole('link', { name: 'Start the workshop' }).click()
  await expect(page).toHaveURL(/\/workshop\/01-why-mcp$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Why MCP, and what we build')
})

test('the workshop lists every chapter and pages through them', async ({ page }) => {
  await page.goto('/workshop')
  const chapters = page.locator('main ol > li')
  await expect(chapters).toHaveCount(11)

  await chapters.nth(2).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your first tool')
  await expect(page.getByRole('button', { name: 'Copy' }).first()).toBeVisible()

  await page.getByRole('link', { name: /Next/ }).click()
  await expect(page).toHaveURL(/04-validating-input$/)
})

for (const width of [390, 360]) {
  test(`nothing scrolls sideways at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    for (const path of [
      '/',
      '/workshop',
      '/workshop/09-transports',
      '/workshop/10-connect-clients',
    ]) {
      await page.goto(path)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow, path).toBeLessThanOrEqual(0)
      // html and body clip sideways overflow, so also check that nothing pokes out of the
      // viewport unless it sits inside its own scroll box (like a code block).
      const offenders = await page.evaluate((viewport) => {
        const scrolls = (el: Element) => {
          const x = getComputedStyle(el).overflowX
          return x === 'auto' || x === 'scroll' || x === 'hidden'
        }
        return [...document.querySelectorAll('body *')]
          .filter((el) => {
            for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
              if (scrolls(p)) return false
            }
            return el.getBoundingClientRect().right > viewport + 1
          })
          .map((el) => `${el.tagName}.${el.className}`.slice(0, 80))
      }, width)
      expect(offenders, path).toEqual([])
    }
  })
}

test('back to top appears after scrolling and returns to the top', async ({ page }) => {
  await page.goto('/')
  const button = page.getByRole('button', { name: 'Back to top' })
  await expect(button).toBeHidden()
  await page.evaluate(() => window.scrollTo(0, 2000))
  await expect(button).toBeVisible()
  await button.click()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
})
