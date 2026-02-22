import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { ClientCard } from './ClientCard'
import { ClientCardSkeleton } from './ClientCardSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { PaginationControls } from '@/components/common/PaginationControls'
import {
  useListClients,
  type ClientQueryDto,
  ClientStatus,
} from '@/lib/data/clients'

interface ClientListProps {
  statusFilter?: ClientStatus | null
  searchQuery?: string
  page: number
  limit: number
  hasActiveFilters: boolean
  onPageChange: (page: number) => void
}

export function ClientList({
  statusFilter,
  searchQuery,
  page,
  limit,
  hasActiveFilters,
  onPageChange,
}: ClientListProps): React.JSX.Element {
  const { t } = useTranslation()
  const deferredSearchQuery = React.useDeferredValue(searchQuery ?? '')
  const queryParams = React.useMemo(() => {
    const params: ClientQueryDto = {
      page,
      limit,
    }
    const query = deferredSearchQuery.trim()
    if (query) {
      params.q = query
    }
    if (statusFilter) {
      params.account_status = statusFilter
    }
    return params
  }, [deferredSearchQuery, limit, page, statusFilter])

  const { data, isLoading, error } = useListClients(queryParams)

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ClientCardSkeleton key={`skeleton-${String(i)}`} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState message={t('clients.errorLoading') || 'Error loading clients'} />
    )
  }

  const clients = data?.data ?? []
  const meta = data?.meta

  if (clients.length === 0) {
    return (
      <EmptyState
        message={
          hasActiveFilters
            ? (t('clients.noClientsFiltered') || 'No results for these filters')
            : (t('clients.noClients') || 'No clients found')
        }
      />
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
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
