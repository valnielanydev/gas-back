import { Param } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { UuidParamSchema } from '../dto/uuid-param.dto';

export const UuidParam = () => Param(new ZodValidationPipe(UuidParamSchema));
