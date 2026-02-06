export const TEST_USER = {
  name: 'E2E Test User',
  email: 'e2e-test@librestock.local',
  password: 'TestPassword123!',
}

const MAX_RETRIES = 5
const RETRY_DELAY_MS = 3000

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function createTestUser(): Promise<void> {
  const response = await fetch('http://localhost:8080/api/auth/sign-up/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: TEST_USER.name,
      email: TEST_USER.email,
      password: TEST_USER.password,
    }),
  })

  if (response.ok) {
    console.log('Test user created successfully')
    return
  }

  if (response.status === 422 || response.status === 409) {
    console.log('Test user already exists, skipping creation')
    return
  }

  const body = await response.text()
  throw new Error(
    `Failed to create test user: ${response.status} ${response.statusText}\n${body}`,
  )
}

async function globalSetup(): Promise<void> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await createTestUser()
      return
    } catch (error) {
      console.error(`Attempt ${attempt}/${MAX_RETRIES} failed:`, (error as Error).message)
      if (attempt < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s...`)
        await sleep(RETRY_DELAY_MS)
      } else {
        throw error
      }
    }
  }
}

export default globalSetup
