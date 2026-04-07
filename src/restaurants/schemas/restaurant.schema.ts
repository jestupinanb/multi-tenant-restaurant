import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RestaurantDocument = Restaurant & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_doc, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class Restaurant {
  @Prop({
    required: true,
    trim: true,
    unique: true,
    minlength: 1,
    maxlength: 100,
  })
  name: string;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
