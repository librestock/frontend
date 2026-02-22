import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import z from 'zod'
import {
  type ClientResponseDto,
  ClientStatus,
  useCreateClient,
  useUpdateClient,
  getListClientsQueryKey,
} from '@/lib/data/clients'

const formSchema = z.object({
  company_name: z
    .string()
    .min(1, 'Company name is required')
    .max(200, 'Company name must be shorter than 200 characters'),
  contact_person: z
    .string()
    .min(1, 'Contact person is required')
    .max(200, 'Contact person must be shorter than 200 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  yacht_name: z
    .string()
    .max(200, 'Yacht name must be shorter than 200 characters')
    .optional(),
  phone: z
    .string()
    .max(50, 'Phone must be shorter than 50 characters')
    .optional(),
  billing_address: z.string().optional(),
  default_delivery_address: z.string().optional(),
  account_status: z.nativeEnum(ClientStatus),
  payment_terms: z
    .string()
    .max(200, 'Payment terms must be shorter than 200 characters')
    .optional(),
  credit_limit: z.number().min(0, 'Credit limit must be 0 or greater').optional(),
  notes: z.string().optional(),
})

interface UseClientFormOptions {
  client?: ClientResponseDto
  onSuccess?: () => void
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useClientForm({ client, onSuccess }: UseClientFormOptions = {}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const createMutation = useCreateClient({
    mutation: {
      onSuccess: async () => {
        toast.success(t('clients.created') || 'Client created successfully')
        await queryClient.invalidateQueries({
          queryKey: getListClientsQueryKey(),
        })
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(t('clients.createError') || 'Failed to create client')
        console.error('Client creation error:', error)
      },
    },
  })

  const updateMutation = useUpdateClient({
    mutation: {
      onSuccess: async () => {
        toast.success(t('clients.updated') || 'Client updated successfully')
        await queryClient.invalidateQueries({
          queryKey: getListClientsQueryKey(),
        })
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(t('clients.updateError') || 'Failed to update client')
        console.error('Client update error:', error)
      },
    },
  })

  return useForm({
    defaultValues: {
      company_name: client?.company_name ?? '',
      contact_person: client?.contact_person ?? '',
      email: client?.email ?? '',
      yacht_name: client?.yacht_name ?? '',
      phone: client?.phone ?? '',
      billing_address: client?.billing_address ?? '',
      default_delivery_address: client?.default_delivery_address ?? '',
      account_status: client?.account_status ?? ClientStatus.ACTIVE,
      payment_terms: client?.payment_terms ?? '',
      credit_limit: client?.credit_limit ?? undefined,
      notes: client?.notes ?? '',
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
        company_name: value.company_name,
        contact_person: value.contact_person,
        email: value.email,
        yacht_name: value.yacht_name || undefined,
        phone: value.phone || undefined,
        billing_address: value.billing_address || undefined,
        default_delivery_address: value.default_delivery_address || undefined,
        account_status: value.account_status,
        payment_terms: value.payment_terms || undefined,
        credit_limit: value.credit_limit,
        notes: value.notes || undefined,
      }

      await (client
        ? updateMutation.mutateAsync({
            id: client.id,
            data: payload,
          })
        : createMutation.mutateAsync({
            data: payload,
          }))
    },
  })
}
