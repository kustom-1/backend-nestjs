import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CartDesignService } from './cart-design.service';
import { CreateCartDesignDto } from './dto/create-cart-design.dto';
import { UpdateCartDesignDto } from './dto/update-cart-design.dto';
import { CartWithDesignsDto } from './dto/cart-with-designs.dto';
import { CartDesign } from './cart-design.entity';
import { AuthGuard } from '@nestjs/passport';
import { AbacGuard } from '../permissions/guards/abac.guard';
import { Resource, Action } from '../permissions/decorators/abac.decorator';

@ApiTags('Cart Design')
@ApiBearerAuth()
@Controller('cart-design')
export class CartDesignController {
  constructor(private readonly service: CartDesignService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('cart_design')
  @Action('read')
  @ApiOperation({
    summary: 'Get all carts with their designs',
    description: `Returns a list of all carts, each containing their associated designs with quantity and subtotal information.
    The designs are grouped by cart for easier consumption.

    **Price Calculation:**
    - Subtotal per item: (cloth.basePrice × 1.20) × quantity
    - The 20% markup is applied for custom design work
    - Total amount is the sum of all design subtotals in the cart`
  })
  @ApiResponse({
    status: 200,
    description: 'List of carts with their designs successfully retrieved',
    type: [CartWithDesignsDto]
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions to read cart designs'
  })
  findAll() {
    return this.service.findAll();
  }

  @Get('cart/:cartId')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('cart_design')
  @Action('read')
  @ApiOperation({
    summary: 'Get a specific cart with all its designs',
    description: `Returns a single cart with all associated designs, including detailed information about each design, quantities, and subtotals.

    **Price Calculation:**
    - Subtotal per item: (cloth.basePrice × 1.20) × quantity
    - The 20% markup is applied for custom design work
    - Total amount is the sum of all design subtotals in the cart`
  })
  @ApiParam({
    name: 'cartId',
    type: Number,
    description: 'The ID of the cart to retrieve',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Cart with designs successfully retrieved',
    type: CartWithDesignsDto
  })
  @ApiResponse({
    status: 404,
    description: 'No designs found for the specified cart'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions to read cart designs'
  })
  findByCart(@Param('cartId') cartId: number) {
    return this.service.findByCart(cartId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('cart_design')
  @Action('read')
  @ApiOperation({
    summary: 'Get a specific cart-design relationship',
    description: 'Returns a single cart-design relationship by its ID, including the design and cart details.'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the cart-design relationship',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Cart-design relationship successfully retrieved',
    type: CartDesign
  })
  @ApiResponse({
    status: 404,
    description: 'Cart-design relationship not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions to read cart designs'
  })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('cart_design')
  @Action('create')
  @ApiOperation({
    summary: 'Add a design to a cart',
    description: `Creates a new cart-design relationship, adding a design to a specific cart.

    **Automatic Price Calculation:**
    - The subtotal is calculated automatically based on the cloth's base price
    - Formula: (cloth.basePrice × 1.20) × quantity
    - No need to provide the subtotal in the request
    - The 20% markup covers custom design work`
  })
  @ApiResponse({
    status: 201,
    description: 'Design successfully added to cart with calculated subtotal',
    type: CartDesign
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions to create cart designs'
  })
  @ApiResponse({
    status: 404,
    description: 'Design not found'
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Error creating cart design'
  })
  create(@Body() dto: CreateCartDesignDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('cart_design')
  @Action('update')
  @ApiOperation({
    summary: 'Update a cart-design relationship',
    description: `Updates the quantity of a design in a cart.

    **Automatic Price Recalculation:**
    - When you update the quantity, the subtotal is automatically recalculated
    - Formula: (cloth.basePrice × 1.20) × new_quantity
    - You don't need to manually calculate or provide the subtotal`
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the cart-design relationship to update',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Cart-design relationship successfully updated with recalculated subtotal',
    type: CartDesign
  })
  @ApiResponse({
    status: 404,
    description: 'Cart-design relationship not found'
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions to update cart designs'
  })
  update(@Param('id') id: number, @Body() dto: UpdateCartDesignDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('cart_design')
  @Action('delete')
  @ApiOperation({
    summary: 'Remove a design from a cart',
    description: 'Deletes a cart-design relationship, removing a design from a specific cart.'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the cart-design relationship to delete',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Design successfully removed from cart',
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
  @ApiResponse({
    status: 404,
    description: 'Cart-design relationship not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions to delete cart designs'
  })
  delete(@Param('id') id: number) {
    return this.service.delete(id);
  }
}
