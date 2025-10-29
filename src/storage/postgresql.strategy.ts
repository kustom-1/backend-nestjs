import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { StorageStrategy, DatabaseConnection } from './storage.strategy';
import { User } from '../users/users.entity';
import { RolePermission } from '../permissions/role-permission.entity';
import { Cloth } from '../cloths/cloth.entity';
import { Category } from '../categories/category.entity';
import { Design } from '../designs/design.entity';
import { Image } from '../images/image.entity';
import { Cart } from '../carts/cart.entity';
import { CustomImage } from '../custom-images/custom-image.entity';
import { CartDesign } from '../cart-design/cart-design.entity';
import { Stock } from '../stocks/stock.entity';
import { Address } from '../addresses/address.entity';
import { Order } from '../orders/order.entity';
import { Transaction } from '../transactions/transaction.entity';
import { DesignHistory } from '../design-history/design-history.entity';
import { UserRoleMapping } from '../permissions/user-role.entity';

@Injectable()
export class PostgreSQLStrategy implements StorageStrategy, OnModuleDestroy {
  private dataSource: DataSource;
  private isConnectedFlag = false;

  constructor(private configService: ConfigService) {}

  async connect(): Promise<DataSource> {
    if (this.isConnectedFlag && this.dataSource?.isInitialized) {
      return this.dataSource;
    }

    const sslMode = this.configService.get('DB_SSLMODE') || 'disable';

    const connectionConfig: any = {
      type: 'postgres' as const,
      host: this.configService.get('DB_HOST'),
      port: parseInt(this.configService.get('DB_PORT'), 10),
      username: this.configService.get('DB_USER'),
      password: this.configService.get('DB_PASS'),
      database: this.configService.get('DB_NAME'),
      synchronize: true, // Solo para desarrollo
      autoLoadEntities: true,
      entities: [
        User,
        RolePermission,
        UserRoleMapping,
        Cloth,
        Category,
        Design,
        Image,
        Cart,
        CustomImage,
        CartDesign,
        Stock,
        Address,
        Order,
        Transaction,
        DesignHistory,
      ], // Entidades de la base de datos que usan postgresql
      logging: false,
    };

    // Configure SSL only when requested. For local docker/postgres (no SSL) set DB_SSLMODE=disable
    if (sslMode.toLowerCase() !== 'disable') {
      // Default to a permissive SSL configuration; production should supply proper certs
      connectionConfig.ssl = { rejectUnauthorized: false };
    } else {
      connectionConfig.ssl = false;
    }

    this.dataSource = new DataSource(connectionConfig);

    try {
      await this.dataSource.initialize();
      this.isConnectedFlag = true;
      console.log('PostgreSQL connection established');
      return this.dataSource;
    } catch (error) {
      console.error('Error connecting to PostgreSQL:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.dataSource?.isInitialized) {
      await this.dataSource.destroy();
      this.isConnectedFlag = false;
      console.log('PostgreSQL connection closed');
    }
  }

  getRepository(entity: any): Repository<any> {
    if (!this.dataSource?.isInitialized) {
      throw new Error('Database connection not established');
    }
    return this.dataSource.getRepository(entity);
  }

  isConnected(): boolean {
    return this.isConnectedFlag && this.dataSource?.isInitialized;
  }

  async onModuleDestroy() {
    await this.disconnect();
  }
} 