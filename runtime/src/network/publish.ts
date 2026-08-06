import { useCallback } from 'react'
import { z } from 'zod'
import { socket, reconnect, getProjectId } from './'

/**
 * Standard parameters for an event publication.
 */
export const PublishParamsSchema = z.object({
	channel: z.string(),
	source: z.string().optional(),
})

export type PublishParams = z.infer<typeof PublishParamsSchema>;

/**
 * Structured emitter for sending real-time data or signals.
 * 
 * @param config Room/Operation flags.
 */
export function usePublish<T = unknown>(config: PublishParams) {
	PublishParamsSchema.parse(config)
	const { source, channel } = config

	const publish = useCallback((input: T) => {
		const projectId = getProjectId()
		if (!projectId) return
		reconnect().then(() => {
			socket.invoke('publish', {
				source,
				channel,
				input
			}).catch((err: any) => {
				console.error('[REALTIME] publish failed:', err?.message || err)
			})
		})
	}, [ source, channel ]) 

	return publish
}
