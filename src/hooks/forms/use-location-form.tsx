import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import z from 'zod'
import {
  type LocationResponseDto,
  useCreateLocation,
  useUpdateLocation,
  getListLocationsQueryKey,
  getListAllLocationsQueryKey,
  LocationType,
} from '@/lib/data/locations'

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(200, 'Name must be shorter than 200 characters'),
  type: z.enum(['WAREHOUSE', 'SUPPLIER', 'IN_TRANSIT', 'CLIENT']),
  address: z.string().optional(),
  contact_person: z
    .string()
    .max(200, 'Contact person must be shorter than 200 characters')
    .optional(),
  phone: z
    .string()
    .max(50, 'Phone must be shorter than 50 characters')
    .optional(),
  is_active: z.boolean(),
})

interface UseLocationFormOptions {
  location?: LocationResponseDto
  onSuccess?: () => void
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useLocationForm({ location, onSuccess }: UseLocationFormOptions = {}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const createMutation = useCreateLocation({
    mutation: {
      onSuccess: async () => {
        toast.success(t('locations.created') || 'Location created successfully')
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: getListLocationsQueryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: getListAllLocationsQueryKey(),
          }),
        ])
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(t('locations.createError') || 'Failed to create location')
        console.error('Location creation error:', error)
      },
    },
  })

  const updateMutation = useUpdateLocation({
    mutation: {
      onSuccess: async () => {
        toast.success(t('locations.updated') || 'Location updated successfully')
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: getListLocationsQueryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: getListAllLocationsQueryKey(),
          }),
        ])
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(t('locations.updateError') || 'Failed to update location')
        console.error('Location update error:', error)
      },
    },
  })

  return useForm({
    defaultValues: {
      name: location?.name ?? '',
      type: location?.type ?? LocationType.WAREHOUSE,
      address: location?.address ?? '',
      contact_person: location?.contact_person ?? '',
      phone: location?.phone ?? '',
      is_active: location?.is_active ?? true,
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = formSchema.safeParse(value)
        if (!result.success) {
          return result.error.format()
        }
        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      const payload = {
        name: value.name,
        type: value.type,
        address: value.address || undefined,
        contact_person: value.contact_person || undefined,
        phone: value.phone || undefined,
        is_active: value.is_active,
      }

      await (location ? updateMutation.mutateAsync({
          id: location.id,
          data: payload,
        }) : createMutation.mutateAsync({
          data: payload,
        }));
    },
  })
}
