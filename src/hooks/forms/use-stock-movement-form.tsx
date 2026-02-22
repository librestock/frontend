import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import z from 'zod'
import { StockMovementReason } from '@librestock/types'
import {
  useCreateStockMovement,
  getListStockMovementsQueryKey,
} from '@/lib/data/stock-movements'

const formSchema = z.object({
  product_id: z.string().uuid('Please select a product'),
  from_location_id: z.string().optional(),
  to_location_id: z.string().optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  reason: z.nativeEnum(StockMovementReason, {
    message: 'Please select a reason',
  }),
  order_id: z.string().optional(),
  reference_number: z.string().max(100).optional(),
  cost_per_unit: z.number().min(0).optional(),
  notes: z.string().max(1000).optional(),
})

interface UseStockMovementFormOptions {
  onSuccess?: () => void
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useStockMovementForm({
  onSuccess,
}: UseStockMovementFormOptions = {}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const createMutation = useCreateStockMovement({
    mutation: {
      onSuccess: async () => {
        toast.success(t('stockMovements.created') || 'Stock movement created successfully')
        await queryClient.invalidateQueries({
          queryKey: getListStockMovementsQueryKey(),
        })
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(t('stockMovements.createError') || 'Failed to create stock movement')
        console.error('Stock movement creation error:', error)
      },
    },
  })

  return useForm({
    defaultValues: {
      product_id: '',
      from_location_id: '',
      to_location_id: '',
      quantity: 1,
      reason: '' as StockMovementReason,
      order_id: '',
      reference_number: '',
      cost_per_unit: undefined as number | undefined,
      notes: '',
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
        from_location_id: value.from_location_id || undefined,
        to_location_id: value.to_location_id || undefined,
        quantity: value.quantity,
        reason: value.reason,
        order_id: value.order_id || undefined,
        reference_number: value.reference_number || undefined,
        cost_per_unit: value.cost_per_unit,
        notes: value.notes || undefined,
      }

      await createMutation.mutateAsync({
        data: payload as Parameters<typeof createMutation.mutateAsync>[0]['data'],
      })
    },
  })
}
