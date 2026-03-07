import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Building2, Mail, Phone, Ship, CreditCard, MoreHorizontal, Pencil, Trash2, ToggleRight } from 'lucide-react'

import { ClientForm } from './ClientForm'
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
  type ClientResponseDto,
  ClientStatus,
} from '@/lib/data/clients'
import { useDeleteClientOptimistic, useToggleClientStatus } from '@/hooks/clients'

interface ClientCardProps {
  client: ClientResponseDto
}

const STATUS_BADGE_VARIANT: Record<ClientStatus, 'default' | 'secondary' | 'destructive'> = {
  [ClientStatus.ACTIVE]: 'default',
  [ClientStatus.SUSPENDED]: 'destructive',
  [ClientStatus.INACTIVE]: 'secondary',
}

function formatCreditLimit(value: number | null): string | null {
  if (value == null) {
    return null
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

export function ClientCard({ client }: ClientCardProps): React.JSX.Element {
  const { t } = useTranslation()
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const { deleteMutation, performDelete } = useDeleteClientOptimistic()
  const { toggleStatus } = useToggleClientStatus()

  const handleDelete = (): void => {
    setDeleteOpen(false)
    performDelete(client.id)
  }

  const handleStatusToggle = (): void => {
    toggleStatus(client)
  }

  const statusLabel = t(`clients.statuses.${client.account_status}`) || client.account_status
  const creditFormatted = formatCreditLimit(client.credit_limit)

  return (
    <>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center gap-3">
            <div className="bg-muted rounded-lg p-2">
              <Building2 className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-medium">
                {client.company_name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant={STATUS_BADGE_VARIANT[client.account_status]}>
                  {statusLabel}
                </Badge>
                {client.yacht_name && (
                  <span className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Ship className="size-3" />
                    {client.yacht_name}
                  </span>
                )}
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
                {t('actions.edit', { defaultValue: 'Edit' })}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleStatusToggle}>
                <ToggleRight className="mr-2 size-4" />
                {client.account_status === ClientStatus.ACTIVE
                  ? (t('clients.statuses.SUSPENDED', { defaultValue: 'Suspend' }))
                  : (t('clients.statuses.ACTIVE', { defaultValue: 'Activate' }))}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="mr-2 size-4" />
                {t('actions.delete', { defaultValue: 'Delete' })}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {client.contact_person && (
            <div className="text-muted-foreground flex items-center gap-2">
              <Building2 className="size-4" />
              <span>{client.contact_person}</span>
            </div>
          )}
          {client.email && (
            <div className="text-muted-foreground flex items-center gap-2">
              <Mail className="size-4" />
              <span className="truncate">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="text-muted-foreground flex items-center gap-2">
              <Phone className="size-4" />
              <span>{client.phone}</span>
            </div>
          )}
          {creditFormatted && (
            <div className="text-muted-foreground flex items-center gap-2">
              <CreditCard className="size-4" />
              <span>{creditFormatted}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <FormDialog
        cancelLabel={t('form.cancel', { defaultValue: 'Cancel' })}
        contentClassName="sm:max-w-[550px]"
        description={t('clients.editDescription', { defaultValue: 'Update client details.' })}
        formId="edit-client-form"
        open={editOpen}
        submitLabel={t('actions.save', { defaultValue: 'Save' })}
        title={t('clients.editTitle', { defaultValue: 'Edit Client' })}
        onOpenChange={setEditOpen}
      >
        <ClientForm
          client={client}
          formId="edit-client-form"
          onSuccess={() => setEditOpen(false)}
        />
      </FormDialog>

      <DeleteConfirmationDialog
        description={t('clients.deleteDescription', { defaultValue: 'Are you sure you want to delete this client? This action cannot be undone.' })}
        isLoading={deleteMutation.isPending}
        open={deleteOpen}
        title={t('clients.deleteTitle', { defaultValue: 'Delete Client' })}
        onConfirm={handleDelete}
        onOpenChange={setDeleteOpen}
      />
    </>
  )
}
