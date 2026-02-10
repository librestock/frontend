import { Permission, Resource } from '@librestock/types'
import { useCurrentUser } from '@/lib/data/auth'

const DEFAULT_PERMISSIONS: Partial<Record<Resource, Permission[]>> = {
  [Resource.DASHBOARD]: [Permission.READ],
  [Resource.SETTINGS]: [Permission.READ, Permission.WRITE],
}

export function canAccess(
  permissions: Partial<Record<Resource, Permission[]>>,
  permission: Permission,
  resource: Resource,
): boolean {
  return permissions[resource]?.includes(permission) ?? false
}

export interface UsePermissionsReturn {
  roles: string[]
  isLoading: boolean
  can: (permission: Permission, resource: Resource) => boolean
}

export function usePermissions(): UsePermissionsReturn {
  const { data: currentUser, isLoading } = useCurrentUser()

  const permissions =
    currentUser?.permissions && Object.keys(currentUser.permissions).length > 0
      ? currentUser.permissions
      : DEFAULT_PERMISSIONS

  return {
    roles: currentUser?.roles ?? [],
    isLoading,
    can(permission: Permission, resource: Resource): boolean {
      return canAccess(permissions, permission, resource)
    },
  }
}
