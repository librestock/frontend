import type { BrandingResponseDto, UpdateBrandingDto } from '@librestock/types'
import { apiGet, apiPut } from './axios-client'
import { makeMutationHook, makeQueryHook } from './make-crud-hooks'

export type { BrandingResponseDto, UpdateBrandingDto }

const branding = makeQueryHook<BrandingResponseDto>(
  () => ['/branding'] as const,
  async (signal) => await apiGet<BrandingResponseDto>('/branding', undefined, signal),
)

export const getBrandingControllerGetQueryKey = branding.getQueryKey
export const getBrandingControllerGetQueryOptions = branding.getQueryOptions
export const useBrandingControllerGet = branding.useQuery

export const useBrandingControllerUpdate = makeMutationHook<
  BrandingResponseDto,
  { data: UpdateBrandingDto }
>('brandingControllerUpdate', async (vars) =>
  await apiPut<BrandingResponseDto>('/branding', vars.data),
)
