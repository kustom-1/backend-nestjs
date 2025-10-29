import { IsInt, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCartDesignDto {
  @ApiProperty({ type: Number })
  @IsInt()
  design: number;

  @ApiProperty({ type: Number })
  @IsInt()
  cart: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsInt()
  quantity?: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsNumber()
  subtotal?: number;
}
