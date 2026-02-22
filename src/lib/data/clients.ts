import {
  ClientStatus,
  type ClientQueryDto,
  type ClientResponseDto,
  type CreateClientDto,
  type PaginatedClientsResponseDto,
  type UpdateClientDto,
} from '@librestock/types'
import { makeCrudHooks } from './make-crud-hooks'

export type {
  ClientQueryDto,
  ClientResponseDto,
  CreateClientDto,
  PaginatedClientsResponseDto,
  UpdateClientDto,
}
export { ClientStatus }

const crud = makeCrudHooks<
  ClientResponseDto,
  CreateClientDto,
  UpdateClientDto,
  PaginatedClientsResponseDto,
  ClientQueryDto,
  void
>({ endpoint: '/clients', resourceName: 'Client' })

export const getListClientsQueryKey = crud.getListQueryKey
export const getListClientsQueryOptions = crud.getListQueryOptions
export const getGetClientQueryOptions = crud.getGetQueryOptions
export const useListClients = crud.useList
export const useGetClient = crud.useGet
export const useCreateClient = crud.useCreate
export const useUpdateClient = crud.useUpdate
export const useDeleteClient = crud.useDelete
