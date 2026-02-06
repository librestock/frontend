import { test, expect } from '@playwright/test'
import { TEST_USER } from '../global-setup'

const NAVIGATION_TIMEOUT = 15000

test.describe('Authentication', () => {
  test('login form renders', async ({ page }) => {
    await page.goto('/login')

    await expect(page.locator('h1', { hasText: /sign in/i })).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]', { hasText: /sign in/i })).toBeVisible()
  })

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto('/login')

    await page.locator('input[type="email"]').fill(TEST_USER.email)
    await page.locator('input[type="password"]').fill(TEST_USER.password)
    await page.locator('button[type="submit"]').click()

    await expect(
      page.locator('[data-sidebar="menu-button"]', { hasText: /dashboard/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await expect(page).toHaveURL('/')
  })

  test('failed login shows error message', async ({ page }) => {
    await page.goto('/login')

    await page.locator('input[type="email"]').fill('wrong@example.com')
    await page.locator('input[type="password"]').fill('WrongPassword123!')
    await page.locator('button[type="submit"]').click()

    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await expect(page).toHaveURL('/login')
  })

  test('unauthenticated access shows welcome screen', async ({ page }) => {
    await page.goto('/')

    await expect(
      page.getByTestId('welcome-heading'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await expect(page.locator('a', { hasText: /sign in/i })).toBeVisible()
  })

  test('logout returns to unauthenticated state', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.locator('input[type="email"]').fill(TEST_USER.email)
    await page.locator('input[type="password"]').fill(TEST_USER.password)
    await page.locator('button[type="submit"]').click()

    await expect(
      page.locator('[data-sidebar="menu-button"]', { hasText: /dashboard/i }),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // Clear cookies to simulate logout
    await page.context().clearCookies()
    await page.reload()

    await expect(
      page.getByTestId('welcome-heading'),
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })
})
