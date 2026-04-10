import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Types } from 'mongoose';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { RestaurantId } from '../common/decorators/restaurant-id.decorator';

@Controller('restaurants/:restaurantId/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @RestaurantId() restaurantId: Types.ObjectId,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(restaurantId, dto);
  }
}
