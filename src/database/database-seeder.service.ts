import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/users.entity';
import { Category } from '../categories/category.entity';
import { Cloth } from '../cloths/cloth.entity';
import { Image } from '../images/image.entity';
import { Design } from '../designs/design.entity';
import { Cart } from '../carts/cart.entity';
import { Address } from '../addresses/address.entity';
import { CartDesign } from '../cart-design/cart-design.entity';
import { CustomImage } from '../custom-images/custom-image.entity';
import { DesignHistory } from '../design-history/design-history.entity';
import { Stock } from '../stocks/stock.entity';
import { Order } from '../orders/order.entity';
import { Transaction } from '../transactions/transaction.entity';
import { RolePermission } from '../permissions/role-permission.entity';

@Injectable()
export class DatabaseSeederService {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Cloth)
    private readonly clothRepository: Repository<Cloth>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    @InjectRepository(Design)
    private readonly designRepository: Repository<Design>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(CartDesign)
    private readonly cartDesignRepository: Repository<CartDesign>,
    @InjectRepository(CustomImage)
    private readonly customImageRepository: Repository<CustomImage>,
    @InjectRepository(DesignHistory)
    private readonly designHistoryRepository: Repository<DesignHistory>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) { }

  async seed() {
    this.logger.log('🌱 Starting database seeding...');

    try {
      // Check if data already exists
      const userCount = await this.userRepository.count();
      if (userCount > 0) {
        this.logger.warn('⚠️  Database already seeded. Skipping...');
        return;
      }

      // Seed in order (respecting foreign keys)
      await this.seedUsers();
      await this.seedCategories();
      await this.seedCloths();
      await this.seedImages();
      await this.seedDesigns();
      await this.seedCarts();
      await this.seedAddresses();
      await this.seedCartDesigns();
      // await this.seedCustomImages();
      // await this.seedDesignHistory();
      await this.seedStocks();
      await this.seedOrders();
      await this.seedTransactions();
      await this.seedRolePermissions();

      this.logger.log('✅ Database seeding completed successfully!');
    } catch (error) {
      this.logger.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  private async seedUsers() {
    this.logger.log('👥 Seeding users...');
    const password = await bcrypt.hash('1234', 10);

    const users = [
      {
        firstName: 'Admin',
        lastName: 'Sistema',
        email: 'admin@kustom.com',
        isActive: true,
        password,
        role: UserRole.COORDINADOR,
      },
      {
        firstName: 'Raul',
        lastName: 'Admin',
        email: 'raul@admin.com',
        isActive: true,
        password,
        role: UserRole.COORDINADOR,
      },
      {
        firstName: 'Carlos',
        lastName: 'Consultor',
        email: 'carlos@consultor.com',
        isActive: true,
        password,
        role: UserRole.CONSULTOR,
      },
      {
        firstName: 'Maria',
        lastName: 'Auxiliar',
        email: 'maria@auxiliar.com',
        isActive: true,
        password,
        role: UserRole.AUXILIAR,
      },
      {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@kustom.com',
        isActive: true,
        password,
        role: UserRole.CONSULTOR,
      },
    ];

    await this.userRepository.save(users);
    this.logger.log(`  ✓ Created ${users.length} users`);
  }

  private async seedCategories() {
    this.logger.log('📁 Seeding categories...');
    const categories = [
      {
        name: 'Camisetas',
        description: 'Camisetas de algodón de alta calidad',
      },
      {
        name: 'Polos',
        description: 'Polos deportivos y casuales',
      },
      {
        name: 'Sudaderas',
        description: 'Sudaderas con capucha y sin capucha',
      },
      {
        name: 'Gorras',
        description: 'Gorras personalizables',
      },
      {
        name: 'Accesorios',
        description: 'Otros productos personalizables',
      },
    ];

    await this.categoryRepository.save(categories);
    this.logger.log(`  ✓ Created ${categories.length} categories`);
  }

  private async seedCloths() {
    this.logger.log('👕 Seeding cloths...');

    const categories = await this.categoryRepository.find();
    const camisetas = categories.find(c => c.name === 'Camisetas');
    const polos = categories.find(c => c.name === 'Polos');
    const sudaderas = categories.find(c => c.name === 'Sudaderas');
    const gorras = categories.find(c => c.name === 'Gorras');

    const cloths = [
      {
        name: 'Camiseta Básica Blanca',
        description: 'Camiseta de algodón 100% blanca',
        basePrice: 15000,
        category: camisetas,
      },
      {
        name: 'Camiseta Básica Negra',
        description: 'Camiseta de algodón 100% negra',
        basePrice: 15000,
        category: camisetas,
      },
      {
        name: 'Polo Deportivo Azul',
        description: 'Polo deportivo transpirable',
        basePrice: 25000,
        category: polos,
      },
      {
        name: 'Sudadera con Capucha Gris',
        description: 'Sudadera cómoda con capucha ajustable',
        basePrice: 45000,
        category: sudaderas,
      },
      {
        name: 'Sudadera Básica Roja',
        description: 'Sudadera sin capucha de algodón',
        basePrice: 38000,
        category: sudaderas,
      },
      {
        name: 'Gorra Snapback Negra',
        description: 'Gorra ajustable con visera plana',
        basePrice: 20000,
        category: gorras,
      },
      {
        name: 'Gorra Trucker Blanca',
        description: 'Gorra con malla trasera',
        basePrice: 18000,
        category: gorras,
      },
    ];

    await this.clothRepository.save(cloths);
    this.logger.log(`  ✓ Created ${cloths.length} cloths`);
  }

  private async seedImages() {
    this.logger.log('🖼️  Seeding images...');

    const cloths = await this.clothRepository.find();

    const LOGOS = [
      {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfCscjolutCHBMeWTsabdBsWZ1oPd2NMLGUw&s",
        description: "Logo de React",
      },
      {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTh1fm5a4Ef1I0BWa6JRcjMDwA5d5Px450UEg&s",
        description: "Logo del Cacique",
      },
    ];

    const images = LOGOS.map((logo, index) => {

      return {
        url: logo.url,
        description: `${logo.description}`,
        tags: ["decal"]
      };
    });


    await this.imageRepository.save(images);
    this.logger.log(`  ✓ Created ${images.length} images`);
  }

  private async seedDesigns() {
    this.logger.log('🎨 Seeding designs...');

    const users = await this.userRepository.find();
    const cloths = await this.clothRepository.find();

    const designs = [
      {
        name: 'Diseño Corporativo',
        description: 'Logo de empresa en el pecho',
        user: users[1],
        cloth: cloths[0],
      },
      {
        name: 'Diseño Deportivo',
        description: 'Número y nombre en la espalda',
        user: users[2],
        cloth: cloths[2],
      },
      {
        name: 'Diseño Artístico',
        description: 'Ilustración personalizada',
        user: users[1],
        cloth: cloths[1],
      },
      {
        name: 'Diseño Minimalista',
        description: 'Texto simple centrado',
        user: users[4],
        cloth: cloths[3],
      },
      {
        name: 'Diseño Complejo',
        description: 'Múltiples elementos gráficos',
        user: users[2],
        cloth: cloths[4],
      },
    ];

    await this.designRepository.save(designs);
    this.logger.log(`  ✓ Created ${designs.length} designs`);
  }

  private async seedCarts() {
    this.logger.log('🛒 Seeding carts...');

    const users = await this.userRepository.find();

    const carts = [
      {
        user: users[1],
        totalAmount: 45000,
      },
      {
        user: users[2],
        totalAmount: 63000,
      },
    ];

    await this.cartRepository.save(carts);
    this.logger.log(`  ✓ Created ${carts.length} carts`);
  }

  private async seedAddresses() {
    this.logger.log('📍 Seeding addresses...');

    const users = await this.userRepository.find();

    const addresses = [
      {
        street: 'Calle 123',
        city: 'Bogotá',
        state: 'Cundinamarca',
        country: 'Colombia',
        zipCode: '110111',
        user: users[1],
      },
      {
        street: 'Carrera 45 #67-89',
        city: 'Medellín',
        state: 'Antioquia',
        country: 'Colombia',
        zipCode: '050001',
        user: users[2],
      },
      {
        street: 'Avenida 6 #15-28',
        city: 'Cali',
        state: 'Valle del Cauca',
        country: 'Colombia',
        zipCode: '760001',
        user: users[4],
      },
    ];

    await this.addressRepository.save(addresses);
    this.logger.log(`  ✓ Created ${addresses.length} addresses`);
  }

  private async seedCartDesigns() {
    this.logger.log('🛍️  Seeding cart designs...');

    const carts = await this.cartRepository.find();
    const designs = await this.designRepository.find();

    const cartDesigns = [
      {
        cart: carts[0],
        design: designs[0],
        quantity: 3,
        priceAtPurchase: 15000,
      },
      {
        cart: carts[1],
        design: designs[1],
        quantity: 2,
        priceAtPurchase: 25000,
      },
      {
        cart: carts[1],
        design: designs[2],
        quantity: 1,
        priceAtPurchase: 13000,
      },
    ];

    await this.cartDesignRepository.save(cartDesigns);
    this.logger.log(`  ✓ Created ${cartDesigns.length} cart designs`);
  }

  private async seedCustomImages() {
    this.logger.log('🎭 Seeding custom images...');

    const designs = await this.designRepository.find();
    const images = await this.imageRepository.find();

    // Verificar que tengamos suficientes imágenes y diseños
    if (images.length < 4 || designs.length < 4) {
      this.logger.warn('  ⚠️  Not enough images or designs to create custom images');
      return;
    }

    const customImages = [
      {
        image: images[0],
        design: designs[0],
        config: {
          positionX: 50,
          positionY: 20,
          width: 100,
          height: 100,
          rotation: 0,
        },
      },
      {
        image: images[1],
        design: designs[1],
        config: {
          positionX: 50,
          positionY: 50,
          width: 80,
          height: 120,
          rotation: 0,
        },
      },
      {
        image: images[2],
        design: designs[2],
        config: {
          positionX: 30,
          positionY: 30,
          width: 200,
          height: 200,
          rotation: 0,
        },
      },
      {
        image: images[3],
        design: designs[3],
        config: {
          positionX: 50,
          positionY: 50,
          width: 150,
          height: 50,
          rotation: 0,
        },
      },
    ];

    await this.customImageRepository.save(customImages);
    this.logger.log(`  ✓ Created ${customImages.length} custom images`);
  }

  private async seedDesignHistory() {
    this.logger.log('📜 Seeding design history...');

    const designs = await this.designRepository.find();

    const designHistories = [
      {
        design: designs[0],
        version: 1,
        changeDescription: 'Versión inicial del diseño',
        changedBy: 2,
      },
      {
        design: designs[0],
        version: 2,
        changeDescription: 'Ajuste de tamaño del logo',
        changedBy: 2,
      },
      {
        design: designs[1],
        version: 1,
        changeDescription: 'Creación del diseño deportivo',
        changedBy: 3,
      },
      {
        design: designs[2],
        version: 1,
        changeDescription: 'Diseño artístico inicial',
        changedBy: 2,
      },
    ];

    await this.designHistoryRepository.save(designHistories);
    this.logger.log(`  ✓ Created ${designHistories.length} design history entries`);
  }

  private async seedStocks() {
    this.logger.log('📦 Seeding stocks...');

    const cloths = await this.clothRepository.find();

    const sizes = ['XS', 'S', 'M', 'L', 'XL'];
    const colors = ['Blanco', 'Negro', 'Azul', 'Rojo'];

    const stocks = [];
    for (let i = 0; i < Math.min(3, cloths.length); i++) {
      for (const size of sizes) {
        stocks.push({
          cloth: cloths[i],
          size: size,
          color: colors[i % colors.length],
          quantity: Math.floor(Math.random() * 50) + 10,
        });
      }
    }

    await this.stockRepository.save(stocks);
    this.logger.log(`  ✓ Created ${stocks.length} stock entries`);
  }

  private async seedOrders() {
    this.logger.log('📋 Seeding orders...');

    const users = await this.userRepository.find();
    const addresses = await this.addressRepository.find();

    const orders = [
      {
        user: users[1],
        totalAmount: 45000,
        status: 'pending',
        shippingAddress: addresses[0],
      },
      {
        user: users[2],
        totalAmount: 63000,
        status: 'processing',
        shippingAddress: addresses[1],
      },
      {
        user: users[4],
        totalAmount: 20000,
        status: 'completed',
        shippingAddress: addresses[2],
      },
    ];

    await this.orderRepository.save(orders);
    this.logger.log(`  ✓ Created ${orders.length} orders`);
  }

  private async seedTransactions() {
    this.logger.log('💳 Seeding transactions...');

    const orders = await this.orderRepository.find();

    const transactions = [
      {
        order: orders[0],
        amount: 45000,
        paymentMethod: 'credit_card',
        status: 'pending',
        transactionId: 'TXN-' + Date.now() + '-001',
      },
      {
        order: orders[1],
        amount: 63000,
        paymentMethod: 'credit_card',
        status: 'completed',
        transactionId: 'TXN-' + Date.now() + '-002',
      },
      {
        order: orders[2],
        amount: 20000,
        paymentMethod: 'cash',
        status: 'completed',
        transactionId: 'TXN-' + Date.now() + '-003',
      },
    ];

    await this.transactionRepository.save(transactions);
    this.logger.log(`  ✓ Created ${transactions.length} transactions`);
  }

  private async seedRolePermissions() {
    this.logger.log('🔐 Seeding role permissions...');

    const permissions = [
      // Coordinador - Full access
      { role: UserRole.COORDINADOR, resource: 'users', action: 'create', effect: 'allow' as const, description: 'Crear usuarios' },
      { role: UserRole.COORDINADOR, resource: 'users', action: 'read', effect: 'allow' as const, description: 'Ver usuarios' },
      { role: UserRole.COORDINADOR, resource: 'users', action: 'update', effect: 'allow' as const, description: 'Actualizar usuarios' },
      { role: UserRole.COORDINADOR, resource: 'users', action: 'delete', effect: 'allow' as const, description: 'Eliminar usuarios' },
      { role: UserRole.COORDINADOR, resource: 'categories', action: 'create', effect: 'allow' as const, description: 'Crear categorías' },
      { role: UserRole.COORDINADOR, resource: 'categories', action: 'read', effect: 'allow' as const, description: 'Ver categorías' },
      { role: UserRole.COORDINADOR, resource: 'categories', action: 'update', effect: 'allow' as const, description: 'Actualizar categorías' },
      { role: UserRole.COORDINADOR, resource: 'categories', action: 'delete', effect: 'allow' as const, description: 'Eliminar categorías' },
      { role: UserRole.COORDINADOR, resource: 'cloths', action: 'create', effect: 'allow' as const, description: 'Crear prendas' },
      { role: UserRole.COORDINADOR, resource: 'cloths', action: 'read', effect: 'allow' as const, description: 'Ver prendas' },
      { role: UserRole.COORDINADOR, resource: 'cloths', action: 'update', effect: 'allow' as const, description: 'Actualizar prendas' },
      { role: UserRole.COORDINADOR, resource: 'cloths', action: 'delete', effect: 'allow' as const, description: 'Eliminar prendas' },
      { role: UserRole.COORDINADOR, resource: 'orders', action: 'read', effect: 'allow' as const, description: 'Ver todas las órdenes' },

      // Consultor - Read and Create designs
      { role: UserRole.CONSULTOR, resource: 'categories', action: 'read', effect: 'allow' as const, description: 'Ver categorías' },
      { role: UserRole.CONSULTOR, resource: 'cloths', action: 'read', effect: 'allow' as const, description: 'Ver prendas' },
      { role: UserRole.CONSULTOR, resource: 'designs', action: 'create', effect: 'allow' as const, description: 'Crear diseños' },
      { role: UserRole.CONSULTOR, resource: 'designs', action: 'read', effect: 'allow' as const, description: 'Ver diseños propios' },
      { role: UserRole.CONSULTOR, resource: 'designs', action: 'update', effect: 'allow' as const, description: 'Actualizar diseños propios' },
      { role: UserRole.CONSULTOR, resource: 'carts', action: 'create', effect: 'allow' as const, description: 'Crear carrito' },
      { role: UserRole.CONSULTOR, resource: 'carts', action: 'read', effect: 'allow' as const, description: 'Ver carrito propio' },
      { role: UserRole.CONSULTOR, resource: 'carts', action: 'update', effect: 'allow' as const, description: 'Actualizar carrito' },
      { role: UserRole.CONSULTOR, resource: 'cart_design', action: 'create', effect: 'allow' as const, description: 'Crear carrito design' },
      { role: UserRole.CONSULTOR, resource: 'cart_design', action: 'update', effect: 'allow' as const, description: 'Actualizar carrito design' },
      { role: UserRole.CONSULTOR, resource: 'cart_design', action: 'read', effect: 'allow' as const, description: 'Read carrito design' },
      { role: UserRole.CONSULTOR, resource: 'cart_design', action: 'delete', effect: 'allow' as const, description: 'Delete carrito design' },
      { role: UserRole.CONSULTOR, resource: 'orders', action: 'create', effect: 'allow' as const, description: 'Crear órdenes' },
      { role: UserRole.CONSULTOR, resource: 'orders', action: 'read', effect: 'allow' as const, description: 'Ver órdenes propias' },

      // Auxiliar - Limited access
      { role: UserRole.AUXILIAR, resource: 'categories', action: 'read', effect: 'allow' as const, description: 'Ver categorías' },
      { role: UserRole.AUXILIAR, resource: 'categories', action: 'create', effect: 'allow' as const, description: 'Crear categorías' },
      { role: UserRole.AUXILIAR, resource: 'cloths', action: 'read', effect: 'allow' as const, description: 'Ver prendas' },
      { role: UserRole.AUXILIAR, resource: 'designs', action: 'read', effect: 'allow' as const, description: 'Ver diseños' },
      { role: UserRole.AUXILIAR, resource: 'orders', action: 'read', effect: 'allow' as const, description: 'Ver órdenes' },
      { role: UserRole.AUXILIAR, resource: 'orders', action: 'update', effect: 'allow' as const, description: 'Actualizar estado de órdenes' },
      { role: UserRole.AUXILIAR, resource: 'stocks', action: 'read', effect: 'allow' as const, description: 'Ver inventario' },
      { role: UserRole.AUXILIAR, resource: 'stocks', action: 'update', effect: 'allow' as const, description: 'Actualizar inventario' },
    ];

    await this.rolePermissionRepository.save(permissions);
    this.logger.log(`  ✓ Created ${permissions.length} role permissions`);
  }
}
