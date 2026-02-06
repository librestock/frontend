import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Clock, X } from 'lucide-react'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { CreateInventory } from '@/components/inventory/CreateInventory'
import { LocationAreaSidebar } from '@/components/inventory/LocationAreaSidebar'
import { InventoryTable } from '@/components/inventory/InventoryTable'
import { SearchBar } from '@/components/items/SearchBar'
import { useListAllLocations } from '@/lib/data/locations'
import { useAreasControllerFindAll } from '@/lib/data/areas'
import type { InventoryQueryDto } from '@/lib/data/inventory'
import {
  parseBooleanParam,
  parseNumberParam,
  parseStringParam,
} from '@/lib/router/search'
import { prefetchInventoryData } from '@/lib/router/loaders'

const inventorySearchSchema = z.object({
  location: z.preprocess(parseStringParam, z.string().optional()),
  area: z.preprocess(parseStringParam, z.string().optional()),
  q: z.preprocess(parseStringParam, z.string().optional()),
  low: z.preprocess(parseBooleanParam, z.boolean().optional()),
  expiring: z.preprocess(parseBooleanParam, z.boolean().optional()),
  page: z.preprocess(parseNumberParam, z.number().int().min(1).optional()),
})

const INVENTORY_PAGE_SIZE = 50

export const Route = createFileRoute('/inventory')({
  validateSearch: (search) => inventorySearchSchema.parse(search),
  loader: async ({ context: { queryClient }, location }) => {
    const search = inventorySearchSchema.parse(location.search)
    try {
      await prefetchInventoryData(queryClient, search, INVENTORY_PAGE_SIZE)
    } catch {
      // Allow client-side to retry if SSR prefetch fails
    }
  },
  component: InventoryPage,
})

type InventorySearch = ReturnType<typeof Route.useSearch>

