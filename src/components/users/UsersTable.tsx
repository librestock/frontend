'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { MoreHorizontal } from 'lucide-react'

import { RoleBadges } from './RoleBadges'
import { UpdateRolesDialog } from './UpdateRolesDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@/components/ui/table'
import { TableFactory } from '@/components/common/TableFactory'
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog'
import {
  useListUsers,
  type UserQueryDto,
  type UserResponseDto,
} from '@/lib/data/users'
import { useUserMutations } from '@/hooks/users'

interface UsersTableProps {
  filters?: Partial<UserQueryDto>
  page: number
  limit: number
  hasActiveFilters: boolean
  onPageChange: (page: number) => void
}

function TableSkeleton(): React.JSX.Element {
  return (
    <TableBody>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={`skeleton-row-${String(i)}`}>
          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
          <TableCell><Skeleton className="h-5 w-40" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-8" /></TableCell>
        </TableRow>
      ))}
    </TableBody>
  )
}

function UserRow({
  user,
  onEditRoles,
  onBan,
  onUnban,
  onDelete,
  onRevokeSessions,
}: {
  user: UserResponseDto
  onEditRoles: (user: UserResponseDto) => void
  onBan: (user: UserResponseDto) => void
  onUnban: (user: UserResponseDto) => void
  onDelete: (user: UserResponseDto) => void
  onRevokeSessions: (user: UserResponseDto) => void
}): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <TableRow>
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
      <TableCell><RoleBadges roles={user.roles} /></TableCell>
      <TableCell>
        {user.banned ? (
          <Badge variant="destructive">
            {t('users.banned', { defaultValue: 'Banned' })}
          </Badge>
        ) : (
          <Badge variant="secondary">
            {t('users.active', { defaultValue: 'Active' })}
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {new Date(user.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="size-8" size="icon" variant="ghost">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditRoles(user)}>
              {t('users.editRoles', { defaultValue: 'Edit Roles' })}
            </DropdownMenuItem>
            {user.banned ? (
              <DropdownMenuItem onClick={() => onUnban(user)}>
                {t('users.unban', { defaultValue: 'Unban' })}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onBan(user)}>
                {t('users.ban', { defaultValue: 'Ban' })}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onRevokeSessions(user)}>
              {t('users.revokeSessions', { defaultValue: 'Revoke Sessions' })}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(user)}
            >
              {t('actions.delete', { defaultValue: 'Delete' })}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

export function UsersTable({
  filters,
  page,
  limit,
  hasActiveFilters,
  onPageChange,
}: UsersTableProps): React.JSX.Element {
  const { t } = useTranslation()
  const { banMutation, unbanMutation, deleteMutation, revokeSessionsMutation } = useUserMutations()

  const [rolesDialogUser, setRolesDialogUser] = React.useState<UserResponseDto | null>(null)
  const [deleteDialogUser, setDeleteDialogUser] = React.useState<UserResponseDto | null>(null)

  const queryParams = React.useMemo(
    () => ({ page, limit, ...filters }),
    [filters, limit, page],
  )

  const { data, isLoading, error } = useListUsers(queryParams)

  const users = data?.data ?? []
  const meta = data?.meta
  const hasError = Boolean(error)
  const isEmpty = !isLoading && users.length === 0
  const table = (
    <TableFactory
      errorMessage={t('users.errorLoading', { defaultValue: 'Error loading users' })}
      hasError={hasError}
      isEmpty={users.length === 0}
      isLoading={isLoading}
      page={page}
      renderSkeleton={() => <TableSkeleton />}
      totalItems={meta?.total}
      totalPages={meta?.total_pages ?? 1}
      emptyMessage={
        hasActiveFilters
          ? t('users.noUsersFiltered', { defaultValue: 'No results for these filters' })
          : t('users.noUsers', { defaultValue: 'No users found' })
      }
      renderBody={() => (
        <TableBody>
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onBan={(u) => banMutation.mutate({ id: u.id, data: {} })}
              onDelete={setDeleteDialogUser}
              onEditRoles={setRolesDialogUser}
              onRevokeSessions={(u) => revokeSessionsMutation.mutate({ id: u.id })}
              onUnban={(u) => unbanMutation.mutate({ id: u.id })}
            />
          ))}
        </TableBody>
      )}
      renderHeader={() => (
        <TableRow>
          <TableHead>{t('users.name', { defaultValue: 'Name' })}</TableHead>
          <TableHead>{t('users.email', { defaultValue: 'Email' })}</TableHead>
          <TableHead>{t('users.rolesColumn', { defaultValue: 'Roles' })}</TableHead>
          <TableHead>{t('users.status', { defaultValue: 'Status' })}</TableHead>
          <TableHead>{t('users.created', { defaultValue: 'Created' })}</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      )}
      onPageChange={onPageChange}
    />
  )

  if (hasError || isEmpty) {
    return table
  }

  return (
    <>
      {table}

      <UpdateRolesDialog
        open={rolesDialogUser !== null}
        user={rolesDialogUser}
        onOpenChange={(open) => {
          if (!open) setRolesDialogUser(null)
        }}
      />

      <DeleteConfirmationDialog
        isLoading={deleteMutation.isPending}
        open={deleteDialogUser !== null}
        title={t('users.deleteTitle', { defaultValue: 'Delete User' })}
        description={t('users.deleteDescription', {
          defaultValue: 'Are you sure you want to delete this user? This action cannot be undone.',
        })}
        onConfirm={() => {
          if (deleteDialogUser) {
            deleteMutation.mutate(
              { id: deleteDialogUser.id },
              { onSuccess: () => setDeleteDialogUser(null) },
            )
          }
        }}
        onOpenChange={(open) => {
          if (!open) setDeleteDialogUser(null)
        }}
      />
    </>
  )
}
