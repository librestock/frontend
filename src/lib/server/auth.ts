import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import type { CurrentUserResponseDto } from '@/lib/data/auth'
import { apiBaseUrl } from '@/lib/url-config'

const CURRENT_USER_PATH = '/auth/me'

async function fetchCurrentUser(
  cookieHeader?: string,
): Promise<CurrentUserResponseDto | null> {
  const headers = new Headers({
    Accept: 'application/json',
  })

  if (cookieHeader) {
    headers.set('cookie', cookieHeader)
  }

  const response = await fetch(`${apiBaseUrl}${CURRENT_USER_PATH}`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  })

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch current user: ${response.status}`)
  }

  return (await response.json()) as CurrentUserResponseDto
}

export const getServerCurrentUser = createServerFn({ method: 'GET' }).handler(
  async (): Promise<CurrentUserResponseDto | null> => {
    const cookieHeader = getRequestHeader('cookie')
    return fetchCurrentUser(cookieHeader)
  },
)
