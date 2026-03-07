import { useCallback } from 'react'
import { useQueryClient, type QueryKey, type UseMutationResult } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  restoreQueryData,
  snapshotQueryData,
  type QuerySnapshot,
} from '@/lib/data/query-cache'

const UNDO_DELAY_MS = 5000

interface DeleteVariables {
  id: string
}

interface OptimisticTarget {
  queryKey: QueryKey
  update: (previous: unknown, id: string) => unknown
}

interface MutationHookOptions {
  mutation: {
    onSuccess?: () => Promise<void> | void
    onError?: (error: unknown) => void
  }
}

interface OptimisticDeleteI18n {
  success: string
  error: string
  undo: string
}

interface OptimisticDeleteConfig<Context> {
  useMutationHook: (
    options: MutationHookOptions,
  ) => UseMutationResult<unknown, unknown, DeleteVariables, unknown>
  getOptimisticTargets: (id: string, context?: Context) => readonly OptimisticTarget[]
  getInvalidationKeys: (context?: Context) => readonly QueryKey[]
  i18n: OptimisticDeleteI18n
  onMutationError?: (error: unknown) => void
}

export function makeOptimisticDelete<Context = undefined>(
  config: OptimisticDeleteConfig<Context>,
) {
  return function useOptimisticDelete() {
    const { t } = useTranslation()
    const queryClient = useQueryClient()

    const deleteMutation = config.useMutationHook({
      mutation: {
        onSuccess: async () => {
          await Promise.all(
            config
              .getInvalidationKeys()
              .map(async (queryKey) => {
                await queryClient.invalidateQueries({
                  queryKey,
                })
              }),
          )
        },
        onError: (error) => {
          toast.error(t(config.i18n.error))
          config.onMutationError?.(error)
        },
      },
    })

    const performDelete = useCallback(
      (id: string, context?: Context) => {
        const targets = config.getOptimisticTargets(id, context)
        const snapshots: QuerySnapshot<unknown>[] = targets.map(({ queryKey }) =>
          snapshotQueryData(queryClient, queryKey),
        )

        for (const target of targets) {
          queryClient.setQueriesData(
            { queryKey: target.queryKey },
            (old) => target.update(old, id),
          )
        }

        let didUndo = false
        const timeoutId = window.setTimeout(() => {
          if (didUndo) {
            return
          }

          deleteMutation.mutateAsync({ id }).catch(() => {
            for (const snapshot of snapshots) {
              restoreQueryData(queryClient, snapshot)
            }
          })
        }, UNDO_DELAY_MS)

        toast(t(config.i18n.success), {
          action: {
            label: t(config.i18n.undo),
            onClick: () => {
              didUndo = true
              window.clearTimeout(timeoutId)
              for (const snapshot of snapshots) {
                restoreQueryData(queryClient, snapshot)
              }
            },
          },
        })
      },
      [deleteMutation, queryClient, t],
    )

    return { deleteMutation, performDelete }
  }
}
