import { test, expect } from '@playwright/test'
import { NAVIGATION_TIMEOUT } from '../helpers'

test.describe('Roles Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/roles')

    await expect(
      page.locator('h1', { hasText: /role management/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('page loads with header and create button', async ({ page }) => {
    await expect(page).toHaveURL('/roles')

    await expect(
      page.locator('h1', { hasText: /role management/i }),
    ).toBeVisible()

    await expect(
      page.locator('text=Manage roles and their permissions'),
    ).toBeVisible()

    await expect(
      page.locator('button', { hasText: /create role/i }),
    ).toBeVisible()
  })

  test('roles table loads with data', async ({ page }) => {
    const table = page.locator('table')
    const emptyState = page.locator('text=No roles found')

    await expect(table.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('roles table shows correct column headers', async ({ page }) => {
    const table = page.locator('table')
    const emptyState = page.locator('text=No roles found')

    await expect(table.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const tableExists = await table.isVisible().catch(() => false)
    if (!tableExists) {
      test.skip()
      return
    }

    await expect(table.locator('th', { hasText: /name/i })).toBeVisible()
    await expect(table.locator('th', { hasText: /description/i })).toBeVisible()
    await expect(table.locator('th', { hasText: /type/i })).toBeVisible()
    await expect(table.locator('th', { hasText: /permission/i })).toBeVisible()
  })

  test('roles table displays system and custom role badges', async ({ page }) => {
    const table = page.locator('table')
    const emptyState = page.locator('text=No roles found')

    await expect(table.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const tableExists = await table.isVisible().catch(() => false)
    if (!tableExists) {
      test.skip()
      return
    }

    // Should have at least one role row
    const firstRow = table.locator('tbody tr').first()
    await expect(firstRow).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Type column should show System or Custom badge
    const systemBadge = table.locator('text=System')
    const customBadge = table.locator('text=Custom')
    await expect(systemBadge.or(customBadge)).toBeVisible()
  })

  test('roles table shows permission counts', async ({ page }) => {
    const table = page.locator('table')
    const emptyState = page.locator('text=No roles found')

    await expect(table.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const tableExists = await table.isVisible().catch(() => false)
    if (!tableExists) {
      test.skip()
      return
    }

    const firstRow = table.locator('tbody tr').first()
    await expect(firstRow).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Should show permission count text like "5 permissions"
    await expect(
      firstRow.locator('text=/\\d+ permission/i'),
    ).toBeVisible()
  })

  test('create role: open dialog and verify form fields', async ({ page }) => {
    const createButton = page.locator('button', { hasText: /create role/i })
    await expect(createButton).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await createButton.click()

    await expect(
      page.locator('[role="dialog"]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('[role="dialog"] >> text=Create Role'),
    ).toBeVisible()

    // Name field
    await expect(page.locator('[role="dialog"] #name')).toBeVisible()

    // Description field
    const descInput = page.locator('[role="dialog"] #description')
    await expect(descInput).toBeVisible()

    // Permissions section should be visible (checkboxes)
    await expect(
      page.locator('[role="dialog"] >> text=Permissions').or(
        page.locator('[role="dialog"] >> text=Permission'),
      ),
    ).toBeVisible()

    // Cancel
    const cancelButton = page.locator('[role="dialog"] button', { hasText: /cancel/i })
    await expect(cancelButton).toBeVisible()
    await cancelButton.click()
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: NAVIGATION_TIMEOUT })
  })

  test('create role: fill form and submit', async ({ page }) => {
    const createButton = page.locator('button', { hasText: /create role/i })
    await createButton.click()

    await expect(
      page.locator('[role="dialog"]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Fill name
    const nameInput = page.locator('[role="dialog"] #name')
    await expect(nameInput).toBeVisible()
    await nameInput.fill(`E2E Test Role ${Date.now()}`)

    // Fill description
    const descInput = page.locator('[role="dialog"] #description')
    if (await descInput.isVisible().catch(() => false)) {
      await descInput.fill('Test role created by e2e tests')
    }

    // Check at least one permission checkbox
    const firstCheckbox = page.locator('[role="dialog"] input[type="checkbox"]').first()
    if (await firstCheckbox.isVisible().catch(() => false)) {
      await firstCheckbox.check()
    }

    // Submit
    const submitButton = page.locator('[role="dialog"] button[type="submit"]')
    await submitButton.click()

    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: NAVIGATION_TIMEOUT })

    // Toast
    await expect(
      page.locator('[data-sonner-toast]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('edit role: open dropdown and edit dialog for custom role', async ({ page }) => {
    const table = page.locator('table')
    const emptyState = page.locator('text=No roles found')

    await expect(table.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const tableExists = await table.isVisible().catch(() => false)
    if (!tableExists) {
      test.skip()
      return
    }

    // Find a custom role row (not system)
    const customRow = table.locator('tbody tr').filter({ hasText: /custom/i }).first()
    const anyRow = table.locator('tbody tr').first()

    const hasCustom = await customRow.isVisible().catch(() => false)
    const targetRow = hasCustom ? customRow : anyRow

    const rowExists = await targetRow.isVisible().catch(() => false)
    if (!rowExists) {
      test.skip()
      return
    }

    // Open dropdown
    const dropdownTrigger = targetRow.locator('button').filter({ has: page.locator('svg') }).last()
    await dropdownTrigger.click()

    // Edit option
    const editOption = page.locator('[role="menuitem"]', { hasText: /edit/i })
    await expect(editOption).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await editOption.click()

    // Dialog should open
    await expect(
      page.locator('[role="dialog"]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('[role="dialog"] >> text=Edit Role'),
    ).toBeVisible()

    // Name should be pre-filled
    const nameInput = page.locator('[role="dialog"] #name')
    await expect(nameInput).toBeVisible()
    const nameValue = await nameInput.inputValue()
    expect(nameValue.length).toBeGreaterThan(0)

    // Close
    const cancelButton = page.locator('[role="dialog"] button', { hasText: /cancel/i })
    await cancelButton.click()
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: NAVIGATION_TIMEOUT })
  })

  test('delete option is disabled for system roles', async ({ page }) => {
    const table = page.locator('table')
    const emptyState = page.locator('text=No roles found')

    await expect(table.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const tableExists = await table.isVisible().catch(() => false)
    if (!tableExists) {
      test.skip()
      return
    }

    // Find a system role row
    const systemRow = table.locator('tbody tr').filter({ hasText: /system/i }).first()

    const hasSystem = await systemRow.isVisible().catch(() => false)
    if (!hasSystem) {
      test.skip()
      return
    }

    // Open dropdown
    const dropdownTrigger = systemRow.locator('button').filter({ has: page.locator('svg') }).last()
    await dropdownTrigger.click()

    // Delete option should be disabled for system roles
    const deleteOption = page.locator('[role="menuitem"]', { hasText: /delete/i })
    if (await deleteOption.isVisible().catch(() => false)) {
      await expect(deleteOption).toBeDisabled()
    }

    await page.keyboard.press('Escape')
  })

  test('delete custom role: open dropdown, confirm deletion', async ({ page }) => {
    const table = page.locator('table')
    const emptyState = page.locator('text=No roles found')

    await expect(table.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const tableExists = await table.isVisible().catch(() => false)
    if (!tableExists) {
      test.skip()
      return
    }

    // Find a custom (non-system) role
    const customRow = table.locator('tbody tr').filter({ hasText: /custom/i }).first()

    const hasCustom = await customRow.isVisible().catch(() => false)
    if (!hasCustom) {
      test.skip()
      return
    }

    // Open dropdown
    const dropdownTrigger = customRow.locator('button').filter({ has: page.locator('svg') }).last()
    await dropdownTrigger.click()

    // Click Delete
    const deleteOption = page.locator('[role="menuitem"]', { hasText: /delete/i })
    const isEnabled = await deleteOption.isEnabled().catch(() => false)
    if (!isEnabled) {
      await page.keyboard.press('Escape')
      test.skip()
      return
    }
    await deleteOption.click()

    // Confirmation dialog
    await expect(
      page.locator('[role="alertdialog"]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Confirm
    const confirmButton = page.locator('[role="alertdialog"] button', { hasText: /delete/i })
    await confirmButton.click()

    await expect(page.locator('[role="alertdialog"]')).toBeHidden({ timeout: NAVIGATION_TIMEOUT })

    // Toast
    await expect(
      page.locator('[data-sonner-toast]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })
})
