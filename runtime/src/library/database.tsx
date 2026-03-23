import { useQuery, useMutation as useMutationRQ, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import React from 'react';
import { api, socket } from './api';

const queryClient = new QueryClient();

export const DataProvider = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

// --- Types ---

interface InquiryResponse<T = any> {
  item?: T;
  items?: T[];
  pagination?: { page: number; limit: number; total: number; pages: number };
}

interface MutationResponse {
  success: boolean;
  message: string;
}

// --- Hooks ---

/**
 * Hook for data inquiries
 * Returns [data, isLoading, pagination]
 * 
 * Automatically listens for `refresh:<source>` via Socket.io.
 * When the server emits that event, the data reloads silently.
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

  // Auto-listen for real-time invalidation using the source name
  useEffect(() => {
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: [source], exact: false })
    }

    socket.on(`refresh:${source}`, handler)
    return () => { socket.off(`refresh:${source}`, handler) }
  }, [source])

  const data = type === 'retrieve' ? query.data?.items : query.data?.item;
  const pagination = type === 'retrieve' ? query.data?.pagination : undefined;
  
  return [data, query.isLoading, pagination] as [typeof data, boolean, typeof pagination];
}

/**
 * Hook for data mutations
 * Returns [mutate, isPending]
 * 
 * Pass `refresh` as an array of source names to auto-invalidate after success.
 * Example: useMutation("inventory", "upsert", { refresh: ["inventory", "dashboard"] })
 */
export function useMutation<V = any>(
  source: string, 
  type: 'upsert' | 'purge',
  options: any = {},
  refresh: string | string[] = []
) {
  const refreshKeys = Array.isArray(refresh) ? refresh : [refresh]

  const mutation = useMutationRQ<MutationResponse, any, V>({
    mutationFn: (input: V) => api.post(`/mutation/${type}`, { source, input, options }).then(r => r.data),
    onSuccess: (data: MutationResponse) => {
      if (data.success) {
        refreshKeys.forEach(source => {
          socket.emit(`refresh:${source}`);
        });
      }
    },
    onError: (err: any) => {
      console.error(`Mutation ${type} error on ${source}:`, err.response?.data?.message || err.message);
    },
  });

  const mutate = (input: V, callback?: (_: boolean) => void) => {
    mutation.mutate(input, {
      onSuccess: (data: MutationResponse) => callback?.(data.success),
    });
  };

  return [mutate, mutation.isPending] as [typeof mutate, boolean];
}
