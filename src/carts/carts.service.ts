import { Injectable, OnModuleInit, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartsService implements OnModuleInit {
  private repo: Repository<Cart>;

  constructor(private storageService: StorageService) {}

  async onModuleInit() {
    await this.storageService.connect();
    this.repo = this.storageService.getRepository(Cart);
  }

  async findAll(): Promise<Cart[]> {
    return this.repo.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<Cart> {
    const item = await this.repo.findOne({ where: { id }, relations: ['user'] });
    if (!item) throw new NotFoundException(`Cart ${id} not found`);
    return item;
  }

  async findByUser(userId: number, activeOnly: boolean = false): Promise<Cart[]> {
    const where: any = { user: { id: userId } };
    if (activeOnly) {
      where.isActive = true;
    }
    const carts = await this.repo.find({ where, relations: ['user'] });
    return carts;
  }

  async findActiveCartByUser(userId: number): Promise<Cart | null> {
    const cart = await this.repo.findOne({
      where: { user: { id: userId }, isActive: true },
      relations: ['user']
    });
    return cart;
  }

  async create(data: CreateCartDto): Promise<Cart> {
    try {
      const toSave: any = {
        user: data.user ? { id: data.user } : null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      };
      const entity = this.repo.create(toSave as any);
      const saved = await this.repo.save(entity as unknown as Cart);
      return saved as Cart;
    } catch (error) {
      throw new InternalServerErrorException('Error creating cart');
    }
  }

  async update(id: number, data: UpdateCartDto): Promise<Cart> {
    const cart = await this.findOne(id);
    if (data.user) cart.user = { id: data.user } as any;
    if (data.isActive !== undefined) cart.isActive = data.isActive;
    return this.repo.save(cart);
  }

  async delete(id: number) {
    const res = await this.repo.delete(id);
    if (res.affected === 0) throw new NotFoundException(`Cart ${id} not found`);
    return { message: 'Deleted' };
  }
}
