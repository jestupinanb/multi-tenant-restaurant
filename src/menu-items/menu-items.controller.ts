import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { RestaurantId } from '../common/decorators/restaurant-id.decorator';

@Controller('restaurants/:restaurantId/menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @RestaurantId() restaurantId: Types.ObjectId,
    @Body() dto: CreateMenuItemDto,
  ) {
    return this.menuItemsService.create(restaurantId, dto);
  }

  @Get()
  findAll(@RestaurantId() restaurantId: Types.ObjectId) {
    return this.menuItemsService.findAll(restaurantId);
  }

  @Get(':itemId')
  findOne(
    @RestaurantId() restaurantId: Types.ObjectId,
    @Param('itemId', ParseObjectIdPipe) itemId: Types.ObjectId,
  ) {
    return this.menuItemsService.findOne(restaurantId, itemId);
  }

  @Patch(':itemId')
  update(
    @RestaurantId() restaurantId: Types.ObjectId,
    @Param('itemId', ParseObjectIdPipe) itemId: Types.ObjectId,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.menuItemsService.update(restaurantId, itemId, dto);
  }

  @Delete(':itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @RestaurantId() restaurantId: Types.ObjectId,
    @Param('itemId', ParseObjectIdPipe) itemId: Types.ObjectId,
  ) {
    return this.menuItemsService.remove(restaurantId, itemId);
  }
}
