import { IsInt, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsInt()
  quantity?: number;

  @ApiProperty({ type: Number })
  @IsInt()
  user: number;

  @ApiProperty({ required: false, type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsInt()
  address?: number;
}
