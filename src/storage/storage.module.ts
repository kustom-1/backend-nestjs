import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';
import { PostgreSQLStrategy } from './postgresql.strategy';
import { MongoStrategy } from './mongo.strategy';
import { BucketStrategy } from './bucket.strategy';
import { StorageConfig, StorageType } from './storage.config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'STORAGE_STRATEGY',
      useFactory: (configService: ConfigService) => {
        const storageType = StorageConfig.getStorageType(configService);
        
        switch (storageType) {
          case StorageType.MONGODB:
            return new MongoStrategy(configService);
          case StorageType.BUCKET:
            return new BucketStrategy(configService);
          case StorageType.POSTGRESQL:
          default:
            return new PostgreSQLStrategy(configService);
        }
      },
      inject: [ConfigService],
    },
    StorageService,
    PostgreSQLStrategy,
    MongoStrategy,
    BucketStrategy,
  ],
  exports: [StorageService],
})
export class StorageModule {} 