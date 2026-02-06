import {
  type BanUserDto,
  type PaginatedUsersResponseDto,
  type UpdateUserRolesDto,
  type UserQueryDto,
  type UserResponseDto,
} from '@librestock/types'
import { makeCrudHooks, makeMutationHook } from './make-crud-hooks'
import { apiPatch, apiPost, apiPut, apiDelete } from './axios-client'

export type {
  BanUserDto,
  PaginatedUsersResponseDto,
  UpdateUserRolesDto,
  UserQueryDto,
  UserResponseDto,
}

const crud = makeCrudHooks<
  UserResponseDto,
  never,
  never,
  PaginatedUsersResponseDto,
  UserQueryDto,
  void
>({ endpoint: '/users', resourceName: 'User' })

export const getListUsersQueryKey = crud.getListQueryKey
export const getListUsersQueryOptions = crud.getListQueryOptions
export const useListUsers = crud.useList
export const useGetUser = crud.useGet

export const useUpdateUserRoles = makeMutationHook<
  UserResponseDto,
  { id: string; data: UpdateUserRolesDto }
>(
  'updateUserRoles',
  async (vars) => await apiPut<UserResponseDto>(`/users/${vars.id}/roles`, vars.data),
)

export const useBanUser = makeMutationHook<
  UserResponseDto,
  { id: string; data: BanUserDto }
>(
  'banUser',
  async (vars) => await apiPatch<UserResponseDto>(`/users/${vars.id}/ban`, vars.data),
)

export const useUnbanUser = makeMutationHook<UserResponseDto, { id: string }>(
  'unbanUser',
  async (vars) => await apiPatch<UserResponseDto>(`/users/${vars.id}/unban`),
)

export const useDeleteUser = makeMutationHook<void, { id: string }>(
  'deleteUser',
  async (vars) => await apiDelete<void>(`/users/${vars.id}`),
)

export const useRevokeUserSessions = makeMutationHook<void, { id: string }>(
  'revokeUserSessions',
  async (vars) => await apiPost<void>(`/users/${vars.id}/revoke-sessions`),
)
