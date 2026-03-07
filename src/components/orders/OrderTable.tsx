import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import { OrderStatus } from '@librestock/types/orders'

import { OrderStatusBadge } from './OrderStatusBadge'
import { StatusTransitionDropdown } from './StatusTransitionDropdown'
import { OrderForm } from './OrderForm'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TableFactory } from '@/components/common/TableFactory'
import { FormDialog } from '@/components/common/FormDialog'
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog'
import {
  useListOrders,
  type OrderQueryDto,
  type OrderResponseDto,
} from '@/lib/data/orders'
import { useDeleteOrderOptimistic } from '@/hooks/orders'

interface OrderTableProps {
  filters?: Partial<OrderQueryDto>
  page: number
  limit: number
  hasActiveFilters: boolean
  onPageChange: (page: number) => void
}

function TableSkeleton(): React.JSX.Element {
  return (
    <TableBody>
      {Array.from({ length: 10 }).map((_, i) => (
        <TableRow key={`skeleton-row-${String(i)}`}>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-10" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  )
}

function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function OrderTable({
  filters,
  page,
  limit,
  hasActiveFilters,
  onPageChange,
}: OrderTableProps): React.JSX.Element {
  const { t } = useTranslation()

  const queryParams = React.useMemo(() => {
    const params: OrderQueryDto = {
      page,
      limit,
      ...filters,
    }
    return params
  }, [filters, limit, page])

  const { data, isLoading, error } = useListOrders(queryParams)

  const orders = data?.data ?? []
  const meta = data?.meta

  return (
    <TableFactory
      errorMessage={t('orders.errorLoading', { defaultValue: 'Error loading orders' })}
      hasError={!!error}
      isEmpty={orders.length === 0}
      isLoading={isLoading}
      page={page}
      renderSkeleton={() => <TableSkeleton />}
      totalItems={meta?.total}
      totalPages={meta?.total_pages ?? 1}
      emptyMessage={
        hasActiveFilters
          ? (t('orders.noOrdersFiltered', { defaultValue: 'No results for these filters' }))
          : (t('orders.noOrders', { defaultValue: 'No orders found' }))
      }
      renderBody={() => (
        <TableBody>
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </TableBody>
      )}
      renderHeader={() => (
        <TableRow>
          <TableHead>{t('orders.orderNumber', { defaultValue: 'Order #' })}</TableHead>
          <TableHead>{t('orders.client', { defaultValue: 'Client' })}</TableHead>
          <TableHead>{t('orders.status', { defaultValue: 'Status' })}</TableHead>
          <TableHead>{t('orders.itemCount', { defaultValue: 'Items' })}</TableHead>
          <TableHead>{t('orders.totalAmount', { defaultValue: 'Total' })}</TableHead>
          <TableHead>{t('orders.createdAt', { defaultValue: 'Created' })}</TableHead>
          <TableHead className="w-[100px]" />
        </TableRow>
      )}
      onPageChange={onPageChange}
    />
  )
}

interface OrderRowProps {
  order: OrderResponseDto
}

function OrderRow({ order }: OrderRowProps): React.JSX.Element {
  const { t } = useTranslation()
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const { deleteMutation, performDelete } = useDeleteOrderOptimistic()

  const canEdit =
    order.status === OrderStatus.DRAFT ||
    order.status === OrderStatus.CONFIRMED
  const canDelete = order.status === OrderStatus.DRAFT

  const handleDelete = (): void => {
    setDeleteOpen(false)
    performDelete(order.id)
  }

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">
          {order.order_number}
        </TableCell>
        <TableCell>
          {order.client_name ?? (
            <span className="text-muted-foreground">
              {t('orders.unknownClient', { defaultValue: 'Unknown' })}
            </span>
          )}
        </TableCell>
        <TableCell>
          <OrderStatusBadge status={order.status} />
        </TableCell>
        <TableCell>{order.items.length}</TableCell>
        <TableCell>{formatCurrency(Number(order.total_amount))}</TableCell>
        <TableCell>{formatDate(order.created_at)}</TableCell>
        <TableCell>
          <div className="flex items-center justify-end gap-1">
            <StatusTransitionDropdown
              currentStatus={order.status}
              orderId={order.id}
            />
            {(canEdit || canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="size-8" size="icon" variant="ghost">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEdit && (
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                      <Pencil className="mr-2 size-4" />
                      {t('actions.edit', { defaultValue: 'Edit' })}
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <>
                      {canEdit && <DropdownMenuSeparator />}
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteOpen(true)}
                      >
                        <Trash2 className="mr-2 size-4" />
                        {t('actions.delete', { defaultValue: 'Delete' })}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </TableCell>
      </TableRow>

      <FormDialog
        cancelLabel={t('form.cancel', { defaultValue: 'Cancel' })}
        contentClassName="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        formId="edit-order-form"
        open={editOpen}
        submitLabel={t('actions.save', { defaultValue: 'Save' })}
        title={t('orders.editTitle', { defaultValue: 'Edit Order' })}
        description={
          t('orders.editDescription', { defaultValue: 'Update order details.' })
        }
        onOpenChange={setEditOpen}
      >
        <OrderForm
          formId="edit-order-form"
          order={order}
          onSuccess={() => setEditOpen(false)}
        />
      </FormDialog>

      <DeleteConfirmationDialog
        isLoading={deleteMutation.isPending}
        open={deleteOpen}
        title={t('orders.deleteTitle', { defaultValue: 'Delete Order' })}
        description={
          t('orders.deleteDescription', { defaultValue: 'Are you sure you want to delete this order? This action cannot be undone.' })
        }
        onConfirm={handleDelete}
        onOpenChange={setDeleteOpen}
      />
    </>
  )
}
