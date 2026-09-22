import { historyAlertTypeSchema } from '@models';
import { z } from 'zod';

export const historyAlertTypesJsonSchema = z.toJSONSchema(
	z.array(historyAlertTypeSchema),
);
