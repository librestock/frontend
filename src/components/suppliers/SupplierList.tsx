import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { SupplierCard } from './SupplierCard'
import { SupplierCardSkeleton } from './SupplierCardSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { PaginationControls } from '@/components/common/PaginationControls'
import {
  useListSuppliers,
  type SupplierQueryDto,
} from '@/lib/data/suppliers'

interface SupplierListProps {
  isActiveFilter?: boolean | null
  searchQuery?: string
  page: number
  limit: number
  hasActiveFilters: boolean
  onPageChange: (page: number) => void
}

export function SupplierList({
  isActiveFilter,
  searchQuery,
  page,
  limit,
  hasActiveFilters,
  onPageChange,
}: SupplierListProps): React.JSX.Element {
  const { t } = useTranslation()
  const deferredSearchQuery = React.useDeferredValue(searchQuery ?? '')
  const queryParams = React.useMemo(() => {
    const params: SupplierQueryDto = {
      page,
      limit,
    }
    const query = deferredSearchQuery.trim()
    if (query) {
      params.q = query
    }
    if (isActiveFilter !== null && isActiveFilter !== undefined) {
      params.is_active = isActiveFilter
    }
    return params
  }, [deferredSearchQuery, limit, page, isActiveFilter])

  const { data, isLoading, error } = useListSuppliers(queryParams)

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SupplierCardSkeleton key={`skeleton-${String(i)}`} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState message={t('suppliers.errorLoading') || 'Error loading suppliers'} />
    )
  }

  const suppliers = data?.data ?? []
  const meta = data?.meta

  if (suppliers.length === 0) {
    return (
      <EmptyState
        message={
          hasActiveFilters
            ? (t('suppliers.noSuppliersFiltered') || 'No results for these filters')
            : (t('suppliers.noSuppliers') || 'No suppliers found')
        }
      />
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((supplier) => (
          <SupplierCard
            key={supplier.id}
            supplier={supplier}
          />
        ))}
      </div>
      <PaginationControls
        isLoading={isLoading}
        page={page}
        totalItems={meta?.total}
        totalPages={meta?.total_pages ?? 1}
        onPageChange={onPageChange}
      />
    </>
  )
}
