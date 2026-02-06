import {
  type QueryClient,
  type QueryKey,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
  useMutation,
  useQuery,
} from '@tanstack/react-query'
import { apiDelete, apiGet, apiPost, apiPut } from './axios-client'

// ---------------------------------------------------------------------------
// Shared option types
// ---------------------------------------------------------------------------

export interface QueryOptionsArg<TData> {
  query?: Partial<UseQueryOptions<TData>>
}

export interface MutationOptionsArg<TData, TVars> {
  mutation?: UseMutationOptions<TData, unknown, TVars>
}

export type QueryHookResult<TData> = UseQueryResult<TData> & {
  queryKey: QueryKey
}

// ---------------------------------------------------------------------------
// makeCrudHooks
// ---------------------------------------------------------------------------

interface CrudConfig {
  endpoint: string
  resourceName: string
}

export function makeCrudHooks<
  TResponse,
  TCreateDto,
  TUpdateDto,
  TListResponse = TResponse[],
  TQueryDto = void,
  TDeleteResponse = void,
>(config: CrudConfig) {
  const { endpoint, resourceName } = config

  // --- query keys ---

  function getListQueryKey(params?: TQueryDto) {
    return [endpoint, ...(params ? [params] : [])] as const
  }

  function getGetQueryKey(id?: string) {
    return [`${endpoint}/${id}`] as const
  }

  // --- query options ---

  function getListQueryOptions(
    params?: TQueryDto,
    options?: QueryOptionsArg<TListResponse>,
  ) {
    const queryKey = options?.query?.queryKey ?? getListQueryKey(params)
    const queryFn = async ({ signal }: { signal?: AbortSignal }) =>
      await apiGet<TListResponse>(endpoint, params, signal)
    return { queryKey, queryFn, ...options?.query } as UseQueryOptions<
      TListResponse,
      unknown,
      TListResponse,
      QueryKey
    >
  }

  function getGetQueryOptions(
    id?: string,
    options?: QueryOptionsArg<TResponse>,
  ): UseQueryOptions<TResponse, unknown, TResponse, QueryKey> {
    if (!id) {
      return {
        queryKey: getGetQueryKey(id),
        queryFn: async () =>
          await Promise.reject(
            new Error(`${resourceName} id is required to fetch`),
          ),
        enabled: false,
      } as UseQueryOptions<TResponse, unknown, TResponse, QueryKey>
    }
    const queryKey = options?.query?.queryKey ?? getGetQueryKey(id)
    const queryFn = async ({ signal }: { signal?: AbortSignal }) =>
      await apiGet<TResponse>(`${endpoint}/${id}`, undefined, signal)
    return { queryKey, queryFn, ...options?.query } as UseQueryOptions<
      TResponse,
      unknown,
      TResponse,
      QueryKey
    >
  }

  // --- query hooks ---

  function useList(
    params?: TQueryDto,
    options?: QueryOptionsArg<TListResponse>,
    queryClient?: QueryClient,
  ): QueryHookResult<TListResponse> {
    const queryOptions = getListQueryOptions(params, options)
    const query = useQuery(queryOptions, queryClient) as UseQueryResult<TListResponse> & {
      queryKey: QueryKey
    }
    return { ...query, queryKey: queryOptions.queryKey }
  }

  function useGet(
    id: string,
    options?: QueryOptionsArg<TResponse>,
    queryClient?: QueryClient,
  ): QueryHookResult<TResponse> {
    const queryOptions = getGetQueryOptions(id, options)
    const query = useQuery(queryOptions, queryClient) as UseQueryResult<TResponse> & {
      queryKey: QueryKey
    }
    return { ...query, queryKey: queryOptions.queryKey }
  }

  // --- mutation hooks ---

  function useCreate(
    options?: MutationOptionsArg<TResponse, { data: TCreateDto }>,
    queryClient?: QueryClient,
  ): UseMutationResult<TResponse, unknown, { data: TCreateDto }> {
    return useMutation(
      {
        mutationKey: [`create${resourceName}`],
        mutationFn: async (vars) =>
          await apiPost<TResponse>(endpoint, vars.data),
        ...options?.mutation,
      },
      queryClient,
    )
  }

  function useUpdate(
    options?: MutationOptionsArg<
      TResponse,
      { id: string; data: TUpdateDto }
    >,
    queryClient?: QueryClient,
  ): UseMutationResult<
    TResponse,
    unknown,
    { id: string; data: TUpdateDto }
  > {
    return useMutation(
      {
        mutationKey: [`update${resourceName}`],
        mutationFn: async (vars) =>
          await apiPut<TResponse>(`${endpoint}/${vars.id}`, vars.data),
        ...options?.mutation,
      },
      queryClient,
    )
  }

  function useDelete(
    options?: MutationOptionsArg<TDeleteResponse, { id: string }>,
    queryClient?: QueryClient,
  ): UseMutationResult<TDeleteResponse, unknown, { id: string }> {
    return useMutation(
      {
        mutationKey: [`delete${resourceName}`],
        mutationFn: async (vars) =>
          await apiDelete<TDeleteResponse>(`${endpoint}/${vars.id}`),
        ...options?.mutation,
      },
      queryClient,
    )
  }

  return {
    getListQueryKey,
    getGetQueryKey,
    getListQueryOptions,
    getGetQueryOptions,
    useList,
    useGet,
    useCreate,
    useUpdate,
    useDelete,
  }
}

