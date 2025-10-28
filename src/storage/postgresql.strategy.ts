import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { StorageStrategy, DatabaseConnection } from './storage.strategy';
import { User } from '../users/users.entity';
import { RolePermission } from '../permissions/role-permission.entity';

@Injectable()
export class PostgreSQLStrategy implements StorageStrategy, OnModuleDestroy {
  private dataSource: DataSource;
  private isConnectedFlag = false;

  constructor(private configService: ConfigService) {}

  async connect(): Promise<DataSource> {
    if (this.isConnectedFlag && this.dataSource?.isInitialized) {
      return this.dataSource;
    }

    const connectionConfig = {
      type: 'postgres' as const,
      host: this.configService.get('DB_HOST'),
      port: parseInt(this.configService.get('DB_PORT'), 10),
      username: this.configService.get('DB_USER'),
      password: this.configService.get('DB_PASS'),
      database: this.configService.get('DB_NAME'),
      synchronize: true, // Solo para desarrollo
      autoLoadEntities: true,
      entities: [User, RolePermission], // Entidades de la base de datos que usan postgresql
      logging: false,
      ssl: {
        rejectUnauthorized: false,
      },
    };

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