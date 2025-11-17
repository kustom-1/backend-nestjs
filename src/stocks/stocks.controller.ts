import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { StocksService } from './stocks.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { StockResponseDto } from './dto/stock-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { AbacGuard } from '../permissions/guards/abac.guard';
import { Resource, Action } from '../permissions/decorators/abac.decorator';

@ApiTags('Stocks')
@ApiBearerAuth()
@Controller('stocks')
export class StocksController {
  constructor(private readonly service: StocksService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('stocks')
  @Action('read')
  @ApiOperation({ summary: 'Get all stocks', description: 'Retrieve list of all inventory stocks' })
  @ApiResponse({ status: 200, description: 'List of stocks retrieved successfully', type: [StockResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('stocks')
  @Action('read')
  @ApiOperation({ summary: 'Get stock by ID', description: 'Retrieve a specific stock by its ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Stock ID' })
  @ApiResponse({ status: 200, description: 'Stock found', type: StockResponseDto })
  @ApiResponse({ status: 404, description: 'Stock not found' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('stocks')
  @Action('create')
  @ApiOperation({ summary: 'Create stock', description: 'Create a new stock record' })
  @ApiBody({ type: CreateStockDto })
  @ApiResponse({ status: 201, description: 'Stock created successfully', type: StockResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() dto: CreateStockDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('stocks')
  @Action('update')
  @ApiOperation({ summary: 'Update stock', description: 'Update an existing stock record' })
  @ApiParam({ name: 'id', type: 'number', description: 'Stock ID' })
  @ApiBody({ type: UpdateStockDto })
  @ApiResponse({ status: 200, description: 'Stock updated successfully', type: StockResponseDto })
  @ApiResponse({ status: 404, description: 'Stock not found' })
  update(@Param('id') id: number, @Body() dto: UpdateStockDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('stocks')
  @Action('delete')
  @ApiOperation({ summary: 'Delete stock', description: 'Delete a stock record' })
  @ApiParam({ name: 'id', type: 'number', description: 'Stock ID' })
  @ApiResponse({ status: 200, description: 'Stock deleted successfully' })
  @ApiResponse({ status: 404, description: 'Stock not found' })
  delete(@Param('id') id: number) {
    return this.service.delete(id);
  }
}
