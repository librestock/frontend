import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { LocationCard } from './LocationCard'
import { LocationCardSkeleton } from './LocationCardSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { PaginationControls } from '@/components/common/PaginationControls'
import {
  useListLocations,
  type LocationQueryDto,
  type LocationResponseDto,
} from '@/lib/data/locations'

interface LocationListProps {
  typeFilter?: string | null
  searchQuery?: string
  page: number
  limit: number
  hasActiveFilters: boolean
  onPageChange: (page: number) => void
  onSelectLocation?: (location: LocationResponseDto) => void
}

export function LocationList({
  typeFilter,
  searchQuery,
  page,
  limit,
  hasActiveFilters,
  onPageChange,
  onSelectLocation,
}: LocationListProps): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const deferredSearchQuery = React.useDeferredValue(searchQuery ?? '')
  const queryParams = React.useMemo(() => {
    const params: LocationQueryDto = {
      page,
      limit,
    }
    const query = deferredSearchQuery.trim()
    if (query) {
      params.search = query
    }
    if (typeFilter) {
      params.type = typeFilter as LocationQueryDto['type']
    }
    return params
  }, [deferredSearchQuery, limit, page, typeFilter])

  const { data, isLoading, error } = useListLocations(queryParams)

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <LocationCardSkeleton key={`skeleton-${String(i)}`} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState message={t('locations.errorLoading') || 'Error loading locations'} />
    )
  }

  const locations = data?.data ?? []
  const meta = data?.meta

  if (locations.length === 0) {
    return (
      <EmptyState
        message={
          hasActiveFilters
            ? (t('locations.noLocationsFiltered') || 'No results for these filters')
            : (t('locations.noLocations') || 'No locations found')
        }
      />
    )
  }

  const handleClick = (location: LocationResponseDto): void => {
    onSelectLocation?.(location)
    void navigate({ to: '/locations/$id', params: { id: location.id } })
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            onClick={() => handleClick(location)}
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
