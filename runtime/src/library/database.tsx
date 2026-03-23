import { useQuery, useMutation as useMutationRQ, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useCallback, useState } from 'react';
import React from 'react';
import { api, socket, reconnect } from './api';

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
export function useMutation<T = any>(
  source: string, 
  type: 'upsert' | 'purge',
  options: any = {},
  refresh: string | string[] = []
) {
  const refreshKeys = Array.isArray(refresh) ? refresh : [refresh]

  const mutation = useMutationRQ<MutationResponse, any, T>({
    mutationFn: (input: T) => api.post(`/mutation/${type}`, { source, input, options }).then(r => r.data),
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

  const mutate = (input: T, callback?: (_: boolean) => void) => {
    mutation.mutate(input, {
      onSuccess: (data: MutationResponse) => callback?.(data.success),
    });
  };

  return [mutate, mutation.isPending] as [typeof mutate, boolean];
}

/**
 * 3. useSubscription
 * Reactive real-time receiver that returns current state based on a 'source'.
 * 
 * @param source The resource name (e.g. 'inventory', 'chat'). Mandatory.
 * @param filter Optional filtering criteria (e.g. { category: 'toys' }).
 * @returns The latest data received from the real-time stream.
 */
export function useSubscription<T = any>(
	source: string,
	filter?: Record<string, any>
) {
	const [subscribe, setSubscribe] = useState<T | undefined>();

	useEffect(() => {
		// Ensure fresh connection on mount
		reconnect();

		// Tell the server to join our room and fetch historical data
		socket.emit('subscribe', { source, filter });

		// Smart handler: If state is array, it accumulates (unless payload is an array). If object, it replaces.
		const handler = (payload: any) => {
			setSubscribe(prev => {
				if (Array.isArray(prev) || Array.isArray(payload)) {
					// Server sent an initial array of latest items, or prev is already an array
					if (Array.isArray(payload)) return payload as unknown as T;
					// Server sent a new single event, append it to array
					return [...((prev as any[]) || []), payload] as unknown as T;
				}
				// Server sent an object, just replace it
				return payload as T;
			});
		};

		socket.on(source, handler);

		// Component teardown: Clean up the listener and leave the room
		return () => {
			socket.off(source, handler);
			socket.emit('unsubscribe', { source, filter });
		};
	}, [source, JSON.stringify(filter)]); // Effect re-runs if source or filter changes

	return subscribe;
}

/**
 * 4. usePublish
 * Structured emitter for sending real-time data or signals.
 * 
 * @param source The target resource name. Optional (for generic events).
 * @param options Room/Operation flags (e.g. { id: 'general', to: 'USER-ID' }).
 * @returns A function to publish data.
 */
export function usePublish<T = any>(
	source?: string,
	options?: Record<string, any>
) {
	/**
	 * Emit an event through the socket.
	 * If 'source' is present, the server knows which resource DB to target.
	 * 
	 * @param input The payload data (Must be an object).
	 */
	const publish = useCallback((input: T) => {
		socket.emit('publish', {
			source,
			input,
			options
		});
	}, [source, JSON.stringify(options)]); 

	return publish;
}
