import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { z } from 'zod'

import { ActionButtons } from '@/components/items/ActionButtons'
import { DisplayTypeToggle } from '@/components/items/DisplayTypeToggle'
import { ItemCard } from '@/components/items/ItemCard'
import { ItemsGrid } from '@/components/items/ItemsGrid'
import { SearchBar } from '@/components/items/SearchBar'
import { SortSelect } from '@/components/items/SortSelect'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { PaginationControls } from '@/components/common/PaginationControls'
import { useListProducts } from '@/lib/data/products'
import { DisplayType } from '@/lib/enums/display-type.enum'
import { SortField } from '@/lib/enums/sort-field.enum'
import {
  parseNumberParam,
  parseStringParam,
} from '@/lib/router/search'

import type { SortOption } from '@/components/items/SortSelect'

const stockSearchSchema = z.object({
  q: z.preprocess(parseStringParam, z.string().optional()),
  sort: z.preprocess(parseStringParam, z.nativeEnum(SortField).optional()),
  view: z.preprocess(parseStringParam, z.nativeEnum(DisplayType).optional()),
  page: z.preprocess(parseNumberParam, z.number().int().min(1).optional()),
})

const STOCK_PAGE_SIZE = 24

export const Route = createFileRoute('/stock')({
  validateSearch: (search) => stockSearchSchema.parse(search),
  component: ItemsPage,
})

type StockSearch = ReturnType<typeof Route.useSearch>

function useSortOptions(): SortOption[] {
  const { t } = useTranslation()

  return React.useMemo(
    () => [
      { value: SortField.NAME, label: t('sort.name') },
      { value: SortField.QUANTITY, label: t('sort.quantity') },
      { value: SortField.VALUE, label: t('sort.value') },
    ],
    [t],
  )
}

function ItemsPage(): React.JSX.Element {
  const { t } = useTranslation()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const sortOptions = useSortOptions()
  const searchQuery = search.q ?? ''
  const sortBy = search.sort ?? SortField.NAME
  const displayType = search.view ?? DisplayType.GRID
  const page = search.page ?? 1
  const deferredSearchQuery = React.useDeferredValue(searchQuery)

  const { data: productsResponse, isLoading, error } = useListProducts({
    page,
    limit: STOCK_PAGE_SIZE,
    search: deferredSearchQuery.trim() ? deferredSearchQuery.trim() : undefined,
  })
  const meta = productsResponse?.meta

  const sortedItems = React.useMemo(() => {
    const items = productsResponse?.data ?? []
    const sorted = [...items]
    if (sortBy === SortField.NAME) {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    }
    return sorted
  }, [productsResponse?.data, sortBy])

  const filterChips = React.useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = []
    if (searchQuery) {
      chips.push({
        key: 'search',
        label: `${t('common.search') || 'Search'}: ${searchQuery}`,
        onRemove: () => {
          void navigate({
            search: (prev: StockSearch) => ({
              ...prev,
              q: undefined,
              page: 1,
            }),
            replace: true,
          })
        },
      })
    }
    if (sortBy !== SortField.NAME) {
      const sortLabel = sortOptions.find((option) => option.value === sortBy)
        ?.label ?? sortBy
      chips.push({
        key: 'sort',
        label: `${t('common.sort') || 'Sort'}: ${sortLabel}`,
        onRemove: () => {
          void navigate({
            search: (prev: StockSearch) => ({
              ...prev,
              sort: undefined,
              page: 1,
            }),
            replace: true,
          })
        },
      })
    }
    if (displayType !== DisplayType.GRID) {
      chips.push({
        key: 'view',
        label: `${t('common.view') || 'View'}: ${displayType}`,
        onRemove: () => {
          void navigate({
            search: (prev: StockSearch) => ({
              ...prev,
              view: undefined,
              page: 1,
            }),
            replace: true,
          })
        },
      })
    }
    return chips
  }, [displayType, navigate, searchQuery, sortBy, sortOptions, t])

  const hasActiveFilters = filterChips.length > 0
  const emptyMessage = searchQuery
    ? (t('items.noSearchResults') || 'No results for this search')
    : (t('items.noItemsFolder') || 'No items found')

  return (
    <div className="flex h-full w-full">
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {t('navigation.products') || 'Products'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-2">
            <ActionButtons />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center gap-2">
            <SearchBar
              className="flex-1"
              placeholder={t('search.itemsPlaceholder')}
              value={searchQuery}
              onChange={(value) => {
                void navigate({
                  search: (prev: StockSearch) => ({
                    ...prev,
                    q: value || undefined,
                    page: 1,
                  }),
                  replace: true,
                })
              }}
              onClear={() => {
                void navigate({
                  search: (prev: StockSearch) => ({
                    ...prev,
                    q: undefined,
                    page: 1,
                  }),
                  replace: true,
                })
              }}
            />
            <SortSelect
              options={sortOptions}
              value={sortBy}
              onChange={(value) => {
                const nextSort = value as SortField
                void navigate({
                  search: (prev: StockSearch) => ({
                    ...prev,
                    sort: nextSort === SortField.NAME ? undefined : nextSort,
                    page: 1,
                  }),
                  replace: true,
                })
              }}
            />
            <DisplayTypeToggle
              value={displayType}
              onChange={(value) => {
                void navigate({
                  search: (prev: StockSearch) => ({
                    ...prev,
                    view: value === DisplayType.GRID ? undefined : value,
                  }),
                  replace: true,
                })
              }}
            />
          </div>
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
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
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  void navigate({ search: {}, replace: true })
                }}
              >
                {t('actions.clearAll') || 'Clear all'}
              </Button>
            </div>
          )}
          <div className="flex-1 overflow-auto">
            {error && (
              <ErrorState
                message={t('items.errorLoading') || 'Error loading items'}
                variant="bordered"
              />
            )}
            {!error && isLoading && (
              <EmptyState
                message={t('common.loading') || 'Loading...'}
                variant="bordered"
              />
            )}
            {!error && !isLoading && (
              <>
                <ItemsGrid
                  displayType={displayType}
                  emptyMessage={emptyMessage}
                  items={sortedItems}
                  renderItem={(item) => (
                    <ItemCard key={item.id} displayType={displayType} item={item} />
                  )}
                />
                <PaginationControls
                  isLoading={isLoading}
                  page={page}
                  totalItems={meta?.total}
                  totalPages={meta?.total_pages ?? 1}
                  onPageChange={(nextPage) => {
                    void navigate({
                      search: (prev: StockSearch) => ({
                        ...prev,
                        page: nextPage,
                      }),
                      replace: true,
                    })
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
