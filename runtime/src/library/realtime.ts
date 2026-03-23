import { useEffect, useCallback, useState } from 'react';
import { socket, reconnect } from './api';

/**
 * --- Hooks ---
 */

/**
 * 1. useSubscription
 * Reactive real-time receiver that returns current state based on a 'source'.
 * 
 * @param source The resource name (e.g. 'inventory', 'chat'). Mandatory.
 * @param initial Initial data (Must be an object or array).
 * @param query Optional filtering criteria (e.g. { category: 'toys' }).
 * @returns The latest data received from the real-time stream.
 */
export function useSubscription<T = any>(
	source: string,
	initial: T,
	options?: Record<string, any>
) {
	const [subscribe, setSubscribe] = useState<T>(initial);

	useEffect(() => {
		// Ensure fresh connection on mount
		reconnect();

		// If a query is provided, tell the server to filter our data room
		if (options) {
			socket.emit('subscribe', { source, options });
		}

		// The server emits specifically back to the 'source' channel
		const handler = (payload: T) => setSubscribe(payload);

		socket.on(source, handler);

		// Component teardown: Clean up the listener and leave the room if filtered
		return () => {
			socket.off(source, handler);
			if (options) {
				socket.emit('unsubscribe', { source, options });
			}
		};
	}, [source, JSON.stringify(options)]); // Effect re-runs if source or filter changes

	return subscribe;
}

/**
 * 2. usePublish
 * Structured emitter for sending real-time data or signals.
 * 
 * @param source The target resource name. Optional (for generic events).
 * @param options Additional operation flags (e.g. { isUrgent: true }).
 * @returns An array containing the [publish] function.
 */
export function usePublish(
	source?: string,
	options?: Record<string, any>
) {
	/**
	 * Emit an event through the socket.
	 * If 'source' is present, the server knows which resource DB to target.
	 * 
	 * @param event The action type (e.g. 'send', 'typing', 'refresh').
	 * @param data The payload data (Must be an object).
	 */
	const publish = useCallback((input: Record<string, any> = {}) => {
		socket.emit('publish', {
			source,
			input,
			options
		});
	}, [source]);

	return publish;
}
