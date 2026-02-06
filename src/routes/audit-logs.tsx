import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { z } from 'zod'

import { redirect } from '@tanstack/react-router'
import { getSession } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LogTable } from '@/components/audit-logs/LogTable'
import {
  AuditAction,
  AuditEntityType,
  type AuditLogQueryDto,
} from '@/lib/data/audit-logs'
import { parseNumberParam, parseStringParam } from '@/lib/router/search'

const auditLogsSearchSchema = z.object({
  page: z.preprocess(parseNumberParam, z.number().int().min(1).optional()),
  action: z.preprocess(parseStringParam, z.string().optional()),
  entity_type: z.preprocess(parseStringParam, z.string().optional()),
})

const AUDIT_LOG_PAGE_SIZE = 50

export const Route = createFileRoute('/audit-logs')({
  validateSearch: (search) => auditLogsSearchSchema.parse(search),
  beforeLoad: async () => {
    const { data: session } = await getSession()
    if (!session) {
      throw redirect({ to: '/login' })
    }
  },
  component: AuditPage,
})

type AuditLogsSearch = ReturnType<typeof Route.useSearch>

function AuditPage(): React.JSX.Element {
  const { t } = useTranslation()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const page = search.page ?? 1
  const action = search.action as AuditAction | undefined
  const entityType = search.entity_type as AuditEntityType | undefined

  const filters = React.useMemo(() => {
    const f: Partial<AuditLogQueryDto> = {}
    if (action) f.action = action
    if (entityType) f.entity_type = entityType
    return f
  }, [action, entityType])

  const filterChips = React.useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = []
    if (action) {
      chips.push({
        key: 'action',
        label: `${t('auditLogs.action', { defaultValue: 'Action' })}: ${t(`auditLogs.actions.${action}`, { defaultValue: action })}`,
        onRemove: () => {
          void navigate({
            search: (prev: AuditLogsSearch) => ({
              ...prev,
              action: undefined,
              page: 1,
            }),
            replace: true,
          })
        },
      })
    }
    if (entityType) {
      chips.push({
        key: 'entity_type',
        label: `${t('auditLogs.entityType', { defaultValue: 'Entity Type' })}: ${t(`auditLogs.entityTypes.${entityType}`, { defaultValue: entityType })}`,
        onRemove: () => {
          void navigate({
            search: (prev: AuditLogsSearch) => ({
              ...prev,
              entity_type: undefined,
              page: 1,
            }),
            replace: true,
          })
        },
      })
    }
    return chips
  }, [action, entityType, navigate, t])

  const hasActiveFilters = filterChips.length > 0

  const clearAll = (): void => {
    void navigate({ search: {}, replace: true })
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold">
            {t('auditLogs.title', { defaultValue: 'Audit Logs' })}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('auditLogs.subtitle', { defaultValue: 'View system activity and changes' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b px-6 py-3">
        <Select
          value={action ?? ''}
          onValueChange={(value) => {
            void navigate({
              search: (prev: AuditLogsSearch) => ({
                ...prev,
                action: value || undefined,
                page: 1,
              }),
              replace: true,
            })
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('auditLogs.allActions', { defaultValue: 'All Actions' })} />
          </SelectTrigger>
          <SelectContent>
            {Object.values(AuditAction).map((a) => (
              <SelectItem key={a} value={a}>
                {t(`auditLogs.actions.${a}`, { defaultValue: a })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={entityType ?? ''}
          onValueChange={(value) => {
            void navigate({
              search: (prev: AuditLogsSearch) => ({
                ...prev,
                entity_type: value || undefined,
                page: 1,
              }),
              replace: true,
            })
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('auditLogs.allEntityTypes', { defaultValue: 'All Entity Types' })} />
          </SelectTrigger>
          <SelectContent>
            {Object.values(AuditEntityType).map((et) => (
              <SelectItem key={et} value={et}>
                {t(`auditLogs.entityTypes.${et}`, { defaultValue: et })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 border-b px-6 py-2">
          {filterChips.map((chip) => (
            <Button
              key={chip.key}
              className="gap-1"
              size="sm"
              variant="outline"
              onClick={chip.onRemove}
            >
              {chip.label}
              <X className="size-3" />
            </Button>
          ))}
          <Button size="sm" variant="ghost" onClick={clearAll}>
            {t('actions.clearAll', { defaultValue: 'Clear all' })}
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-auto p-6">
        <LogTable
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          limit={AUDIT_LOG_PAGE_SIZE}
          page={page}
          onPageChange={(nextPage) => {
            void navigate({
              search: (prev: AuditLogsSearch) => ({
                ...prev,
                page: nextPage,
              }),
              replace: true,
            })
          }}
        />
      </div>
    </div>
  )
}
