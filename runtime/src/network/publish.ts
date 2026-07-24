import { useCallback } from 'react'
import { z } from 'zod'
import { socket } from './'

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
		socket.emit('publish', {
			source,
			input,
			channel
		})
	}, [ source, channel ]) 

	return publish
}
