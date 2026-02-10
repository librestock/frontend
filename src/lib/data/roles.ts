import type { CreateRoleDto, RoleResponseDto, UpdateRoleDto } from '@librestock/types'
import { makeCrudHooks } from './make-crud-hooks'

export type { CreateRoleDto, RoleResponseDto, UpdateRoleDto }

const crud = makeCrudHooks<
  RoleResponseDto,
  CreateRoleDto,
  UpdateRoleDto,
  RoleResponseDto[]
>({ endpoint: '/roles', resourceName: 'Role' })

export const getListRolesQueryKey = crud.getListQueryKey
export const getListRolesQueryOptions = crud.getListQueryOptions
export const useListRoles = crud.useList
export const useGetRole = crud.useGet
export const useCreateRole = crud.useCreate
export const useUpdateRole = crud.useUpdate
export const useDeleteRole = crud.useDelete
