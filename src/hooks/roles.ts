import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  useDeleteRole,
  useCreateRole,
  useUpdateRole,
  getListRolesQueryKey,
} from '@/lib/data/roles'

export function useDeleteRoleMutation() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useDeleteRole({
    mutation: {
      onSuccess: () => {
        toast.success(
          t('roles.deleted', { defaultValue: 'Role deleted successfully' }),
        )
        void queryClient.invalidateQueries({
          queryKey: getListRolesQueryKey(),
        })
      },
      onError: () => {
        toast.error(
          t('roles.deleteError', { defaultValue: 'Failed to delete role' }),
        )
      },
    },
  })
}

export function useRoleMutations(onSuccess: () => void) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const invalidateRoles = (): void => {
    void queryClient.invalidateQueries({ queryKey: getListRolesQueryKey() })
  }

  const createMutation = useCreateRole({
    mutation: {
      onSuccess: () => {
        toast.success(
          t('roles.created', {
            defaultValue: 'Role created successfully',
          }),
        )
        invalidateRoles()
        onSuccess()
      },
      onError: () => {
        toast.error(
          t('roles.createError', { defaultValue: 'Failed to create role' }),
        )
      },
    },
  })

  const updateMutation = useUpdateRole({
    mutation: {
      onSuccess: () => {
        toast.success(
          t('roles.updated', {
            defaultValue: 'Role updated successfully',
          }),
        )
        invalidateRoles()
        onSuccess()
      },
      onError: () => {
        toast.error(
          t('roles.updateError', { defaultValue: 'Failed to update role' }),
        )
      },
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  return { createMutation, updateMutation, isPending }
}
