import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2, ToggleLeft, RotateCcw } from 'lucide-react'

import { BulkStatusDialog } from './BulkStatusDialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog'
import { useBulkProductActions } from '@/hooks/products'

interface BulkActionBarProps {
  selectedIds: string[]
  onClearSelection: () => void
}

export function BulkActionBar({
  selectedIds,
  onClearSelection,
}: BulkActionBarProps): React.JSX.Element | null {
  const { t } = useTranslation()
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [statusOpen, setStatusOpen] = React.useState(false)

  const {
    bulkDeleteMutation,
    bulkStatusMutation,
    isAnyPending,
    handleDelete: hookHandleDelete,
    handleStatusChange: hookHandleStatusChange,
    handleRestore: hookHandleRestore,
  } = useBulkProductActions(onClearSelection)

  const handleDelete = (): void => {
    hookHandleDelete(selectedIds)
    setDeleteOpen(false)
  }

  const handleStatusChange = (isActive: boolean): void => {
    hookHandleStatusChange(selectedIds, isActive)
    setStatusOpen(false)
  }

  const handleRestore = (): void => {
    hookHandleRestore(selectedIds)
  }

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
