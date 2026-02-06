import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import z from 'zod'
import {
  type AreaResponseDto,
  useAreasControllerCreate,
  useAreasControllerUpdate,
  getAreasControllerFindAllQueryKey,
} from '@/lib/data/areas'

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be shorter than 100 characters'),
  code: z
    .string()
    .max(50, 'Code must be shorter than 50 characters')
    .optional(),
  description: z.string().optional(),
  parent_id: z.string().optional(),
  is_active: z.boolean(),
})

// Helper to extract string from nullable field
const getStringFromNullable = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback

interface UseAreaFormOptions {
  locationId: string
  area?: AreaResponseDto
  parentId?: string
  onSuccess?: () => void
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useAreaForm({
  locationId,
  area,
  parentId,
  onSuccess,
}: UseAreaFormOptions) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const createMutation = useAreasControllerCreate({
    mutation: {
      onSuccess: async () => {
        toast.success(t('areas.created') || 'Area created successfully')
        await queryClient.invalidateQueries({
          queryKey: getAreasControllerFindAllQueryKey({ location_id: locationId }),
        })
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(t('areas.createError') || 'Failed to create area')
        console.error('Area creation error:', error)
      },
    },
  })

  const updateMutation = useAreasControllerUpdate({
    mutation: {
      onSuccess: async () => {
        toast.success(t('areas.updated') || 'Area updated successfully')
        await queryClient.invalidateQueries({
          queryKey: getAreasControllerFindAllQueryKey({ location_id: locationId }),
        })
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(t('areas.updateError') || 'Failed to update area')
        console.error('Area update error:', error)
      },
    },
  })

  return useForm({
    defaultValues: {
      name: area?.name ?? '',
      code: area?.code ?? '',
      description: area?.description ?? '',
      parent_id: getStringFromNullable(area?.parent_id, parentId ?? ''),
      is_active: area?.is_active ?? true,
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
      await (area ? updateMutation.mutateAsync({
          id: area.id,
          data: {
            name: value.name,
            code: value.code || undefined,
            description: value.description || undefined,
            parent_id: value.parent_id || undefined,
            is_active: value.is_active,
          } as Parameters<typeof updateMutation.mutateAsync>[0]['data'],
        }) : createMutation.mutateAsync({
          data: {
            location_id: locationId,
            name: value.name,
            code: value.code || undefined,
            description: value.description || undefined,
            parent_id: value.parent_id || undefined,
            is_active: value.is_active,
          },
        }));
    },
  })
}
