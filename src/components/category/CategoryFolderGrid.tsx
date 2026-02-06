'use client'

import { Folder } from 'lucide-react'
import type { CategoryWithChildrenResponseDto } from '@/lib/data/categories'

interface CategoryFolderGridProps {
  categories: CategoryWithChildrenResponseDto[]
  onSelectCategory: (categoryId: string) => void
}

export function CategoryFolderGrid({
  categories,
  onSelectCategory,
}: CategoryFolderGridProps): React.JSX.Element | null {
  if (categories.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {categories.map((category) => (
        <button
          key={category.id}
          className="group bg-card text-card-foreground hover:border-primary hover:bg-accent flex flex-col items-center gap-2 rounded-lg border p-4 transition-all"
          type="button"
          onClick={() => onSelectCategory(category.id)}
        >
          <Folder className="text-muted-foreground group-hover:text-primary size-12 transition-colors" />
          <span className="line-clamp-2 text-center text-sm font-medium">
            {category.name}
          </span>
          {category.children.length > 0 && (
            <span className="text-muted-foreground text-xs">
              {category.children.length} subfolder
              {category.children.length !== 1 ? 's' : ''}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
