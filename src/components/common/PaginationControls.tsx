'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type * as React from 'react'

import { Button } from '@/components/ui/button'

interface PaginationControlsProps {
  page: number
  totalPages: number
  totalItems?: number
  isLoading?: boolean
  onPageChange: (page: number) => void
}

export function PaginationControls({
  page,
  totalPages,
  totalItems,
  isLoading,
  onPageChange,
}: PaginationControlsProps): React.JSX.Element | null {
  const { t } = useTranslation()
  const showControls = totalPages > 1

  if (!showControls && typeof totalItems !== 'number') {
    return null
  }

  const hasPrevious = page > 1
  const hasNext = page < totalPages
  const summaryText =
    typeof totalItems === 'number'
      ? t('pagination.results', {
          count: totalItems,
          defaultValue: `${totalItems} results`,
        })
      : t('pagination.pageOf', {
          page,
          total: totalPages,
          defaultValue: `Page ${page} of ${totalPages}`,
        })
  const prevLabel = t('pagination.prev', { defaultValue: 'Prev' })
  const nextLabel = t('pagination.next', { defaultValue: 'Next' })

  return (
    <div className="flex items-center justify-between gap-4 pt-4">
      <p className="text-muted-foreground text-sm">{summaryText}</p>
      {showControls && (
        <div className="flex items-center gap-2">
          <Button
            disabled={!hasPrevious || isLoading}
            size="sm"
            variant="outline"
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="size-4" />
            {prevLabel}
          </Button>
          <Button
            disabled={!hasNext || isLoading}
            size="sm"
            variant="outline"
            onClick={() => onPageChange(page + 1)}
          >
            {nextLabel}
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
