import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import z from 'zod'
import { isValidCategoryId } from '@/lib/utils'
import {
  getGetProductsByCategoryQueryKey,
  getGetProductQueryKey,
  getListProductsQueryKey,
  useCreateProduct,
  useUpdateProduct,
  type ProductResponseDto,
} from '@/lib/data/products'
import {
  useUploadProductPhoto,
  getListProductPhotosQueryKey,
} from '@/lib/data/photos'
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

interface UseProductFormOptions {
  product?: ProductResponseDto
  categories?: CategoryWithChildrenResponseDto[]
  defaultCategoryId?: string
  pendingFile?: File | null
  onSuccess?: () => void
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useProductForm({
  product,
  categories,
  defaultCategoryId,
  pendingFile,
  onSuccess,
}: UseProductFormOptions) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const uploadMutation = useUploadProductPhoto()

  const createMutation = useCreateProduct({
    mutation: {
      onSuccess: async (data, variables) => {
        toast.success(t('form.productCreated') || 'Product created successfully')

        // Upload pending photo for the newly created product
        if (pendingFile) {
          try {
            await uploadMutation.mutateAsync({
              productId: data.id,
              file: pendingFile,
            })
            toast.success(t('form.photoUploaded') || 'Photo uploaded')
          } catch {
            toast.error(t('form.uploadError') || 'Failed to upload image')
          }
        }

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }),
          queryClient.invalidateQueries({ queryKey: getGetProductsByCategoryQueryKey(variables.data.category_id) }),
          queryClient.invalidateQueries({ queryKey: getListProductPhotosQueryKey(data.id) }),
        ])
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(t('form.productError') || 'Failed to create product')
        console.error('Product creation error:', error)
      },
    },
  })

  const updateMutation = useUpdateProduct({
    mutation: {
      onSuccess: async (_data, variables) => {
        toast.success(t('products.updated') || 'Product updated successfully')
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }),
          queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(variables.id) }),
          queryClient.invalidateQueries({ queryKey: getGetProductsByCategoryQueryKey(variables.data.category_id ?? '') }),
        ])
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(t('products.updateError') || 'Failed to update product')
        console.error('Product update error:', error)
      },
    },
  })

  return useForm({
    defaultValues: {
      sku: product?.sku ?? '',
      name: product?.name ?? '',
      category_id: product?.category_id ?? defaultCategoryId ?? '',
      reorder_point: String(product?.reorder_point ?? 0),
      is_active: product?.is_active ?? true,
      is_perishable: product?.is_perishable ?? false,
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

      await (product
        ? updateMutation.mutateAsync({
            id: product.id,
            data: payload,
          })
        : createMutation.mutateAsync({
            data: payload,
          }))
    },
  })
}
