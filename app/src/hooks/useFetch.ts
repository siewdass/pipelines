import { useQuery as useQueryHook, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { toast } from 'sonner';

/**
 * Generic Fetch Hook (GET)
 * @param key Unique string identifier for the query
 * @param url API endpoint
 */
export function useQuery<TData = any, TError = any>(
  key: string,
  url: string
) {
  const query = useQueryHook<TData, TError>({
    queryKey: [key, url], // URL is part of the key for uniqueness
    queryFn: async () => {
      try {
        const { data } = await api.get(url);
        return data;
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Error fetching data');
        throw err;
      }
    },
    retry: 10,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
  });

  return [query.data, query.isLoading] as [TData | undefined, boolean];
}

/**
 * Generic Mutation Hook (POST/PUT/PATCH/DELETE)
 * @param method HTTP method
 * @param url API endpoint
 * @param keys String or array of strings to invalidate (fuzzy matching)
 */
export function useMutate<TData = any, TVariables = any, TError = any>(
  method: 'post' | 'put' | 'patch' | 'delete',
  url: string,
  keys?: string | string[]
) {
  const queryClient = useQueryClient();

  const mutation = useMutation<TData, TError, TVariables>({
    mutationFn: async (body: TVariables) => {
      let response;
      switch (method) {
        case 'post': response = await api.post(url, body); break;
        case 'put': response = await api.put(url, body); break;
        case 'patch': response = await api.patch(url, body); break;
        case 'delete': response = await api.delete(url, { data: body }); break;
        default: throw new Error(`Unsupported method: ${method}`);
      }
      return response.data;
    },
    onSuccess: (data: any) => {
      if (keys) {
        const keysArray = Array.isArray(keys) ? keys : [keys];
        keysArray.forEach(k => {
          // Fuzzy match: will invalidate all queries starting with [k]
          // e.g., if query key is ['projects', '/list'], invalidating ['projects'] works.
          queryClient.invalidateQueries({ queryKey: [k], exact: false });
        });
      }
      toast.success(data?.message || 'Action successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Action failed');
    },
  });

  return [mutation.mutate, mutation.isPending] as [typeof mutation.mutate, boolean];
}