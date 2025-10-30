import { Injectable, OnModuleInit, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { Repository } from 'typeorm';
import { Cloth } from './cloth.entity';
import { CreateClothDto } from './dto/create-cloth.dto';
import { UpdateClothDto } from './dto/update-cloth.dto';

@Injectable()
export class ClothsService implements OnModuleInit {
  private repo: Repository<Cloth>;

  constructor(private storageService: StorageService) { }

  async onModuleInit() {
    await this.storageService.connect();
    this.repo = this.storageService.getRepository(Cloth);
  }

  async findAll(): Promise<Cloth[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<Cloth> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Cloth ${id} not found`);
    return item;
  }

  async create(data: CreateClothDto): Promise<Cloth> {
    try {
      // Map foreign key id to relation object expected by TypeORM
      const toSave: any = {
        ...data,
        category: data.category ? { id: data.category } : null,
      };
      const cloth = this.repo.create(toSave);
      const saved = await this.repo.save(cloth as unknown as Cloth);
      return saved as Cloth;
    } catch (error) {
      console.error('Error creating cloth:', error);
      throw new InternalServerErrorException('Error creating cloth');
    }
  }

  async update(id: number, data: UpdateClothDto): Promise<Cloth> {
    const cloth = await this.findOne(id);
    Object.assign(cloth, data);
    return this.repo.save(cloth);
  }

  async delete(id: number) {
    const res = await this.repo.delete(id);
    if (res.affected === 0) throw new NotFoundException(`Cloth ${id} not found`);
    return { message: 'Deleted' };
  }
}
