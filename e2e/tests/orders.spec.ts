import { test, expect } from '@playwright/test'
import { NAVIGATION_TIMEOUT } from '../helpers'

test.describe('Orders Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/orders')

    await expect(
      page.locator('h1', { hasText: /orders/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('page loads with header and create button', async ({ page }) => {
    await expect(page).toHaveURL('/orders')

    await expect(
      page.locator('h1', { hasText: /orders/i }),
    ).toBeVisible()

    await expect(
      page.locator('text=Manage orders'),
    ).toBeVisible()

    await expect(
      page.locator('button', { hasText: /create order/i }),
    ).toBeVisible()
  })

  test('search bar is visible and updates URL', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').or(
      page.locator('input[type="search"]'),
    )
    await expect(searchInput).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await searchInput.fill('ORD-001')

    await expect(page).toHaveURL(/q=ORD-001/, { timeout: NAVIGATION_TIMEOUT })
  })

  test('status filter dropdown shows all order statuses', async ({ page }) => {
    const statusTrigger = page.locator('button[role="combobox"]').first()
    await expect(statusTrigger).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await statusTrigger.click()

    // Verify key status options
    await expect(page.locator('[role="option"]', { hasText: /draft/i })).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await expect(page.locator('[role="option"]', { hasText: /confirmed/i })).toBeVisible()
    await expect(page.locator('[role="option"]', { hasText: /shipped/i })).toBeVisible()
    await expect(page.locator('[role="option"]', { hasText: /delivered/i })).toBeVisible()
    await expect(page.locator('[role="option"]', { hasText: /cancelled/i })).toBeVisible()
  })

  test('selecting status filter updates URL and shows filter chip', async ({ page }) => {
    const statusTrigger = page.locator('button[role="combobox"]').first()
    await statusTrigger.click()

    await page.locator('[role="option"]', { hasText: /draft/i }).click()

    await expect(page).toHaveURL(/status=DRAFT/, { timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('button', { hasText: /status.*draft/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('orders table loads with data or empty state', async ({ page }) => {
    const table = page.locator('table')
    const emptyState = page.locator('text=No orders found')

    await expect(table.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('orders table shows correct column headers', async ({ page }) => {
    const table = page.locator('table')
    const emptyState = page.locator('text=No orders found')

    await expect(table.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const tableExists = await table.isVisible().catch(() => false)
    if (!tableExists) {
      test.skip()
      return
    }

    await expect(table.locator('th', { hasText: /order/i })).toBeVisible()
    await expect(table.locator('th', { hasText: /client/i })).toBeVisible()
    await expect(table.locator('th', { hasText: /status/i })).toBeVisible()
    await expect(table.locator('th', { hasText: /items/i })).toBeVisible()
    await expect(table.locator('th', { hasText: /total/i })).toBeVisible()
    await expect(table.locator('th', { hasText: /created/i })).toBeVisible()
  })

  test('order rows display status badges', async ({ page }) => {
    const table = page.locator('table')
    const emptyState = page.locator('text=No orders found')

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

    // Each row should have a status badge
    const statusBadge = firstRow.locator('[class*="badge"]')
    await expect(statusBadge.first()).toBeVisible()
  })

  test('create order: open dialog and verify form fields', async ({ page }) => {
    const createButton = page.locator('button', { hasText: /create order/i })
    await expect(createButton).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await createButton.click()

    await expect(
      page.locator('[role="dialog"]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('[role="dialog"] >> text=Create Order'),
    ).toBeVisible()

    // Should have client selection field
    await expect(
      page.locator('[role="dialog"] >> text=Client'),
    ).toBeVisible()

    // Cancel button
    const cancelButton = page.locator('[role="dialog"] button', { hasText: /cancel/i })
    await expect(cancelButton).toBeVisible()
    await cancelButton.click()
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: NAVIGATION_TIMEOUT })
  })

  test('order row dropdown menu shows edit/delete for draft orders', async ({ page }) => {
    // Filter to DRAFT orders to test edit/delete actions
    const statusTrigger = page.locator('button[role="combobox"]').first()
    await statusTrigger.click()
    await page.locator('[role="option"]', { hasText: /draft/i }).click()
    await expect(page).toHaveURL(/status=DRAFT/, { timeout: NAVIGATION_TIMEOUT })

    const table = page.locator('table')
    const emptyState = page.locator('text=No orders found')

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

    // Open dropdown on first draft order
    const dropdownTrigger = firstRow.locator('button').filter({ has: page.locator('svg') }).last()
    await dropdownTrigger.click()

    // Edit and Delete should be available for draft orders
    await expect(
      page.locator('[role="menuitem"]', { hasText: /edit/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await expect(
      page.locator('[role="menuitem"]', { hasText: /delete/i }),
    ).toBeVisible()

    // Close dropdown by pressing Escape
    await page.keyboard.press('Escape')
  })

  test('filter chips: clear all removes filters', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').or(
      page.locator('input[type="search"]'),
    )
    await expect(searchInput).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await searchInput.fill('test')
    await expect(page).toHaveURL(/q=test/, { timeout: NAVIGATION_TIMEOUT })

    const statusTrigger = page.locator('button[role="combobox"]').first()
    await statusTrigger.click()
    await page.locator('[role="option"]', { hasText: /draft/i }).click()
    await expect(page).toHaveURL(/status=DRAFT/, { timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('button', { hasText: /clear all/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await page.locator('button', { hasText: /clear all/i }).click()

    await expect(page).toHaveURL('/orders', { timeout: NAVIGATION_TIMEOUT })
  })

  test('navigating directly with search params applies filters', async ({ page }) => {
    await page.goto('/orders?status=DELIVERED')

    await expect(
      page.locator('button', { hasText: /status.*delivered/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })
})
