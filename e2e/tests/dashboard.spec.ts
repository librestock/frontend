import { test, expect } from '@playwright/test'

const NAVIGATION_TIMEOUT = 15000

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')

    // Wait for the dashboard to load by checking for the header
    await expect(
      page.locator('h1', { hasText: /dashboard/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('navigates to / (home) and renders page header', async ({ page }) => {
    await expect(page).toHaveURL('/')

    await expect(
      page.locator('h1', { hasText: /dashboard/i }),
    ).toBeVisible()

    // Subtitle
    await expect(
      page.locator('text=Overview of your inventory at a glance'),
    ).toBeVisible()
  })

  test('summary cards load with numbers', async ({ page }) => {
    // Wait for the loading skeletons to disappear and real cards to appear
    // There should be 4 summary cards: Total Products, Total Locations, Inventory Items, Low Stock

    await expect(
      page.locator('text=Total Products'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('text=Total Locations'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('text=Inventory Items'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('text=Low Stock'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Each card should show a numeric value (the bold text)
    // The summary cards render a <p> with text-3xl font-bold containing a number
    const boldNumbers = page.locator('p.text-3xl.font-bold')
    await expect(boldNumbers.first()).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const count = await boldNumbers.count()
    expect(count).toBe(4)

    // Each number should be a valid integer
    for (let i = 0; i < count; i++) {
      const text = await boldNumbers.nth(i).textContent()
      expect(text).not.toBeNull()
      expect(Number.isInteger(Number(text))).toBe(true)
    }
  })

  test('low stock alerts section appears', async ({ page }) => {
    // Low Stock Alerts card should be visible
    await expect(
      page.locator('text=Low Stock Alerts'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('text=Items with quantity below their reorder point'),
    ).toBeVisible()

    // Should show either a table with low stock items or "No low stock items" message
    const lowStockTable = page.locator('table').first()
    const noLowStock = page.locator('text=No low stock items')

    await expect(lowStockTable.or(noLowStock)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // If table is visible, verify its column headers
    const tableVisible = await lowStockTable.isVisible().catch(() => false)
    if (tableVisible) {
      await expect(lowStockTable.locator('th', { hasText: /product/i })).toBeVisible()
      await expect(lowStockTable.locator('th', { hasText: /location/i })).toBeVisible()
      await expect(lowStockTable.locator('th', { hasText: /quantity/i })).toBeVisible()
      await expect(lowStockTable.locator('th', { hasText: /status/i })).toBeVisible()
    }
  })

  test('quick action buttons are present and link to correct pages', async ({ page }) => {
    // Quick Actions card should be visible
    await expect(
      page.locator('text=Quick Actions'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Verify all 4 quick action buttons are present
    const addProductLink = page.locator('a', { hasText: /add product/i })
    const addInventoryLink = page.locator('a', { hasText: /add inventory/i })
    const viewStockLink = page.locator('a', { hasText: /view stock/i })
    const viewInventoryLink = page.locator('a', { hasText: /view inventory/i })

    await expect(addProductLink).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await expect(addInventoryLink).toBeVisible()
    await expect(viewStockLink).toBeVisible()
    await expect(viewInventoryLink).toBeVisible()

    // Verify the hrefs
    await expect(addProductLink).toHaveAttribute('href', /\/stock/)
    await expect(addInventoryLink).toHaveAttribute('href', /\/inventory/)
    await expect(viewStockLink).toHaveAttribute('href', /\/stock/)
    await expect(viewInventoryLink).toHaveAttribute('href', /\/inventory/)
  })

  test('quick action "Add Product" navigates to /stock', async ({ page }) => {
    await expect(
      page.locator('text=Quick Actions'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const addProductLink = page.locator('a', { hasText: /add product/i })
    await addProductLink.click()

    await expect(page).toHaveURL('/stock', { timeout: NAVIGATION_TIMEOUT })
  })

  test('quick action "Add Inventory" navigates to /inventory', async ({ page }) => {
    await expect(
      page.locator('text=Quick Actions'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const addInventoryLink = page.locator('a', { hasText: /add inventory/i })
    await addInventoryLink.click()

    await expect(page).toHaveURL('/inventory', { timeout: NAVIGATION_TIMEOUT })
  })

  test('stock by location chart section renders', async ({ page }) => {
    // Chart card should be visible
    await expect(
      page.locator('text=Stock by Location'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('text=Inventory quantity distributed across locations'),
    ).toBeVisible()

    // Should show either a chart (recharts container) or an empty state
    // recharts renders an SVG inside a ResponsiveContainer
    const chartSvg = page.locator('.recharts-responsive-container svg')
    const chartEmptyState = page.locator('.recharts-responsive-container').locator('..')
      .locator('text=All inventory items are above their reorder points')
    const noDataIcon = page.locator('.lucide-map-pin')

    // We just need to verify the chart card rendered without errors
    // The content depends on whether there's data
    await expect(
      chartSvg.or(noDataIcon),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })
})
