import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, Repository, MongoRepository } from 'typeorm';
import type { StorageStrategy } from './storage.strategy';

@Injectable()
export class MongoStrategy implements StorageStrategy, OnModuleDestroy {
  private dataSource: DataSource;
  private isConnectedFlag = false;

  constructor(private configService: ConfigService) {}

  async connect(): Promise<DataSource> {
    if (this.isConnectedFlag && this.dataSource?.isInitialized) {
      return this.dataSource;
    }

    const connectionConfig = {
      type: 'mongodb' as const,
      host: this.configService.get('MONGO_HOST', 'localhost'),
      port: parseInt(this.configService.get('MONGO_PORT', '27017'), 10),
      username: this.configService.get('MONGO_USER'),
      password: this.configService.get('MONGO_PASS'),
      database: this.configService.get('MONGO_DB'),
      useUnifiedTopology: true,
      useNewUrlParser: true,
    };

    this.dataSource = new DataSource(connectionConfig);

    try {
      await this.dataSource.initialize();
      this.isConnectedFlag = true;
      console.log('MongoDB connection established');
      return this.dataSource;
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.dataSource?.isInitialized) {
      await this.dataSource.destroy();
      this.isConnectedFlag = false;
      console.log('MongoDB connection closed');
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

