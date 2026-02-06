'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AlertTriangle } from 'lucide-react'
import { InventoryForm } from './InventoryForm'
import { AdjustQuantity } from './AdjustQuantity'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FormDialog } from '@/components/common/FormDialog'
import { CrudDropdownMenu } from '@/components/common/CrudDropdownMenu'
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { PaginationControls } from '@/components/common/PaginationControls'
import {
  useListInventory,
  useDeleteInventoryItem,
  getListInventoryQueryKey,
  type InventoryQueryDto,
  type InventoryResponseDto,
  type PaginatedInventoryResponseDto,
} from '@/lib/data/inventory'
import {
  removeItemFromPaginated,
  restoreQueryData,
  snapshotQueryData,
} from '@/lib/data/query-cache'
import { useExpiryDateStatus } from '@/hooks/useExpiryDateStatus'
import { useLowStockStatus } from '@/hooks/useLowStockStatus'

interface InventoryTableProps {
  filters?: Partial<InventoryQueryDto>
  page: number
  limit: number
  hasActiveFilters: boolean
  onPageChange: (page: number) => void
}

function TableSkeleton({ showLocation }: { showLocation: boolean }): React.JSX.Element {
  return (
    <TableBody>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={`skeleton-row-${String(i)}`}>
          <TableCell>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-1 h-3 w-20" />
          </TableCell>
          {showLocation && (
            <TableCell>
              <Skeleton className="h-4 w-24" />
            </TableCell>
          )}
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-8 ml-auto" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  )
}

interface InventoryRowProps {
  inventory: InventoryResponseDto
  showLocation?: boolean
}

function InventoryRow({ inventory, showLocation = true }: InventoryRowProps): React.JSX.Element {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const { product, location, area, quantity, batchNumber, id, expiry_date: expiryDateRaw } = inventory

  const deleteMutation = useDeleteInventoryItem({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getListInventoryQueryKey(),
        })
      },
      onError: (error) => {
        toast.error(t('inventory.deleteError') || 'Failed to delete inventory')
        console.error('Inventory deletion error:', error)
      },
    },
  })

  const handleDelete = (): void => {
    const listQueryKey = getListInventoryQueryKey()
    const snapshot = snapshotQueryData<PaginatedInventoryResponseDto>(
      queryClient,
      listQueryKey,
    )
    queryClient.setQueriesData<PaginatedInventoryResponseDto>(
      { queryKey: listQueryKey },
      (old) => removeItemFromPaginated(old, id),
    )
    setDeleteOpen(false)

    let didUndo = false
    const timeoutId = window.setTimeout(() => {
      if (didUndo) {
        return
      }
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
  }

  const isLowStock = useLowStockStatus(product, quantity)
  const { expiryDate, isExpired, isExpiringSoon } = useExpiryDateStatus(expiryDateRaw)
  const expiredLabel = t('inventory.expired') || 'Expired'
  const expiringLabel = t('inventory.expiringSoon') || 'Expiring Soon'

  const formId = `edit-inventory-form-${id}`

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="font-medium">{product?.name ?? 'Unknown'}</div>
          {product?.sku && (
            <div className="text-xs text-muted-foreground">{product.sku}</div>
          )}
        </TableCell>
        {showLocation && (
          <TableCell className="text-muted-foreground">
            <div>{location?.name ?? 'Unknown'}</div>
            {area?.name && (
              <div className="text-xs">{area.name}</div>
            )}
          </TableCell>
        )}
        <TableCell>
          <div className="flex items-center gap-2">
            <span className={cn(
              'font-semibold tabular-nums',
              isLowStock && 'text-destructive'
            )}>
              {quantity}
            </span>
            {isLowStock && (
              <AlertTriangle className="size-4 text-destructive" />
            )}
          </div>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {batchNumber || '—'}
        </TableCell>
        <TableCell>
          {expiryDate ? (
            <span className={cn(
              isExpired && 'text-destructive',
              isExpiringSoon && 'text-yellow-600'
            )}>
              {expiryDate.toLocaleDateString()}
              {isExpired && (
                <Badge className="ml-2 text-xs" variant="destructive">
                  {expiredLabel}
                </Badge>
              )}
              {isExpiringSoon && (
                <Badge
                  className="ml-2 text-xs border-yellow-600 text-yellow-600"
                  variant="outline"
                >
                  {expiringLabel}
                </Badge>
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-end gap-1">
            <AdjustQuantity inventory={inventory} />
            <CrudDropdownMenu
              onDelete={() => setDeleteOpen(true)}
              onEdit={() => setEditOpen(true)}
            />
          </div>
        </TableCell>
      </TableRow>

      <FormDialog
        cancelLabel={t('form.cancel') || 'Cancel'}
        description={t('inventory.editDescription') || 'Update inventory details.'}
        formId={formId}
        open={editOpen}
        submitLabel={t('actions.save') || 'Save'}
        title={t('inventory.editTitle') || 'Edit Inventory'}
        onOpenChange={setEditOpen}
      >
        <InventoryForm
          formId={formId}
          inventory={inventory}
          onSuccess={() => setEditOpen(false)}
        />
      </FormDialog>

      <DeleteConfirmationDialog
        description={t('inventory.deleteDescription') || 'Are you sure you want to delete this inventory record?'}
        isLoading={deleteMutation.isPending}
        open={deleteOpen}
        title={t('inventory.deleteTitle') || 'Delete Inventory'}
        onConfirm={handleDelete}
        onOpenChange={setDeleteOpen}
      />
    </>
  )
}

export function InventoryTable({
  filters,
  page,
  limit,
  hasActiveFilters,
  onPageChange,
}: InventoryTableProps): React.JSX.Element {
  const { t } = useTranslation()

  const queryParams = React.useMemo(
    () => ({
      page,
      limit,
      ...filters,
    }),
    [filters, limit, page],
  )

  const { data, isLoading, error } = useListInventory(queryParams)

  const inventoryItems = data?.data ?? []
  const meta = data?.meta
  const showLocation = !filters?.location_id && !filters?.area_id

  if (error) {
    return (
      <ErrorState
        message={t('inventory.errorLoading') || 'Error loading inventory'}
        variant="bordered"
      />
    )
  }

  if (!isLoading && inventoryItems.length === 0) {
    return (
      <EmptyState
        variant="bordered"
        message={
          hasActiveFilters
            ? (t('inventory.noInventoryFiltered') || 'No results for these filters')
            : (t('inventory.noInventory') || 'No inventory found')
        }
      />
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('inventory.product') || 'Product'}</TableHead>
            {showLocation && (
              <TableHead>{t('inventory.location') || 'Location'}</TableHead>
            )}
            <TableHead>{t('inventory.quantity') || 'Qty'}</TableHead>
            <TableHead>{t('inventory.batchNumber') || 'Batch Number'}</TableHead>
            <TableHead>{t('inventory.expiryDate') || 'Expiry Date'}</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        {isLoading ? (
          <TableSkeleton showLocation={showLocation} />
        ) : (
          <TableBody>
            {inventoryItems.map((inventory) => (
              <InventoryRow
                key={inventory.id}
                inventory={inventory}
                showLocation={showLocation}
              />
            ))}
          </TableBody>
        )}
      </Table>
      <div className="px-4 pb-4">
        <PaginationControls
          isLoading={isLoading}
          page={page}
          totalItems={meta?.total}
          totalPages={meta?.total_pages ?? 1}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  )
}
