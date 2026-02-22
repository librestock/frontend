'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Truck, Mail, Phone, User, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

import { SupplierForm } from './SupplierForm'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FormDialog } from '@/components/common/FormDialog'
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog'
import {
  type SupplierResponseDto,
  type PaginatedSuppliersResponseDto,
  useDeleteSupplier,
  getListSuppliersQueryKey,
} from '@/lib/data/suppliers'
import {
  removeItemFromPaginated,
  restoreQueryData,
  snapshotQueryData,
} from '@/lib/data/query-cache'

interface SupplierCardProps {
  supplier: SupplierResponseDto
}

export function SupplierCard({ supplier }: SupplierCardProps): React.JSX.Element {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const deleteMutation = useDeleteSupplier({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getListSuppliersQueryKey(),
        })
      },
      onError: (error) => {
        toast.error(t('suppliers.deleteError') || 'Failed to delete supplier')
        console.error('Supplier deletion error:', error)
      },
    },
  })

  const handleDelete = (): void => {
    const listQueryKey = getListSuppliersQueryKey()
    const snapshot = snapshotQueryData<PaginatedSuppliersResponseDto>(
      queryClient,
      listQueryKey,
    )
    queryClient.setQueriesData<PaginatedSuppliersResponseDto>(
      { queryKey: listQueryKey },
      (old) => removeItemFromPaginated(old, supplier.id),
    )
    setDeleteOpen(false)

    let didUndo = false
    const timeoutId = window.setTimeout(() => {
      if (didUndo) {
        return
      }
      deleteMutation.mutateAsync({ id: supplier.id }).catch(() => {
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
  }

  return (
    <>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center gap-3">
            <div className="bg-muted rounded-lg p-2">
              <Truck className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-medium">
                {supplier.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant={supplier.is_active ? 'default' : 'secondary'}>
                  {supplier.is_active
                    ? (t('form.active') || 'Active')
                    : (t('form.inactive') || 'Inactive')}
                </Badge>
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="size-8" size="icon" variant="ghost">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 size-4" />
                {t('actions.edit') || 'Edit'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="mr-2 size-4" />
                {t('actions.delete') || 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {supplier.contact_person && (
            <div className="text-muted-foreground flex items-center gap-2">
              <User className="size-4" />
              <span>{supplier.contact_person}</span>
            </div>
          )}
          {supplier.email && (
            <div className="text-muted-foreground flex items-center gap-2">
              <Mail className="size-4" />
              <span className="truncate">{supplier.email}</span>
            </div>
          )}
          {supplier.phone && (
            <div className="text-muted-foreground flex items-center gap-2">
              <Phone className="size-4" />
              <span>{supplier.phone}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <FormDialog
        cancelLabel={t('form.cancel') || 'Cancel'}
        contentClassName="sm:max-w-[550px]"
        description={t('suppliers.editDescription') || 'Update supplier details.'}
        formId="edit-supplier-form"
        open={editOpen}
        submitLabel={t('actions.save') || 'Save'}
        title={t('suppliers.editTitle') || 'Edit Supplier'}
        onOpenChange={setEditOpen}
      >
        <SupplierForm
          formId="edit-supplier-form"
          supplier={supplier}
          onSuccess={() => setEditOpen(false)}
        />
      </FormDialog>

      <DeleteConfirmationDialog
        description={t('suppliers.deleteDescription') || 'Are you sure you want to delete this supplier? This action cannot be undone.'}
        isLoading={deleteMutation.isPending}
        open={deleteOpen}
        title={t('suppliers.deleteTitle') || 'Delete Supplier'}
        onConfirm={handleDelete}
        onOpenChange={setDeleteOpen}
      />
    </>
  )
}
