import type { AreaQueryDto, AreaResponseDto, CreateAreaDto, UpdateAreaDto } from '@librestock/types/areas'
import { makeCrudHooks } from './make-crud-hooks'

export type { AreaQueryDto, AreaResponseDto, CreateAreaDto, UpdateAreaDto }

const crud = makeCrudHooks<
  AreaResponseDto,
  CreateAreaDto,
  UpdateAreaDto,
  AreaResponseDto[],
  AreaQueryDto,
  void
>({ endpoint: '/areas', resourceName: 'Area' })

export const getListAreasQueryKey = crud.getListQueryKey
export const getGetAreaQueryKey = crud.getGetQueryKey
export const getListAreasQueryOptions = crud.getListQueryOptions
export const getGetAreaQueryOptions = crud.getGetQueryOptions
export const useListAreas = crud.useList
export const useGetArea = crud.useGet
export const useCreateArea = crud.useCreate
export const useUpdateArea = crud.useUpdate
export const useDeleteArea = crud.useDelete

// Deprecated aliases kept for backward compatibility during migration.
export const getAreasControllerFindAllQueryKey = getListAreasQueryKey
export const getAreasControllerFindByIdQueryKey = getGetAreaQueryKey
export const getAreasControllerFindAllQueryOptions = getListAreasQueryOptions
export const getAreasControllerFindByIdQueryOptions = getGetAreaQueryOptions
export const useAreasControllerFindAll = useListAreas
export const useAreasControllerFindById = useGetArea
export const useAreasControllerCreate = useCreateArea
export const useAreasControllerUpdate = useUpdateArea
export const useAreasControllerDelete = useDeleteArea
