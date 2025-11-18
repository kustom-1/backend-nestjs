import { IsInt, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartDto {
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
    description: 'Update the active status of the cart',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
