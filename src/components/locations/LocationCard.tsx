'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin, Phone, User } from 'lucide-react'

import { LocationForm } from './LocationForm'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FormDialog } from '@/components/common/FormDialog'
import { CrudDropdownMenu } from '@/components/common/CrudDropdownMenu'
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog'
import {
  type LocationResponseDto,
} from '@/lib/data/locations'
import { useDeleteLocationOptimistic } from '@/hooks/locations'
import {
  LOCATION_TYPE_ICONS,
  LOCATION_TYPE_COLORS,
} from '@/lib/location-type.utils'

interface LocationCardProps {
  location: LocationResponseDto
  onClick?: () => void
}

export function LocationCard({ location, onClick }: LocationCardProps): React.JSX.Element {
  const { t } = useTranslation()
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const Icon = LOCATION_TYPE_ICONS[location.type]
  const typeColor = LOCATION_TYPE_COLORS[location.type]

  const { deleteMutation, performDelete } = useDeleteLocationOptimistic()
  const handleDelete = (): void => {
    setDeleteOpen(false)
    performDelete(location.id)
  }

  return (
    <>
      <Card
        className="cursor-pointer transition-shadow hover:shadow-md"
        onClick={onClick}
      >
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${typeColor}`}>
              <Icon className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-medium">
                {location.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant={location.is_active ? 'default' : 'secondary'}>
                  {!!location.is_active && (t('form.active') || 'Active')}
                </Badge>
                <span className="text-muted-foreground text-xs">
                  {t(`locations.types.${location.type}`) || location.type}
                </span>
              </CardDescription>
            </div>
          </div>
          <CrudDropdownMenu
            stopPropagation
            onDelete={() => setDeleteOpen(true)}
            onEdit={() => setEditOpen(true)}
          />
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {typeof location.address === 'string' && !!location.address && (
            <div className="text-muted-foreground flex items-center gap-2">
              <MapPin className="size-4" />
              <span className="truncate">{location.address}</span>
            </div>
          )}
          {typeof location.contact_person === 'string' && !!location.contact_person && (
            <div className="text-muted-foreground flex items-center gap-2">
              <User className="size-4" />
              <span>{location.contact_person}</span>
            </div>
          )}
          {typeof location.phone === 'string' && !!location.phone && (
            <div className="text-muted-foreground flex items-center gap-2">
              <Phone className="size-4" />
              <span>{location.phone}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <FormDialog
        cancelLabel={t('form.cancel') || 'Cancel'}
        description={t('locations.editDescription') || 'Update location details.'}
        formId="edit-location-form"
        open={editOpen}
        submitLabel={t('actions.save') || 'Save'}
        title={t('locations.editTitle') || 'Edit Location'}
        onOpenChange={setEditOpen}
      >
        <LocationForm
          formId="edit-location-form"
          location={location}
          onSuccess={() => setEditOpen(false)}
        />
      </FormDialog>

      <DeleteConfirmationDialog
        description={t('locations.deleteDescription') || 'Are you sure you want to delete this location? This action cannot be undone.'}
        isLoading={deleteMutation.isPending}
        open={deleteOpen}
        title={t('locations.deleteTitle') || 'Delete Location'}
        onConfirm={handleDelete}
        onOpenChange={setDeleteOpen}
      />
    </>
  )
}
