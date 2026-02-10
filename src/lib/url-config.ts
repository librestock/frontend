import { env } from './env'

const API_VERSION_SUFFIX = '/api/v1'

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '')
}

export function deriveAuthBaseUrl(apiBaseUrl: string): string {
  const parsed = new URL(apiBaseUrl)
  const normalizedPath = trimTrailingSlashes(parsed.pathname)
  const authPath = normalizedPath.endsWith(API_VERSION_SUFFIX)
    ? normalizedPath.slice(0, -API_VERSION_SUFFIX.length)
    : normalizedPath

  return authPath ? `${parsed.origin}${authPath}` : parsed.origin
}

export const apiBaseUrl = trimTrailingSlashes(env.VITE_API_BASE_URL)
export const authBaseUrl = deriveAuthBaseUrl(apiBaseUrl)
