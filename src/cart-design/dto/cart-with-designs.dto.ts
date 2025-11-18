import { ApiProperty } from '@nestjs/swagger';
import { Cart } from '../../carts/cart.entity';
import { CartDesignItemDto } from './cart-design-item.dto';

export class CartWithDesignsDto {
  @ApiProperty({
    description: 'Cart details',
    type: () => Cart
  })
  cart: Cart;

  @ApiProperty({
    description: 'List of designs in this cart with their calculated prices',
    type: [CartDesignItemDto],
    isArray: true
  })
  designs: CartDesignItemDto[];

  @ApiProperty({
    description: 'Total number of designs in the cart',
    example: 3
  })
  totalDesigns: number;

  @ApiProperty({
    description: 'Total cart amount. Sum of all design subtotals. Each subtotal is calculated as: (cloth.basePrice * 1.20) * quantity',
    example: 125.75
  })
  totalAmount: number;
}
