import { test, expect } from '@playwright/test'

const NAVIGATION_TIMEOUT = 15000

const sidebarLinks = [
  { name: 'Dashboard', url: '/' },
  { name: 'Stock', url: '/stock' },
  { name: 'Products', url: '/products' },
  { name: 'Locations', url: '/locations' },
  { name: 'Inventory', url: '/inventory' },
  { name: 'Audit Logs', url: '/audit-logs' },
  { name: 'Settings', url: '/settings' },
]

test.describe('Sidebar Navigation', () => {
  test('all sidebar links are visible', async ({ page }) => {
    await page.goto('/')

    for (const link of sidebarLinks) {
      await expect(
        page.locator('[data-sidebar="menu-button"]', { hasText: new RegExp(link.name, 'i') }),
      ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    }
  })

  for (const link of sidebarLinks) {
    test(`navigate to ${link.name}`, async ({ page }) => {
      await page.goto('/')

      await page
        .locator('[data-sidebar="menu-button"]', { hasText: new RegExp(link.name, 'i') })
        .click()

      await expect(page).toHaveURL(link.url, { timeout: NAVIGATION_TIMEOUT })
    })
  }

  test('active link highlighting', async ({ page }) => {
    await page.goto('/products')

    const productsLink = page.locator('[data-sidebar="menu-button"]', {
      hasText: /products/i,
    })
    await expect(productsLink).toHaveAttribute('data-active', 'true', { timeout: NAVIGATION_TIMEOUT })

    const dashboardLink = page.locator('[data-sidebar="menu-button"]', {
      hasText: /dashboard/i,
    })
    await expect(dashboardLink).not.toHaveAttribute('data-active', 'true')
  })
})
