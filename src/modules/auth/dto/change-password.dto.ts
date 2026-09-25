import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const ChangePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z
    .string()
    .min(8)
    .max(128)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/,
      'Senha deve ter mínimo 8 caracteres, letras maiúsculas, minúsculas, número e caractere especial',
    ),
});

export class ChangePasswordDto extends createZodDto(ChangePasswordSchema) {}
