import { useMutation as useMutationRQ } from '@tanstack/react-query'
import { z } from 'zod'
import { api, socket } from './'

/**
 * Configuration for data persistence operations.
 */
export const MutationOptionsSchema: z.ZodType<unknown> = z.lazy(() => 
	z.object({
		uniques: z.array(z.string()).optional(),
		bridge: z.record(z.string(), z.string()).optional(),
		audit: z.boolean().optional(),
	}).catchall(z.lazy(() => MutationOptionsSchema))
)

export type MutationOptions = z.infer<typeof MutationOptionsSchema>;

/**
 * Standard parameters for a mutation request.
 */
export const MutationParamsSchema = z.object({
	source: z.string(),
	type: z.enum([ 'upsert', 'purge' ]),
	options: MutationOptionsSchema.optional(),
	refresh: z.union([ z.string(), z.array(z.string()) ]).optional(),
})

export type MutationParams = z.infer<typeof MutationParamsSchema>;

export interface MutationResponse {
	success: boolean;
	message: string;
}

/**
 * Hook for data mutations.
 * Returns [mutate, isPending].
 * 
 * @param config Validated mutation parameters.
 */
export function useMutation<T = unknown>(config: MutationParams) {
	MutationParamsSchema.parse(config)
	const { source, type, options = {}, refresh = [] } = config
	const refreshKeys = Array.isArray(refresh) ? refresh : [ refresh ]

	const mutation = useMutationRQ<MutationResponse, unknown, T>({
		mutationFn: (input: T) => api.post(`/mutation/${type}`, { source, input, options }).then(r => r.data),
		onSuccess: (data: MutationResponse) => {
			if (data.success) {
				refreshKeys.forEach(source => {
					socket.emit(`refresh:${source}`)
				})
			}
		},
		onError: (err: any) => {
			console.error(`Mutation ${type} error on ${source}:`, err.response?.data?.message || err.message)
		},
	})

	const mutate = (input: T, callback?: (success: boolean) => void) => {
		mutation.mutate(input, {
			onSuccess: (data: MutationResponse) => callback?.(data.success),
		})
	}

	return [ mutate, mutation.isPending ] as [typeof mutate, boolean]
}
