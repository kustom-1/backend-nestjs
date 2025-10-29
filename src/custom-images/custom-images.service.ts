import { Injectable, OnModuleInit, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { Repository } from 'typeorm';
import { CustomImage } from './custom-image.entity';
import { CreateCustomImageDto } from './dto/create-custom-image.dto';
import { UpdateCustomImageDto } from './dto/update-custom-image.dto';

@Injectable()
export class CustomImagesService implements OnModuleInit {
  private repo: Repository<CustomImage>;

  constructor(private storageService: StorageService) {}

  async onModuleInit() {
    await this.storageService.connect();
    this.repo = this.storageService.getRepository(CustomImage);
  }

  async findAll(): Promise<CustomImage[]> {
    return this.repo.find({ relations: ['image', 'design'] });
  }

  async findOne(id: number): Promise<CustomImage> {
    const item = await this.repo.findOne({ where: { id }, relations: ['image', 'design'] });
    if (!item) throw new NotFoundException(`CustomImage ${id} not found`);
    return item;
  }

  async create(data: CreateCustomImageDto): Promise<CustomImage> {
    try {
      const toSave: any = {
        ...data,
        image: { id: data.image },
        design: data.design ? { id: data.design } : null,
      };
      const entity = this.repo.create(toSave as any);
      const saved = await this.repo.save(entity as unknown as CustomImage);
      return saved as CustomImage;
    } catch (error) {
      throw new InternalServerErrorException('Error creating custom image');
    }
  }

  async update(id: number, data: UpdateCustomImageDto): Promise<CustomImage> {
    const c = await this.findOne(id);
    if (data.design) c.design = { id: data.design } as any;
    if (data.config) c.config = data.config;
    return this.repo.save(c);
  }

  async delete(id: number) {
    const res = await this.repo.delete(id);
    if (res.affected === 0) throw new NotFoundException(`CustomImage ${id} not found`);
    return { message: 'Deleted' };
  }
}
