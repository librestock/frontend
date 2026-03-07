import type { PaginationMeta } from '@librestock/types/common'
import { StockMovementReason, type CreateStockMovementDto, type StockMovementQueryDto, type StockMovementResponseDto } from '@librestock/types/stock-movements'
import { makeCrudHooks } from './make-crud-hooks'

export type { CreateStockMovementDto, StockMovementQueryDto, StockMovementResponseDto }
export { StockMovementReason }

export interface PaginatedStockMovementsResponseDto {
  data: StockMovementResponseDto[]
  meta: PaginationMeta
}

const crud = makeCrudHooks<
  StockMovementResponseDto,
  CreateStockMovementDto,
  never,
  PaginatedStockMovementsResponseDto,
  StockMovementQueryDto,
  never
>({ endpoint: '/stock-movements', resourceName: 'StockMovement' })

export const getListStockMovementsQueryKey = crud.getListQueryKey
export const getListStockMovementsQueryOptions = crud.getListQueryOptions
export const useListStockMovements = crud.useList
export const useGetStockMovement = crud.useGet
export const useCreateStockMovement = crud.useCreate
