import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  useDeleteInventoryItem,
  useAdjustInventoryQuantity,
  getListInventoryQueryKey,
  type PaginatedInventoryResponseDto,
} from '@/lib/data/inventory'
import {
  removeItemFromPaginated,
  restoreQueryData,
  snapshotQueryData,
} from '@/lib/data/query-cache'

export function useDeleteInventoryOptimistic() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const deleteMutation = useDeleteInventoryItem({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getListInventoryQueryKey(),
        })
      },
      onError: (error) => {
        toast.error(
          t('inventory.deleteError') || 'Failed to delete inventory',
        )
        console.error('Inventory deletion error:', error)
      },
    },
  })

  const performDelete = useCallback(
    (id: string) => {
      const listQueryKey = getListInventoryQueryKey()
      const snapshot = snapshotQueryData<PaginatedInventoryResponseDto>(
        queryClient,
        listQueryKey,
      )
      queryClient.setQueriesData<PaginatedInventoryResponseDto>(
        { queryKey: listQueryKey },
        (old) => removeItemFromPaginated(old, id),
      )

      let didUndo = false
      const timeoutId = window.setTimeout(() => {
        if (didUndo) return
        deleteMutation.mutateAsync({ id }).catch(() => {
          restoreQueryData(queryClient, snapshot)
        })
      }, 5000)

      toast(t('inventory.deleted') || 'Inventory deleted successfully', {
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

export function useAdjustInventoryMutation(onSuccess: () => void) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useAdjustInventoryQuantity({
    mutation: {
      onSuccess: async () => {
        toast.success(
          t('inventory.adjusted') || 'Quantity adjusted successfully',
        )
        await queryClient.invalidateQueries({
          queryKey: getListInventoryQueryKey(),
        })
        onSuccess()
      },
      onError: (error) => {
        toast.error(
          t('inventory.adjustError') || 'Failed to adjust quantity',
        )
        console.error('Quantity adjustment error:', error)
      },
    },
  })
}
