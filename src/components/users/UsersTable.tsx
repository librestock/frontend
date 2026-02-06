'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { MoreHorizontal } from 'lucide-react'

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { PaginationControls } from '@/components/common/PaginationControls'
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog'
import { RoleBadges } from './RoleBadges'
import { UpdateRolesDialog } from './UpdateRolesDialog'
import {
  useListUsers,
  useBanUser,
  useUnbanUser,
  useDeleteUser,
  useRevokeUserSessions,
  getListUsersQueryKey,
  type UserQueryDto,
  type UserResponseDto,
} from '@/lib/data/users'

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
            <Button variant="ghost" size="icon" className="size-8">
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
  const queryClient = useQueryClient()

  const [rolesDialogUser, setRolesDialogUser] = React.useState<UserResponseDto | null>(null)
  const [deleteDialogUser, setDeleteDialogUser] = React.useState<UserResponseDto | null>(null)

  const queryParams = React.useMemo(
    () => ({ page, limit, ...filters }),
    [filters, limit, page],
  )

  const { data, isLoading, error } = useListUsers(queryParams)

  const invalidateUsers = (): void => {
    void queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() })
  }

  const banMutation = useBanUser({
    mutation: {
      onSuccess: () => {
        toast.success(t('users.banSuccess', { defaultValue: 'User banned' }))
        invalidateUsers()
      },
      onError: () => {
        toast.error(t('users.banError', { defaultValue: 'Failed to ban user' }))
      },
    },
  })

  const unbanMutation = useUnbanUser({
    mutation: {
      onSuccess: () => {
        toast.success(t('users.unbanSuccess', { defaultValue: 'User unbanned' }))
        invalidateUsers()
      },
      onError: () => {
        toast.error(t('users.unbanError', { defaultValue: 'Failed to unban user' }))
      },
    },
  })

  const deleteMutation = useDeleteUser({
    mutation: {
      onSuccess: () => {
        toast.success(t('users.deleteSuccess', { defaultValue: 'User deleted' }))
        invalidateUsers()
        setDeleteDialogUser(null)
      },
      onError: () => {
        toast.error(t('users.deleteError', { defaultValue: 'Failed to delete user' }))
      },
    },
  })

  const revokeSessionsMutation = useRevokeUserSessions({
    mutation: {
      onSuccess: () => {
        toast.success(t('users.revokeSessionsSuccess', { defaultValue: 'Sessions revoked' }))
      },
      onError: () => {
        toast.error(t('users.revokeSessionsError', { defaultValue: 'Failed to revoke sessions' }))
      },
    },
  })

  const users = data?.data ?? []
  const meta = data?.meta

  if (error) {
    return (
      <ErrorState
        message={t('users.errorLoading', { defaultValue: 'Error loading users' })}
        variant="bordered"
      />
    )
  }

  if (!isLoading && users.length === 0) {
    return (
      <EmptyState
        variant="bordered"
        message={
          hasActiveFilters
            ? t('users.noUsersFiltered', { defaultValue: 'No results for these filters' })
            : t('users.noUsers', { defaultValue: 'No users found' })
        }
      />
    )
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('users.name', { defaultValue: 'Name' })}</TableHead>
              <TableHead>{t('users.email', { defaultValue: 'Email' })}</TableHead>
              <TableHead>{t('users.rolesColumn', { defaultValue: 'Roles' })}</TableHead>
              <TableHead>{t('users.status', { defaultValue: 'Status' })}</TableHead>
              <TableHead>{t('users.created', { defaultValue: 'Created' })}</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <TableBody>
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onEditRoles={setRolesDialogUser}
                  onBan={(u) => banMutation.mutate({ id: u.id, data: {} })}
                  onUnban={(u) => unbanMutation.mutate({ id: u.id })}
                  onDelete={setDeleteDialogUser}
                  onRevokeSessions={(u) => revokeSessionsMutation.mutate({ id: u.id })}
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

      <UpdateRolesDialog
        user={rolesDialogUser}
        open={rolesDialogUser !== null}
        onOpenChange={(open) => {
          if (!open) setRolesDialogUser(null)
        }}
      />

      <DeleteConfirmationDialog
        open={deleteDialogUser !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteDialogUser(null)
        }}
        onConfirm={() => {
          if (deleteDialogUser) {
            deleteMutation.mutate({ id: deleteDialogUser.id })
          }
        }}
        title={t('users.deleteTitle', { defaultValue: 'Delete User' })}
        description={t('users.deleteDescription', {
          defaultValue: 'Are you sure you want to delete this user? This action cannot be undone.',
        })}
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}
