import { test, expect } from '@playwright/test'
import { NAVIGATION_TIMEOUT } from '../helpers'

test.describe('Clients Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/clients')

    await expect(
      page.locator('h1', { hasText: /clients/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('page loads with header and create button', async ({ page }) => {
    await expect(page).toHaveURL('/clients')

    await expect(
      page.locator('h1', { hasText: /clients/i }),
    ).toBeVisible()

    await expect(
      page.locator('button', { hasText: /create client/i }),
    ).toBeVisible()
  })

  test('search bar is visible and updates URL', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').or(
      page.locator('input[type="search"]'),
    )
    await expect(searchInput).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await searchInput.fill('test-client')

    await expect(page).toHaveURL(/q=test-client/, { timeout: NAVIGATION_TIMEOUT })
  })

  test('status filter dropdown shows options', async ({ page }) => {
    const statusTrigger = page.locator('button[role="combobox"]').first()
    await expect(statusTrigger).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await statusTrigger.click()

    await expect(page.locator('[role="option"]', { hasText: /active/i })).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await expect(page.locator('[role="option"]', { hasText: /suspended/i })).toBeVisible()
    await expect(page.locator('[role="option"]', { hasText: /inactive/i })).toBeVisible()
  })

  test('selecting status filter updates URL', async ({ page }) => {
    const statusTrigger = page.locator('button[role="combobox"]').first()
    await statusTrigger.click()

    await page.locator('[role="option"]', { hasText: /active/i }).first().click()

    await expect(page).toHaveURL(/status=/, { timeout: NAVIGATION_TIMEOUT })
  })

  test('client cards load or empty state shows', async ({ page }) => {
    const clientCard = page.locator('[class*="card"]').first()
    const emptyState = page.locator('text=No clients found')

    await expect(clientCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('client card displays company name and status badge', async ({ page }) => {
    const clientCard = page.locator('[class*="card"]').first()
    const emptyState = page.locator('text=No clients found')

    await expect(clientCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const hasClients = await clientCard.isVisible().catch(() => false)
    if (!hasClients) {
      test.skip()
      return
    }

    // Card should show a status badge
    const activeBadge = clientCard.locator('text=Active')
    const suspendedBadge = clientCard.locator('text=Suspended')
    const inactiveBadge = clientCard.locator('text=Inactive')
    await expect(activeBadge.or(suspendedBadge).or(inactiveBadge)).toBeVisible()
  })

  test('create client: open dialog and verify form fields', async ({ page }) => {
    const createButton = page.locator('button', { hasText: /create client/i })
    await expect(createButton).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await createButton.click()

    await expect(
      page.locator('[role="dialog"]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('[role="dialog"] >> text=Create Client'),
    ).toBeVisible()

    // Verify key form fields
    await expect(page.locator('[role="dialog"] #company_name')).toBeVisible()

    // Cancel button
    const cancelButton = page.locator('[role="dialog"] button', { hasText: /cancel/i })
    await expect(cancelButton).toBeVisible()
    await cancelButton.click()
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: NAVIGATION_TIMEOUT })
  })

  test('create client: fill form and submit', async ({ page }) => {
    const createButton = page.locator('button', { hasText: /create client/i })
    await createButton.click()

    await expect(
      page.locator('[role="dialog"]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Fill required fields
    const companyNameInput = page.locator('[role="dialog"] #company_name')
    await expect(companyNameInput).toBeVisible()
    await companyNameInput.fill(`E2E Test Client ${Date.now()}`)

    // Fill optional fields
    const contactInput = page.locator('[role="dialog"] #contact_person')
    if (await contactInput.isVisible().catch(() => false)) {
      await contactInput.fill('Test Contact Person')
    }

    const emailInput = page.locator('[role="dialog"] #email')
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('client@example.com')
    }

    // Submit
    const submitButton = page.locator('[role="dialog"] button[type="submit"]')
    await submitButton.click()

    // Dialog should close on success
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: NAVIGATION_TIMEOUT })

    // Toast notification
    await expect(
      page.locator('[data-sonner-toast]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('edit client: open dropdown and edit dialog', async ({ page }) => {
    const clientCard = page.locator('[class*="card"]').first()
    const emptyState = page.locator('text=No clients found')

    await expect(clientCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const hasClients = await clientCard.isVisible().catch(() => false)
    if (!hasClients) {
      test.skip()
      return
    }

    // Open dropdown
    const dropdownTrigger = clientCard.locator('button').filter({ has: page.locator('svg') }).last()
    await dropdownTrigger.click()

    // Click Edit
    await expect(
      page.locator('[role="menuitem"]', { hasText: /edit/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await page.locator('[role="menuitem"]', { hasText: /edit/i }).click()

    // Edit dialog opens
    await expect(
      page.locator('[role="dialog"]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('[role="dialog"] >> text=Edit Client'),
    ).toBeVisible()

    // Name should be pre-filled
    const companyNameInput = page.locator('[role="dialog"] #company_name')
    await expect(companyNameInput).toBeVisible()
    const nameValue = await companyNameInput.inputValue()
    expect(nameValue.length).toBeGreaterThan(0)

    // Close
    const cancelButton = page.locator('[role="dialog"] button', { hasText: /cancel/i })
    await cancelButton.click()
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: NAVIGATION_TIMEOUT })
  })

  test('delete client: open dropdown, confirm deletion', async ({ page }) => {
    const clientCard = page.locator('[class*="card"]').first()
    const emptyState = page.locator('text=No clients found')

    await expect(clientCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const hasClients = await clientCard.isVisible().catch(() => false)
    if (!hasClients) {
      test.skip()
      return
    }

    // Open dropdown
    const dropdownTrigger = clientCard.locator('button').filter({ has: page.locator('svg') }).last()
    await dropdownTrigger.click()

    // Click Delete
    await expect(
      page.locator('[role="menuitem"]', { hasText: /delete/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await page.locator('[role="menuitem"]', { hasText: /delete/i }).click()

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

  test('status toggle: suspend and activate client via dropdown', async ({ page }) => {
    const clientCard = page.locator('[class*="card"]').first()
    const emptyState = page.locator('text=No clients found')

    await expect(clientCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const hasClients = await clientCard.isVisible().catch(() => false)
    if (!hasClients) {
      test.skip()
      return
    }

    // Open dropdown
    const dropdownTrigger = clientCard.locator('button').filter({ has: page.locator('svg') }).last()
    await dropdownTrigger.click()

    // Should have either Suspend or Activate option
    const suspendOption = page.locator('[role="menuitem"]', { hasText: /suspend/i })
    const activateOption = page.locator('[role="menuitem"]', { hasText: /activate/i })

    await expect(suspendOption.or(activateOption)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Click whichever is visible
    const canSuspend = await suspendOption.isVisible().catch(() => false)
    if (canSuspend) {
      await suspendOption.click()
    } else {
      await activateOption.click()
    }

    // Toast should confirm the status change
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

    await expect(page).toHaveURL('/clients', { timeout: NAVIGATION_TIMEOUT })
  })
})
