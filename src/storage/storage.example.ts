import { Injectable, OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { StorageService } from './storage.service';
import { User } from '../users/users.entity';

// Ejemplo de cómo usar StorageService en un nuevo módulo
@Injectable()
export class ExampleService implements OnModuleInit {
  private userRepository: Repository<User>;

  constructor(private storageService: StorageService) {}

  async onModuleInit() {
    // Conectar a la base de datos
    await this.storageService.connect();
    
    // Obtener el repositorio de la entidad
    this.userRepository = this.storageService.getRepository(User);
  }

  async getUsers(): Promise<User[]> {
    // Verificar conexión antes de usar
    if (!this.storageService.isConnected()) {
      throw new Error('Database not connected');
    }
    
    return await this.userRepository.find();
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }
}

// Ejemplo de módulo que usa StorageService
export class ExampleModule {
  static forRoot() {
    return {
      module: ExampleModule,
      imports: [], // No necesitas importar TypeORM
      providers: [ExampleService],
      exports: [ExampleService],
    };
  }
} 