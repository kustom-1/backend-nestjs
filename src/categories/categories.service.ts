import { Injectable, OnModuleInit, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService implements OnModuleInit {
  private repo: Repository<Category>;

  constructor(private storageService: StorageService) {}

  async onModuleInit() {
    await this.storageService.connect();
    this.repo = this.storageService.getRepository(Category);
  }

  async findAll(): Promise<Category[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<Category> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Category ${id} not found`);
    return item;
  }

  async create(data: CreateCategoryDto): Promise<Category> {
    try {
  const cat = this.repo.create(data as Partial<Category>);
  const saved = await this.repo.save(cat as unknown as Category);
  return saved as Category;
    } catch (error) {
      throw new InternalServerErrorException('Error creating category');
    }
  }

  async update(id: number, data: UpdateCategoryDto): Promise<Category> {
    const cat = await this.findOne(id);
    Object.assign(cat, data);
    return this.repo.save(cat);
  }

  async delete(id: number) {
    const res = await this.repo.delete(id);
    if (res.affected === 0) throw new NotFoundException(`Category ${id} not found`);
    return { message: 'Deleted' };
  }
}
