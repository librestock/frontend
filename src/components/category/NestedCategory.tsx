import * as React from 'react'

import { CategoryCard } from './CategoryCard'
import type { CategoryWithChildrenResponseDto } from '@/lib/data/categories'

interface NestedCategoryProps {
  category: CategoryWithChildrenResponseDto
  depth?: number
  expandedIds: Set<string>
  selectedId: string | null
  onToggle: (id: string) => void
  onSelect: (id: string) => void
  onCreateChild: (parentId: string) => void
}

export function NestedCategory({
  category,
  depth = 0,
  expandedIds,
  selectedId,
  onToggle,
  onSelect,
  onCreateChild,
}: NestedCategoryProps): React.JSX.Element {
  const paddingClass =
    {
      0: 'pl-0',
      1: 'pl-4',
      2: 'pl-8',
      3: 'pl-12',
      4: 'pl-16',
    }[depth] ?? 'pl-20'

  const hasChildren = category.children.length > 0
  const isExpanded = expandedIds.has(category.id)
  const isSelected = selectedId === category.id

  return (
    <div>
      <div className={paddingClass}>
        <CategoryCard
          category={category}
          hasChildren={hasChildren}
          isExpanded={isExpanded}
          isSelected={isSelected}
          onClick={() => onSelect(category.id)}
          onCreateChild={() => onCreateChild(category.id)}
          onToggle={() => onToggle(category.id)}
        />
      </div>
      {!!hasChildren && !!isExpanded && (
        <div>
          {category.children.map((child) => (
            <NestedCategory
              key={child.id}
              category={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              selectedId={selectedId}
              onCreateChild={onCreateChild}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}
