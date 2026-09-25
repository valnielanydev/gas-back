import { z } from 'zod';

export const atLeastOneField = <T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
) =>
  schema.partial().refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser informado',
  });
