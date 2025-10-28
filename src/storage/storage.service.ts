import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import type { StorageStrategy } from './storage.strategy';
import { Repository } from 'typeorm';

@Injectable()
export class StorageService implements OnModuleInit {
  private currentStrategy: StorageStrategy;

  constructor(@Inject('STORAGE_STRATEGY') strategy: StorageStrategy) {
    this.currentStrategy = strategy;
  }

  async onModuleInit() {
    // Auto-conectar al inicializar el módulo
    try {
      if (!this.isConnected()) {
        console.log('Initializing database connection...');
        await this.connect();
      }
    } catch (error) {
      console.error('Failed to initialize database connection:', error);
      // No lanzar error aquí para permitir que la app inicie
    }
  }

  async connect(): Promise<any> {
    return await this.currentStrategy.connect();
  }

  async disconnect(): Promise<void> {
    await this.currentStrategy.disconnect();
  }

  getRepository(entity: any): Repository<any> {
    return this.currentStrategy.getRepository(entity);
  }

  isConnected(): boolean {
    return this.currentStrategy.isConnected();
  }

  // Método para cambiar la estrategia en tiempo de ejecución si es necesario
  setStrategy(strategy: StorageStrategy): void {
    this.currentStrategy = strategy;
  }
}
