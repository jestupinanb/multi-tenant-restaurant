import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
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

  const mockModel = {
    findById: jest.fn(),
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
});
