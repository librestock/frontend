import { test, expect } from '@playwright/test'
import { NAVIGATION_TIMEOUT } from '../helpers'

test.describe('Stock Movements Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/stock-movements')

    await expect(
      page.locator('h1', { hasText: /stock movements/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('page loads with header and record button', async ({ page }) => {
    await expect(page).toHaveURL('/stock-movements')

    await expect(
      page.locator('h1', { hasText: /stock movements/i }),
    ).toBeVisible()

    await expect(
      page.locator('text=Track all stock movements'),
    ).toBeVisible()

    await expect(
      page.locator('button', { hasText: /record movement/i }),
    ).toBeVisible()
  })

  test('filter dropdowns are visible', async ({ page }) => {
    // Should have Reason, Product, and Location filter dropdowns
    const comboboxes = page.locator('button[role="combobox"]')
    const count = await comboboxes.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })

  test('reason filter shows all movement reasons', async ({ page }) => {
    const reasonTrigger = page.locator('button[role="combobox"]').first()
    await expect(reasonTrigger).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await reasonTrigger.click()

    // Verify key reason options
    await expect(page.locator('[role="option"]', { hasText: /purchase/i })).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await expect(page.locator('[role="option"]', { hasText: /sale/i })).toBeVisible()
    await expect(page.locator('[role="option"]', { hasText: /waste/i })).toBeVisible()
    await expect(page.locator('[role="option"]', { hasText: /damaged/i })).toBeVisible()

    // Close dropdown
    await page.keyboard.press('Escape')
  })

  test('selecting reason filter updates URL and shows filter chip', async ({ page }) => {
    const reasonTrigger = page.locator('button[role="combobox"]').first()
    await reasonTrigger.click()

    await page.locator('[role="option"]', { hasText: /purchase/i }).click()

    await expect(page).toHaveURL(/reason=PURCHASE_RECEIVE/, { timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('button', { hasText: /reason/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('stock movements table loads with data or empty state', async ({ page }) => {
    const table = page.locator('table')
    const emptyState = page.locator('text=No stock movements found').or(
      page.locator('text=No movements found'),
    )

    await expect(table.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('stock movements table shows correct column headers', async ({ page }) => {
    const table = page.locator('table')
    const emptyState = page.locator('text=No stock movements found').or(
      page.locator('text=No movements found'),
    )

    await expect(table.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const tableExists = await table.isVisible().catch(() => false)
    if (!tableExists) {
      test.skip()
      return
    }

    await expect(table.locator('th', { hasText: /date/i })).toBeVisible()
    await expect(table.locator('th', { hasText: /product/i })).toBeVisible()
    await expect(
      table.locator('th', { hasText: /from/i }).or(table.locator('th', { hasText: /location/i })),
    ).toBeVisible()
    await expect(table.locator('th', { hasText: /qty/i }).or(table.locator('th', { hasText: /quantity/i }))).toBeVisible()
    await expect(table.locator('th', { hasText: /reason/i })).toBeVisible()
  })

  test('table rows display reason badges', async ({ page }) => {
    const table = page.locator('table')
    const emptyState = page.locator('text=No stock movements found').or(
      page.locator('text=No movements found'),
    )

    await expect(table.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const tableExists = await table.isVisible().catch(() => false)
    if (!tableExists) {
      test.skip()
      return
    }

    const firstRow = table.locator('tbody tr').first()
    const rowExists = await firstRow.isVisible().catch(() => false)
    if (!rowExists) {
      test.skip()
      return
    }

    // Each row should have a reason badge
    const badge = firstRow.locator('[class*="badge"]')
    await expect(badge.first()).toBeVisible()
  })

  test('record movement: open dialog and verify form fields', async ({ page }) => {
    const recordButton = page.locator('button', { hasText: /record movement/i })
    await expect(recordButton).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await recordButton.click()

    await expect(
      page.locator('[role="dialog"]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('[role="dialog"] >> text=Record').or(
        page.locator('[role="dialog"] >> text=Stock Movement'),
      ),
    ).toBeVisible()

    // Key form fields should be present
    await expect(
      page.locator('[role="dialog"] >> text=Product'),
    ).toBeVisible()

    await expect(
      page.locator('[role="dialog"] >> text=Reason').or(
        page.locator('[role="dialog"] >> text=Type'),
      ),
    ).toBeVisible()

    await expect(
      page.locator('[role="dialog"] >> text=Quantity'),
    ).toBeVisible()

    // Cancel
    const cancelButton = page.locator('[role="dialog"] button', { hasText: /cancel/i })
    await expect(cancelButton).toBeVisible()
    await cancelButton.click()
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: NAVIGATION_TIMEOUT })
  })

  test('product filter dropdown shows products', async ({ page }) => {
    // Product filter is typically the second combobox
    const productTrigger = page.locator('button[role="combobox"]').nth(1)
    await expect(productTrigger).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await productTrigger.click()

    // Should have at least the "All Products" option
    const options = page.locator('[role="option"]')
    await expect(options.first()).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await page.keyboard.press('Escape')
  })

  test('location filter dropdown shows locations', async ({ page }) => {
    // Location filter is typically the third combobox
    const locationTrigger = page.locator('button[role="combobox"]').nth(2)
    await expect(locationTrigger).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await locationTrigger.click()

    // Should have at least the "All Locations" option
    const options = page.locator('[role="option"]')
    await expect(options.first()).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await page.keyboard.press('Escape')
  })

  test('filter chips: clear all removes filters', async ({ page }) => {
    // Apply reason filter
    const reasonTrigger = page.locator('button[role="combobox"]').first()
    await reasonTrigger.click()
    await page.locator('[role="option"]', { hasText: /sale/i }).click()
    await expect(page).toHaveURL(/reason=SALE/, { timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('button', { hasText: /clear all/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await page.locator('button', { hasText: /clear all/i }).click()

    await expect(page).toHaveURL('/stock-movements', { timeout: NAVIGATION_TIMEOUT })
  })

  test('navigating directly with search params applies filters', async ({ page }) => {
    await page.goto('/stock-movements?reason=WASTE')

    await expect(
      page.locator('button', { hasText: /reason.*waste/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })
})
