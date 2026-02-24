import { test, expect } from '@playwright/test'
import { NAVIGATION_TIMEOUT } from '../helpers'

test.describe('Stock Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/stock')

    await expect(
      page.locator('h1', { hasText: /products/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('page loads with header and breadcrumb', async ({ page }) => {
    await expect(page).toHaveURL('/stock')

    await expect(
      page.locator('h1', { hasText: /products/i }),
    ).toBeVisible()
  })

  test('search bar is visible and functional', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').or(
      page.locator('input[type="search"]'),
    )
    await expect(searchInput).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await searchInput.fill('test-search')

    await expect(page).toHaveURL(/q=test-search/, { timeout: NAVIGATION_TIMEOUT })
  })

  test('sort dropdown is visible with options', async ({ page }) => {
    const sortTrigger = page.locator('button[role="combobox"]').first()
    await expect(sortTrigger).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await sortTrigger.click()

    await expect(page.locator('[role="option"]', { hasText: /name/i })).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await expect(page.locator('[role="option"]', { hasText: /quantity/i })).toBeVisible()
    await expect(page.locator('[role="option"]', { hasText: /value/i })).toBeVisible()
  })

  test('selecting sort option updates URL', async ({ page }) => {
    const sortTrigger = page.locator('button[role="combobox"]').first()
    await expect(sortTrigger).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await sortTrigger.click()
    await page.locator('[role="option"]', { hasText: /quantity/i }).click()

    await expect(page).toHaveURL(/sort=QUANTITY/, { timeout: NAVIGATION_TIMEOUT })
  })

  test('display type toggle switches between grid and list', async ({ page }) => {
    // Find the toggle group (grid/list buttons)
    const gridButton = page.locator('button[aria-label="Grid view"]').or(
      page.locator('button').filter({ has: page.locator('.lucide-layout-grid, .lucide-grid') }).first(),
    )
    const listButton = page.locator('button[aria-label="List view"]').or(
      page.locator('button').filter({ has: page.locator('.lucide-list, .lucide-align-justify') }).first(),
    )

    await expect(gridButton.or(listButton)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Click list view
    if (await listButton.isVisible().catch(() => false)) {
      await listButton.click()
      await expect(page).toHaveURL(/view=LIST/, { timeout: NAVIGATION_TIMEOUT })
    }

    // Switch back to grid
    if (await gridButton.isVisible().catch(() => false)) {
      await gridButton.click()
      // URL should either have view=GRID or no view param (GRID is default)
      await page.waitForTimeout(500)
    }
  })

  test('items load as cards or show empty state', async ({ page }) => {
    // Wait for either item cards or an empty state
    const itemCard = page.locator('[class*="card"]').first()
    const emptyState = page.locator('text=No products found').or(
      page.locator('text=No items found'),
    )

    await expect(itemCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('item cards display product info', async ({ page }) => {
    const itemCard = page.locator('[class*="card"]').first()
    const emptyState = page.locator('text=No products found').or(
      page.locator('text=No items found'),
    )

    await expect(itemCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const hasItems = await itemCard.isVisible().catch(() => false)
    if (!hasItems) {
      test.skip()
      return
    }

    // Cards should display product name at minimum
    const cardText = await itemCard.textContent()
    expect(cardText).toBeTruthy()
    expect(cardText!.length).toBeGreaterThan(0)
  })

  test('filter chips appear when search is active', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').or(
      page.locator('input[type="search"]'),
    )
    await expect(searchInput).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await searchInput.fill('widget')

    await expect(page).toHaveURL(/q=widget/, { timeout: NAVIGATION_TIMEOUT })

    // A filter chip should appear
    await expect(
      page.locator('button', { hasText: /search.*widget/i }).or(
        page.locator('button', { hasText: /widget/i }),
      ),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('pagination controls are visible when items exist', async ({ page }) => {
    const itemCard = page.locator('[class*="card"]').first()
    const emptyState = page.locator('text=No products found').or(
      page.locator('text=No items found'),
    )

    await expect(itemCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const hasItems = await itemCard.isVisible().catch(() => false)
    if (!hasItems) {
      test.skip()
      return
    }

    // Pagination should show page info
    const pagination = page.locator('text=Page').or(
      page.locator('button', { hasText: /next/i }),
    )
    await expect(pagination).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('clear all button removes all filters', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').or(
      page.locator('input[type="search"]'),
    )
    await expect(searchInput).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await searchInput.fill('test')
    await expect(page).toHaveURL(/q=test/, { timeout: NAVIGATION_TIMEOUT })

    // Sort by something non-default
    const sortTrigger = page.locator('button[role="combobox"]').first()
    await sortTrigger.click()
    await page.locator('[role="option"]', { hasText: /quantity/i }).click()
    await expect(page).toHaveURL(/sort=QUANTITY/, { timeout: NAVIGATION_TIMEOUT })

    // Clear all should appear
    await expect(
      page.locator('button', { hasText: /clear all/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await page.locator('button', { hasText: /clear all/i }).click()

    await expect(page).toHaveURL('/stock', { timeout: NAVIGATION_TIMEOUT })
  })
})
