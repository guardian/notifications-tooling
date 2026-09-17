import { z } from 'zod';

/**
 * Body sent by Grafana's SimpleJson datasource for `POST /grafana/query`.
 * Exactly one target is supported today: the `notifications` metric.
 */
export const grafanaQueryRequestSchema = z.object({
	range: z
		.object({
			from: z.iso.datetime().meta({
				description: 'Start of the Grafana dashboard time range.',
				example: '2026-09-01T00:00:00.000Z',
			}),
			to: z.iso.datetime().meta({
				description: 'End of the Grafana dashboard time range.',
				example: '2026-09-09T00:00:00.000Z',
			}),
		})
		.refine((range) => new Date(range.from) <= new Date(range.to), {
			message: 'range.from must not be after range.to.',
			path: ['from'],
		}),
	targets: z
		.array(
			z.object({
				target: z.literal('notifications').meta({
					description: 'The metric to query.',
					example: 'notifications',
				}),
				refId: z.string().optional().meta({ example: 'A' }),
			}),
		)
		.length(1),
});

export type GrafanaQueryRequest = z.infer<typeof grafanaQueryRequestSchema>;
