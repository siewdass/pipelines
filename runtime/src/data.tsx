import { useQuery, useMutation as useMutationRQ, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { api } from './api';

const queryClient = new QueryClient();

export const DataProvider = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

/**
 * Global utility to refresh/invalidate data for a specific source
 */
export const refresh = (source: string) => {
  queryClient.invalidateQueries({ queryKey: [source], exact: false });
};

// --- Types ---

export interface InquiryResponse<T = any> {
  item?: T;
  items?: T[];
  pagination?: { page: number; limit: number; total: number; pages: number };
}

export interface MutationResponse {
  success: boolean;
  message: string;
}

// --- Hooks ---

/**
 * Hook for data inquiries
 * Returns [data, isLoading, pagination]
 */
export function useInquiry<T = any>(
  source: string, 
  type: 'index' | 'retrieve',
  output: any = {}, 
  options: any = {}
) {
  const query = useQuery<InquiryResponse<T>>({
    queryKey: [source, type, output, options],
    queryFn: () => api.post(`/inquiry/${type}`, { source, output, options }).then(r => r.data),
    retry: 3,
    staleTime: 60000,
  });

  const data = type === 'retrieve' ? query.data?.items : query.data?.item;
  const pagination = type === 'retrieve' ? query.data?.pagination : undefined;
  
  return [data, query.isLoading, pagination] as [typeof data, boolean, typeof pagination];
}

/**
 * Hook for data mutations
 * Returns [mutate, isPending]
 */
export function useMutation<V = any>(
  source: string, 
  type: 'upsert' | 'purge',
  options: any = {}
) {
  const mutation = useMutationRQ<MutationResponse, any, V>({
    mutationFn: (input: V) => api.post(`/mutation/${type}`, { source, input, options }).then(r => r.data),
    onSuccess: (data: MutationResponse) => {
      if (data.success) {
        console.log(`Mutation ${type} success on ${source}:`, data.message);
      } else {
        console.warn(`Mutation ${type} failure on ${source}:`, data.message);
      }
    },
    onError: (err: any) => {
      console.error(`Mutation ${type} system/network error on ${source}:`, err.response?.data?.message || err.message);
    },
  });

  const mutate = (
    input: V, 
    callbacks?: { 
      onSuccess?: (data: MutationResponse) => void, 
      onError?: (error: any) => void 
    }
  ) => {
    mutation.mutate(input, callbacks);
  };

  return [mutate, mutation.isPending] as [typeof mutate, boolean];
}
