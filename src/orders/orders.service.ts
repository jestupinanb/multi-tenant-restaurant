import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderItem } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { MenuItemsService } from '../menu-items/menu-items.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    private readonly menuItemsService: MenuItemsService,
  ) {}

  async create(
    restaurantId: Types.ObjectId,
    dto: CreateOrderDto,
  ): Promise<OrderDocument> {
    // Iterate items: validate cross-tenant ownership and snapshot prices
    let total = 0;
    const snapshotItems: OrderItem[] = [];
    for (const item of dto.items) {
      const menuItemId = new Types.ObjectId(item.menuItemId);
      // Compound { _id, restaurantId } query — throws 404 on cross-tenant access
      const found = await this.menuItemsService.findOne(
        restaurantId,
        menuItemId,
      );
      snapshotItems.push({
        menuItemId: found._id,
        name: found.name,
        price: found.price,
        description: found.description ?? '',
        quantity: item.quantity,
      });
      total += found.price * item.quantity;
    }
    // Round to 2 decimal places
    const totalAmount = Math.round(total * 100) / 100;

    return this.orderModel.create({
      restaurantId,
      customerName: dto.customerName,
      items: snapshotItems,
      totalAmount,
    });
  }
}
