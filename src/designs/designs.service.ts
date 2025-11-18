import { Injectable, OnModuleInit, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { Repository } from 'typeorm';
import { Design } from './design.entity';
import { CreateDesignDto } from './dto/create-design.dto';
import { UpdateDesignDto } from './dto/update-design.dto';

@Injectable()
export class DesignsService implements OnModuleInit {
  private repo: Repository<Design>;

  constructor(private storageService: StorageService) {}

  async onModuleInit() {
    await this.storageService.connect();
    this.repo = this.storageService.getRepository(Design);
  }

  async findAll(): Promise<Design[]> {
    return this.repo.find({ relations: ['user', 'cloth'] });
  }

  async findOne(id: number): Promise<Design> {
    const item = await this.repo.findOne({ where: { id }, relations: ['user', 'cloth'] });
    if (!item) throw new NotFoundException(`Design ${id} not found`);
    return item;
  }

  async create(data: CreateDesignDto): Promise<Design> {
    try {
      const toSave: any = {
        ...data,
        user: data.user ? { id: data.user } : null,
        cloth: data.cloth ? { id: data.cloth } : null,
      };
      const entity = this.repo.create(toSave);
      const saved = await this.repo.save(entity as unknown as Design);
      return saved as Design;
    } catch (error) {
      throw new InternalServerErrorException('Error creating design');
    }
  }

  async update(id: number, data: UpdateDesignDto): Promise<Design> {
    const design = await this.findOne(id);
    if (data.user) design.user = { id: data.user } as any;
    if (data.cloth) design.cloth = { id: data.cloth } as any;
    if (typeof data.isActive !== 'undefined') design.isActive = data.isActive;
    if (typeof data.isPublic !== 'undefined') design.isPublic = data.isPublic;
    if (typeof data.payload !== 'undefined') design.payload = data.payload as any;
    return this.repo.save(design);
  }

  async delete(id: number) {
    const res = await this.repo.delete(id);
    if (res.affected === 0) throw new NotFoundException(`Design ${id} not found`);
    return { message: 'Deleted' };
  }
}
