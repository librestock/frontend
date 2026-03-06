import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  useAreasControllerDelete,
  getAreasControllerFindAllQueryKey,
  type AreaResponseDto,
} from '@/lib/data/areas'
import {
  removeItemFromArray,
  restoreQueryData,
  snapshotQueryData,
} from '@/lib/data/query-cache'

export function useDeleteAreaOptimistic(locationId: string) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const deleteMutation = useAreasControllerDelete({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getAreasControllerFindAllQueryKey({
            location_id: locationId,
          }),
        })
      },
      onError: (error) => {
        toast.error(t('areas.deleteError') || 'Failed to delete area')
        console.error('Area deletion error:', error)
      },
    },
  })

  const performDelete = useCallback(
    (areaId: string) => {
      const queryKey = getAreasControllerFindAllQueryKey({
        location_id: locationId,
      })
      const snapshot = snapshotQueryData<AreaResponseDto[]>(
        queryClient,
        queryKey,
      )
      queryClient.setQueriesData<AreaResponseDto[]>({ queryKey }, (old) =>
        removeItemFromArray(old, areaId),
      )

      let didUndo = false
      const timeoutId = window.setTimeout(() => {
        if (didUndo) return
        deleteMutation.mutateAsync({ id: areaId }).catch(() => {
          restoreQueryData(queryClient, snapshot)
        })
      }, 5000)

      toast(t('areas.deleted') || 'Area deleted successfully', {
        action: {
          label: t('actions.undo') || 'Undo',
          onClick: () => {
            didUndo = true
            window.clearTimeout(timeoutId)
            restoreQueryData(queryClient, snapshot)
          },
        },
      })
    },
    [queryClient, deleteMutation, t, locationId],
  )

  return { deleteMutation, performDelete }
}
