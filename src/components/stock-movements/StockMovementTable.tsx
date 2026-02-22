'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@/components/ui/table'
import { TableFactory } from '@/components/common/TableFactory'
import {
  useListStockMovements,
  type StockMovementQueryDto,
  type StockMovementResponseDto,
} from '@/lib/data/stock-movements'

interface StockMovementTableProps {
  filters?: Partial<StockMovementQueryDto>
  page: number
  limit: number
  hasActiveFilters: boolean
  onPageChange: (page: number) => void
}

function TableSkeleton(): React.JSX.Element {
  return (
    <TableBody>
      {Array.from({ length: 10 }).map((_, i) => (
        <TableRow key={`skeleton-row-${String(i)}`}>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  )
}

function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ReasonBadge({ reason }: { reason: string }): React.JSX.Element {
  const { t } = useTranslation()

  const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    PURCHASE_RECEIVE: 'default',
    SALE: 'secondary',
    WASTE: 'destructive',
    DAMAGED: 'destructive',
    EXPIRED: 'destructive',
    COUNT_CORRECTION: 'outline',
    RETURN_FROM_CLIENT: 'secondary',
    RETURN_TO_SUPPLIER: 'secondary',
    INTERNAL_TRANSFER: 'outline',
  }

  return (
    <Badge variant={variantMap[reason] ?? 'outline'}>
      {t(`stockMovements.reasons.${reason}`) || reason}
    </Badge>
  )
}

function LocationFlow({
  movement,
}: {
  movement: StockMovementResponseDto
}): React.JSX.Element {
  const { t } = useTranslation()
  const fromName = movement.from_location?.name ?? (t('stockMovements.noLocation') || '---')
  const toName = movement.to_location?.name ?? (t('stockMovements.noLocation') || '---')

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="text-muted-foreground">{fromName}</span>
      <ArrowRight className="size-3 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground">{toName}</span>
    </div>
  )
}

function StockMovementRow({
  movement,
}: {
  movement: StockMovementResponseDto
}): React.JSX.Element {
  return (
    <TableRow>
      <TableCell className="text-muted-foreground whitespace-nowrap">
        {formatDate(movement.created_at)}
      </TableCell>
      <TableCell>
        <div className="font-medium">{movement.product?.name ?? 'Unknown'}</div>
        {movement.product?.sku && (
          <div className="text-xs text-muted-foreground">{movement.product.sku}</div>
        )}
      </TableCell>
      <TableCell>
        <LocationFlow movement={movement} />
      </TableCell>
      <TableCell>
        <span className="font-semibold tabular-nums">{movement.quantity}</span>
      </TableCell>
      <TableCell>
        <ReasonBadge reason={movement.reason} />
      </TableCell>
      <TableCell className="text-muted-foreground">
        {movement.reference_number || '---'}
      </TableCell>
    </TableRow>
  )
}

export function StockMovementTable({
  filters,
  page,
  limit,
  hasActiveFilters,
  onPageChange,
}: StockMovementTableProps): React.JSX.Element {
  const { t } = useTranslation()

  const queryParams = React.useMemo(
    () => ({
      page,
      limit,
      ...filters,
    }),
    [filters, limit, page],
  )

  const { data, isLoading, error } = useListStockMovements(queryParams)

  const movements = data?.data ?? []
  const meta = data?.meta

  return (
    <TableFactory
      errorMessage={t('stockMovements.errorLoading') || 'Error loading stock movements'}
      hasError={Boolean(error)}
      isEmpty={movements.length === 0}
      isLoading={isLoading}
      page={page}
      renderSkeleton={() => <TableSkeleton />}
      totalItems={meta?.total}
      totalPages={meta?.total_pages ?? 1}
      emptyMessage={
        hasActiveFilters
          ? (t('stockMovements.noMovementsFiltered') || 'No results for these filters')
          : (t('stockMovements.noMovements') || 'No stock movements found')
      }
      renderBody={() => (
        <TableBody>
          {movements.map((movement) => (
            <StockMovementRow
              key={movement.id}
              movement={movement}
            />
          ))}
        </TableBody>
      )}
      renderHeader={() => (
        <TableRow>
          <TableHead>{t('stockMovements.date') || 'Date'}</TableHead>
          <TableHead>{t('stockMovements.product') || 'Product'}</TableHead>
          <TableHead>{t('stockMovements.locationFlow') || 'From / To'}</TableHead>
          <TableHead>{t('stockMovements.quantity') || 'Qty'}</TableHead>
          <TableHead>{t('stockMovements.reason') || 'Reason'}</TableHead>
          <TableHead>{t('stockMovements.referenceNumber') || 'Reference'}</TableHead>
        </TableRow>
      )}
      onPageChange={onPageChange}
    />
  )
}
