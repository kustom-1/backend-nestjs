import { IsOptional, IsInt, IsBoolean, IsObject } from 'class-validator';
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

  @ApiProperty({
    required: false,
    example: {
      baseModel: '/shirt.glb',
      baseColor: '#ffffff',
      decal: {
        imageUrl: '[inline-data-uri]',
        position: [-0.19964031679170438, 3.230041632845925, -23.165392805743632],
        rotation: [-89.99999167528105, -7.655592358121921e-8, -7.65559124581224e-8],
        scale: 0.35,
        aspectRatio: 0.5625,
      },
    },
  })
  @IsOptional()
  @IsObject()
  payload?: any;
}
