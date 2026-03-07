import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
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
  removeItemFromArray,
  removeItemFromPaginated,
} from '@/lib/data/query-cache'
import { makeOptimisticDelete } from '@/lib/data/make-optimistic-delete'

function useInvalidateProducts(): () => Promise<void> {
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

const useDeleteProductOptimisticFactory = makeOptimisticDelete<string | undefined>({
  useMutationHook: useDeleteProduct,
  getOptimisticTargets: (productId, categoryId) => [
    {
      queryKey: getListProductsQueryKey(),
      update: (old) =>
        removeItemFromPaginated(
          old as PaginatedProductsResponseDto | undefined,
          productId,
        ),
    },
    {
      queryKey: getGetProductsByCategoryQueryKey(categoryId),
      update: (old) =>
        removeItemFromArray(old as ProductResponseDto[] | undefined, productId),
    },
  ],
  getInvalidationKeys: () => [
    getListProductsQueryKey(),
    getGetProductsByCategoryQueryKey(),
  ],
  i18n: {
    success: 'products.deleted',
    error: 'products.deleteError',
    undo: 'actions.undo',
  },
  onMutationError: (error) => {
    console.error('Product deletion error:', error)
  },
})

export function useDeleteProductOptimistic(): ReturnType<
  typeof useDeleteProductOptimisticFactory
> {
  return useDeleteProductOptimisticFactory()
}

export function useBulkProductActions(onClearSelection: () => void): {
  bulkDeleteMutation: ReturnType<typeof useBulkDeleteProducts>
  bulkStatusMutation: ReturnType<typeof useBulkUpdateProductStatus>
  bulkRestoreMutation: ReturnType<typeof useBulkRestoreProducts>
  isAnyPending: boolean
  handleDelete: (ids: string[]) => void
  handleStatusChange: (ids: string[], isActive: boolean) => void
  handleRestore: (ids: string[]) => void
} {
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

export function useBulkCsvImport(
  onSuccess: () => void,
): ReturnType<typeof useBulkCreateProducts> {
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
