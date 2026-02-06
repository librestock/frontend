import { Folder, ChevronRight, ChevronDown, Plus } from 'lucide-react'
import type { CategoryResponseDto } from '@/lib/data/categories'
import { Button } from '@/components/ui/button'

interface CategoryCardProps {
  category: CategoryResponseDto
  hasChildren: boolean
  isExpanded: boolean
  isSelected: boolean
  onToggle: () => void
  onClick: () => void
  onCreateChild?: () => void
}

export function CategoryCard({
  category,
  hasChildren,
  isExpanded,
  isSelected,
  onToggle,
  onClick,
  onCreateChild,
}: CategoryCardProps): React.JSX.Element {
  return (
    <div
      className={`group hover:bg-accent mb-1 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-all ${isSelected ? 'bg-accent' : ''}`}
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onKeyDown={(e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
    >
      {hasChildren ? (
        <button
          className="hover:bg-accent shrink-0 rounded p-0.5"
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
        >
          {isExpanded ? (
            <ChevronDown className="text-muted-foreground size-4" />
          ) : (
            <ChevronRight className="text-muted-foreground size-4" />
          )}
        </button>
      ) : (
        <div className="w-5" />
      )}
      <Folder
        className={`size-4 shrink-0 ${
          isSelected ? 'text-primary' : 'text-muted-foreground'
        }`}
      />
      <span
        className={`truncate text-sm ${
          isSelected ? 'text-foreground font-semibold' : 'font-medium'
        }`}
      >
        {category.name}
      </span>
      {onCreateChild ? (
        <Button
          aria-label="Add subcategory"
          className="ml-auto opacity-0 transition-opacity group-hover:opacity-100"
          size="icon-xs"
          title="Add subcategory"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation()
            onCreateChild()
          }}
        >
          <Plus className="size-3.5" />
        </Button>
      ) : (
        <div />
      )}
    </div>
  )
}
