import {
  ProductSortField,
  SortOrder,
  type BulkCreateProductsDto,
  type BulkDeleteDto,
  type BulkOperationResultDto,
  type BulkRestoreDto,
  type BulkUpdateStatusDto,
  type CreateProductDto,
  type PaginatedProductsResponseDto,
  type ProductQueryDto,
  type ProductResponseDto,
  type UpdateProductDto,
} from '@librestock/types'
import { apiDelete, apiGet, apiPatch, apiPost } from './axios-client'
import {
  makeCrudHooks,
  makeMutationHook,
  makeParamQueryHook,
  makeQueryHook,
} from './make-crud-hooks'

export type {
  BulkCreateProductsDto,
  BulkDeleteDto,
  BulkOperationResultDto,
  BulkRestoreDto,
  BulkUpdateStatusDto,
  CreateProductDto,
  PaginatedProductsResponseDto,
  ProductQueryDto,
  ProductResponseDto,
  UpdateProductDto,
}
export { ProductSortField, SortOrder }

const crud = makeCrudHooks<
  ProductResponseDto,
  CreateProductDto,
  UpdateProductDto,
  PaginatedProductsResponseDto,
  ProductQueryDto,
  ProductResponseDto
>({ endpoint: '/products', resourceName: 'Product' })

export const getListProductsQueryKey = crud.getListQueryKey
export const getListProductsQueryOptions = crud.getListQueryOptions
export const useListProducts = crud.useList
export const useGetProduct = crud.useGet
export const useCreateProduct = crud.useCreate
export const useUpdateProduct = crud.useUpdate
export const useDeleteProduct = crud.useDelete

// --- listAll ---

const listAll = makeQueryHook<ProductResponseDto[]>(
  () => ['/products/all'] as const,
  async (signal) => await apiGet<ProductResponseDto[]>('/products/all', undefined, signal),
)

export const useListAllProducts = listAll.useQuery

// --- byCategory ---

const byCategory = makeParamQueryHook<ProductResponseDto[], string>(
  (categoryId) => ['/products/category', categoryId] as const,
  async (categoryId, signal) =>
    await apiGet<ProductResponseDto[]>(
      `/products/category/${categoryId}`,
      undefined,
      signal,
    ),
)

export const getGetProductsByCategoryQueryKey = byCategory.getQueryKey
export const getGetProductsByCategoryQueryOptions = byCategory.getQueryOptions
export const useGetProductsByCategory = byCategory.useQuery

// --- bulk operations ---

export const useBulkCreateProducts = makeMutationHook<
  BulkOperationResultDto,
  { data: BulkCreateProductsDto }
>('bulkCreateProducts', async (vars) =>
  await apiPost<BulkOperationResultDto>('/products/bulk', vars.data),
)

export const useBulkUpdateProductStatus = makeMutationHook<
  BulkOperationResultDto,
  { data: BulkUpdateStatusDto }
>('bulkUpdateProductStatus', async (vars) =>
  await apiPatch<BulkOperationResultDto>('/products/bulk/status', vars.data),
)

export const useBulkDeleteProducts = makeMutationHook<
  BulkOperationResultDto,
  { data: BulkDeleteDto }
>('bulkDeleteProducts', async (vars) =>
  await apiDelete<BulkOperationResultDto>('/products/bulk', vars.data),
)

export const useBulkRestoreProducts = makeMutationHook<
  BulkOperationResultDto,
  { data: BulkRestoreDto }
>('bulkRestoreProducts', async (vars) =>
  await apiPost<BulkOperationResultDto>('/products/bulk/restore', vars.data),
)
