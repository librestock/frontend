import { test, expect } from '@playwright/test'

const NAVIGATION_TIMEOUT = 15000

test.describe('Audit Logs Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/audit-logs')
    // Wait for the page header to confirm load
    await expect(
      page.locator('h1', { hasText: /audit logs/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('renders page header with title and subtitle', async ({ page }) => {
    await expect(page.locator('h1', { hasText: /audit logs/i })).toBeVisible()
    await expect(
      page.locator('text=View system activity and changes'),
    ).toBeVisible()
  })

  test('renders filter dropdowns', async ({ page }) => {
    // Action filter
    const actionTrigger = page.locator('button[role="combobox"]').first()
    await expect(actionTrigger).toBeVisible()

    // Entity type filter
    const entityTypeTrigger = page.locator('button[role="combobox"]').nth(1)
    await expect(entityTypeTrigger).toBeVisible()
  })

  test('renders table with correct column headers', async ({ page }) => {
    const table = page.locator('table')
    // Table may or may not be present depending on data; check headers if table exists
    const tableExists = await table.isVisible().catch(() => false)

    if (tableExists) {
      await expect(table.locator('th', { hasText: /action/i })).toBeVisible()
      await expect(table.locator('th', { hasText: /entity type/i })).toBeVisible()
      await expect(table.locator('th', { hasText: /entity id/i })).toBeVisible()
      await expect(table.locator('th', { hasText: /user id/i })).toBeVisible()
      await expect(table.locator('th', { hasText: /ip address/i })).toBeVisible()
      await expect(table.locator('th', { hasText: /date/i })).toBeVisible()
    }
  })

  test('shows empty state or table data', async ({ page }) => {
    // Either the table is rendered with data, or an empty state is shown
    const table = page.locator('table')
    const emptyState = page.locator('text=No audit logs found')

    await expect(table.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('action filter opens and shows options', async ({ page }) => {
    const actionTrigger = page.locator('button[role="combobox"]').first()
    await actionTrigger.click()

    // Verify some action options appear
    await expect(page.locator('[role="option"]', { hasText: /create/i })).toBeVisible()
    await expect(page.locator('[role="option"]', { hasText: /update/i })).toBeVisible()
    await expect(page.locator('[role="option"]', { hasText: /delete/i })).toBeVisible()
  })

  test('entity type filter opens and shows options', async ({ page }) => {
    const entityTypeTrigger = page.locator('button[role="combobox"]').nth(1)
    await entityTypeTrigger.click()

    // Verify some entity type options appear
    await expect(page.locator('[role="option"]', { hasText: /product/i })).toBeVisible()
    await expect(page.locator('[role="option"]', { hasText: /category/i })).toBeVisible()
    await expect(page.locator('[role="option"]', { hasText: /inventory/i })).toBeVisible()
  })

  test('selecting action filter updates URL and shows filter chip', async ({ page }) => {
    const actionTrigger = page.locator('button[role="combobox"]').first()
    await actionTrigger.click()

    await page.locator('[role="option"]', { hasText: /create/i }).click()

    // URL should contain the action param
    await expect(page).toHaveURL(/action=CREATE/, { timeout: NAVIGATION_TIMEOUT })

    // A filter chip should appear
    await expect(
      page.locator('button', { hasText: /action.*create/i }),
    ).toBeVisible()

    // Clear all button should appear
    await expect(
      page.locator('button', { hasText: /clear all/i }),
    ).toBeVisible()
  })

  test('selecting entity type filter updates URL and shows filter chip', async ({ page }) => {
    const entityTypeTrigger = page.locator('button[role="combobox"]').nth(1)
    await entityTypeTrigger.click()

    await page.locator('[role="option"]', { hasText: /product/i }).click()

    // URL should contain the entity_type param
    await expect(page).toHaveURL(/entity_type=PRODUCT/, { timeout: NAVIGATION_TIMEOUT })

    // A filter chip should appear
    await expect(
      page.locator('button', { hasText: /entity type.*product/i }),
    ).toBeVisible()
  })

  test('removing filter chip clears the filter from URL', async ({ page }) => {
    // Apply a filter first
    const actionTrigger = page.locator('button[role="combobox"]').first()
    await actionTrigger.click()
    await page.locator('[role="option"]', { hasText: /create/i }).click()

    await expect(page).toHaveURL(/action=CREATE/, { timeout: NAVIGATION_TIMEOUT })

    // Click the filter chip to remove it
    const chip = page.locator('button', { hasText: /action.*create/i })
    await chip.click()

    // URL should no longer have the action param
    await expect(page).not.toHaveURL(/action=CREATE/, { timeout: NAVIGATION_TIMEOUT })
  })

  test('clear all button removes all filters', async ({ page }) => {
    // Apply action filter
    const actionTrigger = page.locator('button[role="combobox"]').first()
    await actionTrigger.click()
    await page.locator('[role="option"]', { hasText: /create/i }).click()
    await expect(page).toHaveURL(/action=CREATE/, { timeout: NAVIGATION_TIMEOUT })

    // Apply entity type filter
    const entityTypeTrigger = page.locator('button[role="combobox"]').nth(1)
    await entityTypeTrigger.click()
    await page.locator('[role="option"]', { hasText: /product/i }).click()
    await expect(page).toHaveURL(/entity_type=PRODUCT/, { timeout: NAVIGATION_TIMEOUT })

    // Click clear all
    await page.locator('button', { hasText: /clear all/i }).click()

    // URL should be clean
    await expect(page).toHaveURL('/audit-logs', { timeout: NAVIGATION_TIMEOUT })
  })

  test('navigating directly with search params applies filters', async ({ page }) => {
    await page.goto('/audit-logs?action=DELETE&entity_type=CATEGORY')

    // Filter chips should be visible
    await expect(
      page.locator('button', { hasText: /action.*delete/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await expect(
      page.locator('button', { hasText: /entity type.*category/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })
})
