'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Package, MapPin, AlertTriangle, Clock } from 'lucide-react'
import { type TFunction } from 'i18next'
import { InventoryForm } from './InventoryForm'
import { AdjustQuantity } from './AdjustQuantity'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FormDialog } from '@/components/common/FormDialog'
import { CrudDropdownMenu } from '@/components/common/CrudDropdownMenu'
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog'
import {
  type InventoryResponseDto,
  useDeleteInventoryItem,
  getListInventoryQueryKey,
  type PaginatedInventoryResponseDto,
} from '@/lib/data/inventory'
import {
  removeItemFromPaginated,
  restoreQueryData,
  snapshotQueryData,
} from '@/lib/data/query-cache'
import { useExpiryDateStatus } from '@/hooks/useExpiryDateStatus'
import { useLowStockStatus } from '@/hooks/useLowStockStatus'

function getExpiryClassName(isExpired: boolean, isExpiringSoon: boolean): string {
  if (isExpired) return 'text-destructive'
  if (isExpiringSoon) return 'text-yellow-600'
  return 'text-muted-foreground'
}

function getExpiryLabel(isExpired: boolean, isExpiringSoon: boolean, t: TFunction): string {
  if (isExpired) return `${t('inventory.expired') || 'Expired'}: `
  if (isExpiringSoon) return `${t('inventory.expiringSoon') || 'Expiring Soon'}: `
  return `${t('inventory.expiryDate') || 'Expires'}: `
}

interface InventoryCardProps {
  inventory: InventoryResponseDto
}

export function InventoryCard({ inventory }: InventoryCardProps): React.JSX.Element {
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

  const formId = `edit-inventory-form-${id}`

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Package className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-medium">
                {product?.name ?? 'Unknown Product'}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                {product?.sku ? (
                  <span className="text-muted-foreground text-xs">
                    {product.sku}
                  </span>
                ) : null}
              </CardDescription>
            </div>
          </div>
          <CrudDropdownMenu
            onDelete={() => setDeleteOpen(true)}
            onEdit={() => setEditOpen(true)}
          />
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Location and Area */}
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <MapPin className="size-4" />
            <span>
              {location?.name ?? 'Unknown Location'}
              {area?.name ? ` > ${area.name}` : ''}
            </span>
          </div>

          {/* Quantity with warnings */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{quantity}</span>
              {isLowStock ? (
                <Badge className="gap-1" variant="destructive">
                  <AlertTriangle className="size-3" />
                  {t('inventory.lowStock') || 'Low Stock'}
                </Badge>
              ) : null}
            </div>
            <AdjustQuantity inventory={inventory} />
          </div>

          {/* Expiry Date */}
          {expiryDate ? (
            <div
              className={`flex items-center gap-2 text-sm ${getExpiryClassName(isExpired, isExpiringSoon)}`}
            >
              <Clock className="size-4" />
              <span>
                {getExpiryLabel(isExpired, isExpiringSoon, t)}
                {expiryDate.toLocaleDateString()}
              </span>
            </div>
          ) : null}

          {/* Batch Number */}
          {batchNumber ? (
            <div className="text-muted-foreground text-sm">
              {t('inventory.batchNumber') || 'Batch'}: {batchNumber}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
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

      {/* Delete Confirmation */}
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
