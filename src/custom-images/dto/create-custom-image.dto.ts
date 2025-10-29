import { IsInt, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomImageDto {
  @ApiProperty({ type: Number })
  @IsInt()
  image: number;

  @ApiProperty({ required: false, description: 'Configuration for custom image' })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsInt()
  design?: number;
}
