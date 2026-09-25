import { z } from 'zod';

export const UuidParamSchema = z.object({ id: z.uuid() });
export type UuidParamDto = z.infer<typeof UuidParamSchema>;
