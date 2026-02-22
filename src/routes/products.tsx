import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { CheckSquare, X } from 'lucide-react'

import CategorySidebar from '@/components/category/CategorySidebar'
import { CreateProductButton } from '@/components/products/CreateProductButton'
import { ProductList } from '@/components/products/ProductList'
import { BulkActionBar } from '@/components/products/BulkActionBar'
import { BulkCsvImportDialog } from '@/components/products/BulkCsvImportDialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  useListCategories,
  type CategoryWithChildrenResponseDto,
  getListCategoriesQueryOptions,
} from '@/lib/data/categories'
import {
  useListProducts,
  useGetProductsByCategory,
} from '@/lib/data/products'

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
  const { t } = useTranslation()
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<
    string | null
  >(null)
  const [selectMode, setSelectMode] = React.useState(false)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
    new Set(),
  )

  const { data: categories = [] } = useListCategories()

  const { data: allProducts } = useListProducts({})
  const { data: categoryProducts } = useGetProductsByCategory(
    selectedCategoryId ?? '',
    { query: { enabled: !!selectedCategoryId } },
  )

  const currentProducts = React.useMemo(() => {
    if (selectedCategoryId) {
      return categoryProducts ?? []
    }
    return allProducts?.data ?? []
  }, [selectedCategoryId, categoryProducts, allProducts])

  const subcategories = React.useMemo(() => {
    if (!selectedCategoryId) {
      return categories
    }
    const selectedCategory = findCategoryById(categories, selectedCategoryId)
    return selectedCategory?.children ?? []
  }, [categories, selectedCategoryId])

  const handleToggleSelect = React.useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleSelectAll = React.useCallback(() => {
    if (!currentProducts.length) return
    const allIds = currentProducts.map((p) => p.id)
    const allSelected = allIds.every((id) => selectedIds.has(id))
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        for (const id of allIds) {
          next.delete(id)
        }
        return next
      })
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        for (const id of allIds) {
          next.add(id)
        }
        return next
      })
    }
  }, [currentProducts, selectedIds])

  const handleClearSelection = React.useCallback(() => {
    setSelectedIds(new Set())
    setSelectMode(false)
  }, [])

  const handleToggleSelectMode = React.useCallback(() => {
    setSelectMode((prev) => {
      if (prev) {
        setSelectedIds(new Set())
      }
      return !prev
    })
  }, [])

  const allSelected =
    currentProducts.length > 0 &&
    currentProducts.every((p) => selectedIds.has(p.id))
  const someSelected =
    currentProducts.some((p) => selectedIds.has(p.id)) && !allSelected

  return (
    <div className="flex h-full w-full">
      <CategorySidebar
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />
      <div className="flex-1 overflow-auto p-4">
        <div className="flex items-center justify-between gap-2 pb-4">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={selectMode ? 'default' : 'outline'}
              onClick={handleToggleSelectMode}
            >
              {selectMode ? (
                <>
                  <X className="size-4" data-icon="inline-start" />
                  {t('bulk.exitSelect') || 'Exit Select'}
                </>
              ) : (
                <>
                  <CheckSquare className="size-4" data-icon="inline-start" />
                  {t('bulk.select') || 'Select'}
                </>
              )}
            </Button>
            {selectMode && currentProducts.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-1.5 text-sm hover:underline"
                  type="button"
                  onClick={handleSelectAll}
                >
                  <Checkbox
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={handleSelectAll}
                  />
                  <span>
                    {allSelected
                      ? (t('bulk.deselectAll') || 'Deselect All')
                      : (t('bulk.selectAll') || 'Select All')}
                  </span>
                </button>
                {selectedIds.size > 0 && (
                  <span className="text-muted-foreground text-sm">
                    {t('bulk.selectedCount', { count: selectedIds.size }) ||
                      `${selectedIds.size} selected`}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <BulkCsvImportDialog />
            <CreateProductButton defaultCategoryId={selectedCategoryId} />
          </div>
        </div>
        <ProductList
          categoryId={selectedCategoryId}
          selectMode={selectMode}
          selectedIds={selectedIds}
          subcategories={subcategories}
          onSelectCategory={setSelectedCategoryId}
          onToggleSelect={handleToggleSelect}
        />
        {selectMode && selectedIds.size > 0 && (
          <div className="h-16" />
        )}
      </div>
      {selectMode && (
        <BulkActionBar
          selectedIds={Array.from(selectedIds)}
          onClearSelection={handleClearSelection}
        />
      )}
    </div>
  )
}
