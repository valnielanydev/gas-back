import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RegisterSchema = z.object({
  cpf: z
    .string()
    .min(11, 'CPF must be at least 11 characters')
    .max(14, 'CPF must be at most 14 characters'),
  name: z.string().min(2).max(100),
  email: z.email().max(254),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/,
      'Senha deve ter mínimo 8 caracteres, letras maiúsculas, minúsculas, número e caractere especial',
    ),
  phone: z.string().min(10).max(15),
});

export class RegisterDto extends createZodDto(RegisterSchema) {}
