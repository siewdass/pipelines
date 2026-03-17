import { useQuery as useQueryHook, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { api } from '../services/api';
import { toast } from 'sonner';

/**
 * React Query Client Instance
 */
const queryClient = new QueryClient();

/**
 * Application-wide Query Provider
 */
export function FetchProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * Generic Fetch Hook (GET)
 * @param key Unique string identifier for the query
 * @param url API endpoint
 * @param params Optional URL query parameters
 */
export function useQuery<TData = any, TError = any>(
  key: string,
  url: string,
  params?: any
) {
  const query = useQueryHook<TData, TError>({
    queryKey: params ? [key, url, params] : [key, url],
    queryFn: async () => {
      try {
        const { data } = await api.get(url, { params });
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

  const mutation = useMutation<TData, TError, TVariables & { overrideUrl?: string }>({
    mutationFn: async ({ overrideUrl, ...body }: any) => {
      const targetUrl = overrideUrl || url;
      let response;
      switch (method) {
        case 'post': response = await api.post(targetUrl, body); break;
        case 'put': response = await api.put(targetUrl, body); break;
        case 'patch': response = await api.patch(targetUrl, body); break;
        case 'delete': response = await api.delete(targetUrl, { data: body }); break;
        default: throw new Error(`Unsupported method: ${method}`);
      }
      return response.data;
    },
    onSuccess: (data: any) => {
      if (keys) {
        const keysArray = Array.isArray(keys) ? keys : [keys];
        keysArray.forEach(k => {
          queryClient.invalidateQueries({ queryKey: [k], exact: false });
        });
      }
      if (data?.message) toast.success(data.message);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Action failed');
    },
  });

  const execute = (variables: TVariables & { overrideUrl?: string }) => mutation.mutate(variables);

  return [execute, mutation.isPending, mutation.data] as [typeof execute, boolean, TData | undefined];
}