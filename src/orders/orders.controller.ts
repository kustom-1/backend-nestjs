import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { AbacGuard } from '../permissions/guards/abac.guard';
import { Resource, Action } from '../permissions/decorators/abac.decorator';

@Controller('order')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('order')
  @Action('read')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('order')
  @Action('read')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('order')
  @Action('create')
  create(@Body() dto: CreateOrderDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('order')
  @Action('update')
  update(@Param('id') id: number, @Body() dto: UpdateOrderDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('order')
  @Action('delete')
  delete(@Param('id') id: number) {
    return this.service.delete(id);
  }
}
