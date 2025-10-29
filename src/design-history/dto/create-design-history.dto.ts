import { IsInt, IsOptional, IsObject, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDesignHistoryDto {
  @ApiProperty({ type: Number })
  @IsInt()
  designId: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsInt()
  version?: number;

  @ApiProperty({ required: false, description: 'Snapshot of design data' })
  @IsOptional()
  @IsObject()
  dataSnapshot?: Record<string, any>;

  @ApiProperty({ required: false, type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsInt()
  order?: number;
}
