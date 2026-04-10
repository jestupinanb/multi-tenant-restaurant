import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { Types } from 'mongoose';
import { RestaurantExistsGuard } from './restaurant-exists.guard';
import { RestaurantsService } from '../../restaurants/restaurants.service';

describe('RestaurantExistsGuard', () => {
  let guard: RestaurantExistsGuard;

  const restaurantId = new Types.ObjectId();

  const mockRestaurantsService = {
    findById: jest.fn(),
  };

  interface MockRequest {
    params: Record<string, string>;
    restaurantId: Types.ObjectId | undefined;
  }

  function createMockContext(
    params: Record<string, string> = {},
  ): ExecutionContext {
    const request: MockRequest = { params, restaurantId: undefined };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    guard = new RestaurantExistsGuard(
      mockRestaurantsService as unknown as RestaurantsService,
    );
    jest.clearAllMocks();
  });

  it('should pass through when no restaurantId param exists', async () => {
    const context = createMockContext({});

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockRestaurantsService.findById).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException for invalid ObjectId format', async () => {
    const context = createMockContext({ restaurantId: 'not-a-valid-id' });

    await expect(guard.canActivate(context)).rejects.toThrow(
      BadRequestException,
    );
    expect(mockRestaurantsService.findById).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when restaurant does not exist', async () => {
    mockRestaurantsService.findById.mockRejectedValue(
      new NotFoundException('Restaurant not found'),
    );

    const context = createMockContext({
      restaurantId: restaurantId.toHexString(),
    });

    await expect(guard.canActivate(context)).rejects.toThrow(NotFoundException);
  });

  it('should attach validated restaurantId to request when restaurant exists', async () => {
    mockRestaurantsService.findById.mockResolvedValue({
      _id: restaurantId,
      name: 'Test Restaurant',
    });

    const context = createMockContext({
      restaurantId: restaurantId.toHexString(),
    });
    const request = context.switchToHttp().getRequest<MockRequest>();

    await guard.canActivate(context);

    expect(request.restaurantId).toBeInstanceOf(Types.ObjectId);
    expect(request.restaurantId!.toHexString()).toBe(
      restaurantId.toHexString(),
    );
  });

  it('should return true when restaurant exists', async () => {
    mockRestaurantsService.findById.mockResolvedValue({
      _id: restaurantId,
      name: 'Test Restaurant',
    });

    const context = createMockContext({
      restaurantId: restaurantId.toHexString(),
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });
});
