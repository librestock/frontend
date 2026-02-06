import { Building2, Truck, Users, Warehouse } from 'lucide-react'
import { LocationType } from '@/lib/enums/location-type.enum'

export const LOCATION_TYPE_ICONS: Record<LocationType, typeof Warehouse> = {
  [LocationType.WAREHOUSE]: Warehouse,
  [LocationType.SUPPLIER]: Building2,
  [LocationType.IN_TRANSIT]: Truck,
  [LocationType.CLIENT]: Users,
}

export const LOCATION_TYPE_COLORS: Record<LocationType, string> = {
  [LocationType.WAREHOUSE]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [LocationType.SUPPLIER]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [LocationType.IN_TRANSIT]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [LocationType.CLIENT]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
}

export function getLocationTypeIcon(type: LocationType): typeof Warehouse {
  return LOCATION_TYPE_ICONS[type]
}

export function getLocationTypeColor(type: LocationType): string {
  return LOCATION_TYPE_COLORS[type]
}
