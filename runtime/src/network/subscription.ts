import { useEffect, useState } from 'react'
import { z } from 'zod'
import { socket, reconnect, getProjectId, buildChannelName } from './'

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
	const [ data, setData ] = useState<T | undefined>()

	useEffect(() => {
		const projectId = getProjectId()
		if (!projectId) return

		const channelName = buildChannelName(projectId, source, channel)

		let active = true
		let consumer: any

		reconnect().then(() => {
			if (!active) return

			const scChannel = socket.subscribe(channelName)
			consumer = scChannel.createConsumer()

			const loop = async () => {
				while (active) {
					const { value, done } = await consumer.next()
					if (done) break
					if (value === undefined) continue
					setData(prev => {
						if (Array.isArray(prev) || Array.isArray(value)) {
							if (Array.isArray(value)) return value as unknown as T
							return [ ...((prev as unknown[]) || []), value ] as unknown as T
						}
						return value as T
					})
				}
			}
			loop()
		})

		return () => {
			active = false
			consumer?.kill?.()
			socket.unsubscribe(channelName)
		}
	}, [ source, channel ])

	return data
}
