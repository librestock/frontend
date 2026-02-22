import {
  OrderStatus,
  type CreateOrderType,
  type UpdateOrderType,
  type OrderResponseType,
  type OrderItemResponseType,
  type OrderQueryType,
  type UpdateOrderStatusType,
  type PaginationMeta,
} from '@librestock/types'
import { apiPatch } from './axios-client'
import { makeCrudHooks, makeMutationHook } from './make-crud-hooks'

export type CreateOrderDto = CreateOrderType
export type UpdateOrderDto = UpdateOrderType
export type OrderResponseDto = OrderResponseType
export type OrderItemResponseDto = OrderItemResponseType
export type OrderQueryDto = OrderQueryType
export type UpdateOrderStatusDto = UpdateOrderStatusType

export interface PaginatedOrdersResponseDto {
  data: OrderResponseDto[]
  meta: PaginationMeta
}

export { OrderStatus }

const crud = makeCrudHooks<
  OrderResponseDto,
  CreateOrderDto,
  UpdateOrderDto,
  PaginatedOrdersResponseDto,
  OrderQueryDto,
  void
>({ endpoint: '/orders', resourceName: 'Order' })

export const getListOrdersQueryKey = crud.getListQueryKey
export const getListOrdersQueryOptions = crud.getListQueryOptions
export const getGetOrderQueryKey = crud.getGetQueryKey
export const getGetOrderQueryOptions = crud.getGetQueryOptions
export const useListOrders = crud.useList
export const useGetOrder = crud.useGet
export const useCreateOrder = crud.useCreate
export const useUpdateOrder = crud.useUpdate
export const useDeleteOrder = crud.useDelete

// --- custom: update order status ---

export const useUpdateOrderStatus = makeMutationHook<
  OrderResponseDto,
  { id: string; data: UpdateOrderStatusDto }
>('updateOrderStatus', async (vars) =>
  await apiPatch<OrderResponseDto>(`/orders/${vars.id}/status`, vars.data),
)
