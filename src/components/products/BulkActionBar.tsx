'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Trash2, ToggleLeft, RotateCcw } from 'lucide-react'

import { BulkStatusDialog } from './BulkStatusDialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog'
import {
  useBulkDeleteProducts,
  useBulkUpdateProductStatus,
  useBulkRestoreProducts,
  getListProductsQueryKey,
  getGetProductsByCategoryQueryKey,
  type BulkOperationResultDto,
} from '@/lib/data/products'

interface BulkActionBarProps {
  selectedIds: string[]
  onClearSelection: () => void
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

export function BulkActionBar({
  selectedIds,
  onClearSelection,
}: BulkActionBarProps): React.JSX.Element | null {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [statusOpen, setStatusOpen] = React.useState(false)

  const invalidateProducts = React.useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }),
      queryClient.invalidateQueries({
        queryKey: getGetProductsByCategoryQueryKey(),
      }),
    ])
  }, [queryClient])

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

  const handleDelete = (): void => {
    bulkDeleteMutation.mutate({ data: { ids: selectedIds } })
    setDeleteOpen(false)
  }

  const handleStatusChange = (isActive: boolean): void => {
    bulkStatusMutation.mutate({ data: { ids: selectedIds, is_active: isActive } })
    setStatusOpen(false)
  }

  const handleRestore = (): void => {
    bulkRestoreMutation.mutate({ data: { ids: selectedIds } })
  }

  const isAnyPending =
    bulkDeleteMutation.isPending ||
    bulkStatusMutation.isPending ||
    bulkRestoreMutation.isPending

  if (selectedIds.length === 0) {
    return null
  }

  return (
    <>
      <div className="bg-background/95 supports-backdrop-filter:bg-background/80 supports-backdrop-filter:backdrop-blur-sm fixed inset-x-0 bottom-0 z-40 border-t p-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <span className="text-sm font-medium">
            {t('bulk.selectedCount', { count: selectedIds.length }) ||
              `${selectedIds.length} selected`}
          </span>
          <div className="flex items-center gap-2">
            {isAnyPending && <Spinner className="size-4" />}
            <Button
              disabled={isAnyPending}
              size="sm"
              variant="outline"
              onClick={() => setStatusOpen(true)}
            >
              <ToggleLeft className="size-4" data-icon="inline-start" />
              {t('bulk.changeStatus') || 'Change Status'}
            </Button>
            <Button
              disabled={isAnyPending}
              size="sm"
              variant="outline"
              onClick={handleRestore}
            >
              <RotateCcw className="size-4" data-icon="inline-start" />
              {t('bulk.restore') || 'Restore'}
            </Button>
            <Button
              disabled={isAnyPending}
              size="sm"
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" data-icon="inline-start" />
              {t('bulk.delete') || 'Delete'}
            </Button>
            <Button
              disabled={isAnyPending}
              size="sm"
              variant="ghost"
              onClick={onClearSelection}
            >
              {t('bulk.cancel') || 'Cancel'}
            </Button>
          </div>
        </div>
      </div>

      <DeleteConfirmationDialog
        isLoading={bulkDeleteMutation.isPending}
        open={deleteOpen}
        title={t('bulk.deleteTitle') || 'Delete Selected Products'}
        description={
          t('bulk.deleteDescription', { count: selectedIds.length }) ||
          `Are you sure you want to delete ${selectedIds.length} products? This action cannot be undone.`
        }
        onConfirm={handleDelete}
        onOpenChange={setDeleteOpen}
      />

      <BulkStatusDialog
        count={selectedIds.length}
        isLoading={bulkStatusMutation.isPending}
        open={statusOpen}
        onConfirm={handleStatusChange}
        onOpenChange={setStatusOpen}
      />
    </>
  )
}
