'use client'

import { useTranslation } from 'react-i18next'
import { InventoryCard } from './InventoryCard'
import { Spinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { useListInventory, type InventoryQueryDto } from '@/lib/data/inventory'

interface InventoryListProps {
  filters?: Partial<InventoryQueryDto>
}

export function InventoryList({ filters }: InventoryListProps): React.JSX.Element {
  const { t } = useTranslation()

  const { data, isLoading, error } = useListInventory({
    page: 1,
    limit: 50,
    ...filters,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState message={t('inventory.errorLoading') || 'Error loading inventory'} />
    )
  }

  const inventoryItems = data?.data ?? []

  if (inventoryItems.length === 0) {
    return (
      <EmptyState message={t('inventory.noInventory') || 'No inventory found'} />
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {inventoryItems.map((inventory) => (
        <InventoryCard key={inventory.id} inventory={inventory} />
      ))}
    </div>
  )
}
