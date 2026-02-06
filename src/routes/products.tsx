import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'

import CategorySidebar from '@/components/category/CategorySidebar'
import { CreateProductButton } from '@/components/products/CreateProductButton'
import { ProductList } from '@/components/products/ProductList'
import {
  useListCategories,
  type CategoryWithChildrenResponseDto,
  getListCategoriesQueryOptions,
} from '@/lib/data/categories'

export const Route = createFileRoute('/products')({
  loader: async ({ context: { queryClient } }) => {
    try {
      await queryClient.ensureQueryData(getListCategoriesQueryOptions())
    } catch {
      // Allow client-side to retry if SSR prefetch fails
    }
  },
  component: ProductPage,
})

function findCategoryById(
  categories: CategoryWithChildrenResponseDto[],
  id: string,
): CategoryWithChildrenResponseDto | null {
  for (const category of categories) {
    if (category.id === id) {
      return category
    }
    if (category.children.length > 0) {
      const found = findCategoryById(category.children, id)
      if (found) return found
    }
  }
  return null
}

function ProductPage(): React.JSX.Element {
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<
    string | null
  >(null)

  const { data: categories = [] } = useListCategories()

  const subcategories = React.useMemo(() => {
    if (!selectedCategoryId) {
      return categories
    }
    const selectedCategory = findCategoryById(categories, selectedCategoryId)
    return selectedCategory?.children ?? []
  }, [categories, selectedCategoryId])

  return (
    <div className="flex h-full w-full">
      <CategorySidebar
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />
      <div className="flex-1 overflow-auto p-4">
        <div className="flex justify-end pb-4">
          <CreateProductButton defaultCategoryId={selectedCategoryId} />
        </div>
        <ProductList
          categoryId={selectedCategoryId}
          subcategories={subcategories}
          onSelectCategory={setSelectedCategoryId}
        />
      </div>
    </div>
  )
}
