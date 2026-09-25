import { CreateUserSchema } from './create-user.dto';
import { atLeastOneField } from '../../../common/utils/zod.utils';
import { createZodDto } from 'nestjs-zod';

export const UpdateUserSchema = atLeastOneField(CreateUserSchema);

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
