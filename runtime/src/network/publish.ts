import { useCallback } from 'react';
import { z } from 'zod';
import { socket } from './';

/**
 * Payload options for event publishing.
 */
export const PublishOptionsSchema = z.object({
	id: z.string().optional(),
	to: z.string().optional(),
}).catchall(z.unknown());

/**
 * Standard parameters for an event publication.
 */
export const PublishParamsSchema = z.object({
	source: z.string().optional(),
	options: PublishOptionsSchema.optional(),
});

export type PublishParams = z.infer<typeof PublishParamsSchema>;

/**
 * Structured emitter for sending real-time data or signals.
 * 
 * @param config Room/Operation flags.
 */
export function usePublish<T = unknown>(config: PublishParams = {}) {
	PublishParamsSchema.parse(config);
	const { source, options } = config;

	const publish = useCallback((input: T) => {
		socket.emit('publish', {
			source,
			input,
			options
		});
	}, [source, JSON.stringify(options)]); 

	return publish;
}
