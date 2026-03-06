import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Pencil,
  Trash2,
  type LucideIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FormDialog } from '@/components/common/FormDialog'
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog'
import { LocationForm } from '@/components/locations/LocationForm'
import { AreaTree } from '@/components/areas/AreaTree'
import { Spinner } from '@/components/ui/spinner'
import {
  useGetLocation,
  useDeleteLocation,
  getListLocationsQueryKey,
  getListAllLocationsQueryKey,
  getGetLocationQueryOptions,
  type PaginatedLocationsResponseDto,
  type LocationResponseDto,
} from '@/lib/data/locations'
import {
  removeItemFromArray,
  removeItemFromPaginated,
  restoreQueryData,
  snapshotQueryData,
} from '@/lib/data/query-cache'
import {
  LOCATION_TYPE_ICONS,
  LOCATION_TYPE_COLORS,
} from '@/lib/location-type.utils'

export const Route = createFileRoute('/locations/$id')({
  loader: async ({ context: { queryClient }, params }) => {
    await queryClient.ensureQueryData(getGetLocationQueryOptions(params.id))
  },
  component: LocationDetailPage,
})

const LOCATIONS_ROUTE = '/locations'
const NAV_LOCATIONS_KEY = 'navigation.locations'

interface DetailFieldProps {
  icon: LucideIcon
  label: string
  value: string
}

function DetailField({ icon: Icon, label, value }: DetailFieldProps): React.JSX.Element {
  return (
    <div className="flex items-start gap-2">
      <Icon className="size-4 text-muted-foreground mt-0.5" />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  )
}

interface LocationDetailsCardProps {
  location: LocationResponseDto
}

function LocationDetailsCard({ location }: LocationDetailsCardProps): React.JSX.Element {
  const { t } = useTranslation()
  const hasDetails = location.address || location.contact_person || location.phone

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {t(NAV_LOCATIONS_KEY) || 'Location Details'}
        </CardTitle>
        <CardDescription>
          {t('locations.subtitle') || 'Contact and address information'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {location.address && (
          <DetailField
            icon={MapPin}
            label={t('locations.address') || 'Address'}
            value={String(location.address)}
          />
        )}
        {location.contact_person && (
          <DetailField
            icon={User}
            label={t('locations.contactPerson') || 'Contact Person'}
            value={String(location.contact_person)}
          />
        )}
        {location.phone && (
          <DetailField
            icon={Phone}
            label={t('locations.phone') || 'Phone'}
            value={String(location.phone)}
          />
        )}
        {!hasDetails && (
          <p className="text-sm text-muted-foreground col-span-full">
            No additional details provided.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

interface LocationHeaderProps {
  location: LocationResponseDto
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
}

function LocationHeader({
  location,
  onBack,
  onEdit,
  onDelete,
}: LocationHeaderProps): React.JSX.Element {
  const { t } = useTranslation()
  const Icon = LOCATION_TYPE_ICONS[location.type]
  const typeColor = LOCATION_TYPE_COLORS[location.type]

  return (
    <div className="border-b px-6 py-4">
      <Button className="mb-4" size="sm" variant="ghost" onClick={onBack}>
        <ArrowLeft className="mr-2 size-4" />
        {t(NAV_LOCATIONS_KEY) || 'Back to Locations'}
      </Button>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`rounded-lg p-3 ${typeColor}`}>
            <Icon className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{location.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={location.is_active ? 'default' : 'secondary'}>
                {location.is_active ? (t('form.active') || 'Active') : (t('form.inactive') || 'Inactive')}
              </Badge>
              <span className="text-muted-foreground text-sm">
                {t(`locations.types.${location.type}`) || location.type}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Pencil className="mr-2 size-4" />
            {t('actions.edit') || 'Edit'}
          </Button>
          <Button
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            variant="outline"
            onClick={onDelete}
          >
            <Trash2 className="mr-2 size-4" />
            {t('actions.delete') || 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function LocationDetailPage(): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id: locationId } = Route.useParams()
  const queryClient = useQueryClient()

  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const { data: location, isLoading, error } = useGetLocation(locationId, {
    query: { enabled: !!locationId },
  })

  const deleteMutation = useDeleteLocation({
    mutation: {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getListLocationsQueryKey() }),
          queryClient.invalidateQueries({ queryKey: getListAllLocationsQueryKey() }),
        ])
      },
      onError: (err) => {
        toast.error(t('locations.deleteError') || 'Failed to delete location')
        console.error('Location deletion error:', err)
      },
    },
  })

  const handleDelete = (): void => {
    const listQueryKey = getListLocationsQueryKey()
    const listAllKey = getListAllLocationsQueryKey()
    const snapshot = snapshotQueryData<PaginatedLocationsResponseDto>(
      queryClient,
      listQueryKey,
    )
    const allSnapshot = snapshotQueryData<LocationResponseDto[]>(
      queryClient,
      listAllKey,
    )
    queryClient.setQueriesData<PaginatedLocationsResponseDto>(
      { queryKey: listQueryKey },
      (old) => removeItemFromPaginated(old, locationId),
    )
    queryClient.setQueriesData<LocationResponseDto[]>(
      { queryKey: listAllKey },
      (old) => removeItemFromArray(old, locationId),
    )
    setDeleteOpen(false)

    let didUndo = false
    const timeoutId = window.setTimeout(() => {
      if (didUndo) {
        return
      }
      deleteMutation.mutateAsync({ id: locationId }).catch(() => {
        restoreQueryData(queryClient, snapshot)
        restoreQueryData(queryClient, allSnapshot)
      })
    }, 5000)

    toast(t('locations.deleted') || 'Location deleted successfully', {
      action: {
        label: t('actions.undo') || 'Undo',
        onClick: () => {
          didUndo = true
          window.clearTimeout(timeoutId)
          restoreQueryData(queryClient, snapshot)
          restoreQueryData(queryClient, allSnapshot)
        },
      },
    })

    void navigate({ to: LOCATIONS_ROUTE })
  }

  const handleBack = (): void => {
    void navigate({ to: LOCATIONS_ROUTE })
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (error || !location) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-destructive">
          {t('locations.errorLoading') || 'Error loading location'}
        </p>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 size-4" />
          {t(NAV_LOCATIONS_KEY) || 'Back to Locations'}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col">
      <LocationHeader
        location={location}
        onBack={handleBack}
        onDelete={() => setDeleteOpen(true)}
        onEdit={() => setEditOpen(true)}
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <LocationDetailsCard location={location} />
        <AreaTree locationId={locationId} />
      </div>

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
    </div>
  )
}
