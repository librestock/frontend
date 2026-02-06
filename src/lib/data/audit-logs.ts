import {
  AuditAction,
  AuditEntityType,
  type AuditLogQueryDto,
  type AuditLogResponseDto,
  type PaginatedAuditLogsResponseDto,
} from '@librestock/types'
import { makeCrudHooks } from './make-crud-hooks'

export type {
  AuditLogQueryDto,
  AuditLogResponseDto,
  PaginatedAuditLogsResponseDto,
}
export { AuditAction, AuditEntityType }

const crud = makeCrudHooks<
  AuditLogResponseDto,
  never,
  never,
  PaginatedAuditLogsResponseDto,
  AuditLogQueryDto,
  void
>({ endpoint: '/audit-logs', resourceName: 'AuditLog' })

export const getListAuditLogsQueryKey = crud.getListQueryKey
export const getListAuditLogsQueryOptions = crud.getListQueryOptions
export const useListAuditLogs = crud.useList
