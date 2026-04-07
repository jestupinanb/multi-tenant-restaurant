import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { OrdersService } from './orders.service';
import { Order } from './schemas/order.schema';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { MenuItemsService } from '../menu-items/menu-items.service';

describe('OrdersService', () => {
  let service: OrdersService;

  const restaurantId = new Types.ObjectId();
  const otherRestaurantId = new Types.ObjectId();
  const menuItemId1 = new Types.ObjectId();
  const menuItemId2 = new Types.ObjectId();

  const mockMenuItem1 = {
    _id: menuItemId1,
    restaurantId,
    name: 'Burger',
    price: 9.99,
  };

  const mockMenuItem2 = {
    _id: menuItemId2,
    restaurantId,
    name: 'Fries',
    price: 3.5,
  };

  const mockModel = {
    create: jest.fn(),
  };

  const mockRestaurantsService = {
    findById: jest.fn(),
  };

  const mockMenuItemsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken(Order.name), useValue: mockModel },
        { provide: RestaurantsService, useValue: mockRestaurantsService },
        { provide: MenuItemsService, useValue: mockMenuItemsService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);

    jest.clearAllMocks();
    // Default: restaurant exists
    mockRestaurantsService.findById.mockResolvedValue({
      _id: restaurantId,
      name: 'Test Restaurant',
    });
  });

  describe('create', () => {
    it('should create an order with correct fields (SCHEMA-03, ORDER-01)', async () => {
      const expectedOrder = {
        _id: new Types.ObjectId(),
        restaurantId,
        customerName: 'John Doe',
        items: [
          {
            menuItemId: menuItemId1,
            name: 'Burger',
            price: 9.99,
            quantity: 2,
          },
        ],
        totalAmount: 19.98,
        status: 'Pending',
      };

      mockMenuItemsService.findOne.mockResolvedValue(mockMenuItem1);
      mockModel.create.mockResolvedValue(expectedOrder);

      const dto = {
        customerName: 'John Doe',
        items: [{ menuItemId: menuItemId1.toHexString(), quantity: 2 }],
      };

      const result = await service.create(restaurantId, dto);

      expect(result).toEqual(expectedOrder);
      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          restaurantId,
          customerName: 'John Doe',
          items: [
            expect.objectContaining({
              menuItemId: menuItemId1,
              name: 'Burger',
              price: 9.99,
              quantity: 2,
            }),
          ],
          totalAmount: 19.98,
        }),
      );
    });

    it('should NOT include status in model.create call — relies on schema default (ORDER-04)', async () => {
      mockMenuItemsService.findOne.mockResolvedValue(mockMenuItem1);
      mockModel.create.mockResolvedValue({});

      const dto = {
        customerName: 'Jane Doe',
        items: [{ menuItemId: menuItemId1.toHexString(), quantity: 1 }],
      };

      await service.create(restaurantId, dto);

      const createArg = (
        mockModel.create.mock.calls as unknown[][]
      )[0][0] as Record<string, unknown>;
      expect(createArg).not.toHaveProperty('status');
    });

    it('should snapshot name and price from MenuItem lookup, not from DTO (SCHEMA-05)', async () => {
      const dbMenuItem = {
        _id: menuItemId1,
        restaurantId,
        name: 'DB Burger',
        price: 12.0,
      };

      mockMenuItemsService.findOne.mockResolvedValue(dbMenuItem);
      mockModel.create.mockResolvedValue({});

      const dto = {
        customerName: 'John Doe',
        items: [{ menuItemId: menuItemId1.toHexString(), quantity: 1 }],
      };

      await service.create(restaurantId, dto);

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [
            expect.objectContaining({
              name: 'DB Burger',
              price: 12.0,
            }),
          ],
        }),
      );
    });

    it('should calculate totalAmount as sum(price * quantity) rounded to 2dp (ORDER-02)', async () => {
      // item1: price=9.99, qty=2 → 19.98
      // item2: price=3.50, qty=3 → 10.50
      // total: 30.48
      mockMenuItemsService.findOne
        .mockResolvedValueOnce(mockMenuItem1) // 9.99
        .mockResolvedValueOnce(mockMenuItem2); // 3.50
      mockModel.create.mockResolvedValue({});

      const dto = {
        customerName: 'John Doe',
        items: [
          { menuItemId: menuItemId1.toHexString(), quantity: 2 },
          { menuItemId: menuItemId2.toHexString(), quantity: 3 },
        ],
      };

      await service.create(restaurantId, dto);

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ totalAmount: 30.48 }),
      );
    });

    it('should round totalAmount for floating-point precision (ORDER-02)', async () => {
      // 1.10 * 3 = 3.3000000000000003 in JS — should be 3.30
      const floatItem = {
        _id: menuItemId1,
        restaurantId,
        name: 'Coffee',
        price: 1.1,
      };
      mockMenuItemsService.findOne.mockResolvedValue(floatItem);
      mockModel.create.mockResolvedValue({});

      const dto = {
        customerName: 'John Doe',
        items: [{ menuItemId: menuItemId1.toHexString(), quantity: 3 }],
      };

      await service.create(restaurantId, dto);

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ totalAmount: 3.3 }),
      );

      const createArg = (
        mockModel.create.mock.calls as unknown[][]
      )[0][0] as Record<string, unknown>;
      // Verify it's NOT the floating-point imprecise value
      expect(createArg.totalAmount).not.toBe(3.3000000000000003);
    });

    it('should throw NotFoundException when menuItemId belongs to a different restaurant (ORDER-03)', async () => {
      mockMenuItemsService.findOne.mockRejectedValue(
        new NotFoundException(
          `MenuItem ${menuItemId1.toHexString()} not found`,
        ),
      );

      const dto = {
        customerName: 'John Doe',
        items: [{ menuItemId: menuItemId1.toHexString(), quantity: 1 }],
      };

      await expect(service.create(restaurantId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when restaurant does not exist (D-13)', async () => {
      mockRestaurantsService.findById.mockRejectedValue(
        new NotFoundException('Restaurant not found'),
      );

      const dto = {
        customerName: 'John Doe',
        items: [{ menuItemId: menuItemId1.toHexString(), quantity: 1 }],
      };

      await expect(service.create(restaurantId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should call restaurantsService.findById before processing items (D-13 fail-fast)', async () => {
      mockRestaurantsService.findById.mockRejectedValue(
        new NotFoundException('Restaurant not found'),
      );

      const dto = {
        customerName: 'John Doe',
        items: [{ menuItemId: menuItemId1.toHexString(), quantity: 1 }],
      };

      await expect(service.create(restaurantId, dto)).rejects.toThrow(
        NotFoundException,
      );

      // Verify menuItemsService was NOT called — restaurant check happens first
      expect(mockMenuItemsService.findOne).not.toHaveBeenCalled();
    });

    it('should not call menuItemsService when restaurant does not exist (D-13 ordering)', async () => {
      mockRestaurantsService.findById.mockRejectedValue(
        new NotFoundException('Restaurant not found'),
      );

      const dto = {
        customerName: 'John Doe',
        items: [{ menuItemId: menuItemId1.toHexString(), quantity: 1 }],
      };

      try {
        await service.create(otherRestaurantId, dto);
      } catch {
        // expected
      }

      expect(mockMenuItemsService.findOne).not.toHaveBeenCalled();
    });

    it('should convert string menuItemId to Types.ObjectId before calling menuItemsService.findOne', async () => {
      mockMenuItemsService.findOne.mockResolvedValue(mockMenuItem1);
      mockModel.create.mockResolvedValue({});

      const dto = {
        customerName: 'John Doe',
        items: [{ menuItemId: menuItemId1.toHexString(), quantity: 1 }],
      };

      await service.create(restaurantId, dto);

      expect(mockMenuItemsService.findOne).toHaveBeenCalledWith(
        restaurantId,
        expect.any(Types.ObjectId),
      );

      // Verify the ObjectId has the same hex value as the string input
      const calledWithObjectId = (
        mockMenuItemsService.findOne.mock.calls as unknown[][]
      )[0][1] as Types.ObjectId;
      expect(calledWithObjectId.toHexString()).toBe(menuItemId1.toHexString());
    });

    it('should handle multiple items and accumulate total correctly', async () => {
      mockMenuItemsService.findOne
        .mockResolvedValueOnce(mockMenuItem1) // Burger: 9.99 * 2 = 19.98
        .mockResolvedValueOnce(mockMenuItem2); // Fries: 3.50 * 1 = 3.50
      mockModel.create.mockResolvedValue({});

      const dto = {
        customerName: 'John Doe',
        items: [
          { menuItemId: menuItemId1.toHexString(), quantity: 2 },
          { menuItemId: menuItemId2.toHexString(), quantity: 1 },
        ],
      };

      await service.create(restaurantId, dto);

      // menuItemsService called twice (once per item)
      expect(mockMenuItemsService.findOne).toHaveBeenCalledTimes(2);

      // items array has length 2
      const createArg = (mockModel.create.mock.calls as unknown[][])[0][0] as {
        items: unknown[];
        totalAmount: number;
      };
      expect(createArg.items).toHaveLength(2);

      // totalAmount: 19.98 + 3.50 = 23.48
      expect(createArg.totalAmount).toBe(23.48);
    });

    it('should cross-tenant test: menuItemId from otherRestaurant rejects with NotFoundException (ORDER-03)', async () => {
      // Simulate MenuItemsService.findOne enforcing cross-tenant isolation with compound query
      mockMenuItemsService.findOne.mockRejectedValue(
        new NotFoundException(
          `MenuItem ${menuItemId1.toHexString()} not found in restaurant ${restaurantId.toHexString()}`,
        ),
      );

      const dto = {
        customerName: 'Attacker',
        items: [{ menuItemId: menuItemId1.toHexString(), quantity: 1 }],
      };

      await expect(service.create(restaurantId, dto)).rejects.toThrow(
        NotFoundException,
      );
      // model.create should never be called when item validation fails
      expect(mockModel.create).not.toHaveBeenCalled();
    });

    it('should include item snapshots with menuItemId from DB object (not raw string)', async () => {
      mockMenuItemsService.findOne.mockResolvedValue(mockMenuItem1);
      mockModel.create.mockResolvedValue({});

      const dto = {
        customerName: 'John Doe',
        items: [{ menuItemId: menuItemId1.toHexString(), quantity: 2 }],
      };

      await service.create(restaurantId, dto);

      // menuItemId in snapshot must come from found._id (a Types.ObjectId), not from DTO string
      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [
            expect.objectContaining({
              menuItemId: mockMenuItem1._id,
            }),
          ],
        }),
      );
    });
  });
});
