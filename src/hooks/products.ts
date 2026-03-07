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

interface BulkMutationI18nKeys {
  partial: string
  success: string
  error: string
}

function makeBulkMutationCallbacks(
  invalidate: () => Promise<void>,
  onClearSelection: () => void,
  t: (key: string, options?: Record<string, unknown>) => string,
  i18nKeys: BulkMutationI18nKeys,
): {
  onSuccess: (result: BulkOperationResultDto) => Promise<void>
  onError: () => void
} {
  return {
    onSuccess: async (result: BulkOperationResultDto) => {
      await invalidate()
      onClearSelection()
      const message = formatBulkResult(result, t)
      if (result.failure_count > 0) {
        toast.warning(t(i18nKeys.partial), { description: message })
        return
      }
      toast.success(t(i18nKeys.success), { description: message })
    },
    onError: () => {
      toast.error(t(i18nKeys.error))
    },
  }
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

  const bulkDeleteCallbacks = makeBulkMutationCallbacks(
    invalidateProducts,
    onClearSelection,
    t,
    {
      partial: 'bulk.deletePartial',
      success: 'bulk.deleteSuccess',
      error: 'bulk.deleteError',
    },
  )

  const bulkStatusCallbacks = makeBulkMutationCallbacks(
    invalidateProducts,
    onClearSelection,
    t,
    {
      partial: 'bulk.statusPartial',
      success: 'bulk.statusSuccess',
      error: 'bulk.statusError',
    },
  )

  const bulkRestoreCallbacks = makeBulkMutationCallbacks(
    invalidateProducts,
    onClearSelection,
    t,
    {
      partial: 'bulk.restorePartial',
      success: 'bulk.restoreSuccess',
      error: 'bulk.restoreError',
    },
  )

  const bulkDeleteMutation = useBulkDeleteProducts({
    mutation: {
      onSuccess: bulkDeleteCallbacks.onSuccess,
      onError: bulkDeleteCallbacks.onError,
    },
  })

  const bulkStatusMutation = useBulkUpdateProductStatus({
    mutation: {
      onSuccess: bulkStatusCallbacks.onSuccess,
      onError: bulkStatusCallbacks.onError,
    },
  })

  const bulkRestoreMutation = useBulkRestoreProducts({
    mutation: {
      onSuccess: bulkRestoreCallbacks.onSuccess,
      onError: bulkRestoreCallbacks.onError,
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
