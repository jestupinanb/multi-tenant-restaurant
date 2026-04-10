import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { RestaurantsService } from '../../restaurants/restaurants.service';

@Injectable()
export class RestaurantExistsGuard implements CanActivate {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      params?: { restaurantId?: string };
      restaurantId?: Types.ObjectId;
    }>();
    const rawId = request.params?.restaurantId;

    // Routes without :restaurantId (e.g. health-check) pass through
    if (!rawId) {
      return true;
    }

    if (!Types.ObjectId.isValid(rawId)) {
      throw new BadRequestException(`Invalid id format: ${rawId}`);
    }

    const restaurantId = new Types.ObjectId(rawId);

    // Throws NotFoundException if restaurant doesn't exist
    await this.restaurantsService.findById(restaurantId);

    // Attach validated ObjectId to request for @RestaurantId() decorator
    request.restaurantId = restaurantId;

    return true;
  }
}
