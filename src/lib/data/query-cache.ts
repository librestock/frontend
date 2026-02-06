import type { QueryClient, QueryKey } from '@tanstack/react-query'

export type QuerySnapshot<T> = [QueryKey, T | undefined][]

export function snapshotQueryData<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
): QuerySnapshot<T> {
  return queryClient.getQueriesData<T>({ queryKey })
}

export function restoreQueryData<T>(
  queryClient: QueryClient,
  snapshot: QuerySnapshot<T>,
): void {
  for (const [key, data] of snapshot) {
    queryClient.setQueryData(key, data)
  }
}

interface PaginatedData<T, M> {
  data: T[]
  meta: M
}

export function removeItemFromPaginated<
  T extends { id: string },
  M extends { total: number },
>(data: PaginatedData<T, M> | undefined, id: string): PaginatedData<T, M> | undefined {
  if (!data) {
    return data
  }
  const next = data.data.filter((item) => item.id !== id)
  if (next.length === data.data.length) {
    return data
  }
  return {
    ...data,
    data: next,
    meta: {
      ...data.meta,
      total: Math.max(0, data.meta.total - 1),
    },
  }
}

export function removeItemFromArray<T extends { id: string }>(
  data: T[] | undefined,
  id: string,
): T[] | undefined {
  if (!data) {
    return data
  }
  const next = data.filter((item) => item.id !== id)
  return next.length === data.length ? data : next
}
