import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  useDeleteOrder,
  useUpdateOrderStatus,
  getListOrdersQueryKey,
  getGetOrderQueryKey,
  type PaginatedOrdersResponseDto,
} from '@/lib/data/orders'
import {
  removeItemFromPaginated,
  restoreQueryData,
  snapshotQueryData,
} from '@/lib/data/query-cache'

export function useDeleteOrderOptimistic() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const deleteMutation = useDeleteOrder({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getListOrdersQueryKey(),
        })
      },
      onError: (error) => {
        toast.error(t('orders.deleteError', { defaultValue: 'Failed to delete order' }))
        console.error('Order deletion error:', error)
      },
    },
  })

  const performDelete = useCallback(
    (orderId: string) => {
      const listQueryKey = getListOrdersQueryKey()
      const snapshot = snapshotQueryData<PaginatedOrdersResponseDto>(
        queryClient,
        listQueryKey,
      )
      queryClient.setQueriesData<PaginatedOrdersResponseDto>(
        { queryKey: listQueryKey },
        (old) => removeItemFromPaginated(old, orderId),
      )

      let didUndo = false
      const timeoutId = window.setTimeout(() => {
        if (didUndo) return
        deleteMutation.mutateAsync({ id: orderId }).catch(() => {
          restoreQueryData(queryClient, snapshot)
        })
      }, 5000)

      toast(t('orders.deleted', { defaultValue: 'Order deleted successfully' }), {
        action: {
          label: t('actions.undo', { defaultValue: 'Undo' }),
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

export function useOrderStatusTransition(orderId: string) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useUpdateOrderStatus({
    mutation: {
      onSuccess: async () => {
        toast.success(t('orders.statusUpdated', { defaultValue: 'Order status updated' }))
        await queryClient.invalidateQueries({
          queryKey: getListOrdersQueryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: getGetOrderQueryKey(orderId),
        })
      },
      onError: (error) => {
        toast.error(
          t('orders.statusUpdateError', { defaultValue: 'Failed to update order status' }),
        )
        console.error('Order status update error:', error)
      },
    },
  })
}
