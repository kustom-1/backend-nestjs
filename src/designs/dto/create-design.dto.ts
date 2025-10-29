import { IsOptional, IsInt, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDesignDto {
  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsInt()
  user?: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsInt()
  cloth?: number;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
