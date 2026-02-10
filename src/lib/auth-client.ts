import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'
import { authBaseUrl } from './url-config'

export const authClient = createAuthClient({
  baseURL: authBaseUrl,
  plugins: [adminClient()],
})

export const { useSession, signIn, signOut, signUp, getSession } = authClient
