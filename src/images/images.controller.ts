import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { AuthGuard } from '@nestjs/passport';
import { AbacGuard } from '../permissions/guards/abac.guard';
import { Resource, Action } from '../permissions/decorators/abac.decorator';

@ApiTags('Images')
@ApiBearerAuth()
@Controller('images')
export class ImagesController {
  constructor(private readonly service: ImagesService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('images')
  @Action('read')
  @ApiOperation({ summary: 'Get all images', description: 'Retrieve list of all design images' })
  @ApiResponse({ status: 200, description: 'List of images retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('images')
  @Action('read')
  @ApiOperation({ summary: 'Get image by ID', description: 'Retrieve a specific image by its ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Image ID' })
  @ApiResponse({ status: 200, description: 'Image found' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('images')
  @Action('create')
  @ApiOperation({ summary: 'Create image', description: 'Create a new design image' })
  @ApiBody({ type: CreateImageDto })
  @ApiResponse({ status: 201, description: 'Image created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() dto: CreateImageDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('images')
  @Action('update')
  @ApiOperation({ summary: 'Update image', description: 'Update an existing image' })
  @ApiParam({ name: 'id', type: 'number', description: 'Image ID' })
  @ApiBody({ type: UpdateImageDto })
  @ApiResponse({ status: 200, description: 'Image updated successfully' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  update(@Param('id') id: number, @Body() dto: UpdateImageDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('images')
  @Action('delete')
  @ApiOperation({ summary: 'Delete image', description: 'Delete a design image' })
  @ApiParam({ name: 'id', type: 'number', description: 'Image ID' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  delete(@Param('id') id: number) {
    return this.service.delete(id);
  }
}
