import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Filter, X } from 'lucide-react'
import { z } from 'zod'

import { StockMovementReason } from '@librestock/types'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CreateStockMovementButton } from '@/components/stock-movements/CreateStockMovementButton'
import { StockMovementTable } from '@/components/stock-movements/StockMovementTable'
import { useListAllLocations } from '@/lib/data/locations'
import { useListAllProducts } from '@/lib/data/products'
import type { StockMovementQueryDto } from '@/lib/data/stock-movements'
import {
  parseNumberParam,
  parseStringParam,
} from '@/lib/router/search'

const STOCK_MOVEMENT_REASONS = [
  { value: 'ALL', label: 'All Reasons' },
  ...Object.values(StockMovementReason).map((r) => ({ value: r, label: r })),
]

const stockMovementsSearchSchema = z.object({
  page: z.preprocess(parseNumberParam, z.number().int().min(1).optional()),
  reason: z.preprocess(parseStringParam, z.nativeEnum(StockMovementReason).optional()),
  product_id: z.preprocess(parseStringParam, z.string().optional()),
  location_id: z.preprocess(parseStringParam, z.string().optional()),
})

const STOCK_MOVEMENTS_PAGE_SIZE = 50

export const Route = createFileRoute('/stock-movements')({
  validateSearch: (search) => stockMovementsSearchSchema.parse(search),
  component: StockMovementsPage,
})

type StockMovementsSearch = ReturnType<typeof Route.useSearch>

function StockMovementsPage(): React.JSX.Element {
  const { t } = useTranslation()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const page = search.page ?? 1
  const reasonFilter = search.reason
  const productFilter = search.product_id
  const locationFilter = search.location_id

  const { data: locations } = useListAllLocations()
  const { data: products } = useListAllProducts()

  const filters = React.useMemo(() => {
    const f: Partial<StockMovementQueryDto> = {}
    if (reasonFilter) {
      f.reason = reasonFilter
    }
    if (productFilter) {
      f.product_id = productFilter
    }
    if (locationFilter) {
      f.location_id = locationFilter
    }
    return f
  }, [reasonFilter, productFilter, locationFilter])

  const selectedProductName = React.useMemo(() => {
    if (!productFilter) return null
    return products?.find((p) => p.id === productFilter)?.name ?? null
  }, [products, productFilter])

  const selectedLocationName = React.useMemo(() => {
    if (!locationFilter) return null
    return locations?.find((l) => l.id === locationFilter)?.name ?? null
  }, [locations, locationFilter])

  const filterChips = React.useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = []
    if (reasonFilter) {
      chips.push({
        key: 'reason',
        label: `${t('stockMovements.reason') || 'Reason'}: ${t(`stockMovements.reasons.${reasonFilter}`) || reasonFilter}`,
        onRemove: () => {
          void navigate({
            search: (prev: StockMovementsSearch) => ({
              ...prev,
              reason: undefined,
              page: 1,
            }),
            replace: true,
          })
        },
      })
    }
    if (productFilter && selectedProductName) {
      chips.push({
        key: 'product',
        label: `${t('stockMovements.product') || 'Product'}: ${selectedProductName}`,
        onRemove: () => {
          void navigate({
            search: (prev: StockMovementsSearch) => ({
              ...prev,
              product_id: undefined,
              page: 1,
            }),
            replace: true,
          })
        },
      })
    }
    if (locationFilter && selectedLocationName) {
      chips.push({
        key: 'location',
        label: `${t('stockMovements.location') || 'Location'}: ${selectedLocationName}`,
        onRemove: () => {
          void navigate({
            search: (prev: StockMovementsSearch) => ({
              ...prev,
              location_id: undefined,
              page: 1,
            }),
            replace: true,
          })
        },
      })
    }
    return chips
  }, [
    navigate,
    reasonFilter,
    productFilter,
    locationFilter,
    selectedProductName,
    selectedLocationName,
    t,
  ])

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
              {t('navigation.stockMovements') || 'Stock Movements'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t('stockMovements.subtitle') || 'Track all stock movements across locations'}
            </p>
          </div>
          <CreateStockMovementButton />
        </div>
      </div>

      <div className="border-b px-6 py-3">
        <div className="flex items-center gap-4">
          <Select
            value={reasonFilter ?? 'ALL'}
            onValueChange={(value) => {
              void navigate({
                search: (prev: StockMovementsSearch) => ({
                  ...prev,
                  reason: value === 'ALL' ? undefined : (value as StockMovementReason),
                  page: 1,
                }),
                replace: true,
              })
            }}
          >
            <SelectTrigger className="w-[200px]">
              <Filter className="mr-2 size-4" />
              <SelectValue placeholder={t('stockMovements.filterByReason') || 'Filter by reason'} />
            </SelectTrigger>
            <SelectContent>
              {STOCK_MOVEMENT_REASONS.map((reason) => (
                <SelectItem key={reason.value} value={reason.value}>
                  {reason.value === 'ALL'
                    ? (t('stockMovements.allReasons') || 'All Reasons')
                    : (t(`stockMovements.reasons.${reason.value}`) || reason.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={productFilter ?? 'ALL'}
            onValueChange={(value) => {
              void navigate({
                search: (prev: StockMovementsSearch) => ({
                  ...prev,
                  product_id: value === 'ALL' ? undefined : value,
                  page: 1,
                }),
                replace: true,
              })
            }}
          >
            <SelectTrigger className="w-[200px]">
              <Filter className="mr-2 size-4" />
              <SelectValue placeholder={t('stockMovements.filterByProduct') || 'Filter by product'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                {t('stockMovements.allProducts') || 'All Products'}
              </SelectItem>
              {(products ?? []).map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={locationFilter ?? 'ALL'}
            onValueChange={(value) => {
              void navigate({
                search: (prev: StockMovementsSearch) => ({
                  ...prev,
                  location_id: value === 'ALL' ? undefined : value,
                  page: 1,
                }),
                replace: true,
              })
            }}
          >
            <SelectTrigger className="w-[200px]">
              <Filter className="mr-2 size-4" />
              <SelectValue placeholder={t('stockMovements.filterByLocation') || 'Filter by location'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                {t('stockMovements.allLocations') || 'All Locations'}
              </SelectItem>
              {(locations ?? []).map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
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
        <StockMovementTable
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          limit={STOCK_MOVEMENTS_PAGE_SIZE}
          page={page}
          onPageChange={(nextPage) => {
            void navigate({
              search: (prev: StockMovementsSearch) => ({
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
