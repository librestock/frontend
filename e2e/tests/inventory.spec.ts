import { test, expect } from '@playwright/test'

const NAVIGATION_TIMEOUT = 15000

test.describe('Inventory Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')

    await page
      .locator('[data-sidebar="menu-button"]', { hasText: /inventory/i })
      .click()

    await expect(page).toHaveURL('/inventory', { timeout: NAVIGATION_TIMEOUT })
  })

  test('navigates to /inventory and page loads', async ({ page }) => {
    // Verify page header
    await expect(
      page.locator('h1', { hasText: /all inventory/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Verify subtitle
    await expect(
      page.locator('text=Track product quantities across locations').or(
        page.locator('text=Track stock levels across locations'),
      ),
    ).toBeVisible()
  })

  test('inventory list loads with table or empty state', async ({ page }) => {
    // Wait for content: either a table with data or an empty state
    const table = page.locator('table')
    const emptyState = page.locator('text=No inventory found')

    await expect(table.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('inventory table shows correct column headers', async ({ page }) => {
    const table = page.locator('table')
    const emptyState = page.locator('text=No inventory found')

    await expect(table.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const tableExists = await table.isVisible().catch(() => false)
    if (tableExists) {
      await expect(table.locator('th', { hasText: /product/i })).toBeVisible()
      await expect(table.locator('th', { hasText: /location/i })).toBeVisible()
      await expect(table.locator('th', { hasText: /qty/i }).or(table.locator('th', { hasText: /quantity/i }))).toBeVisible()
      await expect(table.locator('th', { hasText: /batch/i })).toBeVisible()
      await expect(table.locator('th', { hasText: /expiry/i })).toBeVisible()
    }
  })

  test('location/area sidebar is visible with locations heading', async ({ page }) => {
    // The LocationAreaSidebar should be visible
    const sidebar = page.locator('aside')
    await expect(sidebar).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Should have a "Locations" heading
    await expect(
      sidebar.locator('h2', { hasText: /locations/i }),
    ).toBeVisible()

    // Should have an "All Inventory" option at the bottom
    await expect(
      sidebar.locator('button', { hasText: /all inventory/i }),
    ).toBeVisible()
  })

  test('location sidebar filtering updates page title', async ({ page }) => {
    const sidebar = page.locator('aside')
    await expect(sidebar).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Check if there are any location items in the sidebar
    const locationItems = sidebar.locator('[role="button"]')
    const locationCount = await locationItems.count()

    if (locationCount === 0) {
      // No locations exist; skip this test
      test.skip()
      return
    }

    // Click the first location
    await locationItems.first().click()

    // URL should update with location param
    await expect(page).toHaveURL(/location=/, { timeout: NAVIGATION_TIMEOUT })

    // Page title should change to "Location Inventory"
    await expect(
      page.locator('h1', { hasText: /location inventory/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Click "All Inventory" to reset
    await sidebar.locator('button', { hasText: /all inventory/i }).click()

    await expect(
      page.locator('h1', { hasText: /all inventory/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('search functionality updates URL and shows filter chip', async ({ page }) => {
    // Find the search input
    const searchInput = page.locator('input[placeholder*="Search"]').or(
      page.locator('input[type="search"]'),
    )
    await expect(searchInput).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Type a search query
    await searchInput.fill('test-search')

    // URL should update with the q param
    await expect(page).toHaveURL(/q=test-search/, { timeout: NAVIGATION_TIMEOUT })

    // A filter chip should appear
    await expect(
      page.locator('button', { hasText: /search.*test-search/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('low stock toggle updates URL', async ({ page }) => {
    // Find the Low Stock toggle button
    const lowStockToggle = page.locator('button[aria-label="Show low stock"]')
    await expect(lowStockToggle).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Click the toggle
    await lowStockToggle.click()

    // URL should include low=true
    await expect(page).toHaveURL(/low=true/, { timeout: NAVIGATION_TIMEOUT })

    // A filter chip should appear
    await expect(
      page.locator('button', { hasText: /low stock/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Click again to deactivate
    await lowStockToggle.click()

    // URL should no longer have low=true
    await expect(page).not.toHaveURL(/low=true/, { timeout: NAVIGATION_TIMEOUT })
  })

  test('expiring soon toggle updates URL', async ({ page }) => {
    const expiringSoonToggle = page.locator('button[aria-label="Show expiring soon"]')
    await expect(expiringSoonToggle).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await expiringSoonToggle.click()

    await expect(page).toHaveURL(/expiring=true/, { timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('button', { hasText: /expiring soon/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('create inventory: open dialog and verify form fields', async ({ page }) => {
    // Click the "Add Inventory" button
    const createButton = page.locator('button', { hasText: /add inventory/i })
    await expect(createButton).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await createButton.click()

    // Dialog should open
    await expect(
      page.locator('[role="dialog"]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Dialog title
    await expect(
      page.locator('[role="dialog"] >> text=Add Inventory'),
    ).toBeVisible()

    // Form should have product, location, area, quantity fields
    await expect(page.locator('[role="dialog"] >> text=Product')).toBeVisible()
    await expect(page.locator('[role="dialog"] >> text=Location')).toBeVisible()
    await expect(page.locator('[role="dialog"] >> text=Quantity')).toBeVisible()
    await expect(page.locator('[role="dialog"] >> text=Batch Number')).toBeVisible()

    // Cancel button should be present
    const cancelButton = page.locator('[role="dialog"] button', { hasText: /cancel/i })
    await expect(cancelButton).toBeVisible()

    // Close the dialog
    await cancelButton.click()
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: NAVIGATION_TIMEOUT })
  })

  test('adjust quantity dialog opens from table row', async ({ page }) => {
    // Wait for table data to load
    const table = page.locator('table')
    const emptyState = page.locator('text=No inventory found')

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

    // Click the Adjust button on the first row
    const adjustButton = firstRow.locator('button', { hasText: /adjust/i })
    await expect(adjustButton).toBeVisible()
    await adjustButton.click()

    // Adjust quantity dialog should open
    await expect(
      page.locator('[role="dialog"]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('[role="dialog"] >> text=Adjust Quantity'),
    ).toBeVisible()

    // Should show current quantity
    await expect(
      page.locator('[role="dialog"] >> text=Quantity').first(),
    ).toBeVisible()

    // Should show adjustment input
    await expect(
      page.locator('[role="dialog"] #adjustment'),
    ).toBeVisible()

    // Should show increment/decrement buttons
    const incrementButton = page.locator('[role="dialog"] button').filter({ has: page.locator('.lucide-plus') })
    const decrementButton = page.locator('[role="dialog"] button').filter({ has: page.locator('.lucide-minus') })
    await expect(incrementButton).toBeVisible()
    await expect(decrementButton).toBeVisible()

    // Close
    const cancelButton = page.locator('[role="dialog"] button', { hasText: /cancel/i })
    await cancelButton.click()
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: NAVIGATION_TIMEOUT })
  })

  test('delete inventory with undo toast', async ({ page }) => {
    // Wait for table data
    const table = page.locator('table')
    const emptyState = page.locator('text=No inventory found')

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

    // Open the dropdown menu (three-dot) on the first row
    const dropdownTrigger = firstRow.locator('button').filter({ has: page.locator('.lucide-more-horizontal, svg') }).last()
    await dropdownTrigger.click()

    // Click Delete from the dropdown
    await expect(
      page.locator('[role="menuitem"]', { hasText: /delete/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await page.locator('[role="menuitem"]', { hasText: /delete/i }).click()

    // Delete confirmation dialog should open
    await expect(
      page.locator('[role="alertdialog"]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('[role="alertdialog"] >> text=Delete Inventory'),
    ).toBeVisible()

    // Confirm deletion
    const confirmButton = page.locator('[role="alertdialog"] button', { hasText: /delete/i })
    await confirmButton.click()

    // Dialog should close
    await expect(page.locator('[role="alertdialog"]')).toBeHidden({ timeout: NAVIGATION_TIMEOUT })

    // An undo toast should appear
    await expect(
      page.locator('[data-sonner-toast]').or(page.locator('text=Inventory deleted successfully')),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // The undo button should be present in the toast
    await expect(
      page.locator('button', { hasText: /undo/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('clear all button removes all filters', async ({ page }) => {
    // Apply search filter
    const searchInput = page.locator('input[placeholder*="Search"]').or(
      page.locator('input[type="search"]'),
    )
    await expect(searchInput).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await searchInput.fill('test')
    await expect(page).toHaveURL(/q=test/, { timeout: NAVIGATION_TIMEOUT })

    // Apply low stock filter
    const lowStockToggle = page.locator('button[aria-label="Show low stock"]')
    await lowStockToggle.click()
    await expect(page).toHaveURL(/low=true/, { timeout: NAVIGATION_TIMEOUT })

    // Clear all button should appear
    await expect(
      page.locator('button', { hasText: /clear all/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Click clear all
    await page.locator('button', { hasText: /clear all/i }).click()

    // URL should be clean
    await expect(page).toHaveURL('/inventory', { timeout: NAVIGATION_TIMEOUT })
  })
})
