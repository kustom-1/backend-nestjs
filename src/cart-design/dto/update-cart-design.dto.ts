import { IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartDesignDto {
  @ApiProperty({
    required: false,
    type: Number,
    description: 'Updated quantity (subtotal will be automatically recalculated)',
    example: 3
  })
  @IsOptional()
  @IsInt()
  quantity?: number;
}
