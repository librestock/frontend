'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { PaginationControls } from '@/components/common/PaginationControls'
import {
  useListAuditLogs,
  AuditAction,
  type AuditLogQueryDto,
  type AuditLogResponseDto,
} from '@/lib/data/audit-logs'
import { cn } from '@/lib/utils'

interface LogTableProps {
  filters?: Partial<AuditLogQueryDto>
  page: number
  limit: number
  hasActiveFilters: boolean
  onPageChange: (page: number) => void
}

const ACTION_BADGE_CLASSES: Record<AuditAction, string> = {
  [AuditAction.CREATE]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  [AuditAction.UPDATE]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  [AuditAction.DELETE]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  [AuditAction.RESTORE]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  [AuditAction.ADJUST_QUANTITY]: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  [AuditAction.ADD_PHOTO]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  [AuditAction.STATUS_CHANGE]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
}

function truncateUuid(uuid: string): string {
  return uuid.length > 8 ? `${uuid.slice(0, 8)}…` : uuid
}

function TableSkeleton(): React.JSX.Element {
  return (
    <TableBody>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={`skeleton-row-${String(i)}`}>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  )
}

function LogRow({ log }: { log: AuditLogResponseDto }): React.JSX.Element {
  const { t } = useTranslation()

  const actionLabel = t(`auditLogs.actions.${log.action}`, { defaultValue: log.action })
  const entityLabel = t(`auditLogs.entityTypes.${log.entity_type}`, { defaultValue: log.entity_type })
  const systemLabel = t('auditLogs.system', { defaultValue: 'System' })

  return (
    <TableRow>
      <TableCell>
        <Badge
          className={cn('border-transparent', ACTION_BADGE_CLASSES[log.action])}
          variant="outline"
        >
          {actionLabel}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{entityLabel}</Badge>
      </TableCell>
      <TableCell className="text-muted-foreground font-mono text-xs" title={log.entity_id}>
        {truncateUuid(log.entity_id)}
      </TableCell>
      <TableCell className="text-muted-foreground font-mono text-xs" title={log.user_id ?? undefined}>
        {log.user_id ? truncateUuid(log.user_id) : systemLabel}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {log.ip_address ?? '—'}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {new Date(log.created_at).toLocaleString()}
      </TableCell>
    </TableRow>
  )
}

export function LogTable({
  filters,
  page,
  limit,
  hasActiveFilters,
  onPageChange,
}: LogTableProps): React.JSX.Element {
  const { t } = useTranslation()

  const queryParams = React.useMemo(
    () => ({
      page,
      limit,
      ...filters,
    }),
    [filters, limit, page],
  )

  const { data, isLoading, error } = useListAuditLogs(queryParams)

  const logs = data?.data ?? []
  const meta = data?.meta

  if (error) {
    return (
      <ErrorState
        message={t('auditLogs.errorLoading', { defaultValue: 'Error loading audit logs' })}
        variant="bordered"
      />
    )
  }

  if (!isLoading && logs.length === 0) {
    return (
      <EmptyState
        variant="bordered"
        message={
          hasActiveFilters
            ? t('auditLogs.noLogsFiltered', { defaultValue: 'No results for these filters' })
            : t('auditLogs.noLogs', { defaultValue: 'No audit logs found' })
        }
      />
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('auditLogs.action', { defaultValue: 'Action' })}</TableHead>
            <TableHead>{t('auditLogs.entityType', { defaultValue: 'Entity Type' })}</TableHead>
            <TableHead>{t('auditLogs.entityId', { defaultValue: 'Entity ID' })}</TableHead>
            <TableHead>{t('auditLogs.userId', { defaultValue: 'User ID' })}</TableHead>
            <TableHead>{t('auditLogs.ipAddress', { defaultValue: 'IP Address' })}</TableHead>
            <TableHead>{t('auditLogs.date', { defaultValue: 'Date' })}</TableHead>
          </TableRow>
        </TableHeader>
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <TableBody>
            {logs.map((log) => (
              <LogRow key={log.id} log={log} />
            ))}
          </TableBody>
        )}
      </Table>
      <div className="px-4 pb-4">
        <PaginationControls
          isLoading={isLoading}
          page={page}
          totalItems={meta?.total}
          totalPages={meta?.total_pages ?? 1}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  )
}
