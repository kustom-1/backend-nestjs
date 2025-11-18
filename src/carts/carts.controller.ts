import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart } from './cart.entity';
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
  @ApiOperation({
    summary: 'Get all carts',
    description: 'Retrieve list of all shopping carts with user information and active status'
  })
  @ApiResponse({
    status: 200,
    description: 'List of carts retrieved successfully',
    type: [Cart]
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll() {
    return this.service.findAll();
  }

  @Get('user/:userId')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('carts')
  @Action('read')
  @ApiOperation({
    summary: 'Get carts by user',
    description: `Retrieve all carts for a specific user. Optionally filter by active status.

    **Use Cases:**
    - Get all carts for a user (active and inactive)
    - Get only active carts for a user by setting activeOnly=true
    - Useful for checking if a user has an active shopping session`
  })
  @ApiParam({
    name: 'userId',
    type: Number,
    description: 'The ID of the user',
    example: 1
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'If true, only return active carts. If false or omitted, return all carts.',
    example: true
  })
  @ApiResponse({
    status: 200,
    description: 'List of user carts retrieved successfully',
    type: [Cart]
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findByUser(
    @Param('userId') userId: number,
    @Query('activeOnly') activeOnly?: string
  ) {
    const isActiveOnly = activeOnly === 'true';
    return this.service.findByUser(userId, isActiveOnly);
  }

  @Get('user/:userId/active')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('carts')
  @Action('read')
  @ApiOperation({
    summary: 'Get active cart for a user',
    description: `Retrieve the active cart for a specific user.

    **Use Case:**
    - Returns the current active shopping cart for the user
    - Returns null if the user has no active cart
    - Useful for continuing a shopping session or checking cart status`
  })
  @ApiParam({
    name: 'userId',
    type: Number,
    description: 'The ID of the user',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Active cart retrieved successfully (or null if no active cart)',
    type: Cart,
    schema: {
      oneOf: [
        { $ref: '#/components/schemas/Cart' },
        { type: 'null' }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findActiveCartByUser(@Param('userId') userId: number) {
    return this.service.findActiveCartByUser(userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('carts')
  @Action('read')
  @ApiOperation({
    summary: 'Get cart by ID',
    description: 'Retrieve a specific cart by its ID, including user information and active status'
  })
  @ApiParam({ name: 'id', type: 'number', description: 'Cart ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Cart found',
    type: Cart
  })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('carts')
  @Action('create')
  @ApiOperation({
    summary: 'Create cart',
    description: `Create a new shopping cart for a user.

    **Default Values:**
    - isActive defaults to true if not specified
    - Creates an active cart by default for immediate use`
  })
  @ApiBody({ type: CreateCartDto })
  @ApiResponse({
    status: 201,
    description: 'Cart created successfully',
    type: Cart
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  create(@Body() dto: CreateCartDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('carts')
  @Action('update')
  @ApiOperation({
    summary: 'Update cart',
    description: `Update an existing cart's properties.

    **Common Use Cases:**
    - Set isActive to false to mark a cart as completed/inactive
    - Set isActive to true to reactivate a cart
    - Change the user associated with the cart`
  })
  @ApiParam({ name: 'id', type: 'number', description: 'Cart ID', example: 1 })
  @ApiBody({ type: UpdateCartDto })
  @ApiResponse({
    status: 200,
    description: 'Cart updated successfully',
    type: Cart
  })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  update(@Param('id') id: number, @Body() dto: UpdateCartDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('carts')
  @Action('delete')
  @ApiOperation({
    summary: 'Delete cart',
    description: `Permanently delete a shopping cart.

    **Note:** Consider using PUT to set isActive=false instead of deleting,
    to preserve cart history and allow for potential recovery.`
  })
  @ApiParam({ name: 'id', type: 'number', description: 'Cart ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Cart deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Deleted'
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  delete(@Param('id') id: number) {
    return this.service.delete(id);
  }
}
