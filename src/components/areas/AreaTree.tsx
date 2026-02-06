'use client'

import { useTranslation } from 'react-i18next'
import { FolderTree } from 'lucide-react'
import { AreaTreeItem } from './AreaTreeItem'
import { CreateArea } from './CreateArea'
import { Spinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { useAreasControllerFindAll } from '@/lib/data/areas'

interface AreaTreeProps {
  locationId: string
}

export function AreaTree({ locationId }: AreaTreeProps): React.JSX.Element {
  const { t } = useTranslation()

  const {
    data: areas,
    isLoading,
    error,
  } = useAreasControllerFindAll({
    location_id: locationId,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    )
  }

  if (error !== null) {
    return (
      <ErrorState message={t('areas.errorLoading') || 'Error loading areas'} />
    )
  }

  // Filter root areas (no parent)
  const rootAreas = (areas ?? []).filter((area) => !area.parent_id)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FolderTree className="size-5" />
          {t('areas.title') || 'Areas'}
        </h2>
        <CreateArea locationId={locationId} />
      </div>

      {rootAreas.length === 0 ? (
        <EmptyState
          description={t('areas.createDescription') || 'Add a new area within this location.'}
          icon={FolderTree}
          message={t('areas.noAreas') || 'No areas found'}
          variant="bordered"
        />
      ) : (
        <div className="border rounded-lg p-2">
          {rootAreas.map((area) => (
            <AreaTreeItem
              key={area.id}
              allAreas={areas ?? []}
              area={area}
              locationId={locationId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
