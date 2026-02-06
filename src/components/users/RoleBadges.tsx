'use client'

import { useTranslation } from 'react-i18next'
import { UserRole } from '@librestock/types'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  [UserRole.WAREHOUSE_MANAGER]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  [UserRole.PICKER]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  [UserRole.SALES]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
}

interface RoleBadgesProps {
  roles: UserRole[]
}

export function RoleBadges({ roles }: RoleBadgesProps): React.JSX.Element {
  const { t } = useTranslation()

  if (roles.length === 0) {
    return (
      <span className="text-muted-foreground text-sm">
        {t('users.noRoles', { defaultValue: 'No roles' })}
      </span>
    )
  }

  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((role) => (
        <Badge
          key={role}
          className={cn('border-transparent', ROLE_BADGE_CLASSES[role])}
          variant="outline"
        >
          {t(`users.roles.${role}`, { defaultValue: role })}
        </Badge>
      ))}
    </div>
  )
}
