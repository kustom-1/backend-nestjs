import { ApiProperty } from '@nestjs/swagger';
import { Design } from '../../designs/design.entity';

export class CartDesignItemDto {
  @ApiProperty({
    description: 'ID of the cart-design relationship',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Design details',
    type: () => Design
  })
  design: Design;

  @ApiProperty({
    description: 'Quantity of this design in the cart',
    example: 2
  })
  quantity: number;

  @ApiProperty({
    description: 'Subtotal for this design item. Calculated automatically as: (cloth.basePrice * 1.20) * quantity. The 20% markup is applied for custom designs.',
    example: 45.50
  })
  subtotal: number;
}
