import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsArray, ArrayMinSize, ArrayMaxSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DecalTransformDto {
  @ApiProperty({
    description: 'Scale factor of the decal',
    example: 0.35,
    type: Number,
  })
  @IsNumber()
  scale: number;

  @ApiProperty({
    description: 'Position coordinates [x, y, z] of the decal in 3D space',
    example: [-0.19964031679170438, 3.230041632845925, -23.165392805743632],
    type: [Number],
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  @IsNumber({}, { each: true })
  position: [number, number, number];

  @ApiProperty({
    description: 'Rotation angles [x, y, z] of the decal in degrees',
    example: [-89.99999167528105, -7.655592358121921e-8, -7.65559124581224e-8],
    type: [Number],
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  @IsNumber({}, { each: true })
  rotation: [number, number, number];

  @ApiProperty({
    description: 'Aspect ratio of the decal (width/height)',
    example: 0.5625,
    type: Number,
  })
  @IsNumber()
  aspectRatio: number;
}
