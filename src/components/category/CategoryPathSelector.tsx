'use client'

import * as React from 'react'
import { CategorySelector } from './CategorySelector'
import type { CategoryWithChildrenResponseDto } from '@/lib/data/categories'

interface CategoryPathSelectorProps {
  categories: CategoryWithChildrenResponseDto[]
  value?: string
  onValueChange?: (value: string) => void
  emptyOptionLabel?: string
  separator?: string
}

interface SelectableCategory {
  value: string
  label: string
}

function flattenCategoriesWithPath(
  categories: CategoryWithChildrenResponseDto[],
  separator: string,
): SelectableCategory[] {
  const result: SelectableCategory[] = []

  function traverse(
    nodes: CategoryWithChildrenResponseDto[],
    parentPath = '',
  ): void {
    for (const category of nodes) {
      const currentPath = parentPath
        ? `${parentPath}${separator}${category.name}`
        : category.name
      result.push({ value: category.id, label: currentPath })
      if (category.children.length > 0) {
        traverse(category.children, currentPath)
      }
    }
  }

  traverse(categories)
  return result
}

export function CategoryPathSelector({
  categories,
  value,
  onValueChange,
  emptyOptionLabel,
  separator = ' > ',
}: CategoryPathSelectorProps): React.JSX.Element {
  const options = React.useMemo(() => {
    const flattened = flattenCategoriesWithPath(categories, separator)
    if (!emptyOptionLabel) return flattened
    return [{ value: '', label: emptyOptionLabel }, ...flattened]
  }, [categories, emptyOptionLabel, separator])

  return (
    <CategorySelector
      categories={options}
      value={value}
      onValueChange={onValueChange}
    />
  )
}
