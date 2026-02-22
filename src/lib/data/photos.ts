import type { PhotoResponseDto } from '@librestock/types'
import { apiBaseUrl } from '@/lib/url-config'
import { apiDelete, apiGet, apiPostFormData } from './axios-client'
import { makeParamQueryHook, makeMutationHook } from './make-crud-hooks'

export type { PhotoResponseDto }

// --- list photos for a product ---

const listPhotos = makeParamQueryHook<PhotoResponseDto[], string>(
  (productId) => ['/products', productId, 'photos'] as const,
  async (productId, signal) =>
    await apiGet<PhotoResponseDto[]>(
      `/products/${productId}/photos`,
      undefined,
      signal,
    ),
)

export const getListProductPhotosQueryKey = listPhotos.getQueryKey
export const getListProductPhotosQueryOptions = listPhotos.getQueryOptions
export const useListProductPhotos = listPhotos.useQuery

// --- upload photo ---

export const useUploadProductPhoto = makeMutationHook<
  PhotoResponseDto,
  { productId: string; file: File }
>('uploadProductPhoto', async (vars) => {
  const formData = new FormData()
  formData.append('file', vars.file)
  return await apiPostFormData<PhotoResponseDto>(
    `/products/${vars.productId}/photos`,
    formData,
  )
})

// --- delete photo ---

export const useDeleteProductPhoto = makeMutationHook<
  { message: string },
  { id: string }
>('deleteProductPhoto', async (vars) =>
  await apiDelete<{ message: string }>(`/photos/${vars.id}`),
)

// --- helper to construct photo URL from photo ID ---

export function getPhotoFileUrl(photoId: string): string {
  return `${apiBaseUrl}/photos/${photoId}/file`
}
