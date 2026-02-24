import { test, expect } from '@playwright/test'
import { NAVIGATION_TIMEOUT } from '../helpers'

test.describe('Locations Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/locations')

    await expect(
      page.locator('h1', { hasText: /locations/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('page loads with header and create button', async ({ page }) => {
    await expect(page).toHaveURL('/locations')

    await expect(
      page.locator('h1', { hasText: /locations/i }),
    ).toBeVisible()

    await expect(
      page.locator('text=Manage your storage locations'),
    ).toBeVisible()

    await expect(
      page.locator('button', { hasText: /create location/i }),
    ).toBeVisible()
  })

  test('search bar is visible and updates URL', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').or(
      page.locator('input[type="search"]'),
    )
    await expect(searchInput).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await searchInput.fill('warehouse')

    await expect(page).toHaveURL(/q=warehouse/, { timeout: NAVIGATION_TIMEOUT })
  })

  test('type filter dropdown shows location types', async ({ page }) => {
    const typeTrigger = page.locator('button[role="combobox"]').first()
    await expect(typeTrigger).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await typeTrigger.click()

    await expect(page.locator('[role="option"]', { hasText: /warehouse/i })).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await expect(page.locator('[role="option"]', { hasText: /supplier/i })).toBeVisible()
    await expect(page.locator('[role="option"]', { hasText: /in.transit/i })).toBeVisible()
    await expect(page.locator('[role="option"]', { hasText: /client/i })).toBeVisible()
  })

  test('selecting type filter updates URL and shows filter chip', async ({ page }) => {
    const typeTrigger = page.locator('button[role="combobox"]').first()
    await typeTrigger.click()

    await page.locator('[role="option"]', { hasText: /warehouse/i }).click()

    await expect(page).toHaveURL(/type=WAREHOUSE/, { timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('button', { hasText: /type.*warehouse/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('location cards load or empty state shows', async ({ page }) => {
    const locationCard = page.locator('[class*="card"]').first()
    const emptyState = page.locator('text=No locations found')

    await expect(locationCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('location card displays name, type badge, and status', async ({ page }) => {
    const locationCard = page.locator('[class*="card"]').first()
    const emptyState = page.locator('text=No locations found')

    await expect(locationCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const hasLocations = await locationCard.isVisible().catch(() => false)
    if (!hasLocations) {
      test.skip()
      return
    }

    // Card should show status badge
    const activeBadge = locationCard.locator('text=Active')
    const inactiveBadge = locationCard.locator('text=Inactive')
    await expect(activeBadge.or(inactiveBadge)).toBeVisible()
  })

  test('clicking location card navigates to detail page', async ({ page }) => {
    const locationCard = page.locator('[class*="card"]').first()
    const emptyState = page.locator('text=No locations found')

    await expect(locationCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const hasLocations = await locationCard.isVisible().catch(() => false)
    if (!hasLocations) {
      test.skip()
      return
    }

    // Click on the card (avoid the dropdown trigger)
    await locationCard.click()

    await expect(page).toHaveURL(/\/locations\//, { timeout: NAVIGATION_TIMEOUT })
  })

  test('create location: open dialog and verify form fields', async ({ page }) => {
    const createButton = page.locator('button', { hasText: /create location/i })
    await expect(createButton).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await createButton.click()

    await expect(
      page.locator('[role="dialog"]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('[role="dialog"] >> text=Create Location'),
    ).toBeVisible()

    // Verify form fields
    await expect(page.locator('[role="dialog"] #name')).toBeVisible()
    await expect(page.locator('[role="dialog"] >> text=Type')).toBeVisible()

    // Cancel
    const cancelButton = page.locator('[role="dialog"] button', { hasText: /cancel/i })
    await expect(cancelButton).toBeVisible()
    await cancelButton.click()
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: NAVIGATION_TIMEOUT })
  })

  test('create location: fill form and submit', async ({ page }) => {
    const createButton = page.locator('button', { hasText: /create location/i })
    await createButton.click()

    await expect(
      page.locator('[role="dialog"]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Fill name
    const nameInput = page.locator('[role="dialog"] #name')
    await expect(nameInput).toBeVisible()
    await nameInput.fill(`E2E Test Location ${Date.now()}`)

    // Fill address (optional)
    const addressInput = page.locator('[role="dialog"] #address')
    if (await addressInput.isVisible().catch(() => false)) {
      await addressInput.fill('123 Test Street')
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

  test('edit location via card dropdown', async ({ page }) => {
    const locationCard = page.locator('[class*="card"]').first()
    const emptyState = page.locator('text=No locations found')

    await expect(locationCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const hasLocations = await locationCard.isVisible().catch(() => false)
    if (!hasLocations) {
      test.skip()
      return
    }

    // Open dropdown
    const dropdownTrigger = locationCard.locator('button').filter({ has: page.locator('svg') }).last()
    await dropdownTrigger.click()

    await expect(
      page.locator('[role="menuitem"]', { hasText: /edit/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await page.locator('[role="menuitem"]', { hasText: /edit/i }).click()

    // Edit dialog
    await expect(
      page.locator('[role="dialog"]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('[role="dialog"] >> text=Edit Location'),
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

  test('delete location via card dropdown', async ({ page }) => {
    const locationCard = page.locator('[class*="card"]').first()
    const emptyState = page.locator('text=No locations found')

    await expect(locationCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const hasLocations = await locationCard.isVisible().catch(() => false)
    if (!hasLocations) {
      test.skip()
      return
    }

    // Open dropdown
    const dropdownTrigger = locationCard.locator('button').filter({ has: page.locator('svg') }).last()
    await dropdownTrigger.click()

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

    await expect(page).toHaveURL('/locations', { timeout: NAVIGATION_TIMEOUT })
  })
})

test.describe('Location Detail Page', () => {
  test('navigates to detail page and shows location info', async ({ page }) => {
    await page.goto('/locations')

    await expect(
      page.locator('h1', { hasText: /locations/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const locationCard = page.locator('[class*="card"]').first()
    const emptyState = page.locator('text=No locations found')

    await expect(locationCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const hasLocations = await locationCard.isVisible().catch(() => false)
    if (!hasLocations) {
      test.skip()
      return
    }

    await locationCard.click()

    await expect(page).toHaveURL(/\/locations\//, { timeout: NAVIGATION_TIMEOUT })

    // Should show location name as heading
    await expect(page.locator('h1').first()).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Should have back button
    await expect(
      page.locator('button', { hasText: /back to locations/i }).or(
        page.locator('a', { hasText: /back to locations/i }),
      ),
    ).toBeVisible()

    // Should have edit and delete buttons
    await expect(
      page.locator('button', { hasText: /edit/i }),
    ).toBeVisible()
    await expect(
      page.locator('button', { hasText: /delete/i }),
    ).toBeVisible()
  })

  test('detail page shows location details card', async ({ page }) => {
    await page.goto('/locations')

    await expect(
      page.locator('h1', { hasText: /locations/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const locationCard = page.locator('[class*="card"]').first()
    const emptyState = page.locator('text=No locations found')

    await expect(locationCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const hasLocations = await locationCard.isVisible().catch(() => false)
    if (!hasLocations) {
      test.skip()
      return
    }

    await locationCard.click()

    await expect(page).toHaveURL(/\/locations\//, { timeout: NAVIGATION_TIMEOUT })

    // Location Details card
    await expect(
      page.locator('text=Location Details').or(page.locator('text=Details')),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Status badge
    const activeBadge = page.locator('text=Active')
    const inactiveBadge = page.locator('text=Inactive')
    await expect(activeBadge.or(inactiveBadge)).toBeVisible()
  })

  test('detail page shows area tree section', async ({ page }) => {
    await page.goto('/locations')

    await expect(
      page.locator('h1', { hasText: /locations/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const locationCard = page.locator('[class*="card"]').first()
    const emptyState = page.locator('text=No locations found')

    await expect(locationCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const hasLocations = await locationCard.isVisible().catch(() => false)
    if (!hasLocations) {
      test.skip()
      return
    }

    await locationCard.click()

    await expect(page).toHaveURL(/\/locations\//, { timeout: NAVIGATION_TIMEOUT })

    // Area section should be visible
    await expect(
      page.locator('text=Areas').or(page.locator('text=Area')),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Create area button should be visible
    await expect(
      page.locator('button', { hasText: /create area/i }).or(
        page.locator('button', { hasText: /add area/i }),
      ),
    ).toBeVisible()
  })

  test('create area dialog opens from detail page', async ({ page }) => {
    await page.goto('/locations')

    await expect(
      page.locator('h1', { hasText: /locations/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const locationCard = page.locator('[class*="card"]').first()
    const emptyState = page.locator('text=No locations found')

    await expect(locationCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const hasLocations = await locationCard.isVisible().catch(() => false)
    if (!hasLocations) {
      test.skip()
      return
    }

    await locationCard.click()

    await expect(page).toHaveURL(/\/locations\//, { timeout: NAVIGATION_TIMEOUT })

    // Click create area
    const createAreaButton = page.locator('button', { hasText: /create area/i }).or(
      page.locator('button', { hasText: /add area/i }),
    )
    await expect(createAreaButton).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await createAreaButton.click()

    // Dialog should open
    await expect(
      page.locator('[role="dialog"]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Form fields
    await expect(page.locator('[role="dialog"] #name')).toBeVisible()

    // Close
    const cancelButton = page.locator('[role="dialog"] button', { hasText: /cancel/i })
    await expect(cancelButton).toBeVisible()
    await cancelButton.click()
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: NAVIGATION_TIMEOUT })
  })

  test('back button navigates to locations list', async ({ page }) => {
    await page.goto('/locations')

    await expect(
      page.locator('h1', { hasText: /locations/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const locationCard = page.locator('[class*="card"]').first()
    const emptyState = page.locator('text=No locations found')

    await expect(locationCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const hasLocations = await locationCard.isVisible().catch(() => false)
    if (!hasLocations) {
      test.skip()
      return
    }

    await locationCard.click()

    await expect(page).toHaveURL(/\/locations\//, { timeout: NAVIGATION_TIMEOUT })

    // Click back
    const backButton = page.locator('button', { hasText: /back to locations/i }).or(
      page.locator('a', { hasText: /back to locations/i }),
    )
    await backButton.click()

    await expect(page).toHaveURL('/locations', { timeout: NAVIGATION_TIMEOUT })
  })
})
