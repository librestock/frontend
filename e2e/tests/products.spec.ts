import { test, expect } from '@playwright/test'

const NAVIGATION_TIMEOUT = 15000

test.describe('Products Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')

    await page
      .locator('[data-sidebar="menu-button"]', { hasText: /products/i })
      .click()

    await expect(page).toHaveURL('/products', { timeout: NAVIGATION_TIMEOUT })
  })

  test('navigates to /products via sidebar', async ({ page }) => {
    // The beforeEach already navigated; verify the URL
    await expect(page).toHaveURL('/products')
  })

  test('product list loads with items or shows empty state', async ({ page }) => {
    // Wait for the loading spinner to disappear or for content to appear
    const productCard = page.locator('[role="button"]').first()
    const emptyState = page.locator('text=No products found')

    await expect(productCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('clicking a product navigates to product detail page', async ({ page }) => {
    // Wait for at least one product card to appear
    const productCard = page.locator('[role="button"]').first()
    const emptyState = page.locator('text=No products found')

    await expect(productCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Only proceed if products exist
    const hasProducts = await productCard.isVisible().catch(() => false)
    if (!hasProducts) {
      test.skip()
      return
    }

    await productCard.click()

    // Should navigate to /products/<id>
    await expect(page).toHaveURL(/\/products\//, { timeout: NAVIGATION_TIMEOUT })
  })

  test('product detail page shows expected fields', async ({ page }) => {
    const productCard = page.locator('[role="button"]').first()
    const emptyState = page.locator('text=No products found')

    await expect(productCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const hasProducts = await productCard.isVisible().catch(() => false)
    if (!hasProducts) {
      test.skip()
      return
    }

    await productCard.click()

    await expect(page).toHaveURL(/\/products\//, { timeout: NAVIGATION_TIMEOUT })

    // Product detail page should show the product name as h1
    await expect(page.locator('h1').first()).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Should show Product Details card
    await expect(
      page.locator('text=Product Details'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Should show SKU field
    await expect(page.locator('text=SKU')).toBeVisible()

    // Should show active/inactive badge
    const activeBadge = page.locator('text=Active')
    const inactiveBadge = page.locator('text=Inactive')
    await expect(activeBadge.or(inactiveBadge)).toBeVisible()

    // Should show back button
    await expect(
      page.locator('button', { hasText: /products/i }),
    ).toBeVisible()

    // Should show edit and delete buttons
    await expect(
      page.locator('button', { hasText: /edit/i }),
    ).toBeVisible()
    await expect(
      page.locator('button', { hasText: /delete/i }),
    ).toBeVisible()
  })

  test('create product flow: open dialog, fill form, submit', async ({ page }) => {
    // Click the create product button
    const createButton = page.locator('button', { hasText: /create product/i })
    await expect(createButton).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await createButton.click()

    // Dialog should open
    await expect(
      page.locator('[role="dialog"]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Dialog title should be visible
    await expect(
      page.locator('[role="dialog"] >> text=Create Product'),
    ).toBeVisible()

    // Fill in the SKU field
    const skuInput = page.locator('#sku')
    await expect(skuInput).toBeVisible()
    const uniqueSku = `E2E-TEST-${Date.now()}`
    await skuInput.fill(uniqueSku)

    // Fill in the product name
    const nameInput = page.locator('#name')
    await expect(nameInput).toBeVisible()
    await nameInput.fill('E2E Test Product')

    // Submit the form via the dialog submit button
    const submitButton = page.locator('[role="dialog"] button[type="submit"]', { hasText: /create/i })
    await submitButton.click()

    // Dialog should close on success (or show validation errors)
    // Wait for either the dialog to close or an error to appear
    const dialogClosed = page.locator('[role="dialog"]')
    await expect(dialogClosed).toBeHidden({ timeout: NAVIGATION_TIMEOUT })

    // Verify the new product appears in the list
    await expect(
      page.locator('text=E2E Test Product'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('edit product flow: open dropdown, click edit, modify, save', async ({ page }) => {
    // Wait for products to load
    const productCard = page.locator('[role="button"]').first()
    const emptyState = page.locator('text=No products found')

    await expect(productCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const hasProducts = await productCard.isVisible().catch(() => false)
    if (!hasProducts) {
      test.skip()
      return
    }

    // Open the three-dot dropdown menu on the first product
    const dropdownTrigger = page.locator('[role="button"]').first().locator('button').filter({ has: page.locator('.lucide-more-horizontal, svg') }).first()
    await dropdownTrigger.click()

    // Click the Edit option
    await expect(
      page.locator('[role="menuitem"]', { hasText: /edit/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await page.locator('[role="menuitem"]', { hasText: /edit/i }).click()

    // Edit dialog should open
    await expect(
      page.locator('[role="dialog"]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('[role="dialog"] >> text=Edit Product'),
    ).toBeVisible()

    // Modify the product name
    const nameInput = page.locator('[role="dialog"] #name')
    await expect(nameInput).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await nameInput.fill('E2E Updated Product')

    // Save via the dialog submit button
    const saveButton = page.locator('[role="dialog"] button[type="submit"]', { hasText: /save/i })
    await saveButton.click()

    // Dialog should close
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: NAVIGATION_TIMEOUT })
  })

  test('delete product flow: open dropdown, click delete, confirm', async ({ page }) => {
    // Wait for products to load
    const productCard = page.locator('[role="button"]').first()
    const emptyState = page.locator('text=No products found')

    await expect(productCard.or(emptyState)).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const hasProducts = await productCard.isVisible().catch(() => false)
    if (!hasProducts) {
      test.skip()
      return
    }

    // Open the three-dot dropdown menu on the first product
    const dropdownTrigger = page.locator('[role="button"]').first().locator('button').filter({ has: page.locator('.lucide-more-horizontal, svg') }).first()
    await dropdownTrigger.click()

    // Click the Delete option
    await expect(
      page.locator('[role="menuitem"]', { hasText: /delete/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await page.locator('[role="menuitem"]', { hasText: /delete/i }).click()

    // Delete confirmation dialog should open (AlertDialog)
    await expect(
      page.locator('[role="alertdialog"]'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await expect(
      page.locator('[role="alertdialog"] >> text=Delete Product'),
    ).toBeVisible()

    // Confirm the deletion
    const confirmButton = page.locator('[role="alertdialog"] button', { hasText: /delete/i })
    await confirmButton.click()

    // Dialog should close
    await expect(page.locator('[role="alertdialog"]')).toBeHidden({ timeout: NAVIGATION_TIMEOUT })

    // An undo toast should appear
    await expect(
      page.locator('text=Product deleted successfully').or(page.locator('[data-sonner-toast]')),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })
})
