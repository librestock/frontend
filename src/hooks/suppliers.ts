import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  useDeleteSupplier,
  getListSuppliersQueryKey,
  type PaginatedSuppliersResponseDto,
} from '@/lib/data/suppliers'
import {
  removeItemFromPaginated,
  restoreQueryData,
  snapshotQueryData,
} from '@/lib/data/query-cache'

export function useDeleteSupplierOptimistic() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const deleteMutation = useDeleteSupplier({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getListSuppliersQueryKey(),
        })
      },
      onError: (error) => {
        toast.error(
          t('suppliers.deleteError') || 'Failed to delete supplier',
        )
        console.error('Supplier deletion error:', error)
      },
    },
  })

  const performDelete = useCallback(
    (supplierId: string) => {
      const listQueryKey = getListSuppliersQueryKey()
      const snapshot = snapshotQueryData<PaginatedSuppliersResponseDto>(
        queryClient,
        listQueryKey,
      )
      queryClient.setQueriesData<PaginatedSuppliersResponseDto>(
        { queryKey: listQueryKey },
        (old) => removeItemFromPaginated(old, supplierId),
      )

      let didUndo = false
      const timeoutId = window.setTimeout(() => {
        if (didUndo) return
        deleteMutation.mutateAsync({ id: supplierId }).catch(() => {
          restoreQueryData(queryClient, snapshot)
        })
      }, 5000)

      toast(t('suppliers.deleted') || 'Supplier deleted successfully', {
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
