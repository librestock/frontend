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
import { CreateLocation } from '@/components/locations/CreateLocation'
import { LocationList } from '@/components/locations/LocationList'
import { SearchBar } from '@/components/items/SearchBar'
import { LocationType } from '@/lib/enums/location-type.enum'
import {
  parseNumberParam,
  parseStringParam,
} from '@/lib/router/search'
import { prefetchLocationsData } from '@/lib/router/loaders'

const locationsSearchSchema = z.object({
  q: z.preprocess(parseStringParam, z.string().optional()),
  type: z.preprocess(parseStringParam, z.nativeEnum(LocationType).optional()),
  page: z.preprocess(parseNumberParam, z.number().int().min(1).optional()),
})

const LOCATIONS_PAGE_SIZE = 12

export const Route = createFileRoute('/locations')({
  validateSearch: (search) => locationsSearchSchema.parse(search),
  loader: async ({ context: { queryClient }, location }) => {
    const search = locationsSearchSchema.parse(location.search)
    await prefetchLocationsData(queryClient, search, LOCATIONS_PAGE_SIZE)
  },
  component: LocationsPage,
})

type LocationsSearch = ReturnType<typeof Route.useSearch>

const LOCATION_TYPES = [
  { value: 'ALL', label: 'All Types' },
  { value: LocationType.WAREHOUSE, label: 'Warehouse' },
  { value: LocationType.SUPPLIER, label: 'Supplier' },
  { value: LocationType.IN_TRANSIT, label: 'In Transit' },
  { value: LocationType.CLIENT, label: 'Client' },
]

function LocationsPage(): React.JSX.Element {
  const { t } = useTranslation()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const searchQuery = search.q ?? ''
  const typeFilter = search.type ?? 'ALL'
  const page = search.page ?? 1

  const filterChips = React.useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = []
    if (typeFilter !== 'ALL') {
      chips.push({
        key: 'type',
        label: `${t('locations.filterByType') || 'Type'}: ${
          t(`locations.types.${typeFilter}`) || typeFilter
        }`,
        onRemove: () => {
          void navigate({
            search: (prev: LocationsSearch) => ({
              ...prev,
              type: undefined,
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
            search: (prev: LocationsSearch) => ({
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
  }, [navigate, searchQuery, t, typeFilter])

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
              {t('navigation.locations') || 'Locations'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t('locations.subtitle') || 'Manage your storage locations and areas'}
            </p>
          </div>
          <CreateLocation />
        </div>
      </div>

      <div className="border-b px-6 py-3">
        <div className="flex items-center gap-4">
          <SearchBar
            className="max-w-sm"
            placeholder={t('locations.searchPlaceholder') || 'Search locations...'}
            value={searchQuery}
            onChange={(value) => {
              void navigate({
                search: (prev: LocationsSearch) => ({
                  ...prev,
                  q: value || undefined,
                  page: 1,
                }),
                replace: true,
              })
            }}
            onClear={() => {
              void navigate({
                search: (prev: LocationsSearch) => ({
                  ...prev,
                  q: undefined,
                  page: 1,
                }),
                replace: true,
              })
            }}
          />
          <Select
            value={typeFilter}
            onValueChange={(value) => {
              void navigate({
                search: (prev: LocationsSearch) => ({
                  ...prev,
                  type: value === 'ALL' ? undefined : (value as LocationType),
                  page: 1,
                }),
                replace: true,
              })
            }}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 size-4" />
              <SelectValue placeholder={t('locations.filterByType') || 'Filter by type'} />
            </SelectTrigger>
            <SelectContent>
              {LOCATION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.value === 'ALL'
                    ? (t('locations.allTypes') || type.label)
                    : (t(`locations.types.${type.value}`) || type.label)}
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
        <LocationList
          hasActiveFilters={hasActiveFilters}
          limit={LOCATIONS_PAGE_SIZE}
          page={page}
          searchQuery={searchQuery}
          typeFilter={typeFilter === 'ALL' ? null : typeFilter}
          onPageChange={(nextPage) => {
            void navigate({
              search: (prev: LocationsSearch) => ({
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
