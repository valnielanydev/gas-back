import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const LoginSchema = z.object({
  cpf: z
    .string()
    .min(11, 'CPF must be at least 11 characters')
    .max(14, 'CPF must be at most 14 characters'),
  password: z.string().min(8).max(128),
});

export class LoginDto extends createZodDto(LoginSchema) {}
