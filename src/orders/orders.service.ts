import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderItem } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { MenuItemsService } from '../menu-items/menu-items.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    private readonly restaurantsService: RestaurantsService,
    private readonly menuItemsService: MenuItemsService,
  ) {}

  async create(
    restaurantId: Types.ObjectId,
    dto: CreateOrderDto,
  ): Promise<OrderDocument> {
    // D-13: verify restaurant exists first (throws 404 if not)
    await this.restaurantsService.findById(restaurantId);

    // D-11 + D-12: iterate items, validate cross-tenant, snapshot prices
    let total = 0;
    const snapshotItems: OrderItem[] = [];
    for (const item of dto.items) {
      const menuItemId = new Types.ObjectId(item.menuItemId);
      // D-11: findOne uses compound { _id, restaurantId } — throws 404 on cross-tenant
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
    // D-12: round to 2 decimal places
    const totalAmount = Math.round(total * 100) / 100;

    // D-04: status defaults to 'Pending' via schema default
    return this.orderModel.create({
      restaurantId,
      customerName: dto.customerName,
      items: snapshotItems,
      totalAmount,
    });
  }
}
