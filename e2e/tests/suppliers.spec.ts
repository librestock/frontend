import { test, expect } from '@playwright/test'
import { NAVIGATION_TIMEOUT } from '../helpers'

test.describe('Suppliers Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/suppliers')

    await expect(
      page.locator('h1', { hasText: /suppliers/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('page loads with header and create button', async ({ page }) => {
    await expect(page).toHaveURL('/suppliers')

    await expect(
      page.locator('h1', { hasText: /suppliers/i }),
    ).toBeVisible()

    await expect(
      page.locator('button', { hasText: /create supplier/i }),
    ).toBeVisible()
  })

  test('search bar is visible and updates URL', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').or(
      page.locator('input[type="search"]'),
    )
    await expect(searchInput).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await searchInput.fill('test-supplier')

    await expect(page).toHaveURL(/q=test-supplier/, { timeout: NAVIGATION_TIMEOUT })
  })

  test('status filter dropdown shows options', async ({ page }) => {
    const statusTrigger = page.locator('button[role="combobox"]').first()
    await expect(statusTrigger).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await statusTrigger.click()

    await expect(page.locator('[role="option"]', { hasText: /active/i })).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await expect(page.locator('[role="option"]', { hasText: /inactive/i })).toBeVisible()
  })

  test('selecting status filter updates URL and shows filter chip', async ({ page }) => {
    const statusTrigger = page.locator('button[role="combobox"]').first()
    await statusTrigger.click()

    await page.locator('[role="option"]', { hasText: /active/i }).first().click()

    await expect(page).toHaveURL(/status=/, { timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('button', { hasText: /status/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('supplier cards load or empty state shows', async ({ page }) => {
    const supplierCard = page.locator('[class*="card"]').first()
    const emptyState = page.locator('text=No suppliers found')

    await expect(supplierCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('supplier card displays name and status badge', async ({ page }) => {
    const supplierCard = page.locator('[class*="card"]').first()
    const emptyState = page.locator('text=No suppliers found')

    await expect(supplierCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const hasSuppliers = await supplierCard.isVisible().catch(() => false)
    if (!hasSuppliers) {
      test.skip()
      return
    }

    // Card should have a name
    const cardText = await supplierCard.textContent()
    expect(cardText).toBeTruthy()

    // Card should have a status badge (Active or Inactive)
    const activeBadge = supplierCard.locator('text=Active')
    const inactiveBadge = supplierCard.locator('text=Inactive')
    await expect(activeBadge.or(inactiveBadge)).toBeVisible()
  })

  test('create supplier: open dialog and verify form fields', async ({ page }) => {
    const createButton = page.locator('button', { hasText: /create supplier/i })
    await expect(createButton).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await createButton.click()

    await expect(
      page.locator('[role="dialog"]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('[role="dialog"] >> text=Create Supplier'),
    ).toBeVisible()

    // Verify form fields
    await expect(page.locator('[role="dialog"] >> text=Name')).toBeVisible()
    await expect(page.locator('[role="dialog"] #name')).toBeVisible()

    // Cancel button should work
    const cancelButton = page.locator('[role="dialog"] button', { hasText: /cancel/i })
    await expect(cancelButton).toBeVisible()
    await cancelButton.click()
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: NAVIGATION_TIMEOUT })
  })

  test('create supplier: fill form and submit', async ({ page }) => {
    const createButton = page.locator('button', { hasText: /create supplier/i })
    await createButton.click()

    await expect(
      page.locator('[role="dialog"]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Fill required name field
    const nameInput = page.locator('[role="dialog"] #name')
    await expect(nameInput).toBeVisible()
    await nameInput.fill(`E2E Test Supplier ${Date.now()}`)

    // Fill optional fields
    const contactInput = page.locator('[role="dialog"] #contact_person')
    if (await contactInput.isVisible().catch(() => false)) {
      await contactInput.fill('Test Contact')
    }

    const emailInput = page.locator('[role="dialog"] #email')
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('supplier@example.com')
    }

    // Submit
    const submitButton = page.locator('[role="dialog"] button[type="submit"]')
    await submitButton.click()

    // Dialog should close on success
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: NAVIGATION_TIMEOUT })

    // Toast notification should appear
    await expect(
      page.locator('[data-sonner-toast]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('edit supplier: open dropdown and edit dialog', async ({ page }) => {
    const supplierCard = page.locator('[class*="card"]').first()
    const emptyState = page.locator('text=No suppliers found')

    await expect(supplierCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const hasSuppliers = await supplierCard.isVisible().catch(() => false)
    if (!hasSuppliers) {
      test.skip()
      return
    }

    // Open the dropdown menu
    const dropdownTrigger = supplierCard.locator('button').filter({ has: page.locator('svg') }).last()
    await dropdownTrigger.click()

    // Click Edit
    await expect(
      page.locator('[role="menuitem"]', { hasText: /edit/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await page.locator('[role="menuitem"]', { hasText: /edit/i }).click()

    // Edit dialog should open
    await expect(
      page.locator('[role="dialog"]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('[role="dialog"] >> text=Edit Supplier'),
    ).toBeVisible()

    // Name should be pre-filled
    const nameInput = page.locator('[role="dialog"] #name')
    await expect(nameInput).toBeVisible()
    const nameValue = await nameInput.inputValue()
    expect(nameValue.length).toBeGreaterThan(0)

    // Close dialog
    const cancelButton = page.locator('[role="dialog"] button', { hasText: /cancel/i })
    await cancelButton.click()
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: NAVIGATION_TIMEOUT })
  })

  test('delete supplier: open dropdown, confirm deletion', async ({ page }) => {
    const supplierCard = page.locator('[class*="card"]').first()
    const emptyState = page.locator('text=No suppliers found')

    await expect(supplierCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const hasSuppliers = await supplierCard.isVisible().catch(() => false)
    if (!hasSuppliers) {
      test.skip()
      return
    }

    // Open the dropdown menu
    const dropdownTrigger = supplierCard.locator('button').filter({ has: page.locator('svg') }).last()
    await dropdownTrigger.click()

    // Click Delete
    await expect(
      page.locator('[role="menuitem"]', { hasText: /delete/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await page.locator('[role="menuitem"]', { hasText: /delete/i }).click()

    // Confirmation dialog should open
    await expect(
      page.locator('[role="alertdialog"]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Confirm deletion
    const confirmButton = page.locator('[role="alertdialog"] button', { hasText: /delete/i })
    await confirmButton.click()

    // Dialog should close
    await expect(page.locator('[role="alertdialog"]')).toBeHidden({ timeout: NAVIGATION_TIMEOUT })

    // Undo toast should appear
    await expect(
      page.locator('[data-sonner-toast]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
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

    await expect(page).toHaveURL('/suppliers', { timeout: NAVIGATION_TIMEOUT })
  })
})
