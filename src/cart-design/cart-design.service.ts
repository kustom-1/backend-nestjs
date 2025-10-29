import { Injectable, OnModuleInit, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { Repository } from 'typeorm';
import { CartDesign } from './cart-design.entity';
import { CreateCartDesignDto } from './dto/create-cart-design.dto';
import { UpdateCartDesignDto } from './dto/update-cart-design.dto';

@Injectable()
export class CartDesignService implements OnModuleInit {
  private repo: Repository<CartDesign>;

  constructor(private storageService: StorageService) {}

  async onModuleInit() {
    await this.storageService.connect();
    this.repo = this.storageService.getRepository(CartDesign);
  }

  async findAll(): Promise<CartDesign[]> {
    return this.repo.find({ relations: ['design', 'cart'] });
  }

  async findOne(id: number): Promise<CartDesign> {
    const item = await this.repo.findOne({ where: { id }, relations: ['design', 'cart'] });
    if (!item) throw new NotFoundException(`CartDesign ${id} not found`);
    return item;
  }

  async create(data: CreateCartDesignDto): Promise<CartDesign> {
    try {
      const toSave: any = {
        ...data,
        design: { id: data.design },
        cart: { id: data.cart },
      };
      const entity = this.repo.create(toSave as any);
      const saved = await this.repo.save(entity as unknown as CartDesign);
      return saved as CartDesign;
    } catch (error) {
      throw new InternalServerErrorException('Error creating cart design');
    }
  }

  async update(id: number, data: UpdateCartDesignDto): Promise<CartDesign> {
    const cd = await this.findOne(id);
    if (data.quantity) cd.quantity = data.quantity;
    if (typeof data.subtotal !== 'undefined') cd.subtotal = data.subtotal;
    return this.repo.save(cd);
  }

  async delete(id: number) {
    const res = await this.repo.delete(id);
    if (res.affected === 0) throw new NotFoundException(`CartDesign ${id} not found`);
    return { message: 'Deleted' };
  }
}
