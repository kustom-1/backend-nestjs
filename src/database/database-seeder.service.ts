import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/users.entity';
import { Category } from '../categories/category.entity';
import { Cloth } from '../cloths/cloth.entity';
import { RolePermission } from '../permissions/role-permission.entity';

@Injectable()
export class DatabaseSeederService {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed() {
    this.logger.log('🌱 Starting database seeding...');

    try {
      // Wait a bit for TypeORM to be fully initialized
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify connection is ready
      if (!this.dataSource.isInitialized) {
        throw new Error('DataSource is not initialized');
      }

      const userRepository = this.dataSource.manager.getRepository(User);
      const categoryRepository = this.dataSource.manager.getRepository(Category);
      const clothRepository = this.dataSource.manager.getRepository(Cloth);
      const rolePermissionRepository = this.dataSource.manager.getRepository(RolePermission);

      // Check if data already exists
      const userCount = await userRepository.count();
      if (userCount > 0) {
        this.logger.warn('⚠️  Database already seeded. Skipping...');
        return;
      }

      // Seed in order (respecting foreign keys)
      await this.seedUsers(userRepository);
      await this.seedCategories(categoryRepository);
      await this.seedCloths(clothRepository, categoryRepository);
      await this.seedRolePermissions(rolePermissionRepository);

      this.logger.log('✅ Database seeding completed successfully!');
    } catch (error) {
      this.logger.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  private async seedUsers(userRepository) {
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

    await userRepository.save(users);
    this.logger.log(`  ✓ Created ${users.length} users`);
  }

  private async seedCategories(categoryRepository) {
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

    await categoryRepository.save(categories);
    this.logger.log(`  ✓ Created ${categories.length} categories`);
  }

  private async seedCloths(clothRepository, categoryRepository) {
    this.logger.log('👕 Seeding cloths...');

    const categories = await categoryRepository.find();
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

    await clothRepository.save(cloths);
    this.logger.log(`  ✓ Created ${cloths.length} cloths`);
  }

  private async seedRolePermissions(rolePermissionRepository) {
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
      { role: UserRole.CONSULTOR, resource: 'cloths', action: 'create', effect: 'allow' as const, description: 'Crear prendas personalizadas' },

      // Auxiliar - Limited access
      { role: UserRole.AUXILIAR, resource: 'categories', action: 'read', effect: 'allow' as const, description: 'Ver categorías' },
      { role: UserRole.AUXILIAR, resource: 'categories', action: 'create', effect: 'allow' as const, description: 'Crear categorías' },
      { role: UserRole.AUXILIAR, resource: 'cloths', action: 'read', effect: 'allow' as const, description: 'Ver prendas' },
      { role: UserRole.AUXILIAR, resource: 'users', action: 'read', effect: 'allow' as const, description: 'Ver usuarios' },
    ];

    await rolePermissionRepository.save(permissions);
    this.logger.log(`  ✓ Created ${permissions.length} role permissions`);
  }
}

