import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class GeoPoint {
  @Prop({ type: String, enum: ['Point'], default: 'Point' })
  type!: 'Point';

  @Prop({
    type: [Number],
    required: true,
    validate: {
      validator: (c: number[]) =>
        c.length === 2 &&
        c[0] >= -180 &&
        c[0] <= 180 &&
        c[1] >= -90 &&
        c[1] <= 90,
      message: 'Coordenadas inválidas',
    },
  })
  coordinates!: [number, number];
}

export const GeoPointSchema = SchemaFactory.createForClass(GeoPoint);
