import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const authBaseUrl = apiBaseUrl.replace(/\/api\/v1\/?$/, '')

export const authClient = createAuthClient({
  baseURL: authBaseUrl,
  plugins: [adminClient()],
})

export const { useSession, signIn, signOut, signUp, getSession } = authClient
