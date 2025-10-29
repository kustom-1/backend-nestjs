import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CartDesignService } from './cart-design.service';
import { CreateCartDesignDto } from './dto/create-cart-design.dto';
import { UpdateCartDesignDto } from './dto/update-cart-design.dto';
import { AuthGuard } from '@nestjs/passport';
import { AbacGuard } from '../permissions/guards/abac.guard';
import { Resource, Action } from '../permissions/decorators/abac.decorator';

@Controller('cart-design')
export class CartDesignController {
  constructor(private readonly service: CartDesignService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('cart_design')
  @Action('read')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('cart_design')
  @Action('read')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('cart_design')
  @Action('create')
  create(@Body() dto: CreateCartDesignDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('cart_design')
  @Action('update') 
  update(@Param('id') id: number, @Body() dto: UpdateCartDesignDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('cart_design')
  @Action('delete')
  delete(@Param('id') id: number) {
    return this.service.delete(id);
  }
}
