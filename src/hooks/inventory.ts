import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  useDeleteInventoryItem,
  useAdjustInventoryQuantity,
  getListInventoryQueryKey,
  type PaginatedInventoryResponseDto,
} from '@/lib/data/inventory'
import { removeItemFromPaginated } from '@/lib/data/query-cache'
import { makeOptimisticDelete } from '@/lib/data/make-optimistic-delete'

const useDeleteInventoryOptimisticFactory = makeOptimisticDelete({
  useMutationHook: useDeleteInventoryItem,
  getOptimisticTargets: (id) => [
    {
      queryKey: getListInventoryQueryKey(),
      update: (old) =>
        removeItemFromPaginated(
          old as PaginatedInventoryResponseDto | undefined,
          id,
        ),
    },
  ],
  getInvalidationKeys: () => [getListInventoryQueryKey()],
  i18n: {
    success: 'inventory.deleted',
    error: 'inventory.deleteError',
    undo: 'actions.undo',
  },
  onMutationError: (error) => {
    console.error('Inventory deletion error:', error)
  },
})

export function useDeleteInventoryOptimistic(): ReturnType<
  typeof useDeleteInventoryOptimisticFactory
> {
  return useDeleteInventoryOptimisticFactory()
}

export function useAdjustInventoryMutation(
  onSuccess: () => void,
): ReturnType<typeof useAdjustInventoryQuantity> {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useAdjustInventoryQuantity({
    mutation: {
      onSuccess: async () => {
        toast.success(
          t('inventory.adjusted', { defaultValue: 'Quantity adjusted successfully' }),
        )
        await queryClient.invalidateQueries({
          queryKey: getListInventoryQueryKey(),
        })
        onSuccess()
      },
      onError: (error) => {
        toast.error(
          t('inventory.adjustError', { defaultValue: 'Failed to adjust quantity' }),
        )
        console.error('Quantity adjustment error:', error)
      },
    },
  })
}
