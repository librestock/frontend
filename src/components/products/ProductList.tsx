'use client'
import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import type { ErrorResponseDto } from '@librestock/types'

import { CategoryFolderGrid } from '../category/CategoryFolderGrid'
import { ProductForm } from './ProductForm'
import { ProductThumbnail } from './ProductThumbnail'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { CrudDropdownMenu } from '@/components/common/CrudDropdownMenu'
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog'
import { FormDialog } from '@/components/common/FormDialog'
import {
  useListProducts,
  useGetProductsByCategory,
  useDeleteProduct,
  getListProductsQueryKey,
  getGetProductsByCategoryQueryKey,
  type ProductResponseDto,
  type PaginatedProductsResponseDto,
} from '@/lib/data/products'
import { useListCategories } from '@/lib/data/categories'
import type { CategoryWithChildrenResponseDto } from '@/lib/data/categories'
import {
  removeItemFromPaginated,
  removeItemFromArray,
  restoreQueryData,
  snapshotQueryData,
} from '@/lib/data/query-cache'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface ProductListProps {
  categoryId?: string | null
  subcategories?: CategoryWithChildrenResponseDto[]
  onSelectCategory?: (categoryId: string) => void
  selectMode?: boolean
  selectedIds?: Set<string>
  onToggleSelect?: (id: string) => void
}

interface ProductCardProps {
  product: ProductResponseDto
  onClick: () => void
  selectMode?: boolean
  isSelected?: boolean
  onToggleSelect?: () => void
}

function ProductCard({ product, onClick, selectMode, isSelected, onToggleSelect }: ProductCardProps): React.JSX.Element {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useListCategories({
    query: { enabled: editOpen },
  })

  const deleteMutation = useDeleteProduct({
    mutation: {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: getListProductsQueryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: getGetProductsByCategoryQueryKey(product.category_id),
          }),
        ])
      },
      onError: (error) => {
        toast.error(t('products.deleteError') || 'Failed to delete product')
        console.error('Product deletion error:', error)
      },
    },
  })

  const handleDelete = (): void => {
    const listQueryKey = getListProductsQueryKey()
    const categoryQueryKey = getGetProductsByCategoryQueryKey(product.category_id)

    const listSnapshot = snapshotQueryData<PaginatedProductsResponseDto>(
      queryClient,
      listQueryKey,
    )
    const categorySnapshot = snapshotQueryData<ProductResponseDto[]>(
      queryClient,
      categoryQueryKey,
    )

    queryClient.setQueriesData<PaginatedProductsResponseDto>(
      { queryKey: listQueryKey },
      (old) => removeItemFromPaginated(old, product.id),
    )
    queryClient.setQueriesData<ProductResponseDto[]>(
      { queryKey: categoryQueryKey },
      (old) => removeItemFromArray(old, product.id),
    )

    setDeleteOpen(false)

    let didUndo = false
    const timeoutId = window.setTimeout(() => {
      if (didUndo) {
        return
      }
      deleteMutation.mutateAsync({ id: product.id }).catch(() => {
        restoreQueryData(queryClient, listSnapshot)
        restoreQueryData(queryClient, categorySnapshot)
      })
    }, 5000)

    toast(t('products.deleted') || 'Product deleted successfully', {
      action: {
        label: t('actions.undo') || 'Undo',
        onClick: () => {
          didUndo = true
          window.clearTimeout(timeoutId)
          restoreQueryData(queryClient, listSnapshot)
          restoreQueryData(queryClient, categorySnapshot)
        },
      },
    })
  }

  const formId = `edit-product-form-${product.id}`

  const handleCardClick = (): void => {
    if (selectMode === true && onToggleSelect) {
      onToggleSelect()
    } else {
      onClick()
    }
  }

  const handleCardKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleCardClick()
    }
  }

  return (
    <>
      <div
        className={cn(
          'group cursor-pointer rounded-lg border p-4 transition-colors hover:bg-accent/50',
          selectMode === true && isSelected === true && 'border-primary bg-primary/5',
        )}
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
      >
        <div className="flex items-start justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            {selectMode === true && (
              <Checkbox
                checked={isSelected === true}
                className="mt-1 shrink-0"
                onClick={(e) => e.stopPropagation()}
                onCheckedChange={() => onToggleSelect?.()}
              />
            )}
            <div className="bg-muted size-10 shrink-0 overflow-hidden rounded-md border">
              <ProductThumbnail alt={product.name} productId={product.id} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-muted-foreground text-sm">{product.sku}</p>
            </div>
          </div>
          <div className="ml-2 flex shrink-0 items-center gap-2">
            <Badge variant={product.is_active ? 'default' : 'secondary'}>
              {product.is_active
                ? (t('form.active') || 'Active')
                : (t('form.inactive') || 'Inactive')}
            </Badge>
            {selectMode !== true && (
              <CrudDropdownMenu
                stopPropagation
                onDelete={() => setDeleteOpen(true)}
                onEdit={() => setEditOpen(true)}
              />
            )}
          </div>
        </div>
        <div className={cn(
          'mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground',
          selectMode === true && 'ml-7',
        )}>
          {product.category?.name && (
            <span>{product.category.name}</span>
          )}
          <span
            className={cn(
              'tabular-nums',
              product.reorder_point > 0 && 'font-medium',
            )}
          >
            {t('form.reorderPoint') || 'Reorder Point'}: {product.reorder_point}
          </span>
          {product.is_perishable && (
            <Badge className="text-xs" variant="outline">
              {t('form.perishable') || 'Perishable'}
            </Badge>
          )}
        </div>
      </div>

      <FormDialog
        cancelLabel={t('form.cancel') || 'Cancel'}
        contentClassName="sm:max-w-[900px]"
        description={t('products.editDescription') || 'Update product details.'}
        formId={formId}
        open={editOpen}
        submitLabel={t('actions.save') || 'Save'}
        title={t('products.editTitle') || 'Edit Product'}
        onOpenChange={setEditOpen}
      >
        {categoriesLoading === true && (
          <div className="flex justify-center py-6">
            <Spinner className="size-6" />
          </div>
        )}

        {categoriesError != null && (
          <p className="text-destructive text-sm">
            {t('form.loadCategoriesError') || 'Failed to load categories'}
          </p>
        )}

        {categoriesLoading !== true && categoriesError == null && (
          <ProductForm
            categories={categories}
            formId={formId}
            product={product}
            onSuccess={() => setEditOpen(false)}
          />
        )}
      </FormDialog>

      <DeleteConfirmationDialog
        isLoading={deleteMutation.isPending}
        open={deleteOpen}
        title={t('products.deleteTitle') || 'Delete Product'}
        description={
          t('products.deleteDescription') ||
          'Are you sure you want to delete this product? This action cannot be undone.'
        }
        onConfirm={handleDelete}
        onOpenChange={setDeleteOpen}
      />
    </>
  )
}

