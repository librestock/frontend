import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  useDeleteProduct,
  useBulkDeleteProducts,
  useBulkUpdateProductStatus,
  useBulkRestoreProducts,
  useBulkCreateProducts,
  getListProductsQueryKey,
  getGetProductsByCategoryQueryKey,
  type ProductResponseDto,
  type PaginatedProductsResponseDto,
  type BulkOperationResultDto,
} from '@/lib/data/products'
import {
  removeItemFromPaginated,
  removeItemFromArray,
  restoreQueryData,
  snapshotQueryData,
} from '@/lib/data/query-cache'

function useInvalidateProducts() {
  const queryClient = useQueryClient()
  return useCallback(
    async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }),
        queryClient.invalidateQueries({
          queryKey: getGetProductsByCategoryQueryKey(),
        }),
      ])
    },
    [queryClient],
  )
}

function formatBulkResult(
  result: BulkOperationResultDto,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  const parts: string[] = []
  if (result.success_count > 0) {
    parts.push(
      t('bulk.successCount', { count: result.success_count }) ||
        `${result.success_count} succeeded`,
    )
  }
  if (result.failure_count > 0) {
    parts.push(
      t('bulk.failureCount', { count: result.failure_count }) ||
        `${result.failure_count} failed`,
    )
  }
  return parts.join(', ')
}

export function useDeleteProductOptimistic() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const deleteMutation = useDeleteProduct({
    mutation: {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: getListProductsQueryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: getGetProductsByCategoryQueryKey(),
          }),
        ])
      },
      onError: (error) => {
        toast.error(t('products.deleteError') || 'Failed to delete product')
        console.error('Product deletion error:', error)
      },
    },
  })

  const performDelete = useCallback(
    (productId: string, categoryId?: string) => {
      const listQueryKey = getListProductsQueryKey()
      const categoryQueryKey = getGetProductsByCategoryQueryKey(categoryId)

      const listSnapshot = snapshotQueryData<PaginatedProductsResponseDto>(
        queryClient,
        listQueryKey,
      )
      const categorySnapshot = snapshotQueryData<ProductResponseDto[]>(
        queryClient,
        categoryQueryKey,
      )

      queryClient.setQueriesData<PaginatedProductsResponseDto>(
        { queryKey: listQueryKey },
        (old) => removeItemFromPaginated(old, productId),
      )
      queryClient.setQueriesData<ProductResponseDto[]>(
        { queryKey: categoryQueryKey },
        (old) => removeItemFromArray(old, productId),
      )

      let didUndo = false
      const timeoutId = window.setTimeout(() => {
        if (didUndo) return
        deleteMutation.mutateAsync({ id: productId }).catch(() => {
          restoreQueryData(queryClient, listSnapshot)
          restoreQueryData(queryClient, categorySnapshot)
        })
      }, 5000)

      toast(t('products.deleted') || 'Product deleted successfully', {
        action: {
          label: t('actions.undo') || 'Undo',
          onClick: () => {
            didUndo = true
            window.clearTimeout(timeoutId)
            restoreQueryData(queryClient, listSnapshot)
            restoreQueryData(queryClient, categorySnapshot)
          },
        },
      })
    },
    [queryClient, deleteMutation, t],
  )

  return { deleteMutation, performDelete }
}

export function useBulkProductActions(onClearSelection: () => void) {
  const { t } = useTranslation()
  const invalidateProducts = useInvalidateProducts()

  const bulkDeleteMutation = useBulkDeleteProducts({
    mutation: {
      onSuccess: async (result: BulkOperationResultDto) => {
        await invalidateProducts()
        onClearSelection()
        const message = formatBulkResult(result, t)
        if (result.failure_count > 0) {
          toast.warning(
            t('bulk.deletePartial') || 'Bulk delete partially completed',
            { description: message },
          )
        } else {
          toast.success(t('bulk.deleteSuccess') || 'Products deleted', {
            description: message,
          })
        }
      },
      onError: () => {
        toast.error(t('bulk.deleteError') || 'Failed to delete products')
      },
    },
  })

  const bulkStatusMutation = useBulkUpdateProductStatus({
    mutation: {
      onSuccess: async (result: BulkOperationResultDto) => {
        await invalidateProducts()
        onClearSelection()
        const message = formatBulkResult(result, t)
        if (result.failure_count > 0) {
          toast.warning(
            t('bulk.statusPartial') || 'Status update partially completed',
            { description: message },
          )
        } else {
          toast.success(t('bulk.statusSuccess') || 'Status updated', {
            description: message,
          })
        }
      },
      onError: () => {
        toast.error(t('bulk.statusError') || 'Failed to update status')
      },
    },
  })

  const bulkRestoreMutation = useBulkRestoreProducts({
    mutation: {
      onSuccess: async (result: BulkOperationResultDto) => {
        await invalidateProducts()
        onClearSelection()
        const message = formatBulkResult(result, t)
        if (result.failure_count > 0) {
          toast.warning(
            t('bulk.restorePartial') || 'Restore partially completed',
            { description: message },
          )
        } else {
          toast.success(t('bulk.restoreSuccess') || 'Products restored', {
            description: message,
          })
        }
      },
      onError: () => {
        toast.error(t('bulk.restoreError') || 'Failed to restore products')
      },
    },
  })

  const isAnyPending =
    bulkDeleteMutation.isPending ||
    bulkStatusMutation.isPending ||
    bulkRestoreMutation.isPending

  return {
    bulkDeleteMutation,
    bulkStatusMutation,
    bulkRestoreMutation,
    isAnyPending,
    handleDelete: (ids: string[]) => {
      bulkDeleteMutation.mutate({ data: { ids } })
    },
    handleStatusChange: (ids: string[], isActive: boolean) => {
      bulkStatusMutation.mutate({ data: { ids, is_active: isActive } })
    },
    handleRestore: (ids: string[]) => {
      bulkRestoreMutation.mutate({ data: { ids } })
    },
  }
}

export function useBulkCsvImport(onSuccess: () => void) {
  const { t } = useTranslation()
  const invalidateProducts = useInvalidateProducts()

  return useBulkCreateProducts({
    mutation: {
      onSuccess: async (result: BulkOperationResultDto) => {
        await invalidateProducts()

        if (result.failure_count > 0 && result.success_count > 0) {
          toast.warning(
            t('bulk.importPartial') || 'Import partially completed',
            {
              description:
                t('bulk.importResult', {
                  success: result.success_count,
                  failure: result.failure_count,
                }) ||
                `${result.success_count} created, ${result.failure_count} failed`,
            },
          )
        } else if (result.failure_count > 0) {
          toast.error(t('bulk.importError') || 'Import failed', {
            description:
              result.failures
                .map((f) => `${f.sku ?? f.id ?? 'Unknown'}: ${f.error}`)
                .join('; ') || `${result.failure_count} failed`,
          })
        } else {
          toast.success(t('bulk.importSuccess') || 'Products imported', {
            description:
              t('bulk.importSuccessCount', {
                count: result.success_count,
              }) || `${result.success_count} products created`,
          })
        }

        onSuccess()
      },
      onError: () => {
        toast.error(t('bulk.importError') || 'Failed to import products')
      },
    },
  })
}
