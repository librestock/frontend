import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import z from 'zod'
import { isValidCategoryId } from '@/lib/utils'
import {
  getGetProductsByCategoryQueryKey,
  getListProductsQueryKey,
  useCreateProduct,
} from '@/lib/data/products'
import type { CategoryWithChildrenResponseDto } from '@/lib/data/categories'

const formSchema = z.object({
  sku: z
    .string()
    .min(1, 'SKU must be longer than 1 character')
    .max(50, 'SKU must be shorter than 50 characters'),
  name: z
    .string()
    .min(1, 'Name must be longer than 1 character')
    .max(200, 'Name must be shorter than 200 characters'),
  category_id: z.string().min(1, 'Category is required'),
  reorder_point: z
    .string()
    .min(1, 'Reorder point is required')
    .refine(
      (value) => {
        const parsed = Number(value)
        return Number.isFinite(parsed) && parsed >= 0
      },
      { message: 'Reorder point must be a number >= 0' },
    ),
  is_active: z.boolean(),
  is_perishable: z.boolean(),
})

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useProductForm(
  categories: CategoryWithChildrenResponseDto[] | undefined,
  defaultCategoryId: string | undefined,
  onSuccess?: () => void,
) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const mutation = useCreateProduct({
    mutation: {
      onSuccess: async (_data, variables) => {
        toast.success(
          t('form.productCreated') || 'Product created successfully',
        )
        await queryClient.invalidateQueries({
          queryKey: getListProductsQueryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: getGetProductsByCategoryQueryKey(
            variables.data.category_id,
          ),
        })
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(t('form.productError') || 'Failed to create product')
        console.error('Product creation error:', error)
      },
    },
  })

  return useForm({
    defaultValues: {
      sku: '',
      name: '',
      category_id: defaultCategoryId ?? '',
      reorder_point: '0',
      is_active: true,
      is_perishable: false,
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = formSchema.safeParse(value)
        if (!result.success) {
          return result.error.format()
        }

        if (categories) {
          if (!isValidCategoryId(categories, value.category_id)) {
            return {
              category_id: t('form.invalidCategory') || 'Invalid category',
            }
          }
        }

        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      const payload = {
        sku: value.sku.trim(),
        name: value.name.trim(),
        category_id: value.category_id,
        reorder_point: Number(value.reorder_point),
        is_active: value.is_active,
        is_perishable: value.is_perishable,
      }

      await mutation.mutateAsync({ data: payload })
    },
  })
}
