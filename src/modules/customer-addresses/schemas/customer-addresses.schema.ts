import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  GeoPoint,
  GeoPointSchema,
} from '../../../common/schemas/geo-point.schema';

@Schema({ timestamps: true, collection: 'customer_addresses' })
export class CustomerAddresses {
  @Prop({ type: Types.ObjectId, ref: 'Users', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ trim: true, maxLength: 40 })
  label?: string;

  @Prop({ trim: true, match: /^\d{8}$/ })
  postalCode?: string;

  @Prop({ required: true, trim: true })
  street!: string;

  @Prop({ required: true, trim: true })
  number!: string;

  @Prop({ trim: true })
  complement?: string;

  @Prop({ trim: true })
  neighborhood?: string;

  @Prop({ required: true, trim: true })
  city!: string;

  @Prop({ required: true, uppercase: true, trim: true, match: /^[A-Z]{2}$/ })
  state!: string;

  @Prop({ trim: true })
  reference?: string;

  @Prop({ type: GeoPointSchema, required: true })
  location!: GeoPoint;

  @Prop({ default: false })
  isDefault!: boolean;
}

export type CustomerAddressesDocument = HydratedDocument<CustomerAddresses>;

export const CustomerAddressesSchema =
  SchemaFactory.createForClass(CustomerAddresses);

CustomerAddressesSchema.index({ location: '2dsphere' });

CustomerAddressesSchema.index(
  { userId: 1, isDefault: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } },
);
