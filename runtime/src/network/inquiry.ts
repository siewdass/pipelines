import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { z } from 'zod';
import { api, socket, queryClient } from './';

/**
 * Advanced recursive options for data filtering, sorting, and pagination.
 */
export const InquiryOptionsSchema: z.ZodType<unknown> = z.lazy(() => 
	z.object({
		filter: z.record(z.string(), z.unknown()).optional(),
		sort: z.record(z.string(), z.union([z.literal(1), z.literal(-1), z.number()])).optional(),
		pagination: z.object({
			page: z.number().optional(),
			limit: z.number().optional(),
		}).optional(),
	}).catchall(z.lazy(() => InquiryOptionsSchema))
);

export type InquiryOptions = z.infer<typeof InquiryOptionsSchema>;

/**
 * Standard parameters for an inquiry request.
 */
export const InquiryParamsSchema = z.object({
	source: z.string(),
	type: z.enum(['index', 'retrieve']),
	output: z.record(z.string(), z.union([z.number(), z.record(z.string(), z.unknown())])).optional(),
	options: InquiryOptionsSchema.optional(),
});

export type InquiryParams = z.infer<typeof InquiryParamsSchema>;

export interface InquiryResponse<T = unknown> {
	item?: T;
	items?: T[];
	pagination?: { page: number; limit: number; total: number; pages: number };
}

/**
 * Hook for data inquiries.
 * Returns [data, isLoading, pagination].
 * 
 * @param config Validated inquiry parameters.
 */
export function useInquiry<T = unknown>(config: InquiryParams) {
	InquiryParamsSchema.parse(config);
	const { source, type, output = {}, options = {} } = config;

	const query = useQuery<InquiryResponse<T>>({
		queryKey: [source, type, output, options],
		queryFn: () => api.post(`/inquiry/${type}`, { source, output, options }).then(r => r.data),
		retry: 3,
		staleTime: 60000,
	});

	useEffect(() => {
		const handler = () => {
			queryClient.invalidateQueries({ queryKey: [source], exact: false });
		};
		socket.on(`refresh:${source}`, handler);
		return () => { socket.off(`refresh:${source}`, handler); };
	}, [source]);

	const data = type === 'retrieve' ? query.data?.items : query.data?.item;
	const pagination = type === 'retrieve' ? query.data?.pagination : undefined;
	
	return [data, query.isLoading, pagination] as [typeof data, boolean, typeof pagination];
}
