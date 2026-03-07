import { describe, expect, it } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import {
  removeItemFromPaginated,
  restoreQueryData,
  snapshotQueryData,
} from './query-cache'

describe('query-cache utils', () => {
  it('snapshots and restores matching query data', () => {
    const queryClient = new QueryClient()
    const pageOne = { data: [{ id: 'p1' }], meta: { total: 2 } }
    const pageTwo = { data: [{ id: 'p2' }], meta: { total: 2 } }

    queryClient.setQueryData(['products', { page: 1 }], pageOne)
    queryClient.setQueryData(['products', { page: 2 }], pageTwo)

    const snapshot = snapshotQueryData<typeof pageOne>(
      queryClient,
      ['products'],
    )

    queryClient.setQueryData(['products', { page: 1 }], {
      data: [],
      meta: { total: 0 },
    })
    queryClient.setQueryData(['products', { page: 2 }], undefined)

    restoreQueryData(queryClient, snapshot)

    expect(queryClient.getQueryData(['products', { page: 1 }])).toEqual(pageOne)
    expect(queryClient.getQueryData(['products', { page: 2 }])).toEqual(pageTwo)
  })

  it('removes a paginated item and decrements total safely', () => {
    const source = {
      data: [{ id: 'a' }, { id: 'b' }],
      meta: { total: 0, page: 1 },
    }

    const result = removeItemFromPaginated(source, 'a')

    expect(result).toEqual({
      data: [{ id: 'b' }],
      meta: { total: 0, page: 1 },
    })
  })

  it('returns the original value when id is not found', () => {
    const source = {
      data: [{ id: 'a' }],
      meta: { total: 1 },
    }

    const result = removeItemFromPaginated(source, 'missing')

    expect(result).toBe(source)
  })

  it('returns undefined when source data is undefined', () => {
    expect(removeItemFromPaginated(undefined, 'id')).toBeUndefined()
  })
})
