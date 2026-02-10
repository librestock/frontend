'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { RolePermissionDto, RoleResponseDto } from '@librestock/types'

import { PermissionsMatrix } from './PermissionsMatrix'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  useCreateRole,
  useUpdateRole,
  getListRolesQueryKey,
} from '@/lib/data/roles'

interface RoleFormDialogProps {
  editRole: RoleResponseDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RoleFormDialog({
  editRole,
  open,
  onOpenChange,
}: RoleFormDialogProps): React.JSX.Element {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const isEdit = editRole !== null

  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [permissions, setPermissions] = React.useState<RolePermissionDto[]>([])

  React.useEffect(() => {
    if (editRole) {
      setName(editRole.name)
      setDescription(editRole.description ?? '')
      setPermissions([...editRole.permissions])
    } else {
      setName('')
      setDescription('')
      setPermissions([])
    }
  }, [editRole])

  const invalidateRoles = (): void => {
    void queryClient.invalidateQueries({ queryKey: getListRolesQueryKey() })
  }

  const createMutation = useCreateRole({
    mutation: {
      onSuccess: () => {
        toast.success(t('roles.created', { defaultValue: 'Role created successfully' }))
        invalidateRoles()
        onOpenChange(false)
      },
      onError: () => {
        toast.error(t('roles.createError', { defaultValue: 'Failed to create role' }))
      },
    },
  })

  const updateMutation = useUpdateRole({
    mutation: {
      onSuccess: () => {
        toast.success(t('roles.updated', { defaultValue: 'Role updated successfully' }))
        invalidateRoles()
        onOpenChange(false)
      },
      onError: () => {
        toast.error(t('roles.updateError', { defaultValue: 'Failed to update role' }))
      },
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault()
    if (isEdit) {
      updateMutation.mutate({
        id: editRole.id,
        data: { name, description: description || undefined, permissions },
      })
    } else {
      createMutation.mutate({
        data: { name, description: description || undefined, permissions },
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t('roles.editTitle', { defaultValue: 'Edit Role' })
              : t('roles.createTitle', { defaultValue: 'Create Role' })}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t('roles.editDescription', { defaultValue: 'Modify role name, description, and permissions.' })
              : t('roles.createDescription', { defaultValue: 'Define a new role with specific permissions.' })}
          </DialogDescription>
        </DialogHeader>
        <form id="role-form" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="role-name">
                {t('roles.name', { defaultValue: 'Name' })}
              </Label>
              <Input
                required
                id="role-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="role-description">
                {t('roles.description', { defaultValue: 'Description' })}
              </Label>
              <Input
                id="role-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>
                {t('roles.permissions', { defaultValue: 'Permissions' })}
              </Label>
              <PermissionsMatrix value={permissions} onChange={setPermissions} />
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('actions.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button disabled={isPending || !name.trim()} form="role-form" type="submit">
            {isPending ? (
              <span className="flex items-center gap-2">
                <Spinner className="size-3" />
                {t('actions.save', { defaultValue: 'Save' })}
              </span>
            ) : (
              t('actions.save', { defaultValue: 'Save' })
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
