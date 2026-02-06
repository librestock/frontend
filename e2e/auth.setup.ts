import { test as setup, expect } from '@playwright/test'
import { TEST_USER } from './global-setup'

const authFile = 'e2e/.auth/user.json'

setup('authenticate', async ({ page }) => {
  await page.goto('/login')

  await page.locator('input[type="email"]').fill(TEST_USER.email)
  await page.locator('input[type="password"]').fill(TEST_USER.password)
  await page.locator('button[type="submit"]').click()

  await expect(
    page.locator('[data-sidebar="menu-button"]', { hasText: /dashboard/i }),
  ).toBeVisible({ timeout: 15000 })

  await page.context().storageState({ path: authFile })
})
