import { IsString, IsNumber, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClothDto {
  @ApiProperty({ required: false, type: Number, example: 19.99 })
  @IsNumber()
  @IsOptional()
  basePrice?: number;

  @ApiProperty({ required: false, type: String })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: true, type: Number, description: 'Category ID' })
  @IsInt()
  category: number;

  @ApiProperty({ required: false, type: String })
  @IsString()
  @IsOptional()
  modelUrl?: string;

  @ApiProperty({ required: true, type: String })
  @IsString()
  name: string;
}
