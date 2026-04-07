import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import { RestaurantsService } from './restaurants.service';
import { Restaurant } from './schemas/restaurant.schema';

describe('RestaurantsService', () => {
  let service: RestaurantsService;

  const mockRestaurant = {
    _id: new Types.ObjectId(),
    name: 'Test Restaurant',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const updatedMockRestaurant = {
    ...mockRestaurant,
    name: 'Updated Restaurant',
  };

  const mockModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantsService,
        { provide: getModelToken(Restaurant.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get<RestaurantsService>(RestaurantsService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return { data, total } with all restaurants', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockRestaurant]),
      });

      const result = await service.findAll();

      expect(result).toEqual({ data: [mockRestaurant], total: 1 });
      expect(mockModel.find).toHaveBeenCalledTimes(1);
    });

    it('should return { data: [], total: 0 } when no restaurants exist', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findAll();

      expect(result).toEqual({ data: [], total: 0 });
    });
  });

  describe('findById', () => {
    it('should return restaurant when found', async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRestaurant),
      });

      const result = await service.findById(mockRestaurant._id);

      expect(result).toEqual(mockRestaurant);
      expect(mockModel.findById).toHaveBeenCalledWith(mockRestaurant._id);
    });

    it('should throw NotFoundException when restaurant not found', async () => {
      const id = new Types.ObjectId();
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findById(id)).rejects.toThrow(NotFoundException);
      await expect(service.findById(id)).rejects.toThrow(id.toString());
    });
  });

  describe('create', () => {
    it('should create and return a restaurant', async () => {
      mockModel.create.mockResolvedValue(mockRestaurant);

      const dto = { name: 'Test Restaurant' };
      const result = await service.create(dto);

      expect(result).toEqual(mockRestaurant);
      expect(mockModel.create).toHaveBeenCalledWith(dto);
    });

    it('should throw ConflictException on duplicate name (error code 11000)', async () => {
      mockModel.create.mockRejectedValue({ code: 11000 });

      await expect(service.create({ name: 'Test Restaurant' })).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create({ name: 'Test Restaurant' })).rejects.toThrow(
        'Restaurant with this name already exists',
      );
    });

    it('should re-throw non-11000 errors', async () => {
      const originalError = new Error('other');
      mockModel.create.mockRejectedValue(originalError);

      await expect(service.create({ name: 'Test Restaurant' })).rejects.toThrow(originalError);
    });
  });

  describe('update', () => {
    it('should update and return the restaurant', async () => {
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedMockRestaurant),
      });

      const dto = { name: 'Updated Restaurant' };
      const result = await service.update(mockRestaurant._id, dto);

      expect(result).toEqual(updatedMockRestaurant);
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockRestaurant._id,
        dto,
        { new: true },
      );
    });

    it('should throw NotFoundException when restaurant not found', async () => {
      const id = new Types.ObjectId();
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update(id, { name: 'Anything' })).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException on duplicate name during update', async () => {
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockRejectedValue({ code: 11000 }),
      });

      await expect(
        service.update(mockRestaurant._id, { name: 'Duplicate Name' }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.update(mockRestaurant._id, { name: 'Duplicate Name' }),
      ).rejects.toThrow('Restaurant with this name already exists');
    });
  });
});