// ---------------------------------------------------------------------------
// makeMutationHook — standalone helper for custom mutations
// ---------------------------------------------------------------------------

export function makeMutationHook<TData, TVars>(
  key: string,
  fn: (vars: TVars) => Promise<TData>,
) {
  return function useMutationHook(
    options?: MutationOptionsArg<TData, TVars>,
    queryClient?: QueryClient,
  ): UseMutationResult<TData, unknown, TVars> {
    return useMutation(
      {
        mutationKey: [key],
        mutationFn: fn,
        ...options?.mutation,
      },
      queryClient,
    )
  }
}

// ---------------------------------------------------------------------------
// makeQueryHook — for custom read endpoints (no params)
// ---------------------------------------------------------------------------

export function makeQueryHook<TData>(
  keyFn: () => readonly unknown[],
  fetchFn: (signal?: AbortSignal) => Promise<TData>,
) {
  function getQueryKey() {
    return keyFn()
  }

  function getQueryOptions(options?: QueryOptionsArg<TData>) {
    const queryKey = options?.query?.queryKey ?? getQueryKey()
    const queryFn = async ({ signal }: { signal?: AbortSignal }) =>
      await fetchFn(signal)
    return { queryKey, queryFn, ...options?.query } as UseQueryOptions<
      TData,
      unknown,
      TData,
      QueryKey
    >
  }

  function useQueryHook(
    options?: QueryOptionsArg<TData>,
    queryClient?: QueryClient,
  ): QueryHookResult<TData> {
    const queryOptions = getQueryOptions(options)
    const query = useQuery(queryOptions, queryClient) as UseQueryResult<TData> & {
      queryKey: QueryKey
    }
    return { ...query, queryKey: queryOptions.queryKey }
  }

  return { getQueryKey, getQueryOptions, useQuery: useQueryHook }
}

// ---------------------------------------------------------------------------
// makeParamQueryHook — for custom read endpoints with a parameter
// ---------------------------------------------------------------------------

export function makeParamQueryHook<TData, TParam>(
  keyFn: (param?: TParam) => readonly unknown[],
  fetchFn: (param: TParam, signal?: AbortSignal) => Promise<TData>,
) {
  function getQueryKey(param?: TParam) {
    return keyFn(param)
  }

  function getQueryOptions(
    param?: TParam,
    options?: QueryOptionsArg<TData>,
  ) {
    const queryKey = options?.query?.queryKey ?? getQueryKey(param)
    const queryFn = async ({ signal }: { signal?: AbortSignal }) =>
      await fetchFn(param as TParam, signal)
    return { queryKey, queryFn, ...options?.query } as UseQueryOptions<
      TData,
      unknown,
      TData,
      QueryKey
    >
  }

  function useQueryHook(
    param: TParam,
    options?: QueryOptionsArg<TData>,
    queryClient?: QueryClient,
  ): QueryHookResult<TData> {
    const queryOptions = getQueryOptions(param, options)
    const query = useQuery(queryOptions, queryClient) as UseQueryResult<TData> & {
      queryKey: QueryKey
    }
    return { ...query, queryKey: queryOptions.queryKey }
  }

  return { getQueryKey, getQueryOptions, useQuery: useQueryHook }
}
