import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import z from 'zod'
import {
  type SupplierResponseDto,
  useCreateSupplier,
  useUpdateSupplier,
  getListSuppliersQueryKey,
} from '@/lib/data/suppliers'

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(200, 'Name must be shorter than 200 characters'),
  contact_person: z
    .string()
    .max(200, 'Contact person must be shorter than 200 characters')
    .optional(),
  email: z.union([z.string().email('Invalid email address'), z.literal('')]).optional(),
  phone: z
    .string()
    .max(50, 'Phone must be shorter than 50 characters')
    .optional(),
  address: z.string().optional(),
  website: z
    .union([z.string().url('Invalid URL'), z.literal('')])
    .optional(),
  notes: z.string().optional(),
  is_active: z.boolean(),
})

interface UseSupplierFormOptions {
  supplier?: SupplierResponseDto
  onSuccess?: () => void
}

function toOptionalString(value: string): string | undefined {
  return value === '' ? undefined : value
}

export function useSupplierForm(
  { supplier, onSuccess }: UseSupplierFormOptions = {},
): ReturnType<typeof useForm> {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const createMutation = useCreateSupplier({
    mutation: {
      onSuccess: async () => {
        toast.success(t('suppliers.created', { defaultValue: 'Supplier created successfully' }))
        await queryClient.invalidateQueries({
          queryKey: getListSuppliersQueryKey(),
        })
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(t('suppliers.createError', { defaultValue: 'Failed to create supplier' }))
        console.error('Supplier creation error:', error)
      },
    },
  })

  const updateMutation = useUpdateSupplier({
    mutation: {
      onSuccess: async () => {
        toast.success(t('suppliers.updated', { defaultValue: 'Supplier updated successfully' }))
        await queryClient.invalidateQueries({
          queryKey: getListSuppliersQueryKey(),
        })
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(t('suppliers.updateError', { defaultValue: 'Failed to update supplier' }))
        console.error('Supplier update error:', error)
      },
    },
  })

  return useForm({
    defaultValues: {
      name: supplier?.name ?? '',
      contact_person: supplier?.contact_person ?? '',
      email: supplier?.email ?? '',
      phone: supplier?.phone ?? '',
      address: supplier?.address ?? '',
      website: supplier?.website ?? '',
      notes: supplier?.notes ?? '',
      is_active: supplier?.is_active ?? true,
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
        contact_person: toOptionalString(value.contact_person),
        email: toOptionalString(value.email),
        phone: toOptionalString(value.phone),
        address: toOptionalString(value.address),
        website: toOptionalString(value.website),
        notes: toOptionalString(value.notes),
        is_active: value.is_active,
      }

      await (supplier
        ? updateMutation.mutateAsync({
            id: supplier.id,
            data: payload,
          })
        : createMutation.mutateAsync({
            data: payload,
          }))
    },
  })
}
