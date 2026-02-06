'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChevronRight,
  FolderOpen,
  Folder,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { useListAllLocations, type LocationResponseDto } from '@/lib/data/locations'
import { useAreasControllerFindAll, type AreaResponseDto } from '@/lib/data/areas'
import { LOCATION_TYPE_ICONS } from '@/lib/location-type.utils'

const SELECTED_ITEM_STYLES = 'bg-accent text-accent-foreground'

interface LocationAreaSidebarProps {
  selectedLocationId: string | null
  selectedAreaId: string | null
  onSelect: (locationId: string | null, areaId: string | null) => void
}

interface AreaItemProps {
  area: AreaResponseDto
  allAreas: AreaResponseDto[]
  depth: number
  selectedAreaId: string | null
  expandedIds: Set<string>
  onSelect: (areaId: string) => void
  onToggle: (areaId: string) => void
}

function AreaItem({
  area,
  allAreas,
  depth,
  selectedAreaId,
  expandedIds,
  onSelect,
  onToggle,
}: AreaItemProps): React.JSX.Element {
  const children = allAreas.filter((a) => {
    const parentId = a.parent_id
    return typeof parentId === 'string' && parentId === area.id
  })
  const hasChildren = children.length > 0
  const isExpanded = expandedIds.has(area.id)
  const isSelected = selectedAreaId === area.id

  return (
    <div>
      <div
        role="button"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        tabIndex={0}
        className={cn(
          'flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-sm hover:bg-accent cursor-pointer',
          isSelected && SELECTED_ITEM_STYLES
        )}
        onClick={() => onSelect(area.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect(area.id)
          }
        }}
      >
        {hasChildren ? (
          <button
            className="p-0.5 hover:bg-accent-foreground/10 rounded"
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggle(area.id)
            }}
          >
            <ChevronRight
              className={cn(
                'size-3.5 transition-transform',
                isExpanded && 'rotate-90'
              )}
            />
          </button>
        ) : (
          <span className="w-4" />
        )}
        {isExpanded ? (
          <FolderOpen className="size-4 text-muted-foreground" />
        ) : (
          <Folder className="size-4 text-muted-foreground" />
        )}
        <span className="truncate">{area.name}</span>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {children.map((child) => (
            <AreaItem
              key={child.id}
              allAreas={allAreas}
              area={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              selectedAreaId={selectedAreaId}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface LocationItemProps {
  location: LocationResponseDto
  isSelected: boolean
  isExpanded: boolean
  selectedAreaId: string | null
  onSelect: () => void
  onToggle: () => void
  onSelectArea: (areaId: string) => void
}

function LocationItem({
  location,
  isSelected,
  isExpanded,
  selectedAreaId,
  onSelect,
  onToggle,
  onSelectArea,
}: LocationItemProps): React.JSX.Element {
  const Icon = LOCATION_TYPE_ICONS[location.type]
  const [expandedAreaIds, setExpandedAreaIds] = React.useState<Set<string>>(
    new Set()
  )

  const { data: areas } = useAreasControllerFindAll(
    { location_id: location.id },
    { query: { enabled: isExpanded } }
  )

  const rootAreas = (areas ?? []).filter((a) => !a.parent_id)
  const hasAreas = rootAreas.length > 0

  const handleToggleArea = (areaId: string): void => {
    setExpandedAreaIds((prev) => {
      const next = new Set(prev)
      if (next.has(areaId)) {
        next.delete(areaId)
      } else {
        next.add(areaId)
      }
      return next
    })
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent cursor-pointer',
          isSelected && !selectedAreaId && SELECTED_ITEM_STYLES
        )}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect()
          }
        }}
      >
        <button
          className="p-0.5 hover:bg-accent-foreground/10 rounded"
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
        >
          <ChevronRight
            className={cn(
              'size-3.5 transition-transform',
              isExpanded && 'rotate-90'
            )}
          />
        </button>
        <Icon className="size-4 text-muted-foreground" />
        <span className="truncate">{location.name}</span>
      </div>
      {isExpanded && (
        <div className="ml-2">
          {!areas && (
            <div className="py-2 pl-6">
              <Skeleton className="h-4 w-24" />
            </div>
          )}
          {areas && !hasAreas && (
            <div className="py-1.5 pl-6 text-xs text-muted-foreground">
              No areas
            </div>
          )}
          {hasAreas &&
            rootAreas.map((area) => (
              <AreaItem
                key={area.id}
                allAreas={areas ?? []}
                area={area}
                depth={1}
                expandedIds={expandedAreaIds}
                selectedAreaId={selectedAreaId}
                onSelect={onSelectArea}
                onToggle={handleToggleArea}
              />
            ))}
        </div>
      )}
    </div>
  )
}

export function LocationAreaSidebar({
  selectedLocationId,
  selectedAreaId,
  onSelect,
}: LocationAreaSidebarProps): React.JSX.Element {
  const { t } = useTranslation()
  const { data: locations, isLoading } = useListAllLocations()
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set())

  const handleToggle = (id: string): void => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSelectLocation = (locationId: string): void => {
    onSelect(locationId, null)
    if (!expandedIds.has(locationId)) {
      setExpandedIds((prev) => new Set(prev).add(locationId))
    }
  }

  const handleSelectArea = (locationId: string, areaId: string): void => {
    onSelect(locationId, areaId)
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-background">
      <div className="border-b p-4">
        <h2 className="text-sm font-semibold">
          {t('navigation.locations') || 'Locations'}
        </h2>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {isLoading && (
          <div className="space-y-2 p-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={`skeleton-${String(i)}`} className="h-7 w-full" />
            ))}
          </div>
        )}
        {locations?.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {t('locations.noLocations') || 'No locations found'}
          </div>
        )}
        {locations?.map((location) => (
          <LocationItem
            key={location.id}
            isExpanded={expandedIds.has(location.id)}
            isSelected={selectedLocationId === location.id}
            location={location}
            selectedAreaId={
              selectedLocationId === location.id ? selectedAreaId : null
            }
            onSelect={() => handleSelectLocation(location.id)}
            onSelectArea={(areaId) => handleSelectArea(location.id, areaId)}
            onToggle={() => handleToggle(location.id)}
          />
        ))}
      </nav>
      <div className="border-t p-2">
        <button
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent',
            !selectedLocationId && !selectedAreaId && SELECTED_ITEM_STYLES
          )}
          onClick={() => onSelect(null, null)}
        >
          <span className="w-5" />
          {t('inventory.allInventory') || 'All Inventory'}
        </button>
      </div>
    </aside>
  )
}
