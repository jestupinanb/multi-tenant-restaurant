import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MenuItem, MenuItemDocument } from './schemas/menu-item.schema';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { RestaurantsService } from '../restaurants/restaurants.service';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectModel(MenuItem.name)
    private readonly menuItemModel: Model<MenuItemDocument>,
    private readonly restaurantsService: RestaurantsService,
  ) {}

  async findAll(
    restaurantId: Types.ObjectId,
  ): Promise<{ data: MenuItemDocument[]; total: number }> {
    await this.restaurantsService.findById(restaurantId);
    const data = await this.menuItemModel.find({ restaurantId }).exec();
    return { data, total: data.length };
  }

  async findOne(
    restaurantId: Types.ObjectId,
    id: Types.ObjectId,
  ): Promise<MenuItemDocument> {
    await this.restaurantsService.findById(restaurantId);
    const item = await this.menuItemModel
      .findOne({ _id: id, restaurantId })
      .exec();
    if (!item)
      throw new NotFoundException(`MenuItem ${id.toString()} not found`);
    return item;
  }

  async create(
    restaurantId: Types.ObjectId,
    dto: CreateMenuItemDto,
  ): Promise<MenuItemDocument> {
    await this.restaurantsService.findById(restaurantId);
    try {
      return await this.menuItemModel.create({ ...dto, restaurantId });
    } catch (error) {
      if ((error as { code?: number })?.code === 11000) {
        throw new ConflictException(
          'Menu item with this name already exists in this restaurant',
        );
      }
      throw error;
    }
  }

  async update(
    restaurantId: Types.ObjectId,
    id: Types.ObjectId,
    dto: UpdateMenuItemDto,
  ): Promise<MenuItemDocument> {
    await this.restaurantsService.findById(restaurantId);
    let updated: MenuItemDocument | null;
    try {
      updated = await this.menuItemModel
        .findOneAndUpdate(
          { _id: id, restaurantId },
          { $set: dto },
          { new: true, runValidators: true },
        )
        .exec();
    } catch (error) {
      if ((error as { code?: number })?.code === 11000) {
        throw new ConflictException(
          'Menu item with this name already exists in this restaurant',
        );
      }
      throw error;
    }
    if (!updated)
      throw new NotFoundException(`MenuItem ${id.toString()} not found`);
    return updated;
  }

  async remove(
    restaurantId: Types.ObjectId,
    id: Types.ObjectId,
  ): Promise<void> {
    await this.restaurantsService.findById(restaurantId);
    const deleted = await this.menuItemModel
      .findOneAndDelete({ _id: id, restaurantId })
      .exec();
    if (!deleted)
      throw new NotFoundException(`MenuItem ${id.toString()} not found`);
  }
}
