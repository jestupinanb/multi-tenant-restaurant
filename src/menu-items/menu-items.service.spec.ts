import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import { MenuItemsService } from './menu-items.service';
import { MenuItem } from './schemas/menu-item.schema';
import { RestaurantsService } from '../restaurants/restaurants.service';

describe('MenuItemsService', () => {
  let service: MenuItemsService;

  const restaurantId = new Types.ObjectId();
  const otherRestaurantId = new Types.ObjectId();
  const itemId = new Types.ObjectId();

  const mockMenuItem = {
    _id: itemId,
    restaurantId,
    name: 'Test Burger',
    price: 9.99,
    description: 'A test burger',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const updatedMockMenuItem = {
    ...mockMenuItem,
    price: 14.99,
  };

  const mockModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
    create: jest.fn(),
  };

  const mockRestaurantsService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuItemsService,
        { provide: getModelToken(MenuItem.name), useValue: mockModel },
        { provide: RestaurantsService, useValue: mockRestaurantsService },
      ],
    }).compile();

    service = module.get<MenuItemsService>(MenuItemsService);

    jest.clearAllMocks();
    // Default: restaurant exists (D-01 base case)
    mockRestaurantsService.findById.mockResolvedValue({
      _id: restaurantId,
      name: 'Test Restaurant',
    });
  });

  describe('findAll', () => {
    it('should return { data, total } with items for the given restaurantId', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockMenuItem]),
      });

      const result = await service.findAll(restaurantId);

      expect(result).toEqual({ data: [mockMenuItem], total: 1 });
      expect(mockModel.find).toHaveBeenCalledWith({ restaurantId });
      expect(mockRestaurantsService.findById).toHaveBeenCalledWith(restaurantId);
    });

    it('should return { data: [], total: 0 } when no items exist for restaurant', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findAll(restaurantId);

      expect(result).toEqual({ data: [], total: 0 });
    });

    it('should throw NotFoundException when restaurant does not exist (D-01)', async () => {
      mockRestaurantsService.findById.mockRejectedValue(
        new NotFoundException('Restaurant not found'),
      );

      await expect(service.findAll(restaurantId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return menu item when found with matching restaurantId', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockMenuItem),
      });

      const result = await service.findOne(restaurantId, itemId);

      expect(result).toEqual(mockMenuItem);
      expect(mockModel.findOne).toHaveBeenCalledWith({ _id: itemId, restaurantId });
    });

    it('should throw NotFoundException when item belongs to different restaurant (MENU-07)', async () => {
      // Compound query { _id: itemId, restaurantId: otherRestaurantId } returns null
      // This simulates the cross-tenant isolation — the item exists but belongs to another restaurant
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(otherRestaurantId, itemId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when item not found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(restaurantId, itemId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when restaurant does not exist (D-01)', async () => {
      mockRestaurantsService.findById.mockRejectedValue(
        new NotFoundException('Restaurant not found'),
      );

      await expect(service.findOne(restaurantId, itemId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create item with restaurantId from parameter (not DTO)', async () => {
      mockModel.create.mockResolvedValue(mockMenuItem);

      const dto = { name: 'Test Burger', price: 9.99, description: 'A test burger' };
      const result = await service.create(restaurantId, dto);

      expect(result).toEqual(mockMenuItem);
      expect(mockModel.create).toHaveBeenCalledWith({ ...dto, restaurantId });
      expect(mockRestaurantsService.findById).toHaveBeenCalledWith(restaurantId);
    });

    it('should throw ConflictException on duplicate name (error code 11000)', async () => {
      mockModel.create.mockRejectedValue({ code: 11000 });

      await expect(
        service.create(restaurantId, { name: 'Test Burger', price: 9.99 }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.create(restaurantId, { name: 'Test Burger', price: 9.99 }),
      ).rejects.toThrow('Menu item with this name already exists in this restaurant');
    });

    it('should re-throw non-11000 errors', async () => {
      const originalError = new Error('database error');
      mockModel.create.mockRejectedValue(originalError);

      await expect(
        service.create(restaurantId, { name: 'Test Burger', price: 9.99 }),
      ).rejects.toThrow(originalError);
    });

    it('should throw NotFoundException when restaurant does not exist (D-01)', async () => {
      mockRestaurantsService.findById.mockRejectedValue(
        new NotFoundException('Restaurant not found'),
      );

      await expect(
        service.create(restaurantId, { name: 'Test Burger', price: 9.99 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the menu item', async () => {
      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedMockMenuItem),
      });

      const dto = { price: 14.99 };
      const result = await service.update(restaurantId, itemId, dto);

      expect(result).toEqual(updatedMockMenuItem);
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: itemId, restaurantId },
        dto,
        { new: true, runValidators: true },
      );
    });

    it('should throw NotFoundException when item not found', async () => {
      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update(restaurantId, itemId, { price: 14.99 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException on duplicate name during update', async () => {
      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockRejectedValue({ code: 11000 }),
      });

      await expect(
        service.update(restaurantId, itemId, { name: 'Duplicate Name' }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.update(restaurantId, itemId, { name: 'Duplicate Name' }),
      ).rejects.toThrow('Menu item with this name already exists in this restaurant');
    });

    it('should use compound query { _id, restaurantId } to prevent IDOR (D-11)', async () => {
      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedMockMenuItem),
      });

      await service.update(restaurantId, itemId, { price: 14.99 });

      // CRITICAL: verify compound query is used, not just _id alone
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: itemId, restaurantId },
        expect.anything(),
        expect.anything(),
      );
    });

    it('should throw NotFoundException when restaurant does not exist (D-01)', async () => {
      mockRestaurantsService.findById.mockRejectedValue(
        new NotFoundException('Restaurant not found'),
      );

      await expect(
        service.update(restaurantId, itemId, { price: 14.99 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete the item and return void', async () => {
      mockModel.findOneAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockMenuItem),
      });

      const result = await service.remove(restaurantId, itemId);

      expect(result).toBeUndefined();
      expect(mockModel.findOneAndDelete).toHaveBeenCalledWith({
        _id: itemId,
        restaurantId,
      });
    });

    it('should throw NotFoundException when item not found for deletion', async () => {
      mockModel.findOneAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove(restaurantId, itemId)).rejects.toThrow(NotFoundException);
    });

    it('should use compound query { _id, restaurantId } to prevent IDOR (D-11)', async () => {
      mockModel.findOneAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockMenuItem),
      });

      await service.remove(restaurantId, itemId);

      // CRITICAL: verify compound query is used for cross-tenant isolation
      expect(mockModel.findOneAndDelete).toHaveBeenCalledWith({
        _id: itemId,
        restaurantId,
      });
    });

    it('should throw NotFoundException when restaurant does not exist (D-01)', async () => {
      mockRestaurantsService.findById.mockRejectedValue(
        new NotFoundException('Restaurant not found'),
      );

      await expect(service.remove(restaurantId, itemId)).rejects.toThrow(NotFoundException);
    });
  });
});
