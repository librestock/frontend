import type { ReactNode } from 'react'
import clsx from 'clsx'

import { EmptyState } from '@/components/common/EmptyState'
import { DisplayType } from '@/lib/enums/display-type.enum'

interface ItemsGridProps<T> {
  items: T[]
  displayType: DisplayType
  renderItem: (item: T) => ReactNode
  emptyMessage?: string
}

export function ItemsGrid<T>({
  items,
  displayType,
  renderItem,
  emptyMessage,
}: ItemsGridProps<T>): React.JSX.Element | null {
  if (items.length === 0) {
    return emptyMessage ? <EmptyState message={emptyMessage} /> : null
  }

  return (
    <div
      className={clsx(
        displayType === DisplayType.GRID
          ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'flex flex-col gap-3',
      )}
    >
      {items.map(renderItem)}
    </div>
  )
}
