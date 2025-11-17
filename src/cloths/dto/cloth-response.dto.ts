import { ApiProperty } from '@nestjs/swagger';

class CategoryDto {
  @ApiProperty({ description: 'Category ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Category name', example: 'T-Shirts' })
  name: string;
}

export class ClothResponseDto {
  @ApiProperty({ description: 'Cloth ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Cloth name', example: 'Cool T-Shirt' })
  name: string;

  @ApiProperty({ description: 'Base price of the cloth', example: 19.99 })
  basePrice: number;

  @ApiProperty({ description: 'Cloth description', example: 'A very cool t-shirt', required: false })
  description?: string;

  @ApiProperty({ description: 'URL to the 3D model', example: 'https://example.com/model.glb', required: false })
  modelUrl?: string;

  @ApiProperty({ description: 'Category information', type: CategoryDto })
  category: CategoryDto;
}
