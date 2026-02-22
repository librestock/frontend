import { test, expect } from '@playwright/test'

const NAVIGATION_TIMEOUT = 15000

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')

    await page
      .locator('[data-sidebar="menu-button"]', { hasText: /settings/i })
      .click()

    await expect(page).toHaveURL('/settings', { timeout: NAVIGATION_TIMEOUT })
  })

  test('navigates to /settings and page header loads', async ({ page }) => {
    await expect(
      page.locator('h1', { hasText: /settings/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('branding form loads with fields', async ({ page }) => {
    // Branding card should be visible
    await expect(
      page.locator('text=Branding'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Application Name field should be present with a value
    const appNameInput = page.locator('#app_name')
    await expect(appNameInput).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    const appNameValue = await appNameInput.inputValue()
    expect(appNameValue.length).toBeGreaterThan(0)

    // Tagline field
    await expect(page.locator('#tagline')).toBeVisible()

    // Logo URL field
    await expect(page.locator('#logo_url')).toBeVisible()

    // Favicon URL field
    await expect(page.locator('#favicon_url')).toBeVisible()

    // Primary Color field
    await expect(page.locator('#primary_color')).toBeVisible()

    // Save button
    await expect(
      page.locator('button[type="submit"]', { hasText: /save/i }),
    ).toBeVisible()
  })

  test('appearance card is visible with theme and language sections', async ({ page }) => {
    // Appearance card title
    await expect(
      page.locator('text=Appearance'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Theme section
    await expect(page.locator('text=Theme')).toBeVisible()
    await expect(
      page.locator('text=Switch between light and dark mode'),
    ).toBeVisible()

    // Language section
    await expect(page.locator('text=Language')).toBeVisible()
    await expect(
      page.locator('text=Choose your preferred language'),
    ).toBeVisible()
  })

  test('theme toggle opens dropdown with light, dark, and system options', async ({ page }) => {
    // Find the theme toggle button (the one with sr-only "Toggle theme")
    const themeButton = page.locator('button', { has: page.locator('span.sr-only', { hasText: /toggle theme/i }) })
    await expect(themeButton).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await themeButton.click()

    // Dropdown should appear with Light, Dark, System options
    await expect(
      page.locator('[role="menuitem"]', { hasText: /light/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await expect(
      page.locator('[role="menuitem"]', { hasText: /dark/i }),
    ).toBeVisible()
    await expect(
      page.locator('[role="menuitem"]', { hasText: /system/i }),
    ).toBeVisible()

    // Click Dark
    await page.locator('[role="menuitem"]', { hasText: /dark/i }).click()

    // The HTML element should have the "dark" class
    await expect(page.locator('html')).toHaveClass(/dark/, { timeout: NAVIGATION_TIMEOUT })

    // Switch back to Light
    await themeButton.click()
    await page.locator('[role="menuitem"]', { hasText: /light/i }).click()

    // "dark" class should be removed
    await expect(page.locator('html')).not.toHaveClass(/dark/, { timeout: NAVIGATION_TIMEOUT })
  })

  test('language switcher changes language', async ({ page }) => {
    // Find the language select trigger
    const languageSelect = page.locator('button[role="combobox"]').filter({ hasText: /english|deutsch|français/i })
    await expect(languageSelect).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Open the select
    await languageSelect.click()

    // Verify language options are available
    await expect(
      page.locator('[role="option"]', { hasText: /deutsch/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await expect(
      page.locator('[role="option"]', { hasText: /français/i }),
    ).toBeVisible()
    await expect(
      page.locator('[role="option"]', { hasText: /english/i }),
    ).toBeVisible()

    // Switch to Deutsch
    await page.locator('[role="option"]', { hasText: /deutsch/i }).click()

    // Wait for language to change - the page header text should change
    // The Settings page title is a translated string; let it change
    await page.waitForTimeout(500)

    // Switch back to English
    const updatedSelect = page.locator('button[role="combobox"]').filter({ hasText: /deutsch/i })
    await updatedSelect.click()
    await page.locator('[role="option"]', { hasText: /english/i }).click()

    // Verify it's back to English
    await expect(
      page.locator('h1', { hasText: /settings/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test('sign-out button is present in account section', async ({ page }) => {
    // Account card should be visible
    await expect(
      page.locator('text=Account'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Account description
    await expect(
      page.locator('text=Manage your account session'),
    ).toBeVisible()

    // Sign Out button
    const signOutButton = page.locator('button', { hasText: /sign out/i })
    await expect(signOutButton).toBeVisible()

    // It should be a destructive variant button
    await expect(signOutButton).toBeEnabled()
  })
})
