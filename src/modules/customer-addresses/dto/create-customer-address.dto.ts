import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const requiredText = (message: string) => z.string().trim().min(1, message);
const optionalText = z.string().trim().optional();

export const GeoPointInputSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([
    z.number().min(-180).max(180), // longitude
    z.number().min(-90).max(90), // latitude
  ]),
});

export const CreateCustomerAddressSchema = z.object({
  label: z.string().trim().min(1).max(40).optional(),
  postalCode: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .pipe(z.string().regex(/^\d{8}$/, 'CEP inválido')),
  street: requiredText('Informe a Rua'),
  number: requiredText('Informe o Número'),
  complement: optionalText,
  neighborhood: optionalText,
  city: requiredText('Informe a Cidade'),
  state: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, 'UF inválida'),
  reference: optionalText,
  isDefault: z.boolean().optional(),
  location: GeoPointInputSchema.refine(
    ({ coordinates: [lng, lat] }) =>
      lng >= -74 && lng <= -34 && lat >= -34 && lat <= 6,
    'Coordenadas fora do Brasil',
  ).optional(),
});

export class CreateCustomerAddressDto extends createZodDto(
  CreateCustomerAddressSchema,
) {}
