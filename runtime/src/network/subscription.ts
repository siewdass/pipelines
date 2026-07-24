import { useEffect, useState } from 'react'
import { z } from 'zod'
import { socket, reconnect } from './'

/**
 * Valid parameters for a real-time subscription.
 */
export const SubscriptionParamsSchema = z.object({
	channel: z.string(),
	source: z.string().optional(),
})

export type SubscriptionParams = z.infer<typeof SubscriptionParamsSchema>;

/**
 * Reactive real-time receiver that returns current state based on a 'source'.
 * 
 * @param config Validated subscription criteria.
 */
export function useSubscription<T = unknown>(config: SubscriptionParams) {
	SubscriptionParamsSchema.parse(config)
	const { channel, source } = config
	const [ subscribe, setSubscribe ] = useState<T | undefined>()

	useEffect(() => {
		reconnect()
		const eventName = source || channel
		socket.emit('subscribe', { source, channel })

		const handler = (payload: unknown) => {
			setSubscribe(prev => {
				if (Array.isArray(prev) || Array.isArray(payload)) {
					if (Array.isArray(payload)) return payload as unknown as T
					return [ ...((prev as unknown[]) || []), payload ] as unknown as T
				}
				return payload as T
			})
		}

		socket.on(eventName, handler)
		return () => {
			socket.off(eventName, handler)
			socket.emit('unsubscribe', { source, channel })
		}
	}, [ source, channel ])

	return subscribe
}
