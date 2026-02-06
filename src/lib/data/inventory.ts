import type {
  AdjustInventoryDto,
  CreateInventoryDto,
  InventoryQueryDto,
  InventoryResponseDto,
  PaginatedInventoryResponseDto,
  UpdateInventoryDto,
} from '@librestock/types'
import { apiPatch } from './axios-client'
import { makeCrudHooks, makeMutationHook } from './make-crud-hooks'

export type {
  AdjustInventoryDto,
  CreateInventoryDto,
  InventoryQueryDto,
  InventoryResponseDto,
  PaginatedInventoryResponseDto,
  UpdateInventoryDto,
}

const crud = makeCrudHooks<
  InventoryResponseDto,
  CreateInventoryDto,
  UpdateInventoryDto,
  PaginatedInventoryResponseDto,
  InventoryQueryDto,
  void
>({ endpoint: '/inventory', resourceName: 'InventoryItem' })

export const getListInventoryQueryKey = crud.getListQueryKey
export const getListInventoryQueryOptions = crud.getListQueryOptions
export const useListInventory = crud.useList
export const useCreateInventoryItem = crud.useCreate
export const useUpdateInventoryItem = crud.useUpdate
export const useDeleteInventoryItem = crud.useDelete

export const useAdjustInventoryQuantity = makeMutationHook<
  InventoryResponseDto,
  { id: string; data: AdjustInventoryDto }
>('adjustInventoryQuantity', async (vars) =>
  await apiPatch<InventoryResponseDto>(`/inventory/${vars.id}/adjust`, vars.data),
)
