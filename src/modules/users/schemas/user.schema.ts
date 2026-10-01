import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<Users>;

export enum UserRole {
  MASTER = 'master',
  RESELLER = 'reseller_admin',
  DRIVER = 'driver',
  CUSTOMER = 'customer',
}

@Schema({ timestamps: true })
export class Users {
  @Prop({ required: true, unique: true })
  cpf!: string;

  @Prop({ required: true, select: false })
  password!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ select: false })
  refreshToken?: string;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.CUSTOMER,
  })
  role!: string;

  @Prop()
  resellerId?: string;

  @Prop({ required: true, unique: true })
  phone!: string;
}

export const UsersSchema = SchemaFactory.createForClass(Users);
