import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import z from 'zod'
import {
  type OrderResponseDto,
  useCreateOrder,
  useUpdateOrder,
  getListOrdersQueryKey,
} from '@/lib/data/orders'

const orderItemSchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Unit price must be 0 or greater'),
  notes: z.string().optional(),
})

const createOrderSchema = z.object({
  client_id: z.string().min(1, 'Client is required'),
  delivery_address: z.string().min(1, 'Delivery address is required'),
  delivery_deadline: z.string().optional(),
  yacht_name: z.string().max(200).optional(),
  special_instructions: z.string().optional(),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
})

const updateOrderSchema = z.object({
  delivery_address: z.string().optional(),
  delivery_deadline: z.string().optional(),
  yacht_name: z.string().max(200).optional(),
  special_instructions: z.string().optional(),
})

interface UseOrderFormOptions {
  order?: OrderResponseDto
  onSuccess?: () => void
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useOrderForm({ order, onSuccess }: UseOrderFormOptions = {}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const isEditing = !!order

  const createMutation = useCreateOrder({
    mutation: {
      onSuccess: async () => {
        toast.success(t('orders.created') || 'Order created successfully')
        await queryClient.invalidateQueries({
          queryKey: getListOrdersQueryKey(),
        })
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(t('orders.createError') || 'Failed to create order')
        console.error('Order creation error:', error)
      },
    },
  })

  const updateMutation = useUpdateOrder({
    mutation: {
      onSuccess: async () => {
        toast.success(t('orders.updated') || 'Order updated successfully')
        await queryClient.invalidateQueries({
          queryKey: getListOrdersQueryKey(),
        })
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(t('orders.updateError') || 'Failed to update order')
        console.error('Order update error:', error)
      },
    },
  })

  return useForm({
    defaultValues: isEditing
      ? {
          client_id: order.client_id,
          delivery_address: order.delivery_address ?? '',
          delivery_deadline: order.delivery_deadline
            ? new Date(order.delivery_deadline).toISOString().split('T')[0]
            : '',
          yacht_name: order.yacht_name ?? '',
          special_instructions: order.special_instructions ?? '',
          items: order.items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            notes: item.notes ?? '',
          })),
        }
      : {
          client_id: '',
          delivery_address: '',
          delivery_deadline: '',
          yacht_name: '',
          special_instructions: '',
          items: [
            {
              product_id: '',
              quantity: 1,
              unit_price: 0,
              notes: '',
            },
          ],
        },
    validators: {
      onSubmit: ({ value }) => {
        const schema = isEditing ? updateOrderSchema : createOrderSchema
        const result = schema.safeParse(value)
        if (!result.success) {
          return result.error.format()
        }
        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: order.id,
          data: {
            delivery_address: value.delivery_address || undefined,
            delivery_deadline: value.delivery_deadline || undefined,
            yacht_name: value.yacht_name || undefined,
            special_instructions: value.special_instructions || undefined,
          },
        })
      } else {
        await createMutation.mutateAsync({
          data: {
            client_id: value.client_id,
            delivery_address: value.delivery_address,
            delivery_deadline: value.delivery_deadline || undefined,
            yacht_name: value.yacht_name || undefined,
            special_instructions: value.special_instructions || undefined,
            items: value.items.map((item) => ({
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              notes: item.notes || undefined,
            })),
          },
        })
      }
    },
  })
}
