import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { CustomImagesService } from './custom-images.service';
import { CreateCustomImageDto } from './dto/create-custom-image.dto';
import { UpdateCustomImageDto } from './dto/update-custom-image.dto';
import { AuthGuard } from '@nestjs/passport';
import { AbacGuard } from '../permissions/guards/abac.guard';
import { Resource, Action } from '../permissions/decorators/abac.decorator';

@ApiTags('Custom Images')
@ApiBearerAuth()
@Controller('custom-images')
export class CustomImagesController {
  constructor(private readonly service: CustomImagesService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('custom_images')
  @Action('read')
  @ApiOperation({ summary: 'Get all custom images', description: 'Retrieve list of all user uploaded images' })
  @ApiResponse({ status: 200, description: 'List of custom images retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('custom_images')
  @Action('read')
  @ApiOperation({ summary: 'Get custom image by ID', description: 'Retrieve a specific custom image by its ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Custom Image ID' })
  @ApiResponse({ status: 200, description: 'Custom image found' })
  @ApiResponse({ status: 404, description: 'Custom image not found' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('custom_images')
  @Action('create')
  @ApiOperation({ summary: 'Create custom image', description: 'Upload a new custom image' })
  @ApiBody({ type: CreateCustomImageDto })
  @ApiResponse({ status: 201, description: 'Custom image created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() dto: CreateCustomImageDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('custom_images')
  @Action('update')
  @ApiOperation({ summary: 'Update custom image', description: 'Update an existing custom image' })
  @ApiParam({ name: 'id', type: 'number', description: 'Custom Image ID' })
  @ApiBody({ type: UpdateCustomImageDto })
  @ApiResponse({ status: 200, description: 'Custom image updated successfully' })
  @ApiResponse({ status: 404, description: 'Custom image not found' })
  update(@Param('id') id: number, @Body() dto: UpdateCustomImageDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('custom_images')
  @Action('delete')
  @ApiOperation({ summary: 'Delete custom image', description: 'Delete a custom image' })
  @ApiParam({ name: 'id', type: 'number', description: 'Custom Image ID' })
  @ApiResponse({ status: 200, description: 'Custom image deleted successfully' })
  @ApiResponse({ status: 404, description: 'Custom image not found' })
  delete(@Param('id') id: number) {
    return this.service.delete(id);
  }
}