function InventoryPage(): React.JSX.Element {
  const { t } = useTranslation()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const selectedLocationId = search.location ?? null
  const selectedAreaId = search.area ?? null
  const searchQuery = search.q ?? ''
  const showLowStock = search.low ?? false
  const showExpiringSoon = search.expiring ?? false
  const page = search.page ?? 1
  const deferredSearchQuery = React.useDeferredValue(searchQuery)

  const { data: locations } = useListAllLocations()
  const { data: areas } = useAreasControllerFindAll(
    selectedLocationId ? { location_id: selectedLocationId } : undefined,
    { query: { enabled: !!selectedLocationId } },
  )

  const handleSelect = React.useCallback(
    (locationId: string | null, areaId: string | null): void => {
      void navigate({
        search: (prev: InventorySearch) => ({
          ...prev,
          location: locationId ?? undefined,
          area: areaId ?? undefined,
          page: 1,
        }),
        replace: true,
      })
    },
    [navigate],
  )

  const filters = React.useMemo(() => {
    const f: Partial<InventoryQueryDto> = {}
    if (selectedAreaId) {
      f.area_id = selectedAreaId
    } else if (selectedLocationId) {
      f.location_id = selectedLocationId
    }
    if (deferredSearchQuery) {
      f.search = deferredSearchQuery
    }
    if (showLowStock) {
      f.low_stock = true
    }
    if (showExpiringSoon) {
      f.expiring_soon = true
    }
    return f
  }, [selectedLocationId, selectedAreaId, deferredSearchQuery, showLowStock, showExpiringSoon])

  const currentTitle = React.useMemo(() => {
    if (selectedAreaId) {
      return t('inventory.areaInventory') || 'Area Inventory'
    }
    if (selectedLocationId) {
      return t('inventory.locationInventory') || 'Location Inventory'
    }
    return t('inventory.allInventory') || 'All Inventory'
  }, [selectedLocationId, selectedAreaId, t])

  const selectedLocationName = React.useMemo(() => {
    if (!selectedLocationId) {
      return null
    }
    return locations?.find((location) => location.id === selectedLocationId)
      ?.name ?? null
  }, [locations, selectedLocationId])

  const selectedAreaName = React.useMemo(() => {
    if (!selectedAreaId) {
      return null
    }
    return areas?.find((area) => area.id === selectedAreaId)?.name ?? null
  }, [areas, selectedAreaId])

  const filterChips = React.useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = []
    if (selectedAreaId && selectedAreaName) {
      chips.push({
        key: 'area',
        label: `${t('inventory.area') || 'Area'}: ${selectedAreaName}`,
        onRemove: () => handleSelect(selectedLocationId, null),
      })
    } else if (selectedLocationId && selectedLocationName) {
      chips.push({
        key: 'location',
        label: `${t('inventory.location') || 'Location'}: ${selectedLocationName}`,
        onRemove: () => handleSelect(null, null),
      })
    }
    if (searchQuery) {
      chips.push({
        key: 'search',
        label: `${t('common.search') || 'Search'}: ${searchQuery}`,
        onRemove: () => {
          void navigate({
            search: (prev: InventorySearch) => ({
              ...prev,
              q: undefined,
              page: 1,
            }),
            replace: true,
          })
        },
      })
    }
    if (showLowStock) {
      chips.push({
        key: 'low-stock',
        label: t('inventory.lowStock') || 'Low Stock',
        onRemove: () => {
          void navigate({
            search: (prev: InventorySearch) => ({
              ...prev,
              low: undefined,
              page: 1,
            }),
            replace: true,
          })
        },
      })
    }
    if (showExpiringSoon) {
      chips.push({
        key: 'expiring',
        label: t('inventory.expiringSoon') || 'Expiring Soon',
        onRemove: () => {
          void navigate({
            search: (prev: InventorySearch) => ({
              ...prev,
              expiring: undefined,
              page: 1,
            }),
            replace: true,
          })
        },
      })
    }
    return chips
  }, [
    handleSelect,
    navigate,
    searchQuery,
    selectedAreaId,
    selectedAreaName,
    selectedLocationId,
    selectedLocationName,
    showExpiringSoon,
    showLowStock,
    t,
  ])

  const hasActiveFilters = filterChips.length > 0

  const clearAll = (): void => {
    void navigate({ search: {}, replace: true })
  }

  return (
    <div className="flex h-full w-full">
      <LocationAreaSidebar
        selectedAreaId={selectedAreaId}
        selectedLocationId={selectedLocationId}
        onSelect={handleSelect}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">{currentTitle}</h1>
            <p className="text-muted-foreground text-sm">
              {t('inventory.subtitle') || 'Track product quantities across locations'}
            </p>
          </div>
          <CreateInventory
            defaultAreaId={selectedAreaId ?? undefined}
            defaultLocationId={selectedLocationId ?? undefined}
          />
        </div>

        <div className="flex items-center gap-4 border-b px-6 py-3">
          <SearchBar
            className="max-w-xs"
            placeholder={t('inventory.searchPlaceholder') || 'Search batch...'}
            value={searchQuery}
            onChange={(value) => {
              void navigate({
                search: (prev: InventorySearch) => ({
                  ...prev,
                  q: value || undefined,
                  page: 1,
                }),
                replace: true,
              })
            }}
            onClear={() => {
              void navigate({
                search: (prev: InventorySearch) => ({
                  ...prev,
                  q: undefined,
                  page: 1,
                }),
                replace: true,
              })
            }}
          />
          <Toggle
            aria-label="Show low stock"
            pressed={showLowStock}
            size="sm"
            onPressedChange={(pressed) => {
              void navigate({
                search: (prev: InventorySearch) => ({
                  ...prev,
                  low: pressed ? true : undefined,
                  page: 1,
                }),
                replace: true,
              })
            }}
          >
            <AlertTriangle className="mr-1.5 size-4" />
            {t('inventory.lowStock') || 'Low Stock'}
          </Toggle>
          <Toggle
            aria-label="Show expiring soon"
            pressed={showExpiringSoon}
            size="sm"
            onPressedChange={(pressed) => {
              void navigate({
                search: (prev: InventorySearch) => ({
                  ...prev,
                  expiring: pressed ? true : undefined,
                  page: 1,
                }),
                replace: true,
              })
            }}
          >
            <Clock className="mr-1.5 size-4" />
            {t('inventory.expiringSoon') || 'Expiring Soon'}
          </Toggle>
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
          <InventoryTable
            filters={filters}
            hasActiveFilters={hasActiveFilters}
            limit={INVENTORY_PAGE_SIZE}
            page={page}
            onPageChange={(nextPage) => {
              void navigate({
                search: (prev: InventorySearch) => ({
                  ...prev,
                  page: nextPage,
                }),
                replace: true,
              })
            }}
          />
        </div>
      </div>
    </div>
  )
}
