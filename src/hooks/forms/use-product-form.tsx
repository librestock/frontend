import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { CreateProductSchema, UpdateProductSchema } from '@librestock/types/products'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
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

interface ProductFormValues {
  sku: string
  name: string
  category_id: string
  reorder_point: string
  is_active: boolean
  is_perishable: boolean
}

function toProductPayload(value: ProductFormValues) {
  return {
    sku: value.sku.trim(),
    name: value.name.trim(),
    category_id: value.category_id,
    reorder_point: Number(value.reorder_point),
    is_active: value.is_active,
    is_perishable: value.is_perishable,
  }
}

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
        toast.success(t('form.productCreated', { defaultValue: 'Product created successfully' }))

        // Upload pending photo for the newly created product
        if (pendingFile) {
          try {
            await uploadMutation.mutateAsync({
              productId: data.id,
              file: pendingFile,
            })
            toast.success(t('form.photoUploaded', { defaultValue: 'Photo uploaded' }))
          } catch {
            toast.error(t('form.uploadError', { defaultValue: 'Failed to upload image' }))
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
        toast.error(t('form.productError', { defaultValue: 'Failed to create product' }))
        console.error('Product creation error:', error)
      },
    },
  })

  const updateMutation = useUpdateProduct({
    mutation: {
      onSuccess: async (_data, variables) => {
        toast.success(t('products.updated', { defaultValue: 'Product updated successfully' }))
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }),
          queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(variables.id) }),
          queryClient.invalidateQueries({ queryKey: getGetProductsByCategoryQueryKey(variables.data.category_id ?? '') }),
        ])
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(t('products.updateError', { defaultValue: 'Failed to update product' }))
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
        const payload = toProductPayload(value)
        if (!Number.isFinite(payload.reorder_point) || payload.reorder_point < 0) {
          return {
            reorder_point: 'Reorder point must be a number >= 0',
          }
        }

        const schema = product ? UpdateProductSchema : CreateProductSchema
        const result = schema.safeParse(payload)
        if (!result.success) {
          return result.error.format()
        }

        if (categories) {
          if (!isValidCategoryId(categories, payload.category_id)) {
            return {
              category_id: t('form.invalidCategory', { defaultValue: 'Invalid category' }),
            }
          }
        }

        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      const payload = toProductPayload(value)

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
