import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CustomImagesService } from './custom-images.service';
import { CreateCustomImageDto } from './dto/create-custom-image.dto';
import { UpdateCustomImageDto } from './dto/update-custom-image.dto';
import { AuthGuard } from '@nestjs/passport';
import { AbacGuard } from '../permissions/guards/abac.guard';
import { Resource, Action } from '../permissions/decorators/abac.decorator';

@Controller('custom-images')
export class CustomImagesController {
  constructor(private readonly service: CustomImagesService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('custom_images')
  @Action('read')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('custom_images')
  @Action('read')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('custom_images')
  @Action('create')
  create(@Body() dto: CreateCustomImageDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('custom_images')
  @Action('update')
  update(@Param('id') id: number, @Body() dto: UpdateCustomImageDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('custom_images')
  @Action('delete')
  delete(@Param('id') id: number) {
    return this.service.delete(id);
  }
}
