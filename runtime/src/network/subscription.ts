import { useEffect, useState } from 'react';
import { z } from 'zod';
import { socket, reconnect } from './';

/**
 * Valid parameters for a real-time subscription.
 */
export const SubscriptionParamsSchema = z.object({
	source: z.string(),
	filter: z.record(z.string(), z.unknown()).and(z.object({ id: z.string().optional() })).optional(),
});

export type SubscriptionParams = z.infer<typeof SubscriptionParamsSchema>;

/**
 * Reactive real-time receiver that returns current state based on a 'source'.
 * 
 * @param config Validated subscription criteria.
 */
export function useSubscription<T = unknown>(config: SubscriptionParams) {
	SubscriptionParamsSchema.parse(config);
	const { source, filter } = config;
	const [subscribe, setSubscribe] = useState<T | undefined>();

	useEffect(() => {
		reconnect();
		socket.emit('subscribe', { source, filter });
		const handler = (payload: unknown) => {
			setSubscribe(prev => {
				if (Array.isArray(prev) || Array.isArray(payload)) {
					if (Array.isArray(payload)) return payload as unknown as T;
					return [...((prev as unknown[]) || []), payload] as unknown as T;
				}
				return payload as T;
			});
		};
		socket.on(source, handler);
		return () => {
			socket.off(source, handler);
			socket.emit('unsubscribe', { source, filter });
		};
	}, [source, JSON.stringify(filter)]);

	return subscribe;
}
