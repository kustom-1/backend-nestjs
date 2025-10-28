import { ConfigService } from '@nestjs/config';

export enum StorageType {
  POSTGRESQL = 'postgresql',
  MONGODB = 'mongodb',
  BUCKET = 'bucket',
}

export class StorageConfig {
  static getStorageType(configService: ConfigService): StorageType {
    const storageType = configService.get('STORAGE_TYPE', 'postgresql');
    
    switch (storageType.toLowerCase()) {
      case 'mongodb':
        return StorageType.MONGODB;
      case 'bucket':
        return StorageType.BUCKET;
      case 'postgresql':
      default:
        return StorageType.POSTGRESQL;
    }
  }

  static getStrategyClass(storageType: StorageType): string {
    switch (storageType) {
      case StorageType.MONGODB:
        return 'MongoStrategy';
      case StorageType.BUCKET:
        return 'BucketStrategy';
      case StorageType.POSTGRESQL:
      default:
        return 'PostgreSQLStrategy';
    }
  }
} 