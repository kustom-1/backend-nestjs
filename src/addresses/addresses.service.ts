import { Injectable, OnModuleInit, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { Repository } from 'typeorm';
import { Address } from './address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService implements OnModuleInit {
  private repo: Repository<Address>;

  constructor(private storageService: StorageService) {}

  async onModuleInit() {
    await this.storageService.connect();
    this.repo = this.storageService.getRepository(Address);
  }

  async findAll(): Promise<Address[]> {
    return this.repo.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<Address> {
    const item = await this.repo.findOne({ where: { id }, relations: ['user'] });
    if (!item) throw new NotFoundException(`Address ${id} not found`);
    return item;
  }

  async create(data: CreateAddressDto): Promise<Address> {
    try {
      const toSave: any = {
        ...data,
        user: { id: data.user },
      };
      const entity = this.repo.create(toSave as any);
      const saved = await this.repo.save(entity as unknown as Address);
      return saved as Address;
    } catch (error) {
      throw new InternalServerErrorException('Error creating address');
    }
  }

  async update(id: number, data: UpdateAddressDto): Promise<Address> {
    const a = await this.findOne(id);
    if (data.user) a.user = { id: data.user } as any;
    if (data.street) a.street = data.street;
    if (data.city) a.city = data.city;
    if (data.state) a.state = data.state;
    if (data.postalCode) a.postalCode = data.postalCode;
    if (data.country) a.country = data.country;
    return this.repo.save(a);
  }

  async delete(id: number) {
    const res = await this.repo.delete(id);
    if (res.affected === 0) throw new NotFoundException(`Address ${id} not found`);
    return { message: 'Deleted' };
  }
}
