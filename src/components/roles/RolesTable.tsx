'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { MoreHorizontal } from 'lucide-react'

import { RoleFormDialog } from './RoleFormDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import {
  useListRoles,
  useDeleteRole,
  getListRolesQueryKey,
  type RoleResponseDto,
} from '@/lib/data/roles'

interface RolesTableProps {
  createOpen: boolean
  onCreateOpenChange: (open: boolean) => void
}

function TableSkeleton(): React.JSX.Element {
  return (
    <TableBody>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={`skeleton-row-${String(i)}`}>
          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
          <TableCell><Skeleton className="h-5 w-48" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-8" /></TableCell>
        </TableRow>
      ))}
    </TableBody>
  )
}

function RoleRow({
  role,
  onEdit,
  onDelete,
}: {
  role: RoleResponseDto
  onEdit: (role: RoleResponseDto) => void
  onDelete: (role: RoleResponseDto) => void
}): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <TableRow>
      <TableCell className="font-medium">{role.name}</TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {role.description ?? '-'}
      </TableCell>
      <TableCell>
        {role.is_system ? (
          <Badge variant="secondary">
            {t('roles.system', { defaultValue: 'System' })}
          </Badge>
        ) : (
          <Badge variant="outline">
            {t('roles.custom', { defaultValue: 'Custom' })}
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {t('roles.permissionCount', { count: role.permissions.length, defaultValue: '{{count}} permissions' })}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="size-8" size="icon" variant="ghost">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(role)}>
              {t('actions.edit', { defaultValue: 'Edit' })}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              disabled={role.is_system}
              onClick={() => onDelete(role)}
            >
              {t('actions.delete', { defaultValue: 'Delete' })}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

export function RolesTable({
  createOpen,
  onCreateOpenChange,
}: RolesTableProps): React.JSX.Element {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [editRole, setEditRole] = React.useState<RoleResponseDto | null>(null)
  const [deleteRole, setDeleteRole] = React.useState<RoleResponseDto | null>(null)

  const { data: roles, isLoading, error } = useListRoles()

  const deleteMutation = useDeleteRole({
    mutation: {
      onSuccess: () => {
        toast.success(t('roles.deleted', { defaultValue: 'Role deleted successfully' }))
        void queryClient.invalidateQueries({ queryKey: getListRolesQueryKey() })
        setDeleteRole(null)
      },
      onError: () => {
        toast.error(t('roles.deleteError', { defaultValue: 'Failed to delete role' }))
      },
    },
  })

  if (error) {
    return (
      <ErrorState
        message={t('roles.errorLoading', { defaultValue: 'Error loading roles' })}
        variant="bordered"
      />
    )
  }

  const items = roles ?? []

  if (!isLoading && items.length === 0) {
    return (
      <>
        <EmptyState
          message={t('roles.noRoles', { defaultValue: 'No roles found' })}
          variant="bordered"
        />
        <RoleFormDialog
          editRole={null}
          open={createOpen}
          onOpenChange={onCreateOpenChange}
        />
      </>
    )
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('roles.name', { defaultValue: 'Name' })}</TableHead>
              <TableHead>{t('roles.description', { defaultValue: 'Description' })}</TableHead>
              <TableHead>{t('roles.system', { defaultValue: 'System' })}</TableHead>
              <TableHead>{t('roles.permissions', { defaultValue: 'Permissions' })}</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <TableBody>
              {items.map((role) => (
                <RoleRow
                  key={role.id}
                  role={role}
                  onDelete={setDeleteRole}
                  onEdit={setEditRole}
                />
              ))}
            </TableBody>
          )}
        </Table>
      </div>

      <RoleFormDialog
        editRole={editRole}
        open={createOpen || editRole !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditRole(null)
            onCreateOpenChange(false)
          }
        }}
      />

      <DeleteConfirmationDialog
        isLoading={deleteMutation.isPending}
        open={deleteRole !== null}
        title={t('roles.deleteTitle', { defaultValue: 'Delete Role' })}
        description={t('roles.deleteDescription', {
          defaultValue: 'Are you sure you want to delete this role? Users assigned this role will lose these permissions.',
        })}
        onConfirm={() => {
          if (deleteRole) {
            if (deleteRole.is_system) {
              toast.error(t('roles.systemDeleteError', { defaultValue: 'System roles cannot be deleted' }))
              return
            }
            deleteMutation.mutate({ id: deleteRole.id })
          }
        }}
        onOpenChange={(open) => {
          if (!open) setDeleteRole(null)
        }}
      />
    </>
  )
}
