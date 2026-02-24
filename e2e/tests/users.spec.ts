import { test, expect } from '@playwright/test'
import { NAVIGATION_TIMEOUT } from '../helpers'

test.describe('Users Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/users')

    await expect(
      page.locator('h1', { hasText: /user management/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('page loads with header', async ({ page }) => {
    await expect(page).toHaveURL('/users')

    await expect(
      page.locator('h1', { hasText: /user management/i }),
    ).toBeVisible()

    await expect(
      page.locator('text=Manage user accounts'),
    ).toBeVisible()
  })

  test('search bar is visible and updates URL', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').or(
      page.locator('input[type="search"]'),
    )
    await expect(searchInput).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await searchInput.fill('admin')

    await expect(page).toHaveURL(/q=admin/, { timeout: NAVIGATION_TIMEOUT })
  })

  test('role filter dropdown shows roles', async ({ page }) => {
    const roleTrigger = page.locator('button[role="combobox"]').first()
    await expect(roleTrigger).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await roleTrigger.click()

    // Should have at least one role option
    const options = page.locator('[role="option"]')
    await expect(options.first()).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await page.keyboard.press('Escape')
  })

  test('users table loads with data or empty state', async ({ page }) => {
    const table = page.locator('table')
    const emptyState = page.locator('text=No users found')

    await expect(table.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('users table shows correct column headers', async ({ page }) => {
    const table = page.locator('table')
    const emptyState = page.locator('text=No users found')

    await expect(table.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const tableExists = await table.isVisible().catch(() => false)
    if (!tableExists) {
      test.skip()
      return
    }

    await expect(table.locator('th', { hasText: /name/i })).toBeVisible()
    await expect(table.locator('th', { hasText: /email/i })).toBeVisible()
    await expect(table.locator('th', { hasText: /role/i })).toBeVisible()
    await expect(table.locator('th', { hasText: /status/i })).toBeVisible()
    await expect(table.locator('th', { hasText: /created/i })).toBeVisible()
  })

  test('users table displays user data with roles and status', async ({ page }) => {
    const table = page.locator('table')
    const emptyState = page.locator('text=No users found')

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

    // Row should display user name and email
    const rowText = await firstRow.textContent()
    expect(rowText).toBeTruthy()
    expect(rowText!.length).toBeGreaterThan(0)

    // Should have a status badge (Active or Banned)
    const activeBadge = firstRow.locator('text=Active')
    const bannedBadge = firstRow.locator('text=Banned')
    await expect(activeBadge.or(bannedBadge)).toBeVisible()
  })

  test('user row dropdown shows action options', async ({ page }) => {
    const table = page.locator('table')
    const emptyState = page.locator('text=No users found')

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

    // Open dropdown
    const dropdownTrigger = firstRow.locator('button').filter({ has: page.locator('svg') }).last()
    await dropdownTrigger.click()

    // Should show action options
    await expect(
      page.locator('[role="menuitem"]', { hasText: /edit roles/i }).or(
        page.locator('[role="menuitem"]', { hasText: /roles/i }),
      ),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Ban or Unban option
    const banOption = page.locator('[role="menuitem"]', { hasText: /ban/i })
    const unbanOption = page.locator('[role="menuitem"]', { hasText: /unban/i })
    await expect(banOption.or(unbanOption)).toBeVisible()

    // Revoke sessions
    await expect(
      page.locator('[role="menuitem"]', { hasText: /revoke/i }),
    ).toBeVisible()

    // Close
    await page.keyboard.press('Escape')
  })

  test('edit roles dialog opens from user dropdown', async ({ page }) => {
    const table = page.locator('table')
    const emptyState = page.locator('text=No users found')

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

    // Open dropdown
    const dropdownTrigger = firstRow.locator('button').filter({ has: page.locator('svg') }).last()
    await dropdownTrigger.click()

    // Click Edit Roles
    const editRolesOption = page.locator('[role="menuitem"]', { hasText: /edit roles/i }).or(
      page.locator('[role="menuitem"]', { hasText: /roles/i }),
    )
    await editRolesOption.click()

    // Dialog should open
    await expect(
      page.locator('[role="dialog"]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Close
    const cancelButton = page.locator('[role="dialog"] button', { hasText: /cancel/i }).or(
      page.locator('[role="dialog"] button', { hasText: /close/i }),
    )
    if (await cancelButton.isVisible().catch(() => false)) {
      await cancelButton.click()
    } else {
      await page.keyboard.press('Escape')
    }
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: NAVIGATION_TIMEOUT })
  })

  test('filter chips: clear all removes filters', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').or(
      page.locator('input[type="search"]'),
    )
    await expect(searchInput).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await searchInput.fill('test')
    await expect(page).toHaveURL(/q=test/, { timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('button', { hasText: /clear all/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await page.locator('button', { hasText: /clear all/i }).click()

    await expect(page).toHaveURL('/users', { timeout: NAVIGATION_TIMEOUT })
  })
})
