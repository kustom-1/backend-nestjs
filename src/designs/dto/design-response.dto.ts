import { ApiProperty } from '@nestjs/swagger';
import { DecalTransformDto } from './decal-transform.dto';

class ImageResponseDto {
  @ApiProperty({ description: 'Image ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Image URL', example: 'https://example.com/image.png' })
  url: string;

  @ApiProperty({
    description: 'Image tags',
    example: ['texture', '3d-model'],
    type: [String],
    required: false,
  })
  tags?: string[];
}

class UserResponseDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Username', example: 'john_doe' })
  username: string;
}

class ClothBasicDto {
  @ApiProperty({ description: 'Cloth ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Cloth name', example: 'Cool T-Shirt' })
  name: string;
}

export class DesignResponseDto {
  @ApiProperty({ description: 'Design ID', example: 1 })
  id: number;

  @ApiProperty({
    description: 'User who owns this design',
    type: UserResponseDto,
    required: false,
  })
  user?: UserResponseDto;

  @ApiProperty({
    description: 'Associated cloth item',
    type: ClothBasicDto,
    required: false,
  })
  cloth?: ClothBasicDto;

  @ApiProperty({
    description: 'Base model image (3D model reference)',
    type: ImageResponseDto,
    required: false,
  })
  baseModel?: ImageResponseDto;

  @ApiProperty({
    description: 'Decal image (image applied on the model)',
    type: ImageResponseDto,
    required: false,
  })
  decalImage?: ImageResponseDto;

  @ApiProperty({
    description: 'Base color in hex format',
    example: '#ffffff',
    required: false,
  })
  baseColor?: string;

  @ApiProperty({
    description: 'Decal transformation parameters',
    type: DecalTransformDto,
    required: false,
  })
  decal?: DecalTransformDto;

  @ApiProperty({
    description: 'Whether the design is publicly visible',
    example: false,
  })
  isPublic: boolean;

  @ApiProperty({
    description: 'Whether the design is active',
    example: true,
  })
  isActive: boolean;
}
