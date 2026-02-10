import type { CurrentUserResponseDto } from '@librestock/types'
import { apiGet } from './axios-client'
import { makeQueryHook } from './make-crud-hooks'

export type { CurrentUserResponseDto }

const currentUser = makeQueryHook<CurrentUserResponseDto>(
  () => ['/auth/me'] as const,
  async (signal) => await apiGet<CurrentUserResponseDto>('/auth/me', undefined, signal),
)

export const getCurrentUserQueryKey = currentUser.getQueryKey
export const getCurrentUserQueryOptions = currentUser.getQueryOptions
export const useCurrentUser = currentUser.useQuery
