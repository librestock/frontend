import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Filter, X } from 'lucide-react'
import { z } from 'zod'
import { OrderStatus } from '@librestock/types'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CreateOrderButton } from '@/components/orders/CreateOrderButton'
import { OrderTable } from '@/components/orders/OrderTable'
import { SearchBar } from '@/components/items/SearchBar'
import {
  parseNumberParam,
  parseStringParam,
} from '@/lib/router/search'

const ordersSearchSchema = z.object({
  q: z.preprocess(parseStringParam, z.string().optional()),
  status: z.preprocess(
    parseStringParam,
    z.nativeEnum(OrderStatus).optional(),
  ),
  page: z.preprocess(parseNumberParam, z.number().int().min(1).optional()),
})

const ORDERS_PAGE_SIZE = 20

export const Route = createFileRoute('/orders')({
  validateSearch: (search) => ordersSearchSchema.parse(search),
  component: OrdersPage,
})

type OrdersSearch = ReturnType<typeof Route.useSearch>

const ORDER_STATUSES = [
  { value: 'ALL', labelKey: 'orders.allStatuses', fallback: 'All Statuses' },
  { value: OrderStatus.DRAFT, labelKey: 'orders.statuses.DRAFT', fallback: 'Draft' },
  { value: OrderStatus.CONFIRMED, labelKey: 'orders.statuses.CONFIRMED', fallback: 'Confirmed' },
  { value: OrderStatus.SOURCING, labelKey: 'orders.statuses.SOURCING', fallback: 'Sourcing' },
  { value: OrderStatus.PICKING, labelKey: 'orders.statuses.PICKING', fallback: 'Picking' },
  { value: OrderStatus.PACKED, labelKey: 'orders.statuses.PACKED', fallback: 'Packed' },
  { value: OrderStatus.SHIPPED, labelKey: 'orders.statuses.SHIPPED', fallback: 'Shipped' },
  { value: OrderStatus.DELIVERED, labelKey: 'orders.statuses.DELIVERED', fallback: 'Delivered' },
  { value: OrderStatus.CANCELLED, labelKey: 'orders.statuses.CANCELLED', fallback: 'Cancelled' },
  { value: OrderStatus.ON_HOLD, labelKey: 'orders.statuses.ON_HOLD', fallback: 'On Hold' },
]

function OrdersPage(): React.JSX.Element {
  const { t } = useTranslation()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const searchQuery = search.q ?? ''
  const statusFilter = search.status ?? 'ALL'
  const page = search.page ?? 1
  const deferredSearchQuery = React.useDeferredValue(searchQuery)

  const filters = React.useMemo(() => {
    const f: Record<string, unknown> = {}
    const query = deferredSearchQuery.trim()
    if (query) {
      f.q = query
    }
    if (statusFilter !== 'ALL') {
      f.status = statusFilter
    }
    return f
  }, [deferredSearchQuery, statusFilter])

  const filterChips = React.useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = []
    if (statusFilter !== 'ALL') {
      chips.push({
        key: 'status',
        label: `${t('orders.status') || 'Status'}: ${
          t(`orders.statuses.${statusFilter}`) || statusFilter
        }`,
        onRemove: () => {
          void navigate({
            search: (prev: OrdersSearch) => ({
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
            search: (prev: OrdersSearch) => ({
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
              {t('navigation.orders') || 'Orders'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t('orders.subtitle') ||
                'Manage orders, track fulfillment, and update statuses'}
            </p>
          </div>
          <CreateOrderButton />
        </div>
      </div>

      <div className="border-b px-6 py-3">
        <div className="flex items-center gap-4">
          <SearchBar
            className="max-w-sm"
            placeholder={
              t('orders.searchPlaceholder') || 'Search orders...'
            }
            value={searchQuery}
            onChange={(value) => {
              void navigate({
                search: (prev: OrdersSearch) => ({
                  ...prev,
                  q: value || undefined,
                  page: 1,
                }),
                replace: true,
              })
            }}
            onClear={() => {
              void navigate({
                search: (prev: OrdersSearch) => ({
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
                search: (prev: OrdersSearch) => ({
                  ...prev,
                  status:
                    value === 'ALL' ? undefined : (value as OrderStatus),
                  page: 1,
                }),
                replace: true,
              })
            }}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 size-4" />
              <SelectValue
                placeholder={
                  t('orders.filterByStatus') || 'Filter by status'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((status) => (
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
        <OrderTable
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          limit={ORDERS_PAGE_SIZE}
          page={page}
          onPageChange={(nextPage) => {
            void navigate({
              search: (prev: OrdersSearch) => ({
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
