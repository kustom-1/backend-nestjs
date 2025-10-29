import { IsString, IsOptional, IsBoolean, IsInt, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateImageDto {
  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsString()
  url: string;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsInt()
  user?: number;

  @ApiProperty({ required: false, isArray: true, type: String })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
