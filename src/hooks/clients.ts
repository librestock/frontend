import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  useDeleteClient,
  useUpdateClient,
  getListClientsQueryKey,
  ClientStatus,
  type ClientResponseDto,
  type PaginatedClientsResponseDto,
} from '@/lib/data/clients'
import {
  removeItemFromPaginated,
  restoreQueryData,
  snapshotQueryData,
} from '@/lib/data/query-cache'

export function useDeleteClientOptimistic() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const deleteMutation = useDeleteClient({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getListClientsQueryKey(),
        })
      },
      onError: (error) => {
        toast.error(t('clients.deleteError') || 'Failed to delete client')
        console.error('Client deletion error:', error)
      },
    },
  })

  const performDelete = useCallback(
    (clientId: string) => {
      const listQueryKey = getListClientsQueryKey()
      const snapshot = snapshotQueryData<PaginatedClientsResponseDto>(
        queryClient,
        listQueryKey,
      )
      queryClient.setQueriesData<PaginatedClientsResponseDto>(
        { queryKey: listQueryKey },
        (old) => removeItemFromPaginated(old, clientId),
      )

      let didUndo = false
      const timeoutId = window.setTimeout(() => {
        if (didUndo) return
        deleteMutation.mutateAsync({ id: clientId }).catch(() => {
          restoreQueryData(queryClient, snapshot)
        })
      }, 5000)

      toast(t('clients.deleted') || 'Client deleted successfully', {
        action: {
          label: t('actions.undo') || 'Undo',
          onClick: () => {
            didUndo = true
            window.clearTimeout(timeoutId)
            restoreQueryData(queryClient, snapshot)
          },
        },
      })
    },
    [queryClient, deleteMutation, t],
  )

  return { deleteMutation, performDelete }
}

export function useToggleClientStatus() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const updateMutation = useUpdateClient({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getListClientsQueryKey(),
        })
      },
      onError: (error) => {
        toast.error(t('clients.updateError') || 'Failed to update client')
        console.error('Client status update error:', error)
      },
    },
  })

  const toggleStatus = useCallback(
    (client: ClientResponseDto) => {
      const nextStatus =
        client.account_status === ClientStatus.ACTIVE
          ? ClientStatus.SUSPENDED
          : ClientStatus.ACTIVE

      updateMutation.mutate({
        id: client.id,
        data: { account_status: nextStatus },
      })

      toast.success(t('clients.statusUpdated') || 'Client status updated')
    },
    [updateMutation, t],
  )

  return { updateMutation, toggleStatus }
}
