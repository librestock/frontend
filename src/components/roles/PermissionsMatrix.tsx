'use client'

import { useTranslation } from 'react-i18next'
import { Permission, Resource, type RolePermissionDto } from '@librestock/types'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface PermissionsMatrixProps {
  value: RolePermissionDto[]
  onChange: (perms: RolePermissionDto[]) => void
}

const ALL_RESOURCES = Object.values(Resource)
const ALL_PERMISSIONS = Object.values(Permission)

export function PermissionsMatrix({ value, onChange }: PermissionsMatrixProps): React.JSX.Element {
  const { t } = useTranslation()

  const hasPermission = (resource: Resource, permission: Permission): boolean =>
    value.some((p) => p.resource === resource && p.permission === permission)

  const togglePermission = (resource: Resource, permission: Permission): void => {
    if (hasPermission(resource, permission)) {
      onChange(value.filter((p) => !(p.resource === resource && p.permission === permission)))
    } else {
      onChange([...value, { resource, permission }])
    }
  }

  return (
    <div className="rounded-lg border">
      <div className="grid grid-cols-[1fr_repeat(2,80px)] gap-2 border-b px-4 py-2">
        <div className="text-muted-foreground text-sm font-medium">
          {t('roles.permissions', { defaultValue: 'Permissions' })}
        </div>
        {ALL_PERMISSIONS.map((perm) => (
          <div key={perm} className="text-muted-foreground text-center text-sm font-medium capitalize">
            {perm}
          </div>
        ))}
      </div>
      {ALL_RESOURCES.map((resource) => (
        <div key={resource} className="grid grid-cols-[1fr_repeat(2,80px)] items-center gap-2 border-b px-4 py-2 last:border-b-0">
          <Label className="text-sm capitalize">{resource}</Label>
          {ALL_PERMISSIONS.map((perm) => {
            const id = `perm-${resource}-${perm}`
            return (
              <div key={perm} className="flex justify-center">
                <Checkbox
                  checked={hasPermission(resource, perm)}
                  id={id}
                  onCheckedChange={() => togglePermission(resource, perm)}
                />
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
