import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { tenantScopePlugin } from '../../common/plugins/tenant-scope.plugin';

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

// Compound index for tenant-scoped queries
// Unique prevents duplicate item names within a restaurant
MenuItemSchema.index({ restaurantId: 1, name: 1 }, { unique: true });
MenuItemSchema.plugin(tenantScopePlugin);
