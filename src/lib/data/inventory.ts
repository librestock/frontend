import type { AdjustInventoryDto, CreateInventoryDto, InventoryQueryDto, InventoryResponseDto, InventorySummaryDto, PaginatedInventoryResponseDto, UpdateInventoryDto } from '@librestock/types/inventory'
import { apiGet, apiPatch } from './axios-client'
import { makeCrudHooks, makeMutationHook, makeQueryHook } from './make-crud-hooks'

export type {
  AdjustInventoryDto,
  CreateInventoryDto,
  InventoryQueryDto,
  InventoryResponseDto,
  InventorySummaryDto,
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

const inventorySummary = makeQueryHook(
  () => ['/inventory/summary'] as const,
  async (signal?: AbortSignal) =>
    await apiGet<InventorySummaryDto>('/inventory/summary', undefined, signal),
)

export const getInventorySummaryQueryKey = inventorySummary.getQueryKey
export const getInventorySummaryQueryOptions = inventorySummary.getQueryOptions
export const useGetInventorySummary = inventorySummary.useQuery

export const useAdjustInventoryQuantity = makeMutationHook<
  InventoryResponseDto,
  { id: string; data: AdjustInventoryDto }
>('adjustInventoryQuantity', async (vars) =>
  await apiPatch<InventoryResponseDto>(`/inventory/${vars.id}/adjust`, vars.data),
)
