import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Restaurant, RestaurantDocument } from './schemas/restaurant.schema';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
  ) {}

  async findAll(): Promise<{ data: RestaurantDocument[]; total: number }> {
    const data = await this.restaurantModel.find().exec();
    return { data, total: data.length };
  }

  async findById(id: Types.ObjectId): Promise<RestaurantDocument> {
    const restaurant = await this.restaurantModel.findById(id).exec();
    if (!restaurant) {
      throw new NotFoundException(`Restaurant ${id} not found`);
    }
    return restaurant;
  }

  async create(dto: CreateRestaurantDto): Promise<RestaurantDocument> {
    try {
      return await this.restaurantModel.create(dto);
    } catch (error) {
      if ((error as { code?: number })?.code === 11000) {
        throw new ConflictException('Restaurant with this name already exists');
      }
      throw error;
    }
  }

  async update(
    id: Types.ObjectId,
    dto: UpdateRestaurantDto,
  ): Promise<RestaurantDocument> {
    let updated: RestaurantDocument | null;
    try {
      updated = await this.restaurantModel
        .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
        .exec();
    } catch (error) {
      if ((error as { code?: number })?.code === 11000) {
        throw new ConflictException('Restaurant with this name already exists');
      }
      throw error;
    }
    if (!updated) throw new NotFoundException(`Restaurant ${id} not found`);
    return updated;
  }
}
