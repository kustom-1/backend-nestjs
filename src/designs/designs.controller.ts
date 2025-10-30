import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { DesignsService } from './designs.service';
import { CreateDesignDto } from './dto/create-design.dto';
import { UpdateDesignDto } from './dto/update-design.dto';
import { AuthGuard } from '@nestjs/passport';
import { AbacGuard } from '../permissions/guards/abac.guard';
import { Resource, Action } from '../permissions/decorators/abac.decorator';

@ApiTags('Designs')
@ApiBearerAuth()
@Controller('designs')
export class DesignsController {
  constructor(private readonly service: DesignsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('designs')
  @Action('read')
  @ApiOperation({ summary: 'Get all designs', description: 'Retrieve list of all custom designs' })
  @ApiResponse({ status: 200, description: 'List of designs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('designs')
  @Action('read')
  @ApiOperation({ summary: 'Get design by ID', description: 'Retrieve a specific design by its ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Design ID' })
  @ApiResponse({ status: 200, description: 'Design found' })
  @ApiResponse({ status: 404, description: 'Design not found' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('designs')
  @Action('create')
  @ApiOperation({ summary: 'Create design', description: 'Create a new custom design' })
  @ApiBody({ type: CreateDesignDto })
  @ApiResponse({ status: 201, description: 'Design created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() dto: CreateDesignDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('designs')
  @Action('update')
  @ApiOperation({ summary: 'Update design', description: 'Update an existing design' })
  @ApiParam({ name: 'id', type: 'number', description: 'Design ID' })
  @ApiBody({ type: UpdateDesignDto })
  @ApiResponse({ status: 200, description: 'Design updated successfully' })
  @ApiResponse({ status: 404, description: 'Design not found' })
  update(@Param('id') id: number, @Body() dto: UpdateDesignDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('designs')
  @Action('delete')
  @ApiOperation({ summary: 'Delete design', description: 'Delete a design' })
  @ApiParam({ name: 'id', type: 'number', description: 'Design ID' })
  @ApiResponse({ status: 200, description: 'Design deleted successfully' })
  @ApiResponse({ status: 404, description: 'Design not found' })
  delete(@Param('id') id: number) {
    return this.service.delete(id);
  }
}
