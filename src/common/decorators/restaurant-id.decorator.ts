import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Types } from 'mongoose';

export const RestaurantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Types.ObjectId => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ restaurantId: Types.ObjectId }>();
    return request.restaurantId;
  },
);
