import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { ClothsService } from './cloths.service';
import { CreateClothDto } from './dto/create-cloth.dto';
import { UpdateClothDto } from './dto/update-cloth.dto';
import { AuthGuard } from '@nestjs/passport';
import { AbacGuard } from '../permissions/guards/abac.guard';
import { Resource, Action } from '../permissions/decorators/abac.decorator';

@ApiTags('Cloths')
@ApiBearerAuth()
@Controller('cloths')
export class ClothsController {
  constructor(private readonly service: ClothsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('cloths')
  @Action('read')
  @ApiOperation({ summary: 'Get all cloths', description: 'Retrieve list of all clothing items' })
  @ApiResponse({ status: 200, description: 'List of cloths retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('cloths')
  @Action('read')
  @ApiOperation({ summary: 'Get cloth by ID', description: 'Retrieve a specific cloth by its ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Cloth ID' })
  @ApiResponse({ status: 200, description: 'Cloth found' })
  @ApiResponse({ status: 404, description: 'Cloth not found' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('cloths')
  @Action('create')
  @ApiOperation({ summary: 'Create cloth', description: 'Create a new cloth item' })
  @ApiBody({ type: CreateClothDto })
  @ApiResponse({ status: 201, description: 'Cloth created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() dto: CreateClothDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('cloths')
  @Action('update')
  @ApiOperation({ summary: 'Update cloth', description: 'Update an existing cloth' })
  @ApiParam({ name: 'id', type: 'number', description: 'Cloth ID' })
  @ApiBody({ type: UpdateClothDto })
  @ApiResponse({ status: 200, description: 'Cloth updated successfully' })
  @ApiResponse({ status: 404, description: 'Cloth not found' })
  update(@Param('id') id: number, @Body() dto: UpdateClothDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('cloths')
  @Action('delete')
  @ApiOperation({ summary: 'Delete cloth', description: 'Delete a cloth item' })
  @ApiParam({ name: 'id', type: 'number', description: 'Cloth ID' })
  @ApiResponse({ status: 200, description: 'Cloth deleted successfully' })
  @ApiResponse({ status: 404, description: 'Cloth not found' })
  delete(@Param('id') id: number) {
    return this.service.delete(id);
  }
}
