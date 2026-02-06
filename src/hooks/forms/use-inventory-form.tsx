import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import z from 'zod'
import {
  type InventoryResponseDto,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  getListInventoryQueryKey,
} from '@/lib/data/inventory'

const formSchema = z.object({
  product_id: z.string().uuid('Please select a product'),
  location_id: z.string().uuid('Please select a location'),
  area_id: z.string().optional(),
  quantity: z.number().int().min(0, 'Quantity must be 0 or greater'),
  batchNumber: z.string().max(100).optional(),
  expiry_date: z.string().optional(),
  cost_per_unit: z.number().min(0).optional(),
  received_date: z.string().optional(),
})

// Helper for nullable date fields (still nullable in schema)
const getDateStr = (date: unknown): string => {
  if (typeof date === 'string') {
    return date.split('T')[0]
  }
  return ''
}

// Helper to extract string from nullable field
const getStringFromNullable = (value: unknown): string =>
  typeof value === 'string' ? value : ''

interface UseInventoryFormOptions {
  inventory?: InventoryResponseDto
  onSuccess?: () => void
  defaultLocationId?: string
  defaultAreaId?: string
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useInventoryForm({
  inventory,
  onSuccess,
  defaultLocationId,
  defaultAreaId,
}: UseInventoryFormOptions = {}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const createMutation = useCreateInventoryItem({
    mutation: {
      onSuccess: async () => {
        toast.success(t('inventory.created') || 'Inventory added successfully')
        await queryClient.invalidateQueries({
          queryKey: getListInventoryQueryKey(),
        })
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(t('inventory.createError') || 'Failed to add inventory')
        console.error('Inventory creation error:', error)
      },
    },
  })

  const updateMutation = useUpdateInventoryItem({
    mutation: {
      onSuccess: async () => {
        toast.success(t('inventory.updated') || 'Inventory updated successfully')
        await queryClient.invalidateQueries({
          queryKey: getListInventoryQueryKey(),
        })
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(t('inventory.updateError') || 'Failed to update inventory')
        console.error('Inventory update error:', error)
      },
    },
  })

  return useForm({
    defaultValues: {
      product_id: inventory?.product_id ?? '',
      location_id: inventory?.location_id ?? defaultLocationId ?? '',
      area_id: getStringFromNullable(inventory?.area_id) || (defaultAreaId ?? ''),
      quantity: inventory?.quantity ?? 0,
      batchNumber: inventory?.batchNumber ?? '',
      expiry_date: getDateStr(inventory?.expiry_date),
      cost_per_unit: inventory?.cost_per_unit ? Number(inventory.cost_per_unit) : undefined,
      received_date: getDateStr(inventory?.received_date),
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
        product_id: value.product_id,
        location_id: value.location_id,
        area_id: value.area_id || undefined,
        quantity: value.quantity,
        batchNumber: value.batchNumber || undefined,
        expiry_date: value.expiry_date || undefined,
        cost_per_unit: value.cost_per_unit,
        received_date: value.received_date || undefined,
      }

      await (inventory ? updateMutation.mutateAsync({
          id: inventory.id,
          data: payload as Parameters<typeof updateMutation.mutateAsync>[0]['data'],
        }) : createMutation.mutateAsync({
          data: payload as Parameters<typeof createMutation.mutateAsync>[0]['data'],
        }));
    },
  })
}
