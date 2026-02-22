import {
  type SupplierQueryDto,
  type SupplierResponseDto,
  type CreateSupplierDto,
  type PaginatedSuppliersResponseDto,
  type UpdateSupplierDto,
} from '@librestock/types'
import { makeCrudHooks } from './make-crud-hooks'

export type {
  SupplierQueryDto,
  SupplierResponseDto,
  CreateSupplierDto,
  PaginatedSuppliersResponseDto,
  UpdateSupplierDto,
}

const crud = makeCrudHooks<
  SupplierResponseDto,
  CreateSupplierDto,
  UpdateSupplierDto,
  PaginatedSuppliersResponseDto,
  SupplierQueryDto,
  void
>({ endpoint: '/suppliers', resourceName: 'Supplier' })

export const getListSuppliersQueryKey = crud.getListQueryKey
export const getListSuppliersQueryOptions = crud.getListQueryOptions
export const getGetSupplierQueryOptions = crud.getGetQueryOptions
export const useListSuppliers = crud.useList
export const useGetSupplier = crud.useGet
export const useCreateSupplier = crud.useCreate
export const useUpdateSupplier = crud.useUpdate
export const useDeleteSupplier = crud.useDelete
