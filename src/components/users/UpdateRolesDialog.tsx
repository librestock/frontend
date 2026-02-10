'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import {
  useUpdateUserRoles,
  getListUsersQueryKey,
  type UserResponseDto,
} from '@/lib/data/users'
import { useListRoles } from '@/lib/data/roles'

interface UpdateRolesDialogProps {
  user: UserResponseDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateRolesDialog({
  user,
  open,
  onOpenChange,
}: UpdateRolesDialogProps): React.JSX.Element {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data: availableRoles } = useListRoles()
  const [selectedRoleIds, setSelectedRoleIds] = React.useState<string[]>([])

  React.useEffect(() => {
    if (user && availableRoles) {
      const ids = availableRoles
        .filter((role) => user.roles.includes(role.name))
        .map((role) => role.id)
      setSelectedRoleIds(ids)
    }
  }, [user, availableRoles])

  const mutation = useUpdateUserRoles({
    mutation: {
      onSuccess: () => {
        toast.success(t('users.rolesUpdated', { defaultValue: 'Roles updated successfully' }))
        void queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() })
        onOpenChange(false)
      },
      onError: () => {
        toast.error(t('users.rolesUpdateError', { defaultValue: 'Failed to update roles' }))
      },
    },
  })

  const handleToggle = (roleId: string): void => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId],
    )
  }

  const handleSubmit = (): void => {
    if (!user) return
    mutation.mutate({ id: user.id, data: { roles: selectedRoleIds } })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('users.editRolesTitle', { defaultValue: 'Edit Roles' })}
          </DialogTitle>
          <DialogDescription>
            {t('users.editRolesDescription', {
              defaultValue: 'Assign roles for {{name}}',
              name: user?.name ?? '',
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          {(availableRoles ?? []).map((role) => (
            <div key={role.id} className="flex items-center gap-2">
              <Checkbox
                checked={selectedRoleIds.includes(role.id)}
                id={`role-${role.id}`}
                onCheckedChange={() => handleToggle(role.id)}
              />
              <Label htmlFor={`role-${role.id}`}>
                {role.name}
              </Label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('actions.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button disabled={mutation.isPending} onClick={handleSubmit}>
            {mutation.isPending ? (
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
