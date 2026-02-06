import type {
  AreaQueryDto,
  AreaResponseDto,
  CreateAreaDto,
  UpdateAreaDto,
} from '@librestock/types'
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

export const getAreasControllerFindAllQueryKey = crud.getListQueryKey
export const getAreasControllerFindByIdQueryKey = crud.getGetQueryKey
export const getAreasControllerFindAllQueryOptions = crud.getListQueryOptions
export const getAreasControllerFindByIdQueryOptions = crud.getGetQueryOptions
export const useAreasControllerFindAll = crud.useList
export const useAreasControllerFindById = crud.useGet
export const useAreasControllerCreate = crud.useCreate
export const useAreasControllerUpdate = crud.useUpdate
export const useAreasControllerDelete = crud.useDelete
