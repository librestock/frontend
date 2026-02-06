'use client'
import { useTranslation } from 'react-i18next'
import { isAxiosError } from 'axios'
import type { ErrorResponseDto } from '@librestock/types'

import { CategoryFolderGrid } from '../category/CategoryFolderGrid'
import { Spinner } from '../ui/spinner'
import {
  useListProducts,
  useGetProductsByCategory,
} from '@/lib/data/products'
import type { CategoryWithChildrenResponseDto } from '@/lib/data/categories'

interface ProductListProps {
  categoryId?: string | null
  subcategories?: CategoryWithChildrenResponseDto[]
  onSelectCategory?: (categoryId: string) => void
}

export function ProductList({
  categoryId,
  subcategories = [],
  onSelectCategory,
}: ProductListProps): React.JSX.Element {
  const { t } = useTranslation()
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
            <div key={product.id} className="rounded-lg border p-4">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-muted-foreground text-sm">{product.sku}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