export function ProductList({
  categoryId,
  subcategories = [],
  onSelectCategory,
  selectMode,
  selectedIds,
  onToggleSelect,
}: ProductListProps): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    data: allProducts,
    isLoading: isLoadingAll,
    error: errorAll,
  } = useListProducts({})

  const {
    data: categoryProducts,
    isLoading: isLoadingCategory,
    error: errorCategory,
  } = useGetProductsByCategory(categoryId ?? '', {
    query: { enabled: !!categoryId },
  })

  const products =
    categoryId !== null && categoryId !== undefined
      ? categoryProducts
      : allProducts?.data
  const isLoading =
    categoryId !== null && categoryId !== undefined
      ? isLoadingCategory
      : isLoadingAll
  const error =
    categoryId !== null && categoryId !== undefined ? errorCategory : errorAll
  const errorMessage = (() => {
    if (isAxiosError(error)) {
      const data = error.response?.data as ErrorResponseDto | undefined
      return data?.error ?? error.message
    }
    if (error instanceof Error) {
      return error.message
    }
    return undefined
  })()

  if (isLoading === true) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (error) {
    return (
      <p className="text-destructive">
        {t('products.errorLoading')}
        {!!errorMessage && ` ${errorMessage}`}
      </p>
    )
  }

  const hasSubcategories = subcategories.length > 0
  const hasProducts = products && products.length > 0
  const isEmpty = !hasSubcategories && !hasProducts

  if (isEmpty) {
    return <p className="text-muted-foreground">{t('products.noProducts')}</p>
  }

  return (
    <div className="grid gap-6">
      {!!hasSubcategories && !!onSelectCategory && (
        <CategoryFolderGrid
          categories={subcategories}
          onSelectCategory={onSelectCategory}
        />
      )}
      {!!hasProducts && (
        <div className="grid gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              isSelected={selectedIds?.has(product.id)}
              product={product}
              selectMode={selectMode}
              onClick={() => {
                void navigate({
                  to: '/products/$id',
                  params: { id: product.id },
                })
              }}
              onToggleSelect={() => onToggleSelect?.(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
