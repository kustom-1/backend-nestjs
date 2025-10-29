import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ type: String })
  @IsString()
  name: string;

  @ApiProperty({ required: false, type: String })
  @IsString()
  @IsOptional()
  description?: string;
}
