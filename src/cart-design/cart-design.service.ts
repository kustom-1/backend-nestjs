import { Injectable, OnModuleInit, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { Repository } from 'typeorm';
import { CartDesign } from './cart-design.entity';
import { CreateCartDesignDto } from './dto/create-cart-design.dto';
import { UpdateCartDesignDto } from './dto/update-cart-design.dto';
import { CartWithDesignsDto } from './dto/cart-with-designs.dto';
import { CartDesignItemDto } from './dto/cart-design-item.dto';

@Injectable()
export class CartDesignService implements OnModuleInit {
  private repo: Repository<CartDesign>;
  private readonly CUSTOM_DESIGN_MARKUP = 0.20; // 20% markup for custom designs

  constructor(private storageService: StorageService) {}

  async onModuleInit() {
    await this.storageService.connect();
    this.repo = this.storageService.getRepository(CartDesign);
  }

  /**
   * Calculates the subtotal for a cart design item
   * Formula: (cloth.basePrice + 20%) * quantity
   */
  private calculateSubtotal(clothBasePrice: number, quantity: number): number {
    const priceWithMarkup = clothBasePrice * (1 + this.CUSTOM_DESIGN_MARKUP);
    return priceWithMarkup * quantity;
  }

  async findAll(): Promise<CartWithDesignsDto[]> {
    const cartDesigns = await this.repo.find({
      relations: ['design', 'cart', 'design.cloth', 'design.baseModel', 'design.decalImage', 'cart.user']
    });

    // Group by cart
    const cartMap = new Map<number, CartWithDesignsDto>();

    for (const cd of cartDesigns) {
      if (!cartMap.has(cd.cart.id)) {
        cartMap.set(cd.cart.id, {
          cart: cd.cart,
          designs: [],
          totalDesigns: 0,
          totalAmount: 0
        });
      }

      const cartData = cartMap.get(cd.cart.id);

      // Calculate subtotal based on cloth price + 20% markup
      const calculatedSubtotal = cd.design?.cloth?.basePrice
        ? this.calculateSubtotal(cd.design.cloth.basePrice, cd.quantity)
        : 0;

      const designItem: CartDesignItemDto = {
        id: cd.id,
        design: cd.design,
        quantity: cd.quantity,
        subtotal: calculatedSubtotal
      };

      cartData.designs.push(designItem);
      cartData.totalDesigns += 1;
      cartData.totalAmount += calculatedSubtotal;
    }

    return Array.from(cartMap.values());
  }

  async findOne(id: number): Promise<CartDesign> {
    const item = await this.repo.findOne({
      where: { id },
      relations: ['design', 'cart', 'design.cloth', 'design.baseModel', 'design.decalImage', 'cart.user']
    });
    if (!item) throw new NotFoundException(`CartDesign ${id} not found`);
    return item;
  }

  async findByCart(cartId: number): Promise<CartWithDesignsDto> {
    const cartDesigns = await this.repo.find({
      where: { cart: { id: cartId } },
      relations: ['design', 'cart', 'design.cloth', 'design.baseModel', 'design.decalImage', 'cart.user']
    });

    if (cartDesigns.length === 0) {
      throw new NotFoundException(`No designs found for cart ${cartId}`);
    }

    const designs: CartDesignItemDto[] = cartDesigns.map(cd => {
      const calculatedSubtotal = cd.design?.cloth?.basePrice
        ? this.calculateSubtotal(cd.design.cloth.basePrice, cd.quantity)
        : 0;

      return {
        id: cd.id,
        design: cd.design,
        quantity: cd.quantity,
        subtotal: calculatedSubtotal
      };
    });

    const totalAmount = designs.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      cart: cartDesigns[0].cart,
      designs,
      totalDesigns: designs.length,
      totalAmount
    };
  }

  async create(data: CreateCartDesignDto): Promise<CartDesign> {
    try {
      // Load the design with cloth to calculate price
      const design = await this.storageService.getRepository('Design').findOne({
        where: { id: data.design },
        relations: ['cloth']
      });

      if (!design) {
        throw new NotFoundException(`Design ${data.design} not found`);
      }

      const quantity = data.quantity || 1;
      const calculatedSubtotal = design.cloth?.basePrice
        ? this.calculateSubtotal(design.cloth.basePrice, quantity)
        : 0;

      const toSave: any = {
        design: { id: data.design },
        cart: { id: data.cart },
        quantity,
        subtotal: calculatedSubtotal
      };

      const entity = this.repo.create(toSave as any);
      const saved = await this.repo.save(entity as unknown as CartDesign);

      // Return with full relations
      return this.findOne(saved.id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error creating cart design');
    }
  }

  async update(id: number, data: UpdateCartDesignDto): Promise<CartDesign> {
    const cd = await this.findOne(id);

    // Update quantity if provided
    if (data.quantity) {
      cd.quantity = data.quantity;
    }

    // Recalculate subtotal based on cloth price and quantity
    if (cd.design?.cloth?.basePrice) {
      cd.subtotal = this.calculateSubtotal(cd.design.cloth.basePrice, cd.quantity);
    }

    return this.repo.save(cd);
  }

  async delete(id: number) {
    const res = await this.repo.delete(id);
    if (res.affected === 0) throw new NotFoundException(`CartDesign ${id} not found`);
    return { message: 'Deleted' };
  }
}
