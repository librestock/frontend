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
import { CreateSupplierButton } from '@/components/suppliers/CreateSupplierButton'
import { SupplierList } from '@/components/suppliers/SupplierList'
import { SearchBar } from '@/components/items/SearchBar'
import {
  parseNumberParam,
  parseStringParam,
  parseBooleanParam,
} from '@/lib/router/search'

const suppliersSearchSchema = z.object({
  q: z.preprocess(parseStringParam, z.string().optional()),
  is_active: z.preprocess(parseBooleanParam, z.boolean().optional()),
  page: z.preprocess(parseNumberParam, z.number().int().min(1).optional()),
})

const SUPPLIERS_PAGE_SIZE = 12

export const Route = createFileRoute('/suppliers')({
  validateSearch: (search) => suppliersSearchSchema.parse(search),
  component: SuppliersPage,
})

type SuppliersSearch = ReturnType<typeof Route.useSearch>

const ACTIVE_STATUSES = [
  { value: 'ALL', labelKey: 'suppliers.allStatuses', fallback: 'All Statuses' },
  { value: 'true', labelKey: 'form.active', fallback: 'Active' },
  { value: 'false', labelKey: 'form.inactive', fallback: 'Inactive' },
]

function SuppliersPage(): React.JSX.Element {
  const { t } = useTranslation()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const searchQuery = search.q ?? ''
  const isActiveFilter = search.is_active
  const page = search.page ?? 1

  const activeFilterValue = isActiveFilter === undefined
    ? 'ALL'
    : String(isActiveFilter)

  const filterChips = React.useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = []
    if (isActiveFilter !== undefined) {
      chips.push({
        key: 'is_active',
        label: `${t('suppliers.status') || 'Status'}: ${
          isActiveFilter
            ? (t('form.active') || 'Active')
            : (t('form.inactive') || 'Inactive')
        }`,
        onRemove: () => {
          void navigate({
            search: (prev: SuppliersSearch) => ({
              ...prev,
              is_active: undefined,
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
            search: (prev: SuppliersSearch) => ({
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
  }, [navigate, searchQuery, isActiveFilter, t])

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
              {t('navigation.suppliers') || 'Suppliers'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t('suppliers.subtitle') || 'Manage your supplier contacts and information'}
            </p>
          </div>
          <CreateSupplierButton />
        </div>
      </div>

      <div className="border-b px-6 py-3">
        <div className="flex items-center gap-4">
          <SearchBar
            className="max-w-sm"
            placeholder={t('suppliers.searchPlaceholder') || 'Search suppliers...'}
            value={searchQuery}
            onChange={(value) => {
              void navigate({
                search: (prev: SuppliersSearch) => ({
                  ...prev,
                  q: value || undefined,
                  page: 1,
                }),
                replace: true,
              })
            }}
            onClear={() => {
              void navigate({
                search: (prev: SuppliersSearch) => ({
                  ...prev,
                  q: undefined,
                  page: 1,
                }),
                replace: true,
              })
            }}
          />
          <Select
            value={activeFilterValue}
            onValueChange={(value) => {
              void navigate({
                search: (prev: SuppliersSearch) => ({
                  ...prev,
                  is_active: value === 'ALL' ? undefined : value === 'true',
                  page: 1,
                }),
                replace: true,
              })
            }}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 size-4" />
              <SelectValue placeholder={t('suppliers.filterByStatus') || 'Filter by status'} />
            </SelectTrigger>
            <SelectContent>
              {ACTIVE_STATUSES.map((status) => (
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
        <SupplierList
          hasActiveFilters={hasActiveFilters}
          isActiveFilter={isActiveFilter === undefined ? null : isActiveFilter}
          limit={SUPPLIERS_PAGE_SIZE}
          page={page}
          searchQuery={searchQuery}
          onPageChange={(nextPage) => {
            void navigate({
              search: (prev: SuppliersSearch) => ({
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
