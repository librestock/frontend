import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  useDeleteLocation,
  getListLocationsQueryKey,
  getListAllLocationsQueryKey,
  type LocationResponseDto,
  type PaginatedLocationsResponseDto,
} from '@/lib/data/locations'
import {
  removeItemFromArray,
  removeItemFromPaginated,
  restoreQueryData,
  snapshotQueryData,
} from '@/lib/data/query-cache'

export function useDeleteLocationOptimistic() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const deleteMutation = useDeleteLocation({
    mutation: {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: getListLocationsQueryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: getListAllLocationsQueryKey(),
          }),
        ])
      },
      onError: (error) => {
        toast.error(
          t('locations.deleteError') || 'Failed to delete location',
        )
        console.error('Location deletion error:', error)
      },
    },
  })

  const performDelete = useCallback(
    (locationId: string) => {
      const listQueryKey = getListLocationsQueryKey()
      const listAllKey = getListAllLocationsQueryKey()
      const snapshot = snapshotQueryData<PaginatedLocationsResponseDto>(
        queryClient,
        listQueryKey,
      )
      const allSnapshot = snapshotQueryData<LocationResponseDto[]>(
        queryClient,
        listAllKey,
      )
      queryClient.setQueriesData<PaginatedLocationsResponseDto>(
        { queryKey: listQueryKey },
        (old) => removeItemFromPaginated(old, locationId),
      )
      queryClient.setQueriesData<LocationResponseDto[]>(
        { queryKey: listAllKey },
        (old) => removeItemFromArray(old, locationId),
      )

      let didUndo = false
      const timeoutId = window.setTimeout(() => {
        if (didUndo) return
        deleteMutation.mutateAsync({ id: locationId }).catch(() => {
          restoreQueryData(queryClient, snapshot)
          restoreQueryData(queryClient, allSnapshot)
        })
      }, 5000)

      toast(t('locations.deleted') || 'Location deleted successfully', {
        action: {
          label: t('actions.undo') || 'Undo',
          onClick: () => {
            didUndo = true
            window.clearTimeout(timeoutId)
            restoreQueryData(queryClient, snapshot)
            restoreQueryData(queryClient, allSnapshot)
          },
        },
      })
    },
    [queryClient, deleteMutation, t],
  )

  return { deleteMutation, performDelete }
}
