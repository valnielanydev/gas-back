import { CreateCustomerAddressSchema } from './create-customer-address.dto';
import { atLeastOneField } from '../../../common/utils/zod.utils';
import { createZodDto } from 'nestjs-zod';

export const UpdateCustomerAddressSchema = atLeastOneField(
  CreateCustomerAddressSchema,
);

export class UpdateCustomerAddressDto extends createZodDto(
  UpdateCustomerAddressSchema,
) {}
