import { Injectable, OnModuleInit, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { Repository } from 'typeorm';
import { DesignHistory } from './design-history.entity';
import { CreateDesignHistoryDto } from './dto/create-design-history.dto';
import { UpdateDesignHistoryDto } from './dto/update-design-history.dto';

@Injectable()
export class DesignHistoryService implements OnModuleInit {
  private repo: Repository<DesignHistory>;

  constructor(private storageService: StorageService) {}

  async onModuleInit() {
    await this.storageService.connect();
    this.repo = this.storageService.getRepository(DesignHistory);
  }

  async findAll(): Promise<DesignHistory[]> {
    return this.repo.find({ relations: ['design', 'order'] });
  }

  async findOne(id: number): Promise<DesignHistory> {
    const item = await this.repo.findOne({ where: { id }, relations: ['design', 'order'] });
    if (!item) throw new NotFoundException(`DesignHistory ${id} not found`);
    return item;
  }

  async create(data: CreateDesignHistoryDto): Promise<DesignHistory> {
    try {
      const toSave: any = {
        design: { id: data.designId },
        version: data.version || 1,
        dataSnapshot: data.dataSnapshot || {},
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        order: data.order ? { id: data.order } : null,
      };
      const entity = this.repo.create(toSave as any);
      const saved = await this.repo.save(entity as unknown as DesignHistory);
      return saved as DesignHistory;
    } catch (error) {
      throw new InternalServerErrorException('Error creating design history');
    }
  }

  async update(id: number, data: UpdateDesignHistoryDto): Promise<DesignHistory> {
    const d = await this.findOne(id);
    if (data.dataSnapshot) d.dataSnapshot = data.dataSnapshot;
    if (data.version) d.version = data.version;
    return this.repo.save(d);
  }

  async delete(id: number) {
    const res = await this.repo.delete(id);
    if (res.affected === 0) throw new NotFoundException(`DesignHistory ${id} not found`);
    return { message: 'Deleted' };
  }
}
