import * as React from 'react'
import { useTranslation } from 'react-i18next'
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
import { useRoleMutations } from '@/hooks/roles'

interface RoleFormDialogProps {
  editRole: RoleResponseDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface RoleFormDialogContentProps {
  editRole: RoleResponseDto | null
  onOpenChange: (open: boolean) => void
}

function getRoleFormKey(editRole: RoleResponseDto | null, open: boolean): string {
  const roleId = editRole?.id ?? 'new'
  const name = editRole?.name ?? ''
  const description = editRole?.description ?? ''
  const permissions = JSON.stringify(editRole?.permissions ?? [])

  return [open ? 'open' : 'closed', roleId, name, description, permissions].join('|')
}

export function RoleFormDialog({
  editRole,
  open,
  onOpenChange,
}: RoleFormDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RoleFormDialogContent
        key={getRoleFormKey(editRole, open)}
        editRole={editRole}
        onOpenChange={onOpenChange}
      />
    </Dialog>
  )
}

function RoleFormDialogContent({
  editRole,
  onOpenChange,
}: RoleFormDialogContentProps): React.JSX.Element {
  const { t } = useTranslation()
  const isEdit = editRole !== null

  const [name, setName] = React.useState(() => editRole?.name ?? '')
  const [description, setDescription] = React.useState(() => editRole?.description ?? '')
  const [permissions, setPermissions] = React.useState<RolePermissionDto[]>(() =>
    editRole ? [...editRole.permissions] : [],
  )

  const { createMutation, updateMutation, isPending } = useRoleMutations(() => onOpenChange(false))

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
  )
}
