import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MenuItemDocument = MenuItem & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_doc, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class MenuItem {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurantId!: Types.ObjectId;

  @Prop({ required: true, trim: true, minlength: 1, maxlength: 100 })
  name!: string;

  @Prop({ required: true, min: 0.01 })
  price!: number;

  @Prop({ maxlength: 500 })
  description?: string;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);

// SCHEMA-04: compound index for tenant-scoped queries (D-04)
// Unique prevents duplicate item names within a restaurant
MenuItemSchema.index({ restaurantId: 1, name: 1 }, { unique: true });
