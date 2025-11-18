import { IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCartDesignDto {
  @ApiProperty({
    type: Number,
    description: 'ID of the design to add to the cart',
    example: 5
  })
  @IsInt()
  design: number;

  @ApiProperty({
    type: Number,
    description: 'ID of the cart',
    example: 1
  })
  @IsInt()
  cart: number;

  @ApiProperty({
    required: false,
    type: Number,
    description: 'Quantity of this design (defaults to 1)',
    example: 2,
    default: 1
  })
  @IsOptional()
  @IsInt()
  quantity?: number;
}
