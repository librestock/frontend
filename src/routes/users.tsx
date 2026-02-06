import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { z } from 'zod'
import { UserRole } from '@librestock/types'

import { redirect } from '@tanstack/react-router'
import { getSession } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SearchBar } from '@/components/items/SearchBar'
import { UsersTable } from '@/components/users/UsersTable'
import type { UserQueryDto } from '@/lib/data/users'
import { parseNumberParam, parseStringParam } from '@/lib/router/search'

const usersSearchSchema = z.object({
  page: z.preprocess(parseNumberParam, z.number().int().min(1).optional()),
  search: z.preprocess(parseStringParam, z.string().optional()),
  role: z.preprocess(parseStringParam, z.string().optional()),
})

const USERS_PAGE_SIZE = 20

export const Route = createFileRoute('/users')({
  validateSearch: (search) => usersSearchSchema.parse(search),
  beforeLoad: async () => {
    const { data: session } = await getSession()
    if (!session) {
      throw redirect({ to: '/login' })
    }
  },
  component: UsersPage,
})

type UsersSearch = ReturnType<typeof Route.useSearch>

function UsersPage(): React.JSX.Element {
  const { t } = useTranslation()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const page = search.page ?? 1
  const searchQuery = search.search
  const role = search.role as UserRole | undefined

  const filters = React.useMemo(() => {
    const f: Partial<UserQueryDto> = {}
    if (searchQuery) f.search = searchQuery
    if (role) f.role = role
    return f
  }, [searchQuery, role])

  const filterChips = React.useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = []
    if (role) {
      chips.push({
        key: 'role',
        label: `${t('users.rolesColumn', { defaultValue: 'Role' })}: ${t(`users.roles.${role}`, { defaultValue: role })}`,
        onRemove: () => {
          void navigate({
            search: (prev: UsersSearch) => ({
              ...prev,
              role: undefined,
              page: 1,
            }),
            replace: true,
          })
        },
      })
    }
    return chips
  }, [role, navigate, t])

  const hasActiveFilters = filterChips.length > 0 || !!searchQuery

  const clearAll = (): void => {
    void navigate({ search: {}, replace: true })
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold">
            {t('users.title', { defaultValue: 'User Management' })}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('users.subtitle', { defaultValue: 'Manage user accounts, roles, and access' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b px-6 py-3">
        <SearchBar
          value={searchQuery ?? ''}
          placeholder={t('users.searchPlaceholder', { defaultValue: 'Search users...' })}
          onChange={(value) => {
            void navigate({
              search: (prev: UsersSearch) => ({
                ...prev,
                search: value || undefined,
                page: 1,
              }),
              replace: true,
            })
          }}
          onClear={() => {
            void navigate({
              search: (prev: UsersSearch) => ({
                ...prev,
                search: undefined,
                page: 1,
              }),
              replace: true,
            })
          }}
        />

        <Select
          value={role ?? ''}
          onValueChange={(value) => {
            void navigate({
              search: (prev: UsersSearch) => ({
                ...prev,
                role: value || undefined,
                page: 1,
              }),
              replace: true,
            })
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('users.allRoles', { defaultValue: 'All Roles' })} />
          </SelectTrigger>
          <SelectContent>
            {Object.values(UserRole).map((r) => (
              <SelectItem key={r} value={r}>
                {t(`users.roles.${r}`, { defaultValue: r })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filterChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b px-6 py-2">
          {filterChips.map((chip) => (
            <Button
              key={chip.key}
              className="gap-1"
              size="sm"
              variant="outline"
              onClick={chip.onRemove}
            >
              {chip.label}
              <X className="size-3" />
            </Button>
          ))}
          <Button size="sm" variant="ghost" onClick={clearAll}>
            {t('actions.clearAll', { defaultValue: 'Clear all' })}
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-auto p-6">
        <UsersTable
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          limit={USERS_PAGE_SIZE}
          page={page}
          onPageChange={(nextPage) => {
            void navigate({
              search: (prev: UsersSearch) => ({
                ...prev,
                page: nextPage,
              }),
              replace: true,
            })
          }}
        />
      </div>
    </div>
  )
}
