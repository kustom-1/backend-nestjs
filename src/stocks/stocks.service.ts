import { Injectable, OnModuleInit, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { Repository } from 'typeorm';
import { Stock } from './stock.entity';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class StocksService implements OnModuleInit {
  private repo: Repository<Stock>;

  constructor(private storageService: StorageService) {}

  async onModuleInit() {
    await this.storageService.connect();
    this.repo = this.storageService.getRepository(Stock);
  }

  async findAll(): Promise<Stock[]> {
    return this.repo.find({ relations: ['cloth', 'cloth.category'] });
  }

  async findOne(id: number): Promise<Stock> {
    const item = await this.repo.findOne({
      where: { id },
      relations: ['cloth', 'cloth.category']
    });
    if (!item) throw new NotFoundException(`Stock ${id} not found`);
    return item;
  }

  async create(data: CreateStockDto): Promise<Stock> {
    try {
      const toSave: any = {
        ...data,
        cloth: { id: data.cloth },
      };
      const entity = this.repo.create(toSave as any);
      const saved = await this.repo.save(entity as unknown as Stock);
      // Return the stock with the full cloth and category relations
      return this.findOne(saved.id);
    } catch (error) {
      throw new InternalServerErrorException('Error creating stock');
    }
  }

  async update(id: number, data: UpdateStockDto): Promise<Stock> {
    const s = await this.findOne(id);
    if (data.cloth) s.cloth = { id: data.cloth } as any;
    if (data.gender) s.gender = data.gender;
    if (data.color) s.color = data.color;
    if (data.size) s.size = data.size;
    if (typeof data.stock !== 'undefined') s.stock = data.stock;
    await this.repo.save(s);
    // Return the stock with the full cloth and category relations
    return this.findOne(id);
  }

  async delete(id: number) {
    const res = await this.repo.delete(id);
    if (res.affected === 0) throw new NotFoundException(`Stock ${id} not found`);
    return { message: 'Deleted' };
  }
}
