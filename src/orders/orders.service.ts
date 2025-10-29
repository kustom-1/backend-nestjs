import { Injectable, OnModuleInit, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService implements OnModuleInit {
  private repo: Repository<Order>;

  constructor(private storageService: StorageService) {}

  async onModuleInit() {
    await this.storageService.connect();
    this.repo = this.storageService.getRepository(Order);
  }

  async findAll(): Promise<Order[]> {
    return this.repo.find({ relations: ['user', 'address'] });
  }

  async findOne(id: number): Promise<Order> {
    const item = await this.repo.findOne({ where: { id }, relations: ['user', 'address'] });
    if (!item) throw new NotFoundException(`Order ${id} not found`);
    return item;
  }

  async create(data: CreateOrderDto): Promise<Order> {
    try {
      const toSave: any = {
        ...data,
        user: { id: data.user },
        address: data.address ? { id: data.address } : null,
        date: data.date ? new Date(data.date) : new Date(),
      };
      const entity = this.repo.create(toSave as any);
      const saved = await this.repo.save(entity as unknown as Order);
      return saved as Order;
    } catch (error) {
      throw new InternalServerErrorException('Error creating order');
    }
  }

  async update(id: number, data: UpdateOrderDto): Promise<Order> {
    const o = await this.findOne(id);
    if (data.user) o.user = { id: data.user } as any;
    if (data.address) o.address = { id: data.address } as any;
    if (data.quantity) o.quantity = data.quantity;
    if (data.status) o.status = data.status;
    if (data.date) o.date = new Date(data.date);
    return this.repo.save(o);
  }

  async delete(id: number) {
    const res = await this.repo.delete(id);
    if (res.affected === 0) throw new NotFoundException(`Order ${id} not found`);
    return { message: 'Deleted' };
  }
}
