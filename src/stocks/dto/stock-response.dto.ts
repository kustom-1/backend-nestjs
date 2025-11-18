import { ApiProperty } from '@nestjs/swagger';
import { ClothResponseDto } from '../../cloths/dto/cloth-response.dto';

export class StockResponseDto {
  @ApiProperty({ description: 'Stock ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Gender specification', example: 'Unisex', required: false })
  gender?: string;

  @ApiProperty({ description: 'Color variant', example: 'Blue', required: false })
  color?: string;

  @ApiProperty({ description: 'Size specification', example: 'M', required: false })
  size?: string;

  @ApiProperty({ description: 'Available stock quantity', example: 50 })
  stock: number;

  @ApiProperty({ description: 'Associated cloth item with category details', type: ClothResponseDto })
  cloth: ClothResponseDto;
}
