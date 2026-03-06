import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  useBanUser,
  useUnbanUser,
  useDeleteUser,
  useRevokeUserSessions,
  useUpdateUserRoles,
  getListUsersQueryKey,
} from '@/lib/data/users'

export function useUserMutations() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const invalidateUsers = (): void => {
    void queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() })
  }

  const banMutation = useBanUser({
    mutation: {
      onSuccess: () => {
        toast.success(
          t('users.banSuccess', { defaultValue: 'User banned' }),
        )
        invalidateUsers()
      },
      onError: () => {
        toast.error(
          t('users.banError', { defaultValue: 'Failed to ban user' }),
        )
      },
    },
  })

  const unbanMutation = useUnbanUser({
    mutation: {
      onSuccess: () => {
        toast.success(
          t('users.unbanSuccess', { defaultValue: 'User unbanned' }),
        )
        invalidateUsers()
      },
      onError: () => {
        toast.error(
          t('users.unbanError', { defaultValue: 'Failed to unban user' }),
        )
      },
    },
  })

  const deleteMutation = useDeleteUser({
    mutation: {
      onSuccess: () => {
        toast.success(
          t('users.deleteSuccess', { defaultValue: 'User deleted' }),
        )
        invalidateUsers()
      },
      onError: () => {
        toast.error(
          t('users.deleteError', { defaultValue: 'Failed to delete user' }),
        )
      },
    },
  })

  const revokeSessionsMutation = useRevokeUserSessions({
    mutation: {
      onSuccess: () => {
        toast.success(
          t('users.revokeSessionsSuccess', {
            defaultValue: 'Sessions revoked',
          }),
        )
      },
      onError: () => {
        toast.error(
          t('users.revokeSessionsError', {
            defaultValue: 'Failed to revoke sessions',
          }),
        )
      },
    },
  })

  return {
    banMutation,
    unbanMutation,
    deleteMutation,
    revokeSessionsMutation,
  }
}

export function useUpdateUserRolesMutation(onSuccess: () => void) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useUpdateUserRoles({
    mutation: {
      onSuccess: () => {
        toast.success(
          t('users.rolesUpdated', {
            defaultValue: 'Roles updated successfully',
          }),
        )
        void queryClient.invalidateQueries({
          queryKey: getListUsersQueryKey(),
        })
        onSuccess()
      },
      onError: () => {
        toast.error(
          t('users.rolesUpdateError', {
            defaultValue: 'Failed to update roles',
          }),
        )
      },
    },
  })
}
