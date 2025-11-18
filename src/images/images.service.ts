import { Injectable, OnModuleInit, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { Repository } from 'typeorm';
import { Image } from './image.entity';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';

@Injectable()
export class ImagesService implements OnModuleInit {
  private repo: Repository<Image>;

  constructor(private storageService: StorageService) {}

  async onModuleInit() {
    await this.storageService.connect();
    this.repo = this.storageService.getRepository(Image);
  }

  async findAll(tag?: string): Promise<Image[]> {
    if (!tag) {
      return this.repo.find({ relations: ['user'] });
    }

    // Filter by tag - since tags is a simple-array (comma-separated), we use LIKE
    const queryBuilder = this.repo.createQueryBuilder('image')
      .leftJoinAndSelect('image.user', 'user')
      .where('image.tags LIKE :tag', { tag: `%${tag}%` });

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Image> {
    const item = await this.repo.findOne({ where: { id }, relations: ['user'] });
    if (!item) throw new NotFoundException(`Image ${id} not found`);
    return item;
  }

  async create(data: CreateImageDto): Promise<Image> {
    try {
      const toSave: any = {
        ...data,
        user: data.user ? { id: data.user } : null,
        tags: data.tags ? data.tags : null,
      };
      const entity = this.repo.create(toSave as any);
      const saved = await this.repo.save(entity as unknown as Image);
      return saved as Image;
    } catch (error) {
      throw new InternalServerErrorException('Error creating image');
    }
  }

  async update(id: number, data: UpdateImageDto): Promise<Image> {
    const image = await this.findOne(id);
    if (data.user) image.user = { id: data.user } as any;
    if (data.tags) image.tags = data.tags;
    if (typeof data.isPublic !== 'undefined') image.isPublic = data.isPublic;
    return this.repo.save(image);
  }

  async delete(id: number) {
    const res = await this.repo.delete(id);
    if (res.affected === 0) throw new NotFoundException(`Image ${id} not found`);
    return { message: 'Deleted' };
  }
}
