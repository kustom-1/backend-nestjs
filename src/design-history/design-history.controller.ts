import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { DesignHistoryService } from './design-history.service';
import { CreateDesignHistoryDto } from './dto/create-design-history.dto';
import { UpdateDesignHistoryDto } from './dto/update-design-history.dto';
import { AuthGuard } from '@nestjs/passport';
import { AbacGuard } from '../permissions/guards/abac.guard';
import { Resource, Action } from '../permissions/decorators/abac.decorator';

@Controller('design_history')
export class DesignHistoryController {
  constructor(private readonly service: DesignHistoryService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('design_history')
  @Action('read')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('design_history')
  @Action('read')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('design_history')
  @Action('create')
  create(@Body() dto: CreateDesignHistoryDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('design_history')
  @Action('update')
  update(@Param('id') id: number, @Body() dto: UpdateDesignHistoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('design_history')
  @Action('delete')
  delete(@Param('id') id: number) {
    return this.service.delete(id);
  }
}
