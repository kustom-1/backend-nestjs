import { IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCartDto {
  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsInt()
  user?: number;
}
