import {
  LocationSortField,
  LocationType,
  SortOrder,
  type CreateLocationDto,
  type LocationQueryDto,
  type LocationResponseDto,
  type PaginatedLocationsResponseDto,
  type UpdateLocationDto,
} from '@librestock/types'
import { apiGet } from './axios-client'
import { makeCrudHooks, makeQueryHook } from './make-crud-hooks'

export type {
  CreateLocationDto,
  LocationQueryDto,
  LocationResponseDto,
  PaginatedLocationsResponseDto,
  UpdateLocationDto,
}
export { LocationSortField, LocationType, SortOrder }

const crud = makeCrudHooks<
  LocationResponseDto,
  CreateLocationDto,
  UpdateLocationDto,
  PaginatedLocationsResponseDto,
  LocationQueryDto,
  void
>({ endpoint: '/locations', resourceName: 'Location' })

export const getListLocationsQueryKey = crud.getListQueryKey
export const getListLocationsQueryOptions = crud.getListQueryOptions
export const getGetLocationQueryOptions = crud.getGetQueryOptions
export const useListLocations = crud.useList
export const useGetLocation = crud.useGet
export const useCreateLocation = crud.useCreate
export const useUpdateLocation = crud.useUpdate
export const useDeleteLocation = crud.useDelete

const listAll = makeQueryHook<LocationResponseDto[]>(
  () => ['/locations/all'] as const,
  async (signal) => await apiGet<LocationResponseDto[]>('/locations/all', undefined, signal),
)

export const getListAllLocationsQueryKey = listAll.getQueryKey
export const getListAllLocationsQueryOptions = listAll.getQueryOptions
export const useListAllLocations = listAll.useQuery
