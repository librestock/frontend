'use client'

import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const BADGE_COLORS = [
  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
]

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

interface RoleBadgesProps {
  roles: string[]
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
          className={cn('border-transparent', BADGE_COLORS[hashString(role) % BADGE_COLORS.length])}
          variant="outline"
        >
          {role}
        </Badge>
      ))}
    </div>
  )
}
