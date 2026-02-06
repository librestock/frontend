import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import z from 'zod'
import {
  type CategoryWithChildrenResponseDto,
  useCreateCategory,
  getListCategoriesQueryKey,
} from '@/lib/data/categories'

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Name must be longer than 1 character')
    .max(100, 'Name must be shorter than 100 characters'),
  parent_id: z.string().optional(),
  description: z
    .string()
    .max(500, 'Description must be shorter than 500 characters')
    .optional(),
})

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useCategoryForm(
  categories: CategoryWithChildrenResponseDto[] | undefined,
  defaultParentId?: string | null,
  onSuccess?: () => void,
) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const mutation = useCreateCategory({
    mutation: {
      onSuccess: async () => {
        toast.success(
          t('form.categoryCreated') || 'Category created successfully',
        )
        await queryClient.invalidateQueries({
          queryKey: getListCategoriesQueryKey(),
        })
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(t('form.categoryError') || 'Failed to create category')
        console.error('Category creation error:', error)
      },
    },
  })

  // Helper to check if category name + parent combination exists
  const isDuplicateCategory = (name: string, parentId: string): boolean => {
    if (!categories) return false

    const normalizedName = name.trim().toLowerCase()
    const normalizedParentId = parentId === '' ? null : parentId
    const stack: CategoryWithChildrenResponseDto[] = [...categories]

    while (stack.length > 0) {
      const current = stack.pop()
      if (!current) continue

      const currentParentId =
        current.parent_id === null || typeof current.parent_id !== 'string'
          ? null
          : current.parent_id

      if (
        current.name.toLowerCase() === normalizedName &&
        currentParentId === normalizedParentId
      ) {
        return true
      }

      if (current.children.length > 0) {
        stack.push(...current.children)
      }
    }

    return false
  }

  return useForm({
    defaultValues: {
      name: '',
      parent_id: defaultParentId ?? '',
      description: '',
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = formSchema.safeParse(value)
        if (!result.success) {
          return result.error.format()
        }

        // Check for duplicate category
        if (isDuplicateCategory(value.name, value.parent_id || '')) {
          return {
            form:
              t('form.categoryDuplicateError') ||
              'A category with this name already exists under the selected parent',
          }
        }

        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      const payload = {
        name: value.name,
        parent_id:
          value.parent_id && value.parent_id !== '' ? value.parent_id : null,
        description:
          value.description && value.description !== ''
            ? value.description
            : null,
      }

      await mutation.mutateAsync({
        data: payload,
      })
    },
  })
}
