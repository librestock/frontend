import * as React from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'

import { Permission, Resource } from '@librestock/types'

import { getCurrentUserQueryOptions } from '@/lib/data/auth'
import { canAccess } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
import { RolesTable } from '@/components/roles/RolesTable'

export const Route = createFileRoute('/roles')({
  beforeLoad: async ({ context }) => {
    try {
      const user = await context.queryClient.ensureQueryData(getCurrentUserQueryOptions())
      const permissions = user.permissions ?? {}
      if (!canAccess(permissions, Permission.READ, Resource.ROLES)) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw redirect({ to: '/' })
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'to' in error) throw error
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: '/login' })
    }
  },
  component: RolesPage,
})

function RolesPage(): React.JSX.Element {
  const { t } = useTranslation()
  const [createOpen, setCreateOpen] = React.useState(false)

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold">
            {t('roles.title', { defaultValue: 'Role Management' })}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('roles.subtitle', { defaultValue: 'Manage roles and their permissions' })}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 size-4" />
          {t('roles.create', { defaultValue: 'Create Role' })}
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <RolesTable
          createOpen={createOpen}
          onCreateOpenChange={setCreateOpen}
        />
      </div>
    </div>
  )
}
