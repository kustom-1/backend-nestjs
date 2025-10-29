import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { AuthGuard } from '@nestjs/passport';
import { AbacGuard } from '../permissions/guards/abac.guard';
import { Resource, Action } from '../permissions/decorators/abac.decorator';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('transactions')
  @Action('read')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('transactions')
  @Action('read') 
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('transactions')
  @Action('create')
  create(@Body() dto: CreateTransactionDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('transactions')
  @Action('update')
  update(@Param('id') id: number, @Body() dto: UpdateTransactionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('transactions')
  @Action('delete')
  delete(@Param('id') id: number) {
    return this.service.delete(id);
  }
}
