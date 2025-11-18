import { IsInt, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCartDto {
  @ApiProperty({
    required: false,
    type: Number,
    description: 'ID of the user who owns this cart',
    example: 1
  })
  @IsOptional()
  @IsInt()
  user?: number;

  @ApiProperty({
    required: false,
    type: Boolean,
    description: 'Whether the cart is active or not (defaults to true)',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
