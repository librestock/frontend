'use client'

import * as React from 'react'

import {
  Table,
  TableHeader,
} from '@/components/ui/table'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { PaginationControls } from '@/components/common/PaginationControls'

interface TableFactoryProps {
  hasError: boolean
  errorMessage: string
  isLoading: boolean
  isEmpty: boolean
  emptyMessage: string
  page: number
  totalItems?: number
  totalPages: number
  onPageChange: (page: number) => void
  renderHeader: () => React.ReactNode
  renderSkeleton: () => React.ReactNode
  renderBody: () => React.ReactNode
}

export function TableFactory({
  hasError,
  errorMessage,
  isLoading,
  isEmpty,
  emptyMessage,
  page,
  totalItems,
  totalPages,
  onPageChange,
  renderHeader,
  renderSkeleton,
  renderBody,
}: TableFactoryProps): React.JSX.Element {
  if (hasError) {
    return (
      <ErrorState
        message={errorMessage}
        variant="bordered"
      />
    )
  }

  if (!isLoading && isEmpty) {
    return (
      <EmptyState
        message={emptyMessage}
        variant="bordered"
      />
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>{renderHeader()}</TableHeader>
        {isLoading ? renderSkeleton() : renderBody()}
      </Table>
      <div className="px-4 pb-4">
        <PaginationControls
          isLoading={isLoading}
          page={page}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  )
}
