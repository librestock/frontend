import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Filter, X } from 'lucide-react'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CreateClientButton } from '@/components/clients/CreateClientButton'
import { ClientList } from '@/components/clients/ClientList'
import { SearchBar } from '@/components/items/SearchBar'
import { ClientStatus } from '@/lib/data/clients'
import {
  parseNumberParam,
  parseStringParam,
} from '@/lib/router/search'

const clientsSearchSchema = z.object({
  q: z.preprocess(parseStringParam, z.string().optional()),
  status: z.preprocess(parseStringParam, z.nativeEnum(ClientStatus).optional()),
  page: z.preprocess(parseNumberParam, z.number().int().min(1).optional()),
})

const CLIENTS_PAGE_SIZE = 12

export const Route = createFileRoute('/clients')({
  validateSearch: (search) => clientsSearchSchema.parse(search),
  component: ClientsPage,
})

type ClientsSearch = ReturnType<typeof Route.useSearch>

const CLIENT_STATUSES = [
  { value: 'ALL', labelKey: 'clients.allStatuses', fallback: 'All Statuses' },
  { value: ClientStatus.ACTIVE, labelKey: 'clients.statuses.ACTIVE', fallback: 'Active' },
  { value: ClientStatus.SUSPENDED, labelKey: 'clients.statuses.SUSPENDED', fallback: 'Suspended' },
  { value: ClientStatus.INACTIVE, labelKey: 'clients.statuses.INACTIVE', fallback: 'Inactive' },
]

function ClientsPage(): React.JSX.Element {
  const { t } = useTranslation()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const searchQuery = search.q ?? ''
  const statusFilter = search.status ?? 'ALL'
  const page = search.page ?? 1

  const filterChips = React.useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = []
    if (statusFilter !== 'ALL') {
      chips.push({
        key: 'status',
        label: `${t('clients.status') || 'Status'}: ${
          t(`clients.statuses.${statusFilter}`) || statusFilter
        }`,
        onRemove: () => {
          void navigate({
            search: (prev: ClientsSearch) => ({
              ...prev,
              status: undefined,
              page: 1,
            }),
            replace: true,
          })
        },
      })
    }
    if (searchQuery) {
      chips.push({
        key: 'search',
        label: `${t('common.search') || 'Search'}: ${searchQuery}`,
        onRemove: () => {
          void navigate({
            search: (prev: ClientsSearch) => ({
              ...prev,
              q: undefined,
              page: 1,
            }),
            replace: true,
          })
        },
      })
    }
    return chips
  }, [navigate, searchQuery, statusFilter, t])

  const hasActiveFilters = filterChips.length > 0

  const clearAll = (): void => {
    void navigate({ search: {}, replace: true })
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {t('navigation.clients') || 'Clients'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t('clients.subtitle') || 'Manage your client accounts and contacts'}
            </p>
          </div>
          <CreateClientButton />
        </div>
      </div>

      <div className="border-b px-6 py-3">
        <div className="flex items-center gap-4">
          <SearchBar
            className="max-w-sm"
            placeholder={t('clients.searchPlaceholder') || 'Search clients...'}
            value={searchQuery}
            onChange={(value) => {
              void navigate({
                search: (prev: ClientsSearch) => ({
                  ...prev,
                  q: value || undefined,
                  page: 1,
                }),
                replace: true,
              })
            }}
            onClear={() => {
              void navigate({
                search: (prev: ClientsSearch) => ({
                  ...prev,
                  q: undefined,
                  page: 1,
                }),
                replace: true,
              })
            }}
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              void navigate({
                search: (prev: ClientsSearch) => ({
                  ...prev,
                  status: value === 'ALL' ? undefined : (value as ClientStatus),
                  page: 1,
                }),
                replace: true,
              })
            }}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 size-4" />
              <SelectValue placeholder={t('clients.filterByStatus') || 'Filter by status'} />
            </SelectTrigger>
            <SelectContent>
              {CLIENT_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {t(status.labelKey) || status.fallback}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
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
            {t('actions.clearAll') || 'Clear all'}
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-auto p-6">
        <ClientList
          hasActiveFilters={hasActiveFilters}
          limit={CLIENTS_PAGE_SIZE}
          page={page}
          searchQuery={searchQuery}
          statusFilter={statusFilter === 'ALL' ? null : statusFilter}
          onPageChange={(nextPage) => {
            void navigate({
              search: (prev: ClientsSearch) => ({
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
