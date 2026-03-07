import type { BrandingResponseDto, UpdateBrandingDto } from '@librestock/types/branding'
import { apiGet, apiPut } from './axios-client'
import { makeMutationHook, makeQueryHook } from './make-crud-hooks'

export type { BrandingResponseDto, UpdateBrandingDto }

const branding = makeQueryHook<BrandingResponseDto>(
  () => ['/branding'] as const,
  async (signal) => await apiGet<BrandingResponseDto>('/branding', undefined, signal),
)

export const getBrandingQueryKey = branding.getQueryKey
export const getBrandingQueryOptions = branding.getQueryOptions
export const useGetBranding = branding.useQuery

export const useUpdateBranding = makeMutationHook<
  BrandingResponseDto,
  { data: UpdateBrandingDto }
>('updateBranding', async (vars) =>
  await apiPut<BrandingResponseDto>('/branding', vars.data),
)

// Deprecated aliases kept for backward compatibility during migration.
export const getBrandingControllerGetQueryKey = getBrandingQueryKey
export const getBrandingControllerGetQueryOptions = getBrandingQueryOptions
export const useBrandingControllerGet = useGetBranding
export const useBrandingControllerUpdate = useUpdateBranding
