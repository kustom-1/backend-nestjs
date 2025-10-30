import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { AuthGuard } from '@nestjs/passport';
import { AbacGuard } from '../permissions/guards/abac.guard';
import { Resource, Action } from '../permissions/decorators/abac.decorator';

@ApiTags('Carts')
@ApiBearerAuth()
@Controller('carts')
export class CartsController {
  constructor(private readonly service: CartsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('carts')
  @Action('read')
  @ApiOperation({ summary: 'Get all carts', description: 'Retrieve list of all shopping carts' })
  @ApiResponse({ status: 200, description: 'List of carts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('carts')
  @Action('read')
  @ApiOperation({ summary: 'Get cart by ID', description: 'Retrieve a specific cart by its ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Cart ID' })
  @ApiResponse({ status: 200, description: 'Cart found' })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('carts')
  @Action('create')
  @ApiOperation({ summary: 'Create cart', description: 'Create a new shopping cart' })
  @ApiBody({ type: CreateCartDto })
  @ApiResponse({ status: 201, description: 'Cart created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() dto: CreateCartDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('carts')
  @Action('update')
  @ApiOperation({ summary: 'Update cart', description: 'Update an existing cart' })
  @ApiParam({ name: 'id', type: 'number', description: 'Cart ID' })
  @ApiBody({ type: UpdateCartDto })
  @ApiResponse({ status: 200, description: 'Cart updated successfully' })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  update(@Param('id') id: number, @Body() dto: UpdateCartDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('carts')
  @Action('delete')
  @ApiOperation({ summary: 'Delete cart', description: 'Delete a shopping cart' })
  @ApiParam({ name: 'id', type: 'number', description: 'Cart ID' })
  @ApiResponse({ status: 200, description: 'Cart deleted successfully' })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  delete(@Param('id') id: number) {
    return this.service.delete(id);
  }
}
