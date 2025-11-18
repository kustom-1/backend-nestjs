import { IsOptional, IsInt, IsBoolean, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DecalTransformDto } from './decal-transform.dto';

export class CreateDesignDto {
  @ApiProperty({
    description: 'User ID who owns this design',
    required: false,
    type: Number,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  user?: number;

  @ApiProperty({
    description: 'Cloth ID associated with this design',
    required: false,
    type: Number,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  cloth?: number;

  @ApiProperty({
    description: 'Base model image ID (3D model reference)',
    required: false,
    type: Number,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  baseModel?: number;

  @ApiProperty({
    description: 'Decal image ID (image to be applied on the model)',
    required: false,
    type: Number,
    example: 2,
  })
  @IsOptional()
  @IsInt()
  decalImage?: number;

  @ApiProperty({
    description: 'Base color in hex format',
    required: false,
    type: String,
    example: '#ffffff',
  })
  @IsOptional()
  @IsString()
  baseColor?: string;

  @ApiProperty({
    description: 'Decal transformation parameters',
    required: false,
    type: DecalTransformDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DecalTransformDto)
  decal?: DecalTransformDto;

  @ApiProperty({
    description: 'Whether the design is publicly visible',
    required: false,
    type: Boolean,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({
    description: 'Whether the design is active',
    required: false,
    type: Boolean,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
