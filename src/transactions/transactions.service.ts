import { Injectable, OnModuleInit, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService implements OnModuleInit {
  private repo: Repository<Transaction>;

  constructor(private storageService: StorageService) {}

  async onModuleInit() {
    await this.storageService.connect();
    this.repo = this.storageService.getRepository(Transaction);
  }

  async findAll(): Promise<Transaction[]> {
    return this.repo.find({ relations: ['order'] });
  }

  async findOne(id: number): Promise<Transaction> {
    const item = await this.repo.findOne({ where: { id }, relations: ['order'] });
    if (!item) throw new NotFoundException(`Transaction ${id} not found`);
    return item;
  }

  async create(data: CreateTransactionDto): Promise<Transaction> {
    try {
      const toSave: any = {
        ...data,
        order: data.order ? { id: data.order } : null,
        transactionDate: data.transactionDate ? new Date(data.transactionDate) : null,
      };
      const entity = this.repo.create(toSave as any);
      const saved = await this.repo.save(entity as unknown as Transaction);
      return saved as Transaction;
    } catch (error) {
      throw new InternalServerErrorException('Error creating transaction');
    }
  }

  async update(id: number, data: UpdateTransactionDto): Promise<Transaction> {
    const t = await this.findOne(id);
    if (data.order) t.order = { id: data.order } as any;
    if (typeof data.amount !== 'undefined') t.amount = data.amount;
    if (data.method) t.method = data.method;
    if (data.status) t.status = data.status;
    if (data.transactionDate) t.transactionDate = new Date(data.transactionDate);
    return this.repo.save(t);
  }

  async delete(id: number) {
    const res = await this.repo.delete(id);
    if (res.affected === 0) throw new NotFoundException(`Transaction ${id} not found`);
    return { message: 'Deleted' };
  }
}
