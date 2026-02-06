import type {
  CategoryResponseDto,
  CategoryWithChildrenResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@librestock/types'
import type { QueryClient } from '@tanstack/react-query'
import {
  type QueryHookResult,
  type QueryOptionsArg,
  makeCrudHooks,
} from './make-crud-hooks'

export type {
  CategoryResponseDto,
  CategoryWithChildrenResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
}

const crud = makeCrudHooks<
  CategoryResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryWithChildrenResponseDto[],
  void,
  void
>({ endpoint: '/categories', resourceName: 'Category' })

export const getListCategoriesQueryKey = crud.getListQueryKey

export function getListCategoriesQueryOptions(
  options?: QueryOptionsArg<CategoryWithChildrenResponseDto[]>,
) {
  return crud.getListQueryOptions(undefined, options)
}

export function useListCategories(
  options?: QueryOptionsArg<CategoryWithChildrenResponseDto[]>,
  queryClient?: QueryClient,
): QueryHookResult<CategoryWithChildrenResponseDto[]> {
  return crud.useList(undefined, options, queryClient)
}

export const useCreateCategory = crud.useCreate
export const useUpdateCategory = crud.useUpdate
export const useDeleteCategory = crud.useDelete
